/**
 * Step agent runner — loads a role brief from /agents and executes one
 * sequential workflow step against a local Ollama model.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { applyFileWriteActions, parseFileWriteActions, taskTypeCanWrite } from "../file-actions.js";
import type { ResolvedModelConfig, TaskType } from "../models.js";
import { generateLocalText } from "../ollama.js";
import { executeCommandTool } from "../tools.js";


export interface WorkflowStep {
  id: string;
  title: string;
  agent: string;
  taskType: TaskType;
  objective: string;
  handoff: string;
  collaborators?: string[];
}

export interface StepResult {
  stepId: string;
  title: string;
  agent: string;
  taskType: TaskType;
  output: string;
  handoff: string;
  writtenFiles: string[];
}

export interface WorkflowRunContext {
  goal: string;
  workflowName: string;
  contextBudgetChars: number;
  previousResult?: StepResult;
}

function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) {
    return text;
  }

  return `${text.slice(0, maxChars).trimEnd()}…`;
}

export function extractHandoff(output: string): string {
  const match = output.match(/## Handoff\s*([\s\S]*)$/i);
  if (match?.[1]?.trim()) {
    return match[1].trim();
  }

  return truncateText(output.trim(), 500);
}

async function readAgentPrompt(agent: string): Promise<string> {
  return readFile(join("agents", `${agent}.md`), "utf-8");
}

function buildStepPrompt(step: WorkflowStep, context: WorkflowRunContext): string {
  const previousHandoff = context.previousResult
    ? truncateText(context.previousResult.handoff, Math.floor(context.contextBudgetChars / 2))
    : "No previous handoff. Start from the user goal.";

  const collaborators = step.collaborators?.length
    ? step.collaborators.join(", ")
    : "none";

  const fileActionInstruction = taskTypeCanWrite(step.taskType)
    ? [
        "If you need to create or update files, add an optional section before the handoff:",
        "## File Actions",
        "Use one or more blocks in this exact format:",
        "<<<WRITE:relative/path.ext>>>",
        "full file content here",
        "<<<END_WRITE>>>",
        "Only use repository-relative paths. Never target .git or node_modules.",
      ].join("\n")
    : "Do not include a ## File Actions section for this step.";

  const commandExecutionInstruction = (step.taskType === "codeGeneration" || step.taskType === "editing")
    ? [
        "If you need to run a terminal command (e.g. tests or builds), add this section:",
        "## Terminal Actions",
        "<<<EXECUTE:your command here>>>",
        "Only run safe, non-destructive commands. No interactive prompts.",
      ].join("\n")
    : "Do not include a ## Terminal Actions section.";

  return [

    `Workflow: ${context.workflowName}`,
    `Goal: ${context.goal}`,
    `Current step: ${step.title}`,
    `Primary agent: ${step.agent}`,
    `Collaborators: ${collaborators}`,
    `Task type: ${step.taskType}`,
    `Objective: ${step.objective}`,
    `Required handoff: ${step.handoff}`,
    "Previous handoff:",
    previousHandoff,
    "Return concise Markdown with exactly these headings:",
    "## Summary",
    "## Deliverable",
    "## File Actions (optional, only when you are writing files)",
    "## Terminal Actions (optional, only for codeGeneration/editing)",
    "## Handoff",
    fileActionInstruction,
    commandExecutionInstruction,
    "Keep the response focused, actionable, and short enough for a small local model workflow.",
  ].join("\n\n");
}


export async function runStepAgent(
  step: WorkflowStep,
  context: WorkflowRunContext,
  resolvedConfig: ResolvedModelConfig,
): Promise<StepResult> {
  console.log(`\n🔧  ${step.agent} starting: ${step.title}`);

  const roleBrief = await readAgentPrompt(step.agent);
  const output = await generateLocalText({
    baseUrl: resolvedConfig.provider.baseUrl,
    model: resolvedConfig.roleModels[step.taskType],
    system: `${roleBrief}\n\nSmall-model rules:\n- Keep total output under 220 words.\n- Do not repeat full history.\n- Pass only the minimum next-step context.`,
    prompt: buildStepPrompt(step, context),
    temperature: resolvedConfig.runtime.temperature,
    maxOutputTokens: resolvedConfig.runtime.maxOutputTokens,
    contextWindow: Math.max(2048, Math.floor(resolvedConfig.runtime.contextBudgetChars * 0.7)),
  });

  const writeActions = taskTypeCanWrite(step.taskType) ? parseFileWriteActions(output) : [];
  const writtenFiles = writeActions.length > 0 ? await applyFileWriteActions(writeActions) : [];

  // Parse and execute commands if present
  const commandMatch = output.match(/<<<EXECUTE:([^>\n]+)>>>/);
  if (commandMatch && commandExecutionInstruction.includes("EXECUTE")) {
    const command = commandMatch[1].trim();
    console.log(`💻  Executing: ${command}`);
    const { stdout, stderr, success } = await executeCommandTool.execute({ command });
    if (!success) {
      console.error(`❌  Command failed: ${stderr}`);
    } else if (stdout) {
      console.log(`✅  Output: ${stdout.slice(0, 500).trim()}...`);
    }
  }

  return {

    stepId: step.id,
    title: step.title,
    agent: step.agent,
    taskType: step.taskType,
    output,
    handoff: extractHandoff(output),
    writtenFiles,
  };
}


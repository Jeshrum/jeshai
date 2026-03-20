/**
 * Coordinator — runs a small-model-friendly workflow with sequential handoffs.
 */
import { readFile } from "node:fs/promises";
import { resolveLocalModelConfig } from "../models.js";
import { runStepAgent, type StepResult, type WorkflowStep } from "./specialist.js";

interface WorkflowDefinition {
  name: string;
  mode: "sequential-handoff";
  steps: WorkflowStep[];
}

export interface CoordinatorResult {
  selectedModel: string;
  workflowName: string;
  plan: string[];
  results: StepResult[];
}

async function loadWorkflow(
  workflowPath = process.env.WORKFLOW_PATH ?? "workflows/dev-loop.json",
): Promise<WorkflowDefinition> {
  const raw = await readFile(workflowPath, "utf-8");
  return JSON.parse(raw) as WorkflowDefinition;
}

export async function runCoordinator(userPrompt: string): Promise<CoordinatorResult> {
  const resolvedConfig = await resolveLocalModelConfig();
  const workflow = await loadWorkflow();
  const plan = workflow.steps.map((step) => `${step.title} → ${step.agent}`);
  const results: StepResult[] = [];

  console.log(`\n📋  Workflow: ${workflow.name} (${workflow.mode})`);
  console.log(`🧠  Local model: ${resolvedConfig.selectedModel}`);
  console.log(`🔗  Provider: ${resolvedConfig.provider.baseUrl}`);
  console.log(`\n📋  Coordinator plan (${plan.length} steps):`);
  plan.forEach((t, i) => console.log(`   ${i + 1}. ${t}`));

  let previousResult: StepResult | undefined;

  for (const step of workflow.steps) {
    const result = await runStepAgent(
      step,
      {
        goal: userPrompt,
        workflowName: workflow.name,
        contextBudgetChars: resolvedConfig.runtime.contextBudgetChars,
        previousResult,
      },
      resolvedConfig,
    );

    const writeSuffix = result.writtenFiles.length > 0 ? ` (${result.writtenFiles.length} file writes)` : "";
    console.log(`   ✔ ${step.title} complete via ${step.agent}${writeSuffix}`);
    results.push(result);
    previousResult = result;
  }

  return {
    selectedModel: resolvedConfig.selectedModel,
    workflowName: workflow.name,
    plan,
    results,
  };
}


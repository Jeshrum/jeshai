/**
 * Specialist agent — uses Qwen via OpenRouter to execute individual subtasks.
 */
import { generateText } from "ai";
import { specialistModel } from "../models.js";
import { reportTool, readFileTool, writeFileTool } from "../tools.js";

/**
 * Execute a single specialist subtask with Qwen and return the text result.
 */
export async function runSpecialist(task: string): Promise<string> {
  console.log(`\n🔧  Specialist starting: ${task.slice(0, 80)}…`);

  const result = await generateText({
    model: specialistModel,
    tools: { report: reportTool, readFile: readFileTool, writeFile: writeFileTool },
    maxSteps: 5,
    system: `You are a specialist agent. Complete the assigned task thoroughly.
Use the provided tools when you need to read or write files.
When finished, call the report tool with status "done".`,
    prompt: task,
  });

  console.log(`   ✔ Specialist finished: ${task.slice(0, 60)}…`);
  return result.text;
}


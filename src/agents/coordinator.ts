/**
 * Coordinator agent — uses Claude to break tasks into subtasks and dispatch
 * them to specialist agents.
 */
import { generateText } from "ai";
import { coordinatorModel } from "../models.js";
import { runSpecialist } from "./specialist.js";

export interface CoordinatorResult {
  plan: string[];
  results: { task: string; output: string }[];
}

/**
 * Run the coordinator: it plans the work, fans out to specialists, and
 * returns the aggregated results.
 */
export async function runCoordinator(userPrompt: string): Promise<CoordinatorResult> {
  // Step 1 — Ask Claude to decompose the task into specialist subtasks.
  const planning = await generateText({
    model: coordinatorModel,
    system: `You are a coordinator agent. Given a user request, break it into
a numbered list of independent specialist subtasks. Return ONLY a JSON array
of strings, e.g. ["subtask 1", "subtask 2"]. No other text.`,
    prompt: userPrompt,
  });

  let plan: string[];
  try {
    plan = JSON.parse(planning.text);
  } catch {
    // If the model didn't return clean JSON, wrap the whole response as one task.
    plan = [planning.text.trim()];
  }

  console.log(`\n📋  Coordinator plan (${plan.length} subtasks):`);
  plan.forEach((t, i) => console.log(`   ${i + 1}. ${t}`));

  // Step 2 — Fan out each subtask to a Qwen specialist (in parallel).
  const settled = await Promise.allSettled(
    plan.map((task) => runSpecialist(task)),
  );

  const results = settled.map((r, i) => ({
    task: plan[i],
    output: r.status === "fulfilled" ? r.value : `ERROR: ${(r as PromiseRejectedResult).reason}`,
  }));

  // Step 3 — Let Claude synthesise a final answer from specialist outputs.
  const synthesis = await generateText({
    model: coordinatorModel,
    system: `You are a coordinator agent. Synthesise the specialist outputs
below into a clear, concise final answer for the user.`,
    prompt: JSON.stringify(results, null, 2),
  });

  console.log("\n✅  Coordinator synthesis complete.\n");
  console.log(synthesis.text);

  return { plan, results };
}


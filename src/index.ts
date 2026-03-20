#!/usr/bin/env node
/**
 * CLI entrypoint — run with: npx tsx src/index.ts "your task here"
 */
import "dotenv/config";
import { runCoordinator } from "./agents/coordinator.js";

async function main() {
  const prompt = process.argv.slice(2).join(" ");

  if (!prompt) {
    console.error("Usage: npx tsx src/index.ts <task description>");
    process.exit(1);
  }

  console.log("🚀  Local multi-agent orchestrator starting…");
  console.log(`📝  Task: ${prompt}\n`);

  const { plan, results, selectedModel, workflowName } = await runCoordinator(prompt);

  console.log(`\n🧠  Selected model: ${selectedModel}`);
  console.log(`🪜  Workflow: ${workflowName}`);

  console.log("\n── Results ──────────────────────────────────");
  results.forEach(({ title, agent, output, writtenFiles }, i) => {
    console.log(`\n[${i + 1}] ${title} (${agent})`);
    if (writtenFiles.length > 0) {
      console.log(`Wrote: ${writtenFiles.join(", ")}`);
    }
    console.log(output);
  });
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});


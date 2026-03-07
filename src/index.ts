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

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌  Missing ANTHROPIC_API_KEY — see .env.example");
    process.exit(1);
  }
  if (!process.env.OPENROUTER_API_KEY) {
    console.error("❌  Missing OPENROUTER_API_KEY — see .env.example");
    process.exit(1);
  }

  console.log("🚀  Multi-agent orchestrator starting…");
  console.log(`📝  Task: ${prompt}\n`);

  const { plan, results } = await runCoordinator(prompt);

  console.log("\n── Results ──────────────────────────────────");
  results.forEach(({ task, output }, i) => {
    console.log(`\n[${i + 1}] ${task}`);
    console.log(output);
  });
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});


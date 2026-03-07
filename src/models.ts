/**
 * Model configuration — Claude for coordination, Qwen via OpenRouter for specialists.
 */
import { anthropic } from "@ai-sdk/anthropic";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------

/** Coordinator model — Claude 3.5 Sonnet via Anthropic */
export const coordinatorModel = anthropic("claude-sonnet-4-20250514");

/** Specialist model — Qwen 2.5 Coder 32B via OpenRouter */
export const specialistModel = openrouter("qwen/qwen-2.5-coder-32b-instruct");


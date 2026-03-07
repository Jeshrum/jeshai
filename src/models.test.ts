import { describe, it, expect } from "vitest";
import { coordinatorModel, specialistModel } from "./models.js";

describe("Model configuration", () => {
  it("exports a coordinator model (Claude via Anthropic)", () => {
    expect(coordinatorModel).toBeDefined();
    expect(coordinatorModel.modelId).toContain("claude");
  });

  it("exports a specialist model (Qwen via OpenRouter)", () => {
    expect(specialistModel).toBeDefined();
    expect(specialistModel.modelId).toContain("qwen");
  });
});


import { describe, it, expect } from "vitest";
import {
  pickPreferredModel,
  readLocalAiConfig,
  resolveRoleModels,
} from "./models.js";

describe("Local model configuration", () => {
  it("prefers qwen2.5-coder:3b when available", () => {
    const model = pickPreferredModel([
      "deepseek-coder:1.3b",
      "qwen2.5-coder:3b",
      "qwen2.5:3b",
    ]);

    expect(model).toBe("qwen2.5-coder:3b");
  });

  it("falls back to deepseek-coder:1.3b when needed", () => {
    const model = pickPreferredModel(["deepseek-coder:1.3b", "another-model:latest"]);
    expect(model).toBe("deepseek-coder:1.3b");
  });

  it("maps planning, reasoning, editing, and code generation to the selected model", () => {
    const roleModels = resolveRoleModels(
      {
        planning: "selectedLocalModel",
        reasoning: "selectedLocalModel",
        codeGeneration: "selectedLocalModel",
        editing: "selectedLocalModel",
      },
      "qwen2.5-coder:3b",
    );

    expect(roleModels).toEqual({
      planning: "qwen2.5-coder:3b",
      reasoning: "qwen2.5-coder:3b",
      codeGeneration: "qwen2.5-coder:3b",
      editing: "qwen2.5-coder:3b",
    });
  });

  it("reads Ollama as the default provider from the project config", async () => {
    const config = await readLocalAiConfig();
    expect(config.provider.name).toBe("ollama");
    expect(config.modelSelection.preferred[0]).toBe("qwen2.5-coder:3b");
  });
});


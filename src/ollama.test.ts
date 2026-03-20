import { describe, it, expect, vi } from "vitest";
import { fetchAvailableOllamaModels, generateLocalText } from "./ollama.js";

describe("Ollama helpers", () => {
  it("reads model names from the tags endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        models: [{ name: "qwen2.5-coder:3b" }, { name: "deepseek-coder:1.3b" }],
      }),
    });

    const models = await fetchAvailableOllamaModels("http://localhost:11434/", fetchMock as any);

    expect(models).toEqual(["qwen2.5-coder:3b", "deepseek-coder:1.3b"]);
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:11434/api/tags");
  });

  it("sends a non-streaming generate request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ response: "generated text" }),
    });

    const text = await generateLocalText(
      {
        baseUrl: "http://localhost:11434/",
        model: "qwen2.5-coder:3b",
        system: "You are helpful.",
        prompt: "Say hello",
      },
      fetchMock as any,
    );

    expect(text).toBe("generated text");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(request.body));
    expect(body.model).toBe("qwen2.5-coder:3b");
    expect(body.stream).toBe(false);
  });
});
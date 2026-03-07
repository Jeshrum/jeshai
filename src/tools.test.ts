import { describe, it, expect } from "vitest";
import { reportTool, readFileTool, writeFileTool } from "./tools.js";

describe("Tools", () => {
  it("reportTool returns status, message, and timestamp", async () => {
    const result = await reportTool.execute(
      { status: "done", message: "All good" },
      { toolCallId: "test", messages: [], abortSignal: undefined as any },
    );
    expect(result.status).toBe("done");
    expect(result.message).toBe("All good");
    expect(result.timestamp).toBeDefined();
  });

  it("readFileTool reads an existing file", async () => {
    const result = await readFileTool.execute(
      { path: "package.json" },
      { toolCallId: "test", messages: [], abortSignal: undefined as any },
    );
    expect(result.success).toBe(true);
    expect(result.content).toContain('"name"');
  });

  it("readFileTool returns error for missing file", async () => {
    const result = await readFileTool.execute(
      { path: "nonexistent-file-xyz.txt" },
      { toolCallId: "test", messages: [], abortSignal: undefined as any },
    );
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});


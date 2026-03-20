import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { applyFileWriteActions, parseFileWriteActions, sanitizeWritePath, taskTypeCanWrite } from "./file-actions.js";

describe("file actions", () => {
  it("parses write blocks from the file actions section", () => {
    const output = [
      "## Summary",
      "Done.",
      "",
      "## File Actions",
      "<<<WRITE:src/demo.ts>>>",
      "export const demo = true;",
      "<<<END_WRITE>>>",
      "",
      "<<<WRITE:docs/demo.md>>>",
      "# Demo",
      "<<<END_WRITE>>>",
    ].join("\n");

    expect(parseFileWriteActions(output)).toEqual([
      { path: "src/demo.ts", content: "export const demo = true;" },
      { path: "docs/demo.md", content: "# Demo" },
    ]);
  });

  it("rejects write paths that escape the workspace", () => {
    expect(() => sanitizeWritePath("../secrets.txt")).toThrow(/escapes the workspace/);
    expect(() => sanitizeWritePath("node_modules/pkg/index.js")).toThrow(/blocked location/);
  });

  it("writes parsed files to disk", async () => {
    const root = await mkdtemp(join(tmpdir(), "ollama-writes-"));

    try {
      const written = await applyFileWriteActions(
        [{ path: "generated/hello.txt", content: "hi" }],
        root,
      );

      expect(written).toEqual(["generated/hello.txt"]);
      expect(await readFile(join(root, "generated/hello.txt"), "utf-8")).toBe("hi");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("only allows writes for code generation and editing steps", () => {
    expect(taskTypeCanWrite("codeGeneration")).toBe(true);
    expect(taskTypeCanWrite("editing")).toBe(true);
    expect(taskTypeCanWrite("planning")).toBe(false);
    expect(taskTypeCanWrite("reasoning")).toBe(false);
  });
});
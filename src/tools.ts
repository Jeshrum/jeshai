/**
 * Shared tools available to all agents.
 */
import { tool } from "ai";
import { z } from "zod";

/** Report progress back to the coordinator */
export const reportTool = tool({
  description: "Report your progress or result back to the coordinator.",
  parameters: z.object({
    status: z.enum(["in_progress", "done", "error"]),
    message: z.string().describe("A short summary of what was accomplished or what went wrong."),
  }),
  execute: async ({ status, message }) => {
    return { status, message, timestamp: new Date().toISOString() };
  },
});

/** Read a file from the workspace */
export const readFileTool = tool({
  description: "Read the contents of a file at the given path.",
  parameters: z.object({
    path: z.string().describe("Relative file path to read."),
  }),
  execute: async ({ path }) => {
    const fs = await import("node:fs/promises");
    try {
      const content = await fs.readFile(path, "utf-8");
      return { success: true, content };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
});

/** Write a file to the workspace */
export const writeFileTool = tool({
  description: "Write content to a file at the given path.",
  parameters: z.object({
    path: z.string().describe("Relative file path to write."),
    content: z.string().describe("File content to write."),
  }),
  execute: async ({ path, content }) => {
    const fs = await import("node:fs/promises");
    const nodePath = await import("node:path");
    await fs.mkdir(nodePath.dirname(path), { recursive: true });
    await fs.writeFile(path, content, "utf-8");
    return { success: true, path };
  },
});


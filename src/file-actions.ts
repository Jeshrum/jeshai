import { mkdir, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, normalize } from "node:path";
import type { TaskType } from "./models.js";

export interface FileWriteAction {
  path: string;
  content: string;
}

const WRITE_BLOCK_REGEX = /<<<WRITE:([^>\n]+)>>>(?:\r?\n)([\s\S]*?)(?:\r?\n)<<<END_WRITE>>>/g;
const BLOCKED_SEGMENTS = new Set([".git", "node_modules"]);

export function taskTypeCanWrite(taskType: TaskType): boolean {
  return taskType === "codeGeneration" || taskType === "editing";
}

export function parseFileWriteActions(output: string): FileWriteAction[] {
  if (!/## File Actions/i.test(output)) {
    return [];
  }

  const actions: FileWriteAction[] = [];
  for (const match of output.matchAll(WRITE_BLOCK_REGEX)) {
    actions.push({ path: match[1].trim(), content: match[2] });
  }

  return actions;
}

export function sanitizeWritePath(relativePath: string): string {
  const trimmed = relativePath.trim();
  if (!trimmed) {
    throw new Error("Write action path cannot be empty.");
  }

  if (isAbsolute(trimmed)) {
    throw new Error(`Write action path must be relative: ${trimmed}`);
  }

  const normalized = normalize(trimmed).replace(/\\/g, "/");
  if (normalized === "." || normalized === ".." || normalized.startsWith("../")) {
    throw new Error(`Write action path escapes the workspace: ${trimmed}`);
  }

  const segments = normalized.split("/");
  if (segments.some((segment) => BLOCKED_SEGMENTS.has(segment))) {
    throw new Error(`Write action path targets a blocked location: ${trimmed}`);
  }

  return normalized;
}

export async function applyFileWriteActions(
  actions: FileWriteAction[],
  rootDir = process.cwd(),
): Promise<string[]> {
  const writtenPaths: string[] = [];

  for (const action of actions) {
    const safePath = sanitizeWritePath(action.path);
    const targetPath = join(rootDir, safePath);
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, action.content, "utf-8");
    writtenPaths.push(safePath);
  }

  return writtenPaths;
}
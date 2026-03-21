/**
 * Shared tools available to all agents.
 */

export interface ToolExecutionContext {
  toolCallId: string;
  messages: unknown[];
  abortSignal?: AbortSignal;
}

export interface ReportInput {
  status: "in_progress" | "done" | "error";
  message: string;
}

export interface ReportOutput {
  status: ReportInput["status"];
  message: string;
  timestamp: string;
}

export interface ReadFileInput {
  path: string;
}

export interface ReadFileSuccess {
  success: true;
  content: string;
}

export interface ReadFileFailure {
  success: false;
  error: string;
}

export type ReadFileOutput = ReadFileSuccess | ReadFileFailure;

export interface WriteFileInput {
  path: string;
  content: string;
}

export interface WriteFileOutput {
  success: true;
  path: string;
}

/** Report progress back to the coordinator */
export const reportTool = {
  description: "Report your progress or result back to the coordinator.",
  execute: async ({ status, message }: ReportInput, _context?: ToolExecutionContext): Promise<ReportOutput> => {
    return { status, message, timestamp: new Date().toISOString() };
  },
};

/** Read a file from the workspace */
export const readFileTool = {
  description: "Read the contents of a file at the given path.",
  execute: async ({ path }: ReadFileInput, _context?: ToolExecutionContext): Promise<ReadFileOutput> => {
    const fs = await import("node:fs/promises");
    try {
      const content = await fs.readFile(path, "utf-8");
      return { success: true, content };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  },
};

/** Write a file to the workspace */
export const writeFileTool = {
  description: "Write content to a file at the given path.",
  execute: async (
    { path, content }: WriteFileInput,
    _context?: ToolExecutionContext,
  ): Promise<WriteFileOutput> => {
    const fs = await import("node:fs/promises");
    const nodePath = await import("node:path");
    await fs.mkdir(nodePath.dirname(path), { recursive: true });
    await fs.writeFile(path, content, "utf-8");
    return { success: true, path };
  },
};

export interface ExecuteCommandInput {
  command: string;
}

export interface ExecuteCommandOutput {
  success: boolean;
  stdout: string;
  stderr: string;
}

/** Execute a command in the terminal */
export const executeCommandTool = {
  description: "Execute a shell command in the repository root.",
  execute: async (
    { command }: ExecuteCommandInput,
    _context?: ToolExecutionContext,
  ): Promise<ExecuteCommandOutput> => {
    const { exec } = await import("node:child_process");
    const { promisify } = await import("node:util");
    const execPromise = promisify(exec);

    try {
      const { stdout, stderr } = await execPromise(command);
      return { success: true, stdout, stderr };
    } catch (err) {
      const error = err as { stdout?: string; stderr?: string; message: string };
      return {
        success: false,
        stdout: error.stdout ?? "",
        stderr: error.stderr ?? error.message,
      };
    }
  },
};


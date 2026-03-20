import { readFile } from "node:fs/promises";
import { fetchAvailableOllamaModels } from "./ollama.js";

export type TaskType = "planning" | "reasoning" | "codeGeneration" | "editing";
export type RoleModelSetting = "selectedLocalModel" | string;

export interface LocalAiConfig {
  provider: {
    name: "ollama";
    baseUrl: string;
  };
  modelSelection: {
    preferred: string[];
    defaultFor: Record<TaskType, RoleModelSetting>;
  };
  runtime: {
    contextBudgetChars: number;
    maxOutputTokens: number;
    temperature: number;
    sequentialHandoffs: boolean;
  };
}

export interface ResolvedModelConfig extends LocalAiConfig {
  availableModels: string[];
  selectedModel: string;
  roleModels: Record<TaskType, string>;
}

export const DEFAULT_LOCAL_AI_CONFIG: LocalAiConfig = {
  provider: {
    name: "ollama",
    baseUrl: "http://localhost:11434",
  },
  modelSelection: {
    preferred: ["qwen2.5-coder:3b", "deepseek-coder:1.3b", "qwen2.5:3b"],
    defaultFor: {
      planning: "selectedLocalModel",
      reasoning: "selectedLocalModel",
      codeGeneration: "selectedLocalModel",
      editing: "selectedLocalModel",
    },
  },
  runtime: {
    contextBudgetChars: 6000,
    maxOutputTokens: 384,
    temperature: 0.2,
    sequentialHandoffs: true,
  },
};

function mergeConfig(partial: Partial<LocalAiConfig>): LocalAiConfig {
  return {
    provider: {
      ...DEFAULT_LOCAL_AI_CONFIG.provider,
      ...partial.provider,
    },
    modelSelection: {
      preferred: partial.modelSelection?.preferred ?? DEFAULT_LOCAL_AI_CONFIG.modelSelection.preferred,
      defaultFor: {
        ...DEFAULT_LOCAL_AI_CONFIG.modelSelection.defaultFor,
        ...partial.modelSelection?.defaultFor,
      },
    },
    runtime: {
      ...DEFAULT_LOCAL_AI_CONFIG.runtime,
      ...partial.runtime,
    },
  };
}

export async function readLocalAiConfig(
  configPath = process.env.LOCAL_AI_CONFIG_PATH ?? "local-ai.config.json",
): Promise<LocalAiConfig> {
  const raw = await readFile(configPath, "utf-8");
  return mergeConfig(JSON.parse(raw) as Partial<LocalAiConfig>);
}

export function pickPreferredModel(
  availableModels: string[],
  preferences = DEFAULT_LOCAL_AI_CONFIG.modelSelection.preferred,
): string | null {
  const available = new Set(availableModels);

  for (const model of preferences) {
    if (available.has(model)) {
      return model;
    }
  }

  return availableModels[0] ?? null;
}

export function resolveRoleModels(
  defaultFor: Record<TaskType, RoleModelSetting>,
  selectedLocalModel: string,
): Record<TaskType, string> {
  return {
    planning: defaultFor.planning === "selectedLocalModel" ? selectedLocalModel : defaultFor.planning,
    reasoning: defaultFor.reasoning === "selectedLocalModel" ? selectedLocalModel : defaultFor.reasoning,
    codeGeneration:
      defaultFor.codeGeneration === "selectedLocalModel"
        ? selectedLocalModel
        : defaultFor.codeGeneration,
    editing: defaultFor.editing === "selectedLocalModel" ? selectedLocalModel : defaultFor.editing,
  };
}

export async function resolveLocalModelConfig(
  fetchImpl: typeof fetch = fetch,
): Promise<ResolvedModelConfig> {
  const config = await readLocalAiConfig();
  const availableModels = await fetchAvailableOllamaModels(config.provider.baseUrl, fetchImpl);
  const selectedModel = pickPreferredModel(availableModels, config.modelSelection.preferred);

  if (!selectedModel) {
    throw new Error(
      `No Ollama models available at ${config.provider.baseUrl}. Pull one of: ${config.modelSelection.preferred.join(", ")}`,
    );
  }

  return {
    ...config,
    availableModels,
    selectedModel,
    roleModels: resolveRoleModels(config.modelSelection.defaultFor, selectedModel),
  };
}


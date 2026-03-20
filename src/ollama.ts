import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";

export interface GenerateLocalTextOptions {
  baseUrl: string;
  model: string;
  system: string;
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  contextWindow?: number;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

type FetchLikeResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

type FetchLike = (url: string, init?: RequestInit) => Promise<FetchLikeResponse>;

function normalizeHeaders(headers?: RequestInit["headers"]): Record<string, string> {
  if (!headers) {
    return {};
  }

  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }

  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key, String(value)]),
  );
}

async function requestJson(urlString: string, init?: RequestInit): Promise<FetchLikeResponse> {
  const url = new URL(urlString);
  const transport = url.protocol === "https:" ? httpsRequest : httpRequest;
  const body = typeof init?.body === "string" ? init.body : undefined;

  return new Promise((resolve, reject) => {
    const req = transport(
      url,
      {
        method: init?.method ?? "GET",
        headers: normalizeHeaders(init?.headers),
      },
      (res) => {
        let raw = "";
        res.setEncoding("utf-8");
        res.on("data", (chunk) => {
          raw += chunk;
        });
        res.on("end", () => {
          resolve({
            ok: (res.statusCode ?? 500) >= 200 && (res.statusCode ?? 500) < 300,
            status: res.statusCode ?? 500,
            json: async () => JSON.parse(raw || "{}") as unknown,
          });
        });
      },
    );

    req.setTimeout(10 * 60 * 1000, () => {
      req.destroy(new Error("Ollama request timed out after 10 minutes."));
    });
    req.on("error", reject);

    if (body) {
      req.write(body);
    }

    req.end();
  });
}

export async function fetchAvailableOllamaModels(
  baseUrl: string,
  fetchImpl: FetchLike = requestJson,
): Promise<string[]> {
  const response = await fetchImpl(`${normalizeBaseUrl(baseUrl)}/api/tags`);

  if (!response.ok) {
    throw new Error(`Ollama tags request failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    models?: Array<{ name?: string }>;
  };

  return (data.models ?? [])
    .map((model) => model.name)
    .filter((name): name is string => Boolean(name));
}

export async function generateLocalText(
  options: GenerateLocalTextOptions,
  fetchImpl: FetchLike = requestJson,
): Promise<string> {
  const response = await fetchImpl(`${normalizeBaseUrl(options.baseUrl)}/api/generate`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: options.model,
      system: options.system,
      prompt: options.prompt,
      stream: false,
      keep_alive: "2m",
      options: {
        temperature: options.temperature ?? 0.2,
        num_predict: options.maxOutputTokens ?? 384,
        num_ctx: options.contextWindow ?? 4096,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama generate request failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    response?: string;
    error?: string;
  };

  if (data.error) {
    throw new Error(data.error);
  }

  if (!data.response) {
    throw new Error("Ollama response was empty.");
  }

  return data.response.trim();
}
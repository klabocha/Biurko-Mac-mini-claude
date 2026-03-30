import { config as loadEnv } from "dotenv";
import type { ModelConfig, ServerConfig } from "./types.js";

loadEnv();

interface ModelDefault {
  provider: ModelConfig["provider"];
  model: string;
  apiKeyEnv: string;
  baseUrl: string;
}

const DEFAULT_MODELS: Record<string, ModelDefault> = {
  claude: {
    provider: "anthropic",
    model: "claude-opus-4-6",
    apiKeyEnv: "ANTHROPIC_API_KEY",
    baseUrl: "https://api.anthropic.com",
  },
  grok: {
    provider: "openai-compatible",
    model: "grok-4-1-fast",
    apiKeyEnv: "XAI_API_KEY",
    baseUrl: "https://api.x.ai/v1",
  },
  kimi: {
    provider: "openai-compatible",
    model: "kimi-k2.5",
    apiKeyEnv: "MOONSHOT_API_KEY",
    baseUrl: "https://api.moonshot.ai/v1",
  },
  "gpt-o3": {
    provider: "openai",
    model: "o3",
    apiKeyEnv: "OPENAI_API_KEY",
    baseUrl: "https://api.openai.com/v1",
  },
  gemini: {
    provider: "openai-compatible",
    model: "gemini-2.5-pro",
    apiKeyEnv: "GEMINI_API_KEY",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
  },
  deepseek: {
    provider: "openai-compatible",
    model: "deepseek-chat",
    apiKeyEnv: "DEEPSEEK_API_KEY",
    baseUrl: "https://api.deepseek.com",
  },
  perplexity: {
    provider: "openai-compatible",
    model: "sonar-pro",
    apiKeyEnv: "PERPLEXITY_API_KEY",
    baseUrl: "https://api.perplexity.ai",
  },
};

const DEFAULT_DEBATE_CONFIG = {
  mode: "debate" as const,
  maxRounds: 3,
  showModelNames: true,
  language: "pl",
};

export function loadConfig(): ServerConfig {
  const models: Record<string, ModelConfig> = {};

  for (const [name, def] of Object.entries(DEFAULT_MODELS)) {
    const apiKey = process.env[def.apiKeyEnv];
    if (apiKey) {
      models[name] = {
        provider: def.provider,
        model: def.model,
        apiKey,
        baseUrl: def.baseUrl,
      };
    }
  }

  if (Object.keys(models).length === 0) {
    throw new Error(
      "No API keys configured. Set at least one of: " +
        Object.values(DEFAULT_MODELS)
          .map((m) => m.apiKeyEnv)
          .join(", ")
    );
  }

  return {
    models,
    defaults: { ...DEFAULT_DEBATE_CONFIG },
  };
}

export function addModelToConfig(
  config: ServerConfig,
  name: string,
  modelConfig: ModelConfig
): void {
  config.models[name] = modelConfig;
}

export function removeModelFromConfig(
  config: ServerConfig,
  name: string
): boolean {
  if (config.models[name]) {
    delete config.models[name];
    return true;
  }
  return false;
}

import { AnthropicProvider } from "./anthropic.js";
import { OpenAICompatProvider } from "./openai-compat.js";
import type { LLMProvider, ModelConfig } from "../types.js";

export function createProvider(name: string, config: ModelConfig): LLMProvider {
  switch (config.provider) {
    case "anthropic":
      return new AnthropicProvider(name, config);
    case "openai":
    case "openai-compatible":
      return new OpenAICompatProvider(name, config);
    default:
      throw new Error(`Unknown provider type: ${config.provider}`);
  }
}

import type { LLMProvider, ModelConfig } from "../types.js";

export abstract class BaseProvider implements LLMProvider {
  name: string;
  config: ModelConfig;

  constructor(name: string, config: ModelConfig) {
    this.name = name;
    this.config = config;
  }

  abstract chat(systemPrompt: string, userMessage: string): Promise<string>;
}

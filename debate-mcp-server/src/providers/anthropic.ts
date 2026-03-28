import Anthropic from "@anthropic-ai/sdk";
import { BaseProvider } from "./base.js";
import type { ModelConfig } from "../types.js";

export class AnthropicProvider extends BaseProvider {
  private client: Anthropic;

  constructor(name: string, config: ModelConfig) {
    super(name, config);
    this.client = new Anthropic({ apiKey: config.apiKey });
  }

  async chat(systemPrompt: string, userMessage: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.config.model,
      max_tokens: this.config.maxTokens ?? 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error(`${this.name}: No text response received`);
    }
    return textBlock.text;
  }
}

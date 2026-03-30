import OpenAI from "openai";
import { BaseProvider } from "./base.js";
import type { ModelConfig } from "../types.js";

export class OpenAICompatProvider extends BaseProvider {
  private client: OpenAI;

  constructor(name: string, config: ModelConfig) {
    super(name, config);
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
  }

  async chat(systemPrompt: string, userMessage: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.config.model,
      max_tokens: this.config.maxTokens ?? 4096,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error(`${this.name}: No response received`);
    }
    return content;
  }
}

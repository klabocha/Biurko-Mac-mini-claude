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

  private isReasoningModel(): boolean {
    return /^o[1-9]/.test(this.config.model);
  }

  async chat(systemPrompt: string, userMessage: string): Promise<string> {
    const tokenLimit = this.config.maxTokens ?? 4096;
    const tokenParamKey = this.isReasoningModel()
      ? "max_completion_tokens"
      : "max_tokens";

    const params = {
      model: this.config.model,
      [tokenParamKey]: tokenLimit,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    } as unknown as OpenAI.ChatCompletionCreateParamsNonStreaming;

    const response = await this.client.chat.completions.create(params);

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error(`${this.name}: No response received`);
    }
    return content;
  }
}

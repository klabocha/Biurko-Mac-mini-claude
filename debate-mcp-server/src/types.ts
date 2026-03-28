export type ProviderType = "anthropic" | "openai" | "openai-compatible";

export interface ModelConfig {
  provider: ProviderType;
  model: string;
  apiKey: string;
  baseUrl: string;
  maxTokens?: number;
  temperature?: number;
}

export type DebateMode = "quick_poll" | "debate" | "deep_dive";

export interface DebateConfig {
  mode: DebateMode;
  maxRounds: number;
  showModelNames: boolean;
  language: string;
}

export interface DebateMessage {
  modelName: string;
  round: number;
  content: string;
  timestamp: number;
}

export interface RoundResult {
  round: number;
  responses: DebateMessage[];
}

export interface DebateResult {
  question: string;
  mode: DebateMode;
  models: string[];
  rounds: RoundResult[];
  synthesis: string;
  totalTokensEstimate: number;
}

export interface LLMProvider {
  name: string;
  config: ModelConfig;
  chat(systemPrompt: string, userMessage: string): Promise<string>;
}

export interface ServerConfig {
  models: Record<string, ModelConfig>;
  defaults: DebateConfig;
}

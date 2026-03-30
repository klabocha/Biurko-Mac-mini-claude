import { z } from "zod";
import type { ServerConfig, ProviderType } from "../types.js";
import { addModelToConfig, removeModelFromConfig } from "../config.js";

export const addModelSchema = z.object({
  name: z.string().describe("Nazwa modelu (np. 'deepseek')"),
  provider: z
    .enum(["anthropic", "openai", "openai-compatible"])
    .describe("Typ providera"),
  model: z.string().describe("ID modelu (np. 'deepseek-r1')"),
  baseUrl: z.string().describe("Base URL API"),
  apiKeyEnv: z.string().describe("Nazwa zmiennej srodowiskowej z kluczem API"),
});

export const listModelsSchema = z.object({});

export type AddModelInput = z.infer<typeof addModelSchema>;

export function addModel(input: AddModelInput, config: ServerConfig): string {
  const apiKey = process.env[input.apiKeyEnv];
  if (!apiKey) {
    return `Blad: Zmienna srodowiskowa ${input.apiKeyEnv} nie jest ustawiona.`;
  }

  addModelToConfig(config, input.name, {
    provider: input.provider as ProviderType,
    model: input.model,
    apiKey,
    baseUrl: input.baseUrl,
  });

  return `Model "${input.name}" dodany (${input.model} @ ${input.baseUrl})`;
}

export function listModels(config: ServerConfig): string {
  const models = Object.entries(config.models);
  if (models.length === 0) {
    return "Brak skonfigurowanych modeli.";
  }

  const lines = models.map(([name, cfg]) => {
    return `- **${name}**: ${cfg.model} (${cfg.provider}) @ ${cfg.baseUrl}`;
  });

  return `Skonfigurowane modele (${models.length}):\n${lines.join("\n")}`;
}

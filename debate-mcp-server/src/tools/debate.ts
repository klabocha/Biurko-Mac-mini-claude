import { z } from "zod";
import { createProvider } from "../providers/factory.js";
import { DebateEngine } from "../debate/engine.js";
import { synthesize } from "../debate/synthesis.js";
import type { ServerConfig, DebateResult } from "../types.js";

export const debateSchema = z.object({
  question: z.string().describe("Pytanie lub temat do debaty"),
  mode: z
    .enum(["quick_poll", "debate", "deep_dive"])
    .default("debate")
    .describe(
      "Tryb debaty: quick_poll (1 runda), debate (3 rundy), deep_dive (5+ rund)"
    ),
  models: z
    .array(z.string())
    .optional()
    .describe(
      "Lista nazw modeli do uzycia (domyslnie: wszystkie skonfigurowane)"
    ),
});

export type DebateInput = z.infer<typeof debateSchema>;

export async function runDebateTool(
  input: DebateInput,
  config: ServerConfig
): Promise<string> {
  const selectedModels = input.models ?? Object.keys(config.models);
  const providers = [];

  for (const name of selectedModels) {
    const modelConfig = config.models[name];
    if (!modelConfig) {
      return `Blad: Model "${name}" nie jest skonfigurowany. Dostepne: ${Object.keys(config.models).join(", ")}`;
    }
    providers.push(createProvider(name, modelConfig));
  }

  if (providers.length < 2) {
    return "Blad: Debata wymaga minimum 2 modeli. Sprawdz klucze API.";
  }

  const engine = new DebateEngine(providers, config.defaults.showModelNames);

  // Run debate rounds
  const partialResult = await engine.runDebate(input.question, input.mode);

  // Synthesize (use first provider as synthesizer - typically Claude)
  const synthesis = await synthesize(
    providers[0],
    input.question,
    partialResult.rounds,
    config.defaults.showModelNames
  );

  const result: DebateResult = {
    ...partialResult,
    synthesis,
  };

  return formatDebateResult(result);
}

function formatDebateResult(result: DebateResult): string {
  const parts: string[] = [];

  parts.push(`# Debata: ${result.question}`);
  parts.push(
    `Tryb: ${result.mode} | Modele: ${result.models.join(", ")} | Rundy: ${result.rounds.length}`
  );
  parts.push("");

  for (const round of result.rounds) {
    const label =
      round.round === 0
        ? "## Runda 0 - Niezalezna analiza"
        : `## Runda ${round.round} - Konfrontacja`;
    parts.push(label);
    parts.push("");

    for (const msg of round.responses) {
      parts.push(`### ${msg.modelName}`);
      parts.push(msg.content);
      parts.push("");
    }
  }

  parts.push("## Synteza");
  parts.push(result.synthesis);
  parts.push("");
  parts.push(`---`);
  parts.push(`Szacowane tokeny: ~${result.totalTokensEstimate}`);

  return parts.join("\n");
}

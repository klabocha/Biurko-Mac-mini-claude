import type { LLMProvider, RoundResult } from "../types.js";
import { SYNTHESIS_SYSTEM, buildSynthesisUserPrompt } from "./prompts.js";

export async function synthesize(
  synthesizer: LLMProvider,
  question: string,
  rounds: RoundResult[],
  showModelNames: boolean
): Promise<string> {
  const fullHistory = formatDebateHistory(rounds, showModelNames);
  const userPrompt = buildSynthesisUserPrompt(question, fullHistory);
  return synthesizer.chat(SYNTHESIS_SYSTEM, userPrompt);
}

function formatDebateHistory(rounds: RoundResult[], showNames: boolean): string {
  const parts: string[] = [];

  for (const round of rounds) {
    const roundLabel =
      round.round === 0
        ? "RUNDA 0 - NIEZALEZNA ANALIZA"
        : `RUNDA ${round.round} - KONFRONTACJA`;

    parts.push(`\n=== ${roundLabel} ===\n`);

    for (const msg of round.responses) {
      const label = showNames ? msg.modelName : `Ekspert`;
      parts.push(`--- ${label} ---`);
      parts.push(msg.content);
      parts.push("");
    }
  }

  return parts.join("\n");
}

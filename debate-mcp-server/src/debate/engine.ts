import type { LLMProvider, DebateMode, DebateMessage, RoundResult, DebateResult } from "../types.js";
import {
  ROUND_0_SYSTEM,
  buildRound0UserPrompt,
  buildConfrontationSystemPrompt,
  buildConfrontationUserPrompt,
} from "./prompts.js";

const MODE_ROUNDS: Record<DebateMode, number> = {
  quick_poll: 0,
  debate: 2,
  deep_dive: 4,
};

export class DebateEngine {
  private providers: LLMProvider[];
  private showModelNames: boolean;

  constructor(providers: LLMProvider[], showModelNames: boolean = true) {
    this.providers = providers;
    this.showModelNames = showModelNames;
  }

  async runDebate(question: string, mode: DebateMode): Promise<Omit<DebateResult, "synthesis">> {
    const confrontationRounds = MODE_ROUNDS[mode];
    const rounds: RoundResult[] = [];

    // Round 0 - independent analysis
    const round0 = await this.runRound0(question);
    rounds.push(round0);

    // Confrontation rounds
    for (let r = 1; r <= confrontationRounds; r++) {
      const prevRound = rounds[rounds.length - 1];
      const confrontation = await this.runConfrontationRound(question, r, prevRound, rounds);
      rounds.push(confrontation);
    }

    return {
      question,
      mode,
      models: this.providers.map((p) => p.name),
      rounds,
      totalTokensEstimate: this.estimateTokens(rounds),
    };
  }

  private async runRound0(question: string): Promise<RoundResult> {
    const userPrompt = buildRound0UserPrompt(question);

    const responses = await Promise.allSettled(
      this.providers.map(async (provider): Promise<DebateMessage> => {
        const content = await provider.chat(ROUND_0_SYSTEM, userPrompt);
        return {
          modelName: provider.name,
          round: 0,
          content,
          timestamp: Date.now(),
        };
      })
    );

    return {
      round: 0,
      responses: this.collectResults(responses, 0),
    };
  }

  private async runConfrontationRound(
    question: string,
    round: number,
    prevRound: RoundResult,
    _allRounds: RoundResult[]
  ): Promise<RoundResult> {
    const systemPrompt = buildConfrontationSystemPrompt(round);

    const responses = await Promise.allSettled(
      this.providers.map(async (provider): Promise<DebateMessage> => {
        const ownPrevious = prevRound.responses.find(
          (r) => r.modelName === provider.name
        );
        if (!ownPrevious) {
          throw new Error(`No previous response from ${provider.name}`);
        }

        const otherResponses = prevRound.responses
          .filter((r) => r.modelName !== provider.name)
          .map((r) => ({ name: r.modelName, content: r.content }));

        const userPrompt = buildConfrontationUserPrompt(
          question,
          ownPrevious.content,
          otherResponses,
          this.showModelNames
        );

        const content = await provider.chat(systemPrompt, userPrompt);
        return {
          modelName: provider.name,
          round,
          content,
          timestamp: Date.now(),
        };
      })
    );

    return {
      round,
      responses: this.collectResults(responses, round),
    };
  }

  private collectResults(
    results: PromiseSettledResult<DebateMessage>[],
    round: number
  ): DebateMessage[] {
    const messages: DebateMessage[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === "fulfilled") {
        messages.push(result.value);
      } else {
        messages.push({
          modelName: this.providers[i].name,
          round,
          content: `[BLAD: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}]`,
          timestamp: Date.now(),
        });
      }
    }

    return messages;
  }

  private estimateTokens(rounds: RoundResult[]): number {
    let total = 0;
    for (const round of rounds) {
      for (const msg of round.responses) {
        total += Math.ceil(msg.content.length / 4);
      }
    }
    return total;
  }
}

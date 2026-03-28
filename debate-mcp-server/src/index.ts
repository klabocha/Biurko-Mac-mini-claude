#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { debateSchema, runDebateTool } from "./tools/debate.js";
import {
  addModelSchema,
  listModelsSchema,
  addModel,
  listModels,
} from "./tools/models.js";
import { visualsSchema, generateVisuals } from "./tools/visuals.js";
import type { ServerConfig } from "./types.js";

const config: ServerConfig = loadConfig();

const server = new McpServer({
  name: "debate",
  version: "1.0.0",
});

// debate() - standardowa debata wielorundowa
server.tool(
  "debate",
  "Przeprowadz wielorundowa debate miedzy modelami AI (GPT, Gemini, Kimi, Grok, DeepSeek, Perplexity). Kazdy model analizuje temat niezaleznie, potem konfrontuja stanowiska w kolejnych rundach.",
  debateSchema.shape,
  async (args) => {
    const input = debateSchema.parse(args);
    const result = await runDebateTool(input, config);
    return { content: [{ type: "text" as const, text: result }] };
  }
);

// quick_poll() - szybki poll bez konfrontacji
server.tool(
  "quick_poll",
  "Szybki poll - zbierz niezalezne opinie wszystkich modeli bez konfrontacji (1 runda).",
  debateSchema.omit({ mode: true }).shape,
  async (args) => {
    const input = debateSchema.parse({ ...args, mode: "quick_poll" });
    const result = await runDebateTool(input, config);
    return { content: [{ type: "text" as const, text: result }] };
  }
);

// deep_dive() - gleboka analiza
server.tool(
  "deep_dive",
  "Gleboka analiza - rozszerzona debata z 5+ rundami konfrontacji. Uzyj do strategii biznesowych, kwestii prawnych, zlozonych decyzji.",
  debateSchema.omit({ mode: true }).shape,
  async (args) => {
    const input = debateSchema.parse({ ...args, mode: "deep_dive" });
    const result = await runDebateTool(input, config);
    return { content: [{ type: "text" as const, text: result }] };
  }
);

// add_model() - dynamiczne dodawanie modeli
server.tool(
  "add_model",
  "Dodaj nowy model do debaty w runtime (np. DeepSeek, Ollama, Mistral).",
  addModelSchema.shape,
  async (args) => {
    const input = addModelSchema.parse(args);
    const result = addModel(input, config);
    return { content: [{ type: "text" as const, text: result }] };
  }
);

// list_models() - lista aktywnych modeli
server.tool(
  "list_models",
  "Pokaz liste aktywnych modeli dostepnych do debaty.",
  listModelsSchema.shape,
  async () => {
    const result = listModels(config);
    return { content: [{ type: "text" as const, text: result }] };
  }
);

// generate_visuals() - generowanie grafik (Faza 2)
server.tool(
  "generate_visuals",
  "Generuj wizualizacje na podstawie wyniku debaty - obrazy (Nano Banana), wireframy (Figma), screenshoty (Kapture). Faza 2 - w budowie.",
  visualsSchema.shape,
  async (args) => {
    const input = visualsSchema.parse(args);
    const result = await generateVisuals(input);
    return { content: [{ type: "text" as const, text: result }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(
    `Debate MCP Server started. Models: ${Object.keys(config.models).join(", ")}`
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

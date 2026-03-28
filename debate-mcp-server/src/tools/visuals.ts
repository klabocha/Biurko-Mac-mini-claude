import { z } from "zod";

export const visualsSchema = z.object({
  concept: z.string().describe("Opis koncepcji wizualnej do wygenerowania"),
  tools: z
    .array(z.enum(["nano-banana", "figma", "kapture", "playwright"]))
    .default(["nano-banana"])
    .describe("Narzedzia graficzne do uzycia"),
});

export type VisualsInput = z.infer<typeof visualsSchema>;

export async function generateVisuals(input: VisualsInput): Promise<string> {
  return [
    "## generate_visuals() - Faza 2 (w budowie)",
    "",
    `Koncepcja: ${input.concept}`,
    `Narzedzia: ${input.tools.join(", ")}`,
    "",
    "Ta funkcja bedzie:",
    "1. Generowac obrazy przez Nano Banana MCP (Gemini image gen)",
    "2. Tworzyc wireframy/diagramy przez Figma MCP",
    "3. Robic screenshoty referencyjne przez Kapture/Playwright",
    "",
    "Status: NIE ZAIMPLEMENTOWANE - czeka na Faze 2",
  ].join("\n");
}

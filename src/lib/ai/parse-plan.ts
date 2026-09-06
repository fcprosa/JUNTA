import "server-only";

import { parsePlanLocally } from "@/lib/ai/local-plan-parser";
import {
  parsedPlanSchema,
  type ParsedPlan,
} from "@/lib/domain/schemas";

const systemPrompt =
  "És um assistente que estrutura planos sociais escritos em português de Portugal. Extrai apenas a informação que está explícita ou claramente implícita no texto. Não inventes dados. Não infiras atributos sensíveis, género, orientação sexual, raça, religião, intenções românticas ou traços de personalidade. Quando não souberes um campo, usa null. Responde apenas em JSON válido.";

type ChatCompletion = {
  choices?: Array<{ message?: { content?: string } }>;
};

export async function parsePlanWithAI(input: string): Promise<ParsedPlan> {
  const fallback = parsePlanLocally(input);
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;

  if (!apiKey || !model) return fallback;

  const baseUrl = (process.env.AI_BASE_URL ?? "https://api.openai.com/v1").replace(
    /\/$/,
    "",
  );

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `${input}\n\nDevolve exatamente os campos titulo, descricao, tipo, intencao, vibe, numeroPessoas, cidade, zonaAproximada, data, horaInicio, horaFim, orcamento e tags.`,
          },
        ],
      }),
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) return fallback;
    const payload = (await response.json()) as ChatCompletion;
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return fallback;

    return parsedPlanSchema.parse(JSON.parse(content));
  } catch {
    return fallback;
  }
}

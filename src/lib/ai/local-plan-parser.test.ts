import { parsePlanLocally } from "@/lib/ai/local-plan-parser";
import { groupSchema, profileSchema } from "@/lib/domain/schemas";
import { describe, expect, it } from "vitest";

describe("parsePlanLocally", () => {
  it("extrai pessoas, cidade e intenção de texto português", () => {
    const result = parsePlanLocally(
      "Somos 4 em Lisboa e queremos jogar padel amanhã à tarde para conhecer pessoas novas.",
    );
    expect(result.numeroPessoas).toBe(4);
    expect(result.cidade).toBe("Lisboa");
    expect(result.intencao).toBe("Desporto e atividade");
    expect(result.tags).toContain("padel");
  });
});

describe("schemas de segurança do domínio", () => {
  it("rejeita menores e grupos fora do intervalo 2–8", () => {
    expect(() =>
      profileSchema.parse({
        id: "p",
        nome: "Pessoa",
        idade: 17,
        cidade: "Lisboa",
        createdAt: new Date().toISOString(),
      }),
    ).toThrow();
    expect(() =>
      groupSchema.parse({
        id: "g",
        nome: "Grupo",
        descricao: "",
        cidade: "Lisboa",
        zonaAproximada: null,
        avatar: null,
        numeroPessoas: 9,
        interesses: [],
        isDemo: false,
        createdAt: new Date().toISOString(),
      }),
    ).toThrow();
  });
});

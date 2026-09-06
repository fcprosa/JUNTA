import type { Group, Plan } from "@/lib/domain/schemas";
import { findMatches } from "@/lib/matching/match-groups";
import { describe, expect, it } from "vitest";

const createdAt = "2026-09-06T12:00:00.000Z";

function group(id: string, interesses: string[] = ["Livros"]): Group {
  return {
    id,
    nome: `Grupo ${id}`,
    descricao: "",
    cidade: "Lisboa",
    zonaAproximada: "Arroios",
    avatar: null,
    numeroPessoas: 4,
    interesses,
    isDemo: false,
    createdAt,
  };
}

function plan(id: string, groupId: string, overrides: Partial<Plan> = {}): Plan {
  return {
    id,
    groupId,
    titulo: "Book club",
    descricao: "Conversar sobre um livro num café.",
    tipo: "Book club",
    intencao: "Conhecer pessoas novas",
    vibe: "Tranquila",
    numeroPessoas: 4,
    cidade: "Lisboa",
    zonaAproximada: "Arroios",
    data: "2026-09-20",
    horaInicio: "15:00",
    horaFim: "17:00",
    orcamento: 8,
    tags: ["Livros"],
    status: "ativo",
    createdAt,
    ...overrides,
  };
}

describe("findMatches", () => {
  it("devolve no máximo dois resultados por ordem de relevância", () => {
    const groups = [group("a"), group("b"), group("c", ["Cinema"]), group("d")];
    const result = findMatches({
      sourcePlan: plan("pa", "a"),
      groups,
      plans: [
        plan("pb", "b"),
        plan("pc", "c", { tipo: "Café", tags: ["Cinema"] }),
        plan("pd", "d"),
      ],
    });
    expect(result).toHaveLength(2);
    expect(result[0].reasons).toContain("Tipo de plano semelhante");
  });

  it("exclui bloqueados, horários sem overlap e intenções incompatíveis", () => {
    const groups = [group("a"), group("b"), group("c"), group("d")];
    const result = findMatches({
      sourcePlan: plan("pa", "a"),
      groups,
      blockedGroupIds: ["b"],
      plans: [
        plan("pb", "b"),
        plan("pc", "c", { horaInicio: "18:00", horaFim: "19:00" }),
        plan("pd", "d", { intencao: "Networking" }),
      ],
    });
    expect(result).toEqual([]);
  });
});

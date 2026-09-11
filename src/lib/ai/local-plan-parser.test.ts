import {
  isGenericPlanTitle,
  parsePlanLocally,
} from "@/lib/ai/local-plan-parser";
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

describe("título do plano local", () => {
  it("usa a atividade do texto em vez de um título genérico", () => {
    const result = parsePlanLocally(
      "queremos jogar padel sábado à tarde em Lisboa",
    );
    expect(result.titulo.toLowerCase()).toContain("padel");
    expect(result.horaInicio).toBe("15:00");
    expect(result.horaFim).toBe("19:00");
    expect(isGenericPlanTitle(result.titulo)).toBe(false);
  });

  it("dá títulos diferentes a atividades diferentes", () => {
    const titles = [
      "queremos criar um book club no domingo à tarde em Lisboa",
      "queremos ir a um concerto no sábado à noite no Porto",
      "queremos ir estudar para a biblioteca na quarta de manhã em Coimbra",
    ].map((text) => parsePlanLocally(text).titulo);

    expect(new Set(titles).size).toBe(3);
    expect(titles.every((title) => !isGenericPlanTitle(title))).toBe(true);
  });

  it("deriva o genérico da intenção quando não reconhece a atividade", () => {
    const networking = parsePlanLocally(
      "somos 4 e queremos alargar a rede profissional na sexta à noite em Lisboa",
    );
    const social = parsePlanLocally(
      "somos 4 e queremos combinar qualquer coisa na sexta à noite em Lisboa",
    );

    expect(networking.intencao).toBe("Networking");
    expect(social.intencao).toBe("Conhecer pessoas novas");
    expect(networking.titulo).not.toBe(social.titulo);
    expect(isGenericPlanTitle(networking.titulo)).toBe(true);
    expect(isGenericPlanTitle(social.titulo)).toBe(true);
  });
});

describe("janelas horárias do plano local", () => {
  const windows: Array<[string, string, string]> = [
    ["vamos correr sábado de manhã em Lisboa", "10:00", "13:00"],
    ["queremos almoçar juntos no sábado em Lisboa", "12:00", "14:30"],
    ["queremos jogar padel sábado à tarde em Lisboa", "15:00", "19:00"],
    ["um café no fim da tarde de sábado em Lisboa", "17:00", "20:00"],
    ["jogos de tabuleiro sábado à noite em Lisboa", "20:00", "23:30"],
  ];

  it.each(windows)("reconhece a janela em «%s»", (text, inicio, fim) => {
    const result = parsePlanLocally(text);
    expect(result.horaInicio).toBe(inicio);
    expect(result.horaFim).toBe(fim);
  });

  it("reconhece horas explícitas", () => {
    expect(parsePlanLocally("queremos jogar padel às 19 em Lisboa")).toMatchObject(
      { horaInicio: "19:00", horaFim: "21:00" },
    );
    expect(
      parsePlanLocally("um concerto por volta das 21h no Porto"),
    ).toMatchObject({ horaInicio: "21:00", horaFim: "23:00" });
    expect(
      parsePlanLocally("esplanada das 18 às 22 em Lisboa"),
    ).toMatchObject({ horaInicio: "18:00", horaFim: "22:00" });
  });

  it("sem indicação usa a janela seguinte à hora certa, não a hora atual", () => {
    const result = parsePlanLocally(
      "queremos combinar qualquer coisa em Lisboa",
      new Date("2026-03-14T15:37:00"),
    );
    expect(result.horaInicio).toBe("17:00");
    expect(result.horaFim).toBe("20:00");
  });

  it("depois da última janela do dia usa a manhã seguinte", () => {
    const result = parsePlanLocally(
      "queremos combinar qualquer coisa em Lisboa",
      new Date("2026-03-14T23:40:00"),
    );
    expect(result.horaInicio).toBe("10:00");
    expect(result.horaFim).toBe("13:00");
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

import type { Intencao, ParsedPlan, Vibe } from "@/lib/domain/schemas";

const numberWords: Record<string, number> = {
  dois: 2,
  duas: 2,
  tres: 3,
  três: 3,
  quatro: 4,
  cinco: 5,
  seis: 6,
  sete: 7,
  oito: 8,
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function formatDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function addDays(now: Date, days: number) {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

function nextWeekday(now: Date, weekday: number) {
  const distance = (weekday - now.getDay() + 7) % 7 || 7;
  return addDays(now, distance);
}

function inferDate(text: string, now: Date) {
  if (text.includes("amanha")) return addDays(now, 1);
  if (text.includes("hoje")) return formatDate(now);

  const weekdays: Array<[string, number]> = [
    ["domingo", 0],
    ["segunda", 1],
    ["terca", 2],
    ["quarta", 3],
    ["quinta", 4],
    ["sexta", 5],
    ["sabado", 6],
  ];
  const match = weekdays.find(([word]) => text.includes(word));
  return match ? nextWeekday(now, match[1]) : null;
}

function inferPlan(text: string) {
  const options = [
    {
      terms: ["book club", "clube de leitura", "livro", "livros"],
      tipo: "Book club",
      titulo: "Book club descontraído",
      intencao: "Cultura e lazer" as Intencao,
      vibe: "Tranquila" as Vibe,
      tags: ["livros", "book club", "café"],
    },
    {
      terms: ["estudar", "estudo", "biblioteca"],
      tipo: "Estudo",
      titulo: "Estudar em conjunto",
      intencao: "Estudo e aprendizagem" as Intencao,
      vibe: "Tranquila" as Vibe,
      tags: ["estudo", "café", "livros"],
    },
    {
      terms: ["padel"],
      tipo: "Padel",
      titulo: "Jogar padel",
      intencao: "Desporto e atividade" as Intencao,
      vibe: "Ativa" as Vibe,
      tags: ["padel", "desporto"],
    },
    {
      terms: ["correr", "corrida"],
      tipo: "Corrida",
      titulo: "Correr em grupo",
      intencao: "Desporto e atividade" as Intencao,
      vibe: "Ativa" as Vibe,
      tags: ["corrida", "desporto"],
    },
    {
      terms: ["concerto", "musica"],
      tipo: "Concerto",
      titulo: "Ir a um concerto",
      intencao: "Cultura e lazer" as Intencao,
      vibe: "Social" as Vibe,
      tags: ["música", "concerto", "cultura"],
    },
    {
      terms: ["exposicao", "museu"],
      tipo: "Exposição",
      titulo: "Explorar uma exposição",
      intencao: "Cultura e lazer" as Intencao,
      vibe: "Criativa" as Vibe,
      tags: ["museus", "exposição", "cultura", "café"],
    },
    {
      terms: ["jogos de tabuleiro", "noite de jogos"],
      tipo: "Jogos de tabuleiro",
      titulo: "Noite de jogos de tabuleiro",
      intencao: "Conhecer pessoas novas" as Intencao,
      vibe: "Social" as Vibe,
      tags: ["jogos de tabuleiro", "jogos", "comida"],
    },
    {
      terms: ["esplanada", "beber um cafe", "beber cafe"],
      tipo: "Café ou esplanada",
      titulo: "Café e conversa",
      intencao: "Conhecer pessoas novas" as Intencao,
      vibe: "Social" as Vibe,
      tags: ["café", "esplanada", "conversa"],
    },
  ];

  return (
    options.find((option) => option.terms.some((term) => text.includes(term))) ?? {
      tipo: "Plano social",
      titulo: "Fazer um plano em conjunto",
      intencao: "Conhecer pessoas novas" as Intencao,
      vibe: "Qualquer uma" as Vibe,
      tags: ["conhecer pessoas", "plano em grupo"],
    }
  );
}

export function parsePlanLocally(input: string, now = new Date()): ParsedPlan {
  const text = normalize(input);
  const inferred = inferPlan(text);
  const digitMatch = text.match(/\bsomos\s+([2-8])\b/);
  const wordMatch = Object.entries(numberWords).find(([word]) =>
    text.includes(`somos ${normalize(word)}`),
  );
  const explicitTime = text.match(/\b(?:as|pelas)\s+(\d{1,2})(?::(\d{2}))?\b/);
  const hour = explicitTime ? Number(explicitTime[1]) : null;
  const minute = explicitTime?.[2] ?? "00";

  let horaInicio: string | null = null;
  let horaFim: string | null = null;
  if (hour !== null && hour >= 0 && hour <= 23) {
    horaInicio = `${String(hour).padStart(2, "0")}:${minute}`;
    horaFim = `${String(Math.min(hour + 2, 23)).padStart(2, "0")}:${minute}`;
  } else if (text.includes("manha")) {
    horaInicio = "10:00";
    horaFim = "12:00";
  } else if (text.includes("tarde")) {
    horaInicio = "15:00";
    horaFim = "18:00";
  } else if (text.includes("noite")) {
    horaInicio = "19:00";
    horaFim = "22:00";
  }

  const budgetMatch =
    text.match(/(?:ate|máximo|maximo)\s*(\d+)\s*(?:€|euros?)/) ??
    text.match(/(\d+)\s*(?:€|euros?)/);

  const city =
    ["Lisboa", "Porto", "Coimbra", "Braga", "Faro", "Aveiro", "Setúbal"].find(
      (candidate) => text.includes(normalize(candidate)),
    ) ?? null;

  return {
    titulo: inferred.titulo,
    descricao: input.trim(),
    tipo: inferred.tipo,
    intencao: text.includes("solteir")
      ? "Conhecer outros solteiros"
      : inferred.intencao,
    vibe: inferred.vibe,
    numeroPessoas: digitMatch
      ? Number(digitMatch[1])
      : wordMatch
        ? wordMatch[1]
        : null,
    cidade: city,
    zonaAproximada: null,
    data: inferDate(text, now),
    horaInicio,
    horaFim,
    orcamento: budgetMatch ? Number(budgetMatch[1]) : null,
    tags: inferred.tags,
  };
}

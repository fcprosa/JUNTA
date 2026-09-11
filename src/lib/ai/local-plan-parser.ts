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

/** Janelas nomeadas usadas quando o texto não traz horas explícitas. */
const namedWindows: Array<{ terms: string[]; inicio: string; fim: string }> = [
  {
    terms: ["fim da tarde", "fim de tarde", "final da tarde"],
    inicio: "17:00",
    fim: "20:00",
  },
  { terms: ["almoc"], inicio: "12:00", fim: "14:30" },
  { terms: ["manha"], inicio: "10:00", fim: "13:00" },
  { terms: ["tarde"], inicio: "15:00", fim: "19:00" },
  { terms: ["noite", "jantar", "serao"], inicio: "20:00", fim: "23:30" },
];

/** Ordem cronológica para escolher a janela seguinte a partir da hora atual. */
const windowsByStart = namedWindows
  .map(({ inicio, fim }) => ({ inicio, fim }))
  .sort((left, right) => left.inicio.localeCompare(right.inicio));

/** "manha" não pode ser encontrado dentro de "amanha". */
function mentions(text: string, term: string) {
  return new RegExp(String.raw`\b${term}`).test(text);
}

const hourToken = String.raw`(\d{1,2})(?:[:h](\d{2}))?h?`;
const explicitRange = new RegExp(
  String.raw`\b(?:das|de|entre as|entre)\s+${hourToken}\s+(?:ate as|ate|as|e)\s+${hourToken}`,
);
const explicitHour = new RegExp(
  String.raw`\b(?:as|pelas|para as|volta das|partir das)\s+${hourToken}`,
);
const bareHour = /\b(\d{1,2})h(\d{2})?\b/;

function toLabel(minutes: number) {
  const bounded = Math.max(0, Math.min(minutes, 23 * 60 + 59));
  return [
    String(Math.floor(bounded / 60)).padStart(2, "0"),
    String(bounded % 60).padStart(2, "0"),
  ].join(":");
}

function toMinutes(hour: string, minute?: string) {
  return Number(hour) * 60 + Number(minute ?? "0");
}

function isValidHour(hour: string) {
  return Number(hour) >= 0 && Number(hour) <= 23;
}

function inferWindow(text: string, now: Date) {
  const range = text.match(explicitRange);
  if (range && isValidHour(range[1]) && isValidHour(range[3])) {
    const start = toMinutes(range[1], range[2]);
    const end = toMinutes(range[3], range[4]);
    if (end > start) return { inicio: toLabel(start), fim: toLabel(end) };
  }

  const single = text.match(explicitHour) ?? text.match(bareHour);
  if (single && isValidHour(single[1])) {
    const start = toMinutes(single[1], single[2]);
    return { inicio: toLabel(start), fim: toLabel(start + 120) };
  }

  const named = namedWindows.find((candidate) =>
    candidate.terms.some((term) => mentions(text, term)),
  );
  if (named) return { inicio: named.inicio, fim: named.fim };

  return (
    windowsByStart.find(
      (candidate) => Number(candidate.inicio.slice(0, 2)) > now.getHours(),
    ) ?? windowsByStart[0]
  );
}

/**
 * Títulos usados apenas quando nenhuma atividade é reconhecida no texto. Cada
 * intenção tem o seu, para que dois grupos diferentes não fiquem com o mesmo.
 */
const genericTitles: Record<Intencao, string> = {
  Amizade: "Conhecer um grupo novo",
  "Conhecer pessoas novas": "Conhecer outro grupo",
  "Conhecer outros solteiros": "Conhecer outro grupo de solteiros",
  "Estudo e aprendizagem": "Aprender algo em conjunto",
  "Desporto e atividade": "Fazer desporto em grupo",
  "Cultura e lazer": "Plano cultural em conjunto",
  Networking: "Encontro de networking",
  Outro: "Fazer um plano em conjunto",
};

const intentionCues: Array<[Intencao, string[]]> = [
  ["Networking", ["networking", "profissional", "carreira"]],
  ["Estudo e aprendizagem", ["aprender", "workshop", "apontamentos"]],
  ["Desporto e atividade", ["desporto", "treinar", "treino", "ginasio"]],
  ["Cultura e lazer", ["cultura", "cultural", "arte", "teatro"]],
  ["Amizade", ["amizade", "fazer amigos", "amigos novos"]],
];

function inferIntention(text: string): Intencao {
  return (
    intentionCues.find(([, terms]) =>
      terms.some((term) => text.includes(term)),
    )?.[0] ?? "Conhecer pessoas novas"
  );
}

/** Indica se o título veio do genérico por intenção e não do texto do grupo. */
export function isGenericPlanTitle(titulo: string) {
  const normalized = normalize(titulo.trim());
  return Object.values(genericTitles).some(
    (candidate) => normalize(candidate) === normalized,
  );
}

function inferPlan(text: string) {
  const options = [
    {
      terms: ["book club", "clube de leitura", "leitura", "livro", "livros"],
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
      terms: ["concerto", "musica", "festival"],
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
      terms: ["jogos de tabuleiro", "noite de jogos", "jogos"],
      tipo: "Jogos de tabuleiro",
      titulo: "Noite de jogos de tabuleiro",
      intencao: "Conhecer pessoas novas" as Intencao,
      vibe: "Social" as Vibe,
      tags: ["jogos de tabuleiro", "jogos", "comida"],
    },
    {
      terms: ["esplanada", "beber um cafe", "beber cafe", "cafe", "petiscos"],
      tipo: "Café ou esplanada",
      titulo: "Café e conversa",
      intencao: "Conhecer pessoas novas" as Intencao,
      vibe: "Social" as Vibe,
      tags: ["café", "esplanada", "conversa"],
    },
  ];

  return (
    options.find((option) => option.terms.some((term) => text.includes(term))) ??
    null
  );
}

export function parsePlanLocally(input: string, now = new Date()): ParsedPlan {
  const text = normalize(input);
  const inferred = inferPlan(text);
  const digitMatch = text.match(/\bsomos\s+([2-8])\b/);
  const wordMatch = Object.entries(numberWords).find(([word]) =>
    text.includes(`somos ${normalize(word)}`),
  );
  const timeWindow = inferWindow(text, now);
  const intencao: Intencao = text.includes("solteir")
    ? "Conhecer outros solteiros"
    : inferred?.intencao ?? inferIntention(text);

  const budgetMatch =
    text.match(/(?:ate|máximo|maximo)\s*(\d+)\s*(?:€|euros?)/) ??
    text.match(/(\d+)\s*(?:€|euros?)/);

  const city =
    ["Lisboa", "Porto", "Coimbra", "Braga", "Faro", "Aveiro", "Setúbal"].find(
      (candidate) => text.includes(normalize(candidate)),
    ) ?? null;

  return {
    titulo: inferred?.titulo ?? genericTitles[intencao],
    descricao: input.trim(),
    tipo: inferred?.tipo ?? "Plano social",
    intencao,
    vibe: inferred?.vibe ?? "Qualquer uma",
    numeroPessoas: digitMatch
      ? Number(digitMatch[1])
      : wordMatch
        ? wordMatch[1]
        : null,
    cidade: city,
    zonaAproximada: null,
    data: inferDate(text, now),
    horaInicio: timeWindow.inicio,
    horaFim: timeWindow.fim,
    orcamento: budgetMatch ? Number(budgetMatch[1]) : null,
    tags: inferred?.tags ?? ["conhecer pessoas", "plano em grupo"],
  };
}

import type { Group, Plan } from "@/lib/domain/schemas";

function formatDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function nextWeekday(from: Date, weekday: number) {
  const date = new Date(from);
  const distance = (weekday - date.getDay() + 7) % 7 || 7;
  date.setDate(date.getDate() + distance);
  return formatDate(date);
}

export function createDemoData(now = new Date()): {
  groups: Group[];
  plans: Plan[];
} {
  const createdAt = now.toISOString();
  const sunday = nextWeekday(now, 0);
  const wednesday = nextWeekday(now, 3);
  const saturday = nextWeekday(now, 6);

  const groups: Group[] = [
    {
      id: "group-pagina-42",
      nome: "Página 42",
      descricao:
        "Três amigos que gostam de livros, cafés e conversas longas.",
      cidade: "Lisboa",
      zonaAproximada: "Arroios",
      avatar: null,
      numeroPessoas: 3,
      interesses: ["Livros", "Cafés", "Cultura"],
      isDemo: true,
      createdAt,
    },
    {
      id: "group-biblioteca",
      nome: "Os da Biblioteca",
      descricao: "Quatro estudantes, sempre com espaço para mais uma conversa.",
      cidade: "Lisboa",
      zonaAproximada: "Alvalade",
      avatar: null,
      numeroPessoas: 4,
      interesses: ["Estudo", "Livros", "Café"],
      isDemo: true,
      createdAt,
    },
    {
      id: "group-padel",
      nome: "Padel Depois do Trabalho",
      descricao: "Um grupo descontraído que troca o escritório pelo campo.",
      cidade: "Lisboa",
      zonaAproximada: "Parque das Nações",
      avatar: null,
      numeroPessoas: 4,
      interesses: ["Padel", "Desporto", "Cerveja"],
      isDemo: true,
      createdAt,
    },
    {
      id: "group-fora-rotina",
      nome: "Fora da Rotina",
      descricao: "Três amigos à procura de cultura, comida e boas conversas.",
      cidade: "Lisboa",
      zonaAproximada: "Avenidas Novas",
      avatar: null,
      numeroPessoas: 3,
      interesses: ["Museus", "Música", "Comida", "Conversa", "Cultura"],
      isDemo: true,
      createdAt,
    },
    {
      id: "group-jogada",
      nome: "Jogada Combinada",
      descricao: "Cinco amigos que não recusam um jogo nem uma esplanada.",
      cidade: "Lisboa",
      zonaAproximada: "Campo de Ourique",
      avatar: null,
      numeroPessoas: 5,
      interesses: ["Futebol", "Jogos", "Esplanadas"],
      isDemo: true,
      createdAt,
    },
    {
      id: "group-mesa-redonda",
      nome: "Mesa Redonda",
      descricao: "Jogos de tabuleiro, tecnologia e qualquer coisa para petiscar.",
      cidade: "Lisboa",
      zonaAproximada: "Saldanha",
      avatar: null,
      numeroPessoas: 4,
      interesses: ["Jogos de tabuleiro", "Tecnologia", "Comida"],
      isDemo: true,
      createdAt,
    },
  ];

  const plans: Plan[] = [
    {
      id: "plan-pagina-42",
      groupId: "group-pagina-42",
      titulo: "Book club sem cerimónias",
      descricao: "Criar um book club descontraído no domingo.",
      tipo: "Book club",
      intencao: "Cultura e lazer",
      vibe: "Tranquila",
      numeroPessoas: 3,
      cidade: "Lisboa",
      zonaAproximada: "Arroios",
      data: sunday,
      horaInicio: "15:00",
      horaFim: "18:00",
      orcamento: 10,
      tags: ["livros", "café", "book club", "cultura"],
      status: "ativo",
      createdAt,
    },
    {
      id: "plan-biblioteca",
      groupId: "group-biblioteca",
      titulo: "Estudar com companhia",
      descricao: "Estudar juntos e conhecer outro grupo esta quarta-feira.",
      tipo: "Estudo",
      intencao: "Estudo e aprendizagem",
      vibe: "Tranquila",
      numeroPessoas: 4,
      cidade: "Lisboa",
      zonaAproximada: "Alvalade",
      data: wednesday,
      horaInicio: "15:00",
      horaFim: "19:00",
      orcamento: 8,
      tags: ["estudo", "livros", "café"],
      status: "ativo",
      createdAt,
    },
    {
      id: "plan-padel",
      groupId: "group-padel",
      titulo: "Padel no sábado",
      descricao: "Jogar padel no sábado de manhã.",
      tipo: "Padel",
      intencao: "Desporto e atividade",
      vibe: "Ativa",
      numeroPessoas: 4,
      cidade: "Lisboa",
      zonaAproximada: "Parque das Nações",
      data: saturday,
      horaInicio: "10:00",
      horaFim: "12:00",
      orcamento: 15,
      tags: ["padel", "desporto"],
      status: "ativo",
      createdAt,
    },
    {
      id: "plan-fora-rotina",
      groupId: "group-fora-rotina",
      titulo: "Exposição e café",
      descricao: "Explorar uma exposição e ir beber café.",
      tipo: "Exposição",
      intencao: "Cultura e lazer",
      vibe: "Criativa",
      numeroPessoas: 3,
      cidade: "Lisboa",
      zonaAproximada: "Avenidas Novas",
      data: sunday,
      horaInicio: "14:00",
      horaFim: "18:30",
      orcamento: 12,
      tags: ["museus", "café", "cultura", "conversa"],
      status: "ativo",
      createdAt,
    },
    {
      id: "plan-jogada",
      groupId: "group-jogada",
      titulo: "Ver o jogo em grupo",
      descricao: "Ver o jogo e conhecer outro grupo.",
      tipo: "Futebol",
      intencao: "Conhecer pessoas novas",
      vibe: "Social",
      numeroPessoas: 5,
      cidade: "Lisboa",
      zonaAproximada: "Campo de Ourique",
      data: saturday,
      horaInicio: "18:00",
      horaFim: "21:00",
      orcamento: 15,
      tags: ["futebol", "esplanada", "jogo"],
      status: "ativo",
      createdAt,
    },
    {
      id: "plan-mesa-redonda",
      groupId: "group-mesa-redonda",
      titulo: "Noite de jogos de tabuleiro",
      descricao: "Noite de jogos de tabuleiro com outro grupo.",
      tipo: "Jogos de tabuleiro",
      intencao: "Conhecer pessoas novas",
      vibe: "Social",
      numeroPessoas: 4,
      cidade: "Lisboa",
      zonaAproximada: "Saldanha",
      data: saturday,
      horaInicio: "19:00",
      horaFim: "23:00",
      orcamento: 12,
      tags: ["jogos de tabuleiro", "tecnologia", "comida"],
      status: "ativo",
      createdAt,
    },
  ];

  return { groups, plans };
}

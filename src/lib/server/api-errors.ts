import "server-only";

const publicMessages = [
  "Apenas maiores de 18 anos",
  "Acesso à beta não aprovado",
  "Já existe um grupo ativo",
  "O nome do grupo precisa de 3 caracteres e 2 letras",
  "Máximo de três planos ativos",
  "O plano tem de terminar no futuro",
  "O plano deve ser na cidade do grupo",
  "Horário inválido",
  "Plano não encontrado",
  "Plano inativo",
  "Convite indisponível",
  "Máximo de dois convites pendentes por plano",
  "Máximo de cinco convites em 24 horas",
  "Este grupo já recebeu um convite para este plano",
  "Este grupo já não tem um plano compatível",
  "Só o grupo convidado pode responder",
  "O plano já expirou",
  "Conversa inativa ou expirada",
  "Conversa bloqueada",
  "Limite temporário de mensagens atingido",
  "Sem permissão",
  "Sem permissão para enviar mensagens",
];

export function safeDatabaseMessage(error: unknown) {
  const message =
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
      ? error.message
      : "";
  return (
    publicMessages.find((candidate) => message.includes(candidate)) ??
    "Não foi possível concluir a operação."
  );
}

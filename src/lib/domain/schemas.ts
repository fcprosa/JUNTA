import { z } from "zod";

export const intencoes = [
  "Amizade",
  "Conhecer pessoas novas",
  "Conhecer outros solteiros",
  "Estudo e aprendizagem",
  "Desporto e atividade",
  "Cultura e lazer",
  "Networking",
  "Outro",
] as const;

export const vibes = [
  "Tranquila",
  "Social",
  "Espontânea",
  "Criativa",
  "Ativa",
  "Qualquer uma",
] as const;

export const profileSchema = z.object({
  id: z.string(),
  nome: z.string().min(1),
  idade: z.number().int().min(18),
  cidade: z.string().min(1),
  createdAt: z.string(),
});

export const groupSchema = z.object({
  id: z.string(),
  nome: z.string().min(1),
  descricao: z.string(),
  cidade: z.string().min(1),
  zonaAproximada: z.string().nullable(),
  avatar: z.string().nullable(),
  numeroPessoas: z.number().int().min(2).max(8),
  interesses: z.array(z.string()),
  isDemo: z.boolean(),
  createdAt: z.string(),
});

export const planSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  titulo: z.string().min(1),
  descricao: z.string().min(1),
  tipo: z.string().nullable(),
  intencao: z.enum(intencoes),
  vibe: z.enum(vibes),
  numeroPessoas: z.number().int().min(2).max(8),
  cidade: z.string().min(1),
  zonaAproximada: z.string().nullable(),
  data: z.string(),
  horaInicio: z.string(),
  horaFim: z.string(),
  orcamento: z.number().min(0).nullable(),
  tags: z.array(z.string()),
  status: z.enum(["ativo", "expirado", "terminado"]),
  createdAt: z.string(),
});

export const invitationSchema = z.object({
  id: z.string(),
  fromGroupId: z.string(),
  toGroupId: z.string(),
  planId: z.string(),
  mensagem: z.string().min(1),
  status: z.enum(["pendente", "aceite", "recusado"]),
  createdAt: z.string(),
});

export const conversationSchema = z.object({
  id: z.string(),
  invitationId: z.string(),
  status: z.enum(["ativa", "expirada", "terminada", "bloqueada"]),
  expiresAt: z.string(),
  createdAt: z.string(),
});

export const messageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderGroupId: z.string(),
  content: z.string().min(1).max(1000),
  createdAt: z.string(),
});

export const reportReasons = [
  "Comportamento abusivo",
  "Spam",
  "Perfil falso",
  "Conteúdo inadequado",
  "Outro",
] as const;

export const reportSchema = z.object({
  id: z.string(),
  reporterGroupId: z.string(),
  reportedGroupId: z.string(),
  conversationId: z.string(),
  motivo: z.enum(reportReasons),
  createdAt: z.string(),
});

export const blockSchema = z.object({
  id: z.string(),
  blockerGroupId: z.string(),
  blockedGroupId: z.string(),
  conversationId: z.string(),
  createdAt: z.string(),
});

export const parsedPlanSchema = z.object({
  titulo: z.string(),
  descricao: z.string(),
  tipo: z.string().nullable(),
  intencao: z.enum(intencoes).nullable(),
  vibe: z.enum(vibes).nullable(),
  numeroPessoas: z.number().int().min(2).max(8).nullable(),
  cidade: z.string().nullable(),
  zonaAproximada: z.string().nullable(),
  data: z.string().nullable(),
  horaInicio: z.string().nullable(),
  horaFim: z.string().nullable(),
  orcamento: z.number().min(0).nullable(),
  tags: z.array(z.string()),
});

export type Profile = z.infer<typeof profileSchema>;
export type Group = z.infer<typeof groupSchema>;
export type Plan = z.infer<typeof planSchema>;
export type Invitation = z.infer<typeof invitationSchema>;
export type Conversation = z.infer<typeof conversationSchema>;
export type Message = z.infer<typeof messageSchema>;
export type Report = z.infer<typeof reportSchema>;
export type Block = z.infer<typeof blockSchema>;
export type ParsedPlan = z.infer<typeof parsedPlanSchema>;
export type Intencao = (typeof intencoes)[number];
export type Vibe = (typeof vibes)[number];
export type ReportReason = (typeof reportReasons)[number];

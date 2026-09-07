import "server-only";

import { createClient } from "@/lib/supabase/server";

function planStatus(status: string) {
  if (status === "active") return "ativo";
  if (status === "expired") return "expirado";
  return "terminado";
}

function invitationStatus(status: string) {
  if (status === "pending") return "pendente";
  if (status === "accepted") return "aceite";
  return "recusado";
}

function conversationStatus(status: string) {
  if (status === "active") return "ativa";
  if (status === "expired") return "expirada";
  return "terminada";
}

export async function getLiveBootstrap() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("UNAUTHENTICATED");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,nome,idade,cidade,onboarding_completed,created_at")
    .eq("id", user.id)
    .single();
  if (profileError || !profile) throw profileError ?? new Error("Perfil em falta");

  const { data: ownedGroupId, error: groupError } =
    await supabase.rpc("get_my_group_id");
  if (groupError) throw groupError;

  if (!ownedGroupId) {
    return {
      version: 1 as const,
      profile: profile.onboarding_completed
        ? {
            id: profile.id,
            nome: profile.nome,
            idade: profile.idade,
            cidade: profile.cidade,
            createdAt: profile.created_at,
          }
        : null,
      currentGroupId: null,
      groups: [],
      plans: [],
      invitations: [],
      conversations: [],
      messages: [],
      reports: [],
      blocks: [],
      draftSource: "",
      parsedDraft: null,
    };
  }

  const [
    invitationsResult,
    plansResult,
    groupsResult,
    conversationsResult,
    messagesResult,
    blocksResult,
  ] = await Promise.all([
    supabase
      .from("invitations")
      .select("id,plan_id,from_group_id,to_group_id,mensagem,status,created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("plans")
      .select(
        "id,group_id,titulo,descricao,tipo,intencao,vibe,numero_pessoas,cidade,zona_aproximada,data,hora_inicio,hora_fim,orcamento,tags,status,created_at",
      ),
    supabase
      .from("groups")
      .select(
        "id,nome,descricao,cidade,zona_aproximada,avatar_url,numero_pessoas,interesses,created_at",
      ),
    supabase
      .from("conversations")
      .select("id,invitation_id,status,expires_at,created_at"),
    supabase
      .from("messages")
      .select("id,conversation_id,sender_group_id,content,created_at")
      .order("created_at"),
    supabase
      .from("blocks")
      .select("id,blocker_group_id,blocked_group_id,created_at"),
  ]);
  const queryError =
    invitationsResult.error ??
    plansResult.error ??
    groupsResult.error ??
    conversationsResult.error ??
    messagesResult.error ??
    blocksResult.error;
  if (queryError) throw queryError;

  const invitations = invitationsResult.data ?? [];
  const allPlans = plansResult.data ?? [];
  const relatedGroups = groupsResult.data ?? [];
  const conversations = conversationsResult.data ?? [];
  const messages = messagesResult.data ?? [];
  const blocks = blocksResult.data ?? [];
  const ownedGroup = relatedGroups.find((group) => group.id === ownedGroupId);
  if (!ownedGroup) throw new Error("Grupo próprio não visível");

  return {
    version: 1 as const,
    profile: {
      id: profile.id,
      nome: profile.nome,
      idade: profile.idade,
      cidade: profile.cidade,
      createdAt: profile.created_at,
    },
    currentGroupId: ownedGroupId,
    groups: relatedGroups.map((group) => ({
      id: group.id,
      nome: group.nome,
      descricao: group.descricao ?? "",
      cidade: group.cidade,
      zonaAproximada: group.zona_aproximada,
      avatar: group.avatar_url,
      numeroPessoas: group.numero_pessoas,
      interesses: group.interesses,
      isDemo: false,
      createdAt: group.created_at,
    })),
    plans: allPlans.map((plan) => ({
      id: plan.id,
      groupId: plan.group_id,
      titulo: plan.titulo,
      descricao: plan.descricao,
      tipo: plan.tipo,
      intencao: plan.intencao,
      vibe: plan.vibe ?? "Qualquer uma",
      numeroPessoas: plan.numero_pessoas,
      cidade: plan.cidade,
      zonaAproximada: plan.zona_aproximada,
      data: plan.data,
      horaInicio: plan.hora_inicio.slice(0, 5),
      horaFim: plan.hora_fim.slice(0, 5),
      orcamento: plan.orcamento === null ? null : Number(plan.orcamento),
      tags: plan.tags,
      status: planStatus(plan.status),
      createdAt: plan.created_at,
    })),
    invitations: invitations.map((invitation) => ({
      id: invitation.id,
      fromGroupId: invitation.from_group_id,
      toGroupId: invitation.to_group_id,
      planId: invitation.plan_id,
      mensagem: invitation.mensagem,
      status: invitationStatus(invitation.status),
      createdAt: invitation.created_at,
    })),
    conversations: conversations.map((conversation) => ({
      id: conversation.id,
      invitationId: conversation.invitation_id,
      status: conversationStatus(conversation.status),
      expiresAt: conversation.expires_at,
      createdAt: conversation.created_at,
    })),
    messages: messages.map((message) => ({
      id: message.id,
      conversationId: message.conversation_id,
      senderGroupId: message.sender_group_id,
      content: message.content,
      createdAt: message.created_at,
    })),
    reports: [],
    blocks: blocks.map((block) => ({
      id: block.id,
      blockerGroupId: block.blocker_group_id,
      blockedGroupId: block.blocked_group_id,
      conversationId: "",
      createdAt: block.created_at,
    })),
    draftSource: "",
    parsedDraft: null,
  };
}

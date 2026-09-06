import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
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

  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (profileError || !profile) throw profileError ?? new Error("Perfil em falta");

  const { data: ownedGroup, error: groupError } = await admin
    .from("groups")
    .select("*")
    .eq("owner_id", user.id)
    .eq("is_active", true)
    .maybeSingle();
  if (groupError) throw groupError;

  if (!ownedGroup) {
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

  const { data: invitationData, error: invitationError } = await admin
    .from("invitations")
    .select("*")
    .or(`from_group_id.eq.${ownedGroup.id},to_group_id.eq.${ownedGroup.id}`)
    .order("created_at", { ascending: false });
  if (invitationError) throw invitationError;
  const invitations = invitationData ?? [];

  const invitationIds = invitations.map((item) => item.id);
  const invitationPlanIds = invitations.map((item) => item.plan_id);
  const relatedGroupIds = [
    ownedGroup.id,
    ...invitations.flatMap((item) => [item.from_group_id, item.to_group_id]),
  ];

  const [ownPlansResult, invitationPlansResult, relatedGroupsResult, conversationsResult, blocksResult] = await Promise.all([
    admin.from("plans").select("*").eq("group_id", ownedGroup.id),
    invitationPlanIds.length
      ? admin.from("plans").select("*").in("id", invitationPlanIds)
      : Promise.resolve({ data: [] }),
    admin.from("groups").select("*").in("id", [...new Set(relatedGroupIds)]),
    invitationIds.length
      ? admin.from("conversations").select("*").in("invitation_id", invitationIds)
      : Promise.resolve({ data: [] }),
    admin.from("blocks").select("*").eq("blocker_group_id", ownedGroup.id),
  ]);
  const invitationPlansError =
    "error" in invitationPlansResult ? invitationPlansResult.error : null;
  const conversationsError =
    "error" in conversationsResult ? conversationsResult.error : null;
  const relatedError =
    ownPlansResult.error ??
    invitationPlansError ??
    relatedGroupsResult.error ??
    conversationsError ??
    blocksResult.error;
  if (relatedError) throw relatedError;
  const ownPlans = ownPlansResult.data ?? [];
  const invitationPlans = invitationPlansResult.data ?? [];
  const relatedGroups = relatedGroupsResult.data ?? [];
  const conversations = conversationsResult.data ?? [];
  const blocks = blocksResult.data ?? [];

  const allPlans = [...ownPlans, ...invitationPlans].filter(
    (plan, index, plans) => plans.findIndex((item) => item.id === plan.id) === index,
  );
  const conversationIds = conversations.map((item) => item.id);
  const messagesResult = conversationIds.length
    ? await admin
        .from("messages")
        .select("*")
        .in("conversation_id", conversationIds)
        .order("created_at")
    : { data: [] };
  if ("error" in messagesResult && messagesResult.error) {
    throw messagesResult.error;
  }
  const messages = messagesResult.data ?? [];

  return {
    version: 1 as const,
    profile: {
      id: profile.id,
      nome: profile.nome,
      idade: profile.idade,
      cidade: profile.cidade,
      createdAt: profile.created_at,
    },
    currentGroupId: ownedGroup.id,
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

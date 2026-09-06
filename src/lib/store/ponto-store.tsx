"use client";

import { createDemoData } from "@/lib/data/demo-seed";
import { isDemoMode } from "@/lib/config";
import {
  blockSchema,
  conversationSchema,
  groupSchema,
  invitationSchema,
  messageSchema,
  parsedPlanSchema,
  planSchema,
  profileSchema,
  reportSchema,
  type Block,
  type Conversation,
  type Group,
  type Invitation,
  type Message,
  type ParsedPlan,
  type Plan,
  type Profile,
  type Report,
  type ReportReason,
} from "@/lib/domain/schemas";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { z } from "zod";

const STORAGE_KEY = "ponto-demo-v1";

const persistedStateSchema = z.object({
  version: z.literal(1),
  profile: profileSchema.nullable(),
  currentGroupId: z.string().nullable(),
  groups: z.array(groupSchema),
  plans: z.array(planSchema),
  invitations: z.array(invitationSchema),
  conversations: z.array(conversationSchema),
  messages: z.array(messageSchema),
  reports: z.array(reportSchema),
  blocks: z.array(blockSchema),
  draftSource: z.string(),
  parsedDraft: parsedPlanSchema.nullable(),
});

type PersistedState = z.infer<typeof persistedStateSchema>;
type StoreState = PersistedState & { isHydrated: boolean };

type NewGroupInput = {
  nomePessoa: string;
  idade: number;
  cidade: string;
  nomeGrupo: string;
  descricao: string;
  zonaAproximada: string | null;
  numeroPessoas: number;
  interesses: string[];
};

type PublishPlanInput = Omit<
  Plan,
  "id" | "groupId" | "status" | "createdAt"
>;

type PontoStore = StoreState & {
  demoMode: boolean;
  currentGroup: Group | null;
  createGroup: (input: NewGroupInput) => Promise<void>;
  setDraft: (source: string, parsed: ParsedPlan) => void;
  clearDraft: () => void;
  publishPlan: (input: PublishPlanInput) => Promise<string>;
  sendInvitation: (
    planId: string,
    toGroupId: string,
    message: string,
  ) => Promise<string>;
  respondToInvitation: (
    invitationId: string,
    response: "aceite" | "recusado",
  ) => Promise<string | null>;
  sendMessage: (
    conversationId: string,
    senderGroupId: string,
    content: string,
  ) => Promise<void>;
  endConversation: (conversationId: string) => Promise<void>;
  blockGroup: (
    conversationId: string,
    blockedGroupId: string,
  ) => Promise<void>;
  reportGroup: (
    conversationId: string,
    reportedGroupId: string,
    reason: ReportReason,
  ) => Promise<void>;
  pendingInvitesForPlan: (planId: string) => number;
  resetDemo: () => void;
  refreshLiveData: () => Promise<void>;
};

function createInitialState(): PersistedState {
  const demo = createDemoData();
  return {
    version: 1,
    profile: null,
    currentGroupId: null,
    groups: demo.groups,
    plans: demo.plans,
    invitations: [],
    conversations: [],
    messages: [],
    reports: [],
    blocks: [],
    draftSource: "",
    parsedDraft: null,
  };
}

function createEmptyLiveState(): PersistedState {
  return {
    version: 1,
    profile: null,
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

async function liveRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
  } & T;
  if (!response.ok) {
    throw new Error(payload.error ?? "O serviço está temporariamente indisponível.");
  }
  return payload;
}

function dateTime(plan: Plan) {
  return new Date(`${plan.data}T${plan.horaFim}:00`);
}

function expireState(state: PersistedState, now = new Date()): PersistedState {
  let changed = false;
  const expiredPlanIds = new Set<string>();
  const plans = state.plans.map((plan) => {
    if (plan.status === "ativo" && dateTime(plan).getTime() <= now.getTime()) {
      changed = true;
      expiredPlanIds.add(plan.id);
      return { ...plan, status: "expirado" as const };
    }
    if (plan.status === "expirado") expiredPlanIds.add(plan.id);
    return plan;
  });
  const invitations = state.invitations.map((invitation) => {
    if (
      invitation.status === "pendente" &&
      expiredPlanIds.has(invitation.planId)
    ) {
      changed = true;
      return { ...invitation, status: "recusado" as const };
    }
    return invitation;
  });
  const conversations = state.conversations.map((conversation) => {
    if (
      conversation.status === "ativa" &&
      new Date(conversation.expiresAt).getTime() <= now.getTime()
    ) {
      changed = true;
      return { ...conversation, status: "expirada" as const };
    }
    return conversation;
  });
  return changed ? { ...state, plans, invitations, conversations } : state;
}

function readStoredState(): PersistedState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    return expireState(persistedStateSchema.parse(JSON.parse(raw)));
  } catch {
    return createInitialState();
  }
}

const PontoContext = createContext<PontoStore | null>(null);
const subscribeToHydration = () => () => undefined;

export function PontoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(() =>
    isDemoMode
      ? typeof window === "undefined"
        ? createInitialState()
        : readStoredState()
      : createEmptyLiveState(),
  );
  const [liveReady, setLiveReady] = useState(isDemoMode);
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!isHydrated || !isDemoMode) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [isHydrated, state]);

  useEffect(() => {
    if (!isDemoMode) return;
    const timer = window.setInterval(() => {
      setState((current) => expireState(current));
    }, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const refreshLiveData = useCallback(async () => {
    if (isDemoMode) return;
    try {
      const liveState = await liveRequest<PersistedState>(
        "/api/live/bootstrap",
        { cache: "no-store" },
      );
      setState((current) => ({
        ...liveState,
        draftSource: current.draftSource,
        parsedDraft: current.parsedDraft,
      }));
    } finally {
      setLiveReady(true);
    }
  }, []);

  useEffect(() => {
    if (isDemoMode) return;
    void refreshLiveData().catch(() => {
      // A proteção de rota apresenta o estado correto de autenticação/configuração.
    });
  }, [refreshLiveData]);

  const createGroup = useCallback(async (input: NewGroupInput) => {
    if (!isDemoMode) {
      await liveRequest<{ groupId: string }>("/api/live/onboarding", {
        method: "POST",
        body: JSON.stringify(input),
      });
      await refreshLiveData();
      return;
    }
    const now = new Date().toISOString();
    const profileId = crypto.randomUUID();
    const groupId = crypto.randomUUID();
    const profile: Profile = {
      id: profileId,
      nome: input.nomePessoa.trim(),
      idade: input.idade,
      cidade: input.cidade.trim(),
      createdAt: now,
    };
    const group: Group = {
      id: groupId,
      nome: input.nomeGrupo.trim(),
      descricao: input.descricao.trim(),
      cidade: input.cidade.trim(),
      zonaAproximada: input.zonaAproximada?.trim() || null,
      avatar: null,
      numeroPessoas: input.numeroPessoas,
      interesses: input.interesses,
      isDemo: false,
      createdAt: now,
    };
    setState((current) => ({
      ...current,
      profile,
      currentGroupId: groupId,
      groups: [...current.groups, group],
    }));
  }, [refreshLiveData]);

  const setDraft = useCallback((source: string, parsed: ParsedPlan) => {
    setState((current) => ({
      ...current,
      draftSource: source,
      parsedDraft: parsed,
    }));
  }, []);

  const clearDraft = useCallback(() => {
    setState((current) => ({
      ...current,
      draftSource: "",
      parsedDraft: null,
    }));
  }, []);

  const publishPlan = useCallback(
    async (input: PublishPlanInput) => {
      if (!isDemoMode) {
        const result = await liveRequest<{ planId: string }>("/api/live/plans", {
          method: "POST",
          body: JSON.stringify(input),
        });
        await refreshLiveData();
        setState((current) => ({
          ...current,
          draftSource: "",
          parsedDraft: null,
        }));
        return result.planId;
      }
      if (!state.currentGroupId) throw new Error("Cria primeiro o teu grupo.");
      const id = crypto.randomUUID();
      const plan = planSchema.parse({
        ...input,
        id,
        groupId: state.currentGroupId,
        status: "ativo",
        createdAt: new Date().toISOString(),
      });
      setState((current) => ({
        ...current,
        plans: [...current.plans, plan],
        draftSource: "",
        parsedDraft: null,
      }));
      return id;
    },
    [refreshLiveData, state.currentGroupId],
  );

  const sendInvitation = useCallback(
    async (planId: string, toGroupId: string, message: string) => {
      if (!isDemoMode) {
        const result = await liveRequest<{ invitationId: string }>(
          "/api/live/invitations",
          {
            method: "POST",
            body: JSON.stringify({ planId, toGroupId, message }),
          },
        );
        await refreshLiveData();
        return result.invitationId;
      }
      const plan = state.plans.find((item) => item.id === planId);
      if (
        !plan ||
        plan.status !== "ativo" ||
        dateTime(plan).getTime() <= Date.now()
      ) {
        throw new Error("Este plano já não está ativo.");
      }
      const pending = state.invitations.filter(
        (invitation) =>
          invitation.planId === planId && invitation.status === "pendente",
      );
      if (pending.length >= 2) {
        throw new Error("Já existem dois convites pendentes para este plano.");
      }
      if (pending.some((invitation) => invitation.toGroupId === toGroupId)) {
        throw new Error("Este grupo já recebeu um convite.");
      }
      const id = crypto.randomUUID();
      const invitation: Invitation = invitationSchema.parse({
        id,
        fromGroupId: plan.groupId,
        toGroupId,
        planId,
        mensagem: message.trim(),
        status: "pendente",
        createdAt: new Date().toISOString(),
      });
      setState((current) => ({
        ...current,
        invitations: [...current.invitations, invitation],
      }));
      return id;
    },
    [refreshLiveData, state.invitations, state.plans],
  );

  const respondToInvitation = useCallback(
    async (invitationId: string, response: "aceite" | "recusado") => {
      if (!isDemoMode) {
        const result = await liveRequest<{ conversationId: string | null }>(
          `/api/live/invitations/${invitationId}/respond`,
          {
            method: "POST",
            body: JSON.stringify({ response }),
          },
        );
        await refreshLiveData();
        return result.conversationId;
      }
      const invitation = state.invitations.find(
        (item) => item.id === invitationId,
      );
      if (!invitation || invitation.status !== "pendente") return null;

      const acceptedPlan = state.plans.find(
        (item) => item.id === invitation.planId,
      );
      if (
        response === "aceite" &&
        (!acceptedPlan ||
          acceptedPlan.status !== "ativo" ||
          dateTime(acceptedPlan).getTime() <= Date.now())
      ) {
        return null;
      }

      const conversationId = response === "aceite" ? crypto.randomUUID() : null;
      setState((current) => {
        const invitations = current.invitations.map((item) =>
          item.id === invitationId ? { ...item, status: response } : item,
        );
        if (!conversationId) return { ...current, invitations };

        if (!acceptedPlan) return { ...current, invitations };
        const expiry = dateTime(acceptedPlan);
        expiry.setHours(expiry.getHours() + 24);
        const conversation: Conversation = {
          id: conversationId,
          invitationId,
          status: "ativa",
          expiresAt: expiry.toISOString(),
          createdAt: new Date().toISOString(),
        };
        const firstMessage: Message = {
          id: crypto.randomUUID(),
          conversationId,
          senderGroupId: invitation.fromGroupId,
          content: invitation.mensagem,
          createdAt: invitation.createdAt,
        };
        return {
          ...current,
          invitations,
          conversations: [...current.conversations, conversation],
          messages: [...current.messages, firstMessage],
        };
      });
      return conversationId;
    },
    [refreshLiveData, state.invitations, state.plans],
  );

  const sendMessage = useCallback(
    async (conversationId: string, senderGroupId: string, content: string) => {
      if (!isDemoMode) {
        await liveRequest<{ messageId: string }>(
          `/api/live/conversations/${conversationId}/messages`,
          {
            method: "POST",
            body: JSON.stringify({ content }),
          },
        );
        await refreshLiveData();
        return;
      }
      const conversation = state.conversations.find(
        (item) => item.id === conversationId,
      );
      if (!conversation || conversation.status !== "ativa") {
        throw new Error("Esta conversa já não está ativa.");
      }
      const message = messageSchema.parse({
        id: crypto.randomUUID(),
        conversationId,
        senderGroupId,
        content: content.trim(),
        createdAt: new Date().toISOString(),
      });
      setState((current) => ({
        ...current,
        messages: [...current.messages, message],
      }));
    },
    [refreshLiveData, state.conversations],
  );

  const endConversation = useCallback(async (conversationId: string) => {
    if (!isDemoMode) {
      await liveRequest(`/api/live/conversations/${conversationId}/end`, {
        method: "POST",
      });
      await refreshLiveData();
      return;
    }
    setState((current) => ({
      ...current,
      conversations: current.conversations.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, status: "terminada" }
          : conversation,
      ),
    }));
  }, [refreshLiveData]);

  const blockGroup = useCallback(
    async (conversationId: string, blockedGroupId: string) => {
      if (!isDemoMode) {
        await liveRequest(`/api/live/conversations/${conversationId}/block`, {
          method: "POST",
          body: JSON.stringify({ blockedGroupId }),
        });
        await refreshLiveData();
        return;
      }
      if (!state.currentGroupId) return;
      const block: Block = {
        id: crypto.randomUUID(),
        blockerGroupId: state.currentGroupId,
        blockedGroupId,
        conversationId,
        createdAt: new Date().toISOString(),
      };
      setState((current) => ({
        ...current,
        blocks: [...current.blocks, block],
        conversations: current.conversations.map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, status: "bloqueada" }
            : conversation,
        ),
      }));
    },
    [refreshLiveData, state.currentGroupId],
  );

  const reportGroup = useCallback(
    async (
      conversationId: string,
      reportedGroupId: string,
      reason: ReportReason,
    ) => {
      if (!isDemoMode) {
        await liveRequest(
          `/api/live/conversations/${conversationId}/report`,
          {
            method: "POST",
            body: JSON.stringify({ reportedGroupId, reason }),
          },
        );
        await refreshLiveData();
        return;
      }
      if (!state.currentGroupId) return;
      const report: Report = {
        id: crypto.randomUUID(),
        reporterGroupId: state.currentGroupId,
        reportedGroupId,
        conversationId,
        motivo: reason,
        createdAt: new Date().toISOString(),
      };
      setState((current) => ({
        ...current,
        reports: [...current.reports, report],
      }));
    },
    [refreshLiveData, state.currentGroupId],
  );

  const pendingInvitesForPlan = useCallback(
    (planId: string) =>
      state.invitations.filter(
        (invitation) =>
          invitation.planId === planId && invitation.status === "pendente",
      ).length,
    [state.invitations],
  );

  const resetDemo = useCallback(() => {
    if (!isDemoMode) return;
    window.localStorage.removeItem(STORAGE_KEY);
    setState(createInitialState());
  }, []);

  const currentGroup =
    state.groups.find((group) => group.id === state.currentGroupId) ?? null;
  const storeReady = isHydrated && liveReady;

  const value = useMemo<PontoStore>(
    () => ({
      ...state,
      isHydrated: storeReady,
      demoMode: isDemoMode,
      currentGroup,
      createGroup,
      setDraft,
      clearDraft,
      publishPlan,
      sendInvitation,
      respondToInvitation,
      sendMessage,
      endConversation,
      blockGroup,
      reportGroup,
      pendingInvitesForPlan,
      resetDemo,
      refreshLiveData,
    }),
    [
      state,
      storeReady,
      currentGroup,
      createGroup,
      setDraft,
      clearDraft,
      publishPlan,
      sendInvitation,
      respondToInvitation,
      sendMessage,
      endConversation,
      blockGroup,
      reportGroup,
      pendingInvitesForPlan,
      resetDemo,
      refreshLiveData,
    ],
  );

  return <PontoContext.Provider value={value}>{children}</PontoContext.Provider>;
}

export function usePonto() {
  const context = useContext(PontoContext);
  if (!context) throw new Error("usePonto tem de ser usado dentro de PontoProvider.");
  return context;
}

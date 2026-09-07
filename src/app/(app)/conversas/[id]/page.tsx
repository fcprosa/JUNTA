"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  reportReasons,
  type ReportReason,
} from "@/lib/domain/schemas";
import { formatPlanDate, formatTime, initials } from "@/lib/format";
import { usePonto } from "@/lib/store/ponto-store";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Ban,
  CalendarDays,
  Clock3,
  Flag,
  MapPin,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const {
    currentGroup,
    groups,
    plans,
    invitations,
    conversations,
    messages,
    sendMessage,
    endConversation,
    blockGroup,
    reportGroup,
    demoMode,
    refreshLiveData,
  } = usePonto();
  const conversation = conversations.find((item) => item.id === id);
  const invitation = invitations.find(
    (item) => item.id === conversation?.invitationId,
  );
  const plan = plans.find((item) => item.id === invitation?.planId);
  const fromGroup = groups.find(
    (group) => group.id === invitation?.fromGroupId,
  );
  const toGroup = groups.find((group) => group.id === invitation?.toGroupId);
  const [activeSender, setActiveSender] = useState(
    currentGroup?.id ?? fromGroup?.id ?? "",
  );
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("Comportamento abusivo");
  const [draftMessage, setDraftMessage] = useState("");

  useEffect(() => {
    if (demoMode || !conversation?.id) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`conversation:${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        () => void refreshLiveData(),
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: `id=eq.${conversation.id}`,
        },
        () => void refreshLiveData(),
      )
      .subscribe();

    void fetch("/api/live/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: "conversation_opened",
        groupId: currentGroup?.id,
        metadata: { conversationId: conversation.id },
      }),
    });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversation?.id, currentGroup?.id, demoMode, refreshLiveData]);

  if (!conversation || !invitation || !plan || !fromGroup || !toGroup) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="space-y-4 pt-6 text-center">
          <h1 className="text-xl font-semibold">Conversa não encontrada</h1>
          <Button asChild>
            <Link href="/inicio">Voltar ao início</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const conversationId = conversation.id;
  const defaultSenderId = fromGroup.id;
  const conversationMessages = messages
    .filter((message) => message.conversationId === conversation.id)
    .toSorted(
      (left, right) =>
        new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
    );
  const active = conversation.status === "ativa";
  const ended = conversation.status === "terminada";
  const otherGroup =
    currentGroup?.id === fromGroup.id ? toGroup : fromGroup;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const content = String(data.get("message")).trim();
    if (!content) return;
    try {
      await sendMessage(
        conversationId,
        demoMode ? activeSender || defaultSenderId : currentGroup?.id ?? "",
        content,
      );
      form.reset();
      setDraftMessage("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível enviar.",
      );
    }
  }

  async function confirmReport() {
    try {
      await reportGroup(conversationId, otherGroup.id, reason);
      setReportOpen(false);
      toast.success(
        demoMode ? "Denúncia guardada localmente." : "Denúncia enviada em privado.",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível denunciar.");
    }
  }

  async function confirmBlock() {
    try {
      await blockGroup(conversationId, otherGroup.id);
      toast.success(
        demoMode ? "Grupo bloqueado neste browser." : "Grupo bloqueado.",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível bloquear.");
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Button asChild variant="ghost" className="-ml-2 mb-4">
        <Link href="/inicio">
          <ArrowLeft data-icon="inline-start" />
          Início
        </Link>
      </Button>

      <Card className="overflow-hidden">
        <div className="border-b bg-card p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <Avatar className="size-10 border-2 border-card">
                <AvatarFallback>{initials(fromGroup.nome)}</AvatarFallback>
              </Avatar>
              <Avatar className="size-10 border-2 border-card">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {initials(toGroup.nome)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-semibold">
                {fromGroup.nome} + {toGroup.nome}
              </h1>
              <p className="text-xs text-muted-foreground">
                Conversa temporária · {conversation.status}
              </p>
            </div>
            <Badge
              variant="outline"
              className={active ? "text-primary" : "text-muted-foreground"}
            >
              {active ? "Por combinar" : conversation.status}
            </Badge>
          </div>

          <div className="mt-4 rounded-xl border bg-background p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{plan.titulo}</p>
              <Badge className="bg-primary text-primary-foreground">
                {plan.intencao}
              </Badge>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="size-3.5" />
                {formatPlanDate(plan.data)}
              </span>
              <span className="flex items-center gap-1">
                <Clock3 className="size-3.5" />
                {plan.horaInicio}–{plan.horaFim}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {plan.cidade}
              </span>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          <div
            className="min-h-[340px] space-y-4 p-4 sm:p-5"
            role="log"
            aria-live="polite"
            aria-label="Mensagens da conversa"
          >
            <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" />
              Combinem um local público. Não partilhem dados pessoais.
            </div>

            {conversationMessages.map((message) => {
              const sender = groups.find(
                (group) => group.id === message.senderGroupId,
              );
              const own = message.senderGroupId === currentGroup?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${own ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      own
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-muted"
                    }`}
                  >
                    <p
                      className={`mb-1 text-[11px] font-medium ${
                        own ? "text-primary-foreground/70" : "text-primary"
                      }`}
                    >
                      {sender?.nome}
                    </p>
                    <p className="text-sm leading-6">{message.content}</p>
                    <p
                      className={`mt-1 text-right text-[10px] ${
                        own
                          ? "text-primary-foreground/60"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t p-3 sm:p-4">
            {active ? (
              <>
                <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                  {[
                    "Escolher um ponto público",
                    "Confirmar horário",
                    "Combinar como reconhecer o grupo",
                    "Definir um plano alternativo",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setDraftMessage(suggestion)}
                      className="shrink-0 rounded-full border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
                {demoMode ? (
                  <div className="mb-3 flex items-center gap-2 overflow-x-auto">
                    <span className="shrink-0 text-xs text-muted-foreground">
                      Enviar como:
                    </span>
                    {[fromGroup, toGroup].map((group) => (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => setActiveSender(group.id)}
                        aria-pressed={activeSender === group.id}
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-xs ${
                          activeSender === group.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        {group.nome}
                      </button>
                    ))}
                    <span className="shrink-0 text-[10px] text-warning">
                      controlo demo
                    </span>
                  </div>
                ) : null}
                <form onSubmit={submit} className="flex gap-2">
                  <Input
                    name="message"
                    aria-label="Mensagem"
                    placeholder="Escreve uma mensagem…"
                    maxLength={1000}
                    autoComplete="off"
                    value={draftMessage}
                    onChange={(event) => setDraftMessage(event.target.value)}
                  />
                  <Button type="submit" size="icon" aria-label="Enviar mensagem">
                    <Send />
                  </Button>
                </form>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  Expira em{" "}
                  {new Intl.DateTimeFormat("pt-PT", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(conversation.expiresAt))}
                </p>
              </>
            ) : ended ? (
              <p className="text-center text-sm text-muted-foreground">
                Esta conversa foi terminada.
              </p>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                Esta conversa está {conversation.status}.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setReportOpen(true)}
        >
          <Flag />
          Denunciar
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" disabled={!active}>
              <Ban />
              Bloquear
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bloquear {otherGroup.nome}?</AlertDialogTitle>
              <AlertDialogDescription>
                A conversa termina e este grupo deixa de aparecer nas
                compatibilidades.
                {demoMode ? " A ação fica guardada apenas neste browser." : ""}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmBlock}>
                Bloquear grupo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" disabled={!active}>
              <X />
              Terminar conversa
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Terminar conversa</AlertDialogTitle>
              <AlertDialogDescription>
                Deixam de poder escrever, mas continuam a ver o que combinaram.
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  void endConversation(conversation.id).catch((error) =>
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Não foi possível terminar.",
                    ),
                  );
                }}
              >
                Terminar conversa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Denunciar {otherGroup.nome}</DialogTitle>
            <DialogDescription>
              {demoMode
                ? "A denúncia é privada e fica guardada apenas neste browser durante a demonstração."
                : "A denúncia é privada e só pode ser consultada pela equipa de moderação."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Motivo</label>
            <Select
              value={reason}
              onValueChange={(value) => setReason(value as ReportReason)}
            >
              <SelectTrigger className="w-full" aria-label="Motivo da denúncia">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reportReasons.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmReport}>
              Enviar denúncia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

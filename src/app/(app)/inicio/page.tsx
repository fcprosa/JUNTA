"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { parsedPlanSchema } from "@/lib/domain/schemas";
import { formatPlanDate } from "@/lib/format";
import { usePonto } from "@/lib/store/ponto-store";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Mail,
  MessageCircle,
  Send,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

const suggestions = [
  {
    label: "Ir estudar",
    text: "Somos quatro e queremos ir estudar para um café esta quarta à tarde em Lisboa.",
  },
  {
    label: "Fazer uma esplanada",
    text: "Somos quatro e queremos conhecer pessoas novas numa esplanada este sábado à noite em Lisboa.",
  },
  {
    label: "Jogar padel",
    text: "Somos quatro e queremos jogar padel este sábado de manhã em Lisboa.",
  },
  {
    label: "Ir a um concerto",
    text: "Somos quatro e queremos ir a um concerto este sábado à noite em Lisboa.",
  },
  {
    label: "Criar um book club",
    text: "Somos quatro e queremos criar um book club descontraído este domingo à tarde em Lisboa.",
  },
  {
    label: "Conhecer pessoas novas",
    text: "Somos quatro e queremos conhecer pessoas novas este sábado à noite em Lisboa.",
  },
  {
    label: "Noite de jogos",
    text: "Somos quatro e queremos fazer uma noite de jogos de tabuleiro este sábado à noite em Lisboa.",
  },
  {
    label: "Explorar a cidade",
    text: "Somos quatro e queremos explorar uma exposição este domingo à tarde em Lisboa.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const {
    currentGroup,
    groups,
    plans,
    invitations,
    conversations,
    demoMode,
    setDraft,
  } = usePonto();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const ownPlans = plans
    .filter((plan) => plan.groupId === currentGroup?.id)
    .toReversed();
  const sentInvitations = invitations.filter(
    (invitation) => invitation.fromGroupId === currentGroup?.id,
  );
  const pendingReceivedInvitations = invitations.filter(
    (invitation) =>
      invitation.toGroupId === currentGroup?.id &&
      invitation.status === "pendente",
  );

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (text.trim().length < 10) {
      toast.error("Conta-nos um pouco mais sobre o plano.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/ai/parse-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const payload = (await response.json()) as {
        plan?: unknown;
        error?: string;
      };
      if (!response.ok || !payload.plan) {
        throw new Error(payload.error ?? "Não foi possível estruturar o plano.");
      }
      setDraft(text, parsedPlanSchema.parse(payload.plan));
      router.push("/planos/rever");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível continuar.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="mx-auto max-w-3xl pt-2 sm:pt-8">
        <Badge variant="outline" className="mb-4 text-primary">
          <Sparkles className="size-3" />
          {demoMode ? "Modo demo" : "Beta fechada"}
        </Badge>
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          O que vos apetece fazer?
        </h1>
        <p className="mt-3 text-muted-foreground">
          Escreve como dirias a um amigo. Nós organizamos o resto.
        </p>

        <form onSubmit={submit} className="mt-7">
          <Card className="border-border bg-card shadow-xl shadow-black/15">
            <CardContent className="p-3">
              <Textarea
                aria-label="Descreve o plano do grupo"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Ex.: Somos quatro e queremos conhecer outro grupo para fazer um book club descontraído este domingo em Lisboa."
                className="min-h-36 resize-none border-0 bg-transparent px-3 py-3 text-base leading-7 shadow-none focus-visible:ring-0"
                maxLength={1000}
              />
              <div className="flex items-center justify-between gap-3 border-t px-2 pt-3">
                <span className="text-xs text-muted-foreground">
                  {text.length}/1000
                </span>
                <Button type="submit" disabled={loading} className="h-10">
                  {loading ? "A organizar…" : "Encontrar grupos"}
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.label}
              type="button"
              onClick={() => setText(suggestion.text)}
              className="shrink-0 rounded-full border bg-card px-3 py-2 text-sm text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      </section>

      {pendingReceivedInvitations.length > 0 ? (
        <section>
          <Card className="border-primary/40 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="size-4 text-primary" />
                {pendingReceivedInvitations.length === 1
                  ? "Um grupo convidou-vos"
                  : `${pendingReceivedInvitations.length} grupos convidaram-vos`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingReceivedInvitations.map((invitation) => {
                const group =
                  groups.find((item) => item.id === invitation.fromGroupId)
                    ?.nome ?? "Outro grupo";
                const plan = plans.find(
                  (item) => item.id === invitation.planId,
                );
                return (
                  <Link
                    key={invitation.id}
                    href={`/convites/${invitation.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3 transition hover:border-primary/40"
                  >
                    <span className="min-w-0">
                      <span className="block font-medium">{group}</span>
                      {plan ? (
                        <span className="block truncate text-xs text-muted-foreground">
                          {plan.titulo} · {formatPlanDate(plan.data)}
                        </span>
                      ) : null}
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-sm text-primary">
                      Responder
                      <ArrowRight className="size-4" />
                    </span>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="size-4 text-primary" />
              Planos do grupo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ownPlans.length === 0 ? (
              <p className="text-sm leading-6 text-muted-foreground">
                O primeiro plano que publicarem aparece aqui.
              </p>
            ) : (
              <div className="space-y-3">
                {ownPlans.slice(0, 3).map((plan) => (
                  <Link
                    href={`/planos/${plan.id}/compatibilidades`}
                    key={plan.id}
                    className="block rounded-lg border bg-background p-3 transition hover:border-primary/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{plan.titulo}</p>
                      <Badge
                        variant="outline"
                        className={
                          plan.status === "ativo"
                            ? "text-primary"
                            : "text-muted-foreground"
                        }
                      >
                        {plan.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatPlanDate(plan.data)} · {plan.intencao}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Send className="size-4 text-primary" />
              Convites enviados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sentInvitations.length === 0 ? (
              <p className="text-sm leading-6 text-muted-foreground">
                Podem enviar até dois convites pendentes por plano.
              </p>
            ) : (
              <div className="space-y-3">
                {sentInvitations.slice(-3).map((invitation) => {
                  const group =
                    groups.find((item) => item.id === invitation.toGroupId)
                      ?.nome ?? "Outro grupo";
                  return (
                    <Link
                      key={invitation.id}
                      href={`/convites/${invitation.id}`}
                      className="flex items-center justify-between rounded-lg border bg-background p-3"
                    >
                      <span className="text-sm">{group}</span>
                      <Badge variant="outline">{invitation.status}</Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageCircle className="size-4 text-primary" />
              Conversas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {conversations.length === 0 ? (
              <p className="text-sm leading-6 text-muted-foreground">
                O chat abre apenas depois de um convite ser aceite.
              </p>
            ) : (
              <div className="space-y-3">
                {conversations.slice(-3).map((conversation) => (
                  <Button
                    key={conversation.id}
                    asChild
                    variant="outline"
                    className="h-auto w-full justify-between py-3"
                  >
                    <Link href={`/conversas/${conversation.id}`}>
                      <span>Conversa entre grupos</span>
                      <Clock3 className="text-muted-foreground" />
                    </Link>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

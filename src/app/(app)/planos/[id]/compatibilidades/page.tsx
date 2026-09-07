"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatPlanDate, initials } from "@/lib/format";
import { findMatches, type GroupMatch } from "@/lib/matching/match-groups";
import { usePonto } from "@/lib/store/ponto-store";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Send,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function MatchesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const {
    plans,
    groups,
    blocks,
    invitations,
    demoMode,
    isHydrated,
    sendInvitation,
    pendingInvitesForPlan,
  } = usePonto();
  const [selected, setSelected] = useState<GroupMatch | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [message, setMessage] = useState(
    "Olá! O nosso grupo também gostou deste plano. Apetece-vos combinar?",
  );
  const [liveMatches, setLiveMatches] = useState<GroupMatch[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(!demoMode);

  const plan = plans.find((item) => item.id === id);
  const demoMatches = useMemo(
    () =>
      plan
        ? findMatches({
            sourcePlan: plan,
            groups,
            plans,
            blockedGroupIds: blocks.map((block) => block.blockedGroupId),
          }).filter((match) => !dismissed.includes(match.group.id))
        : [],
    [plan, groups, plans, blocks, dismissed],
  );
  const matches = (demoMode ? demoMatches : liveMatches).filter(
    (match) => !dismissed.includes(match.group.id),
  );

  useEffect(() => {
    if (demoMode) return;
    async function loadMatches() {
      try {
        const response = await fetch(`/api/live/plans/${id}/matches`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as {
          matches?: GroupMatch[];
          error?: string;
        };
        if (!response.ok) {
          toast.error(payload.error ?? "Não foi possível procurar grupos.");
        } else {
          setLiveMatches(payload.matches ?? []);
        }
      } catch {
        toast.error("Não foi possível procurar grupos.");
      } finally {
        setLoadingMatches(false);
      }
    }
    void loadMatches();
  }, [demoMode, id]);
  const pendingCount = pendingInvitesForPlan(id);

  if (!plan) {
    if (!demoMode && (!isHydrated || loadingMatches)) {
      return (
        <Card className="mx-auto max-w-lg">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            A procurar grupos compatíveis…
          </CardContent>
        </Card>
      );
    }
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="space-y-4 pt-6 text-center">
          <h1 className="text-xl font-semibold">Plano não encontrado</h1>
          <Button asChild>
            <Link href="/inicio">Voltar ao início</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  const planId = plan.id;

  async function invite() {
    if (!selected) return;
    try {
      const invitationId = await sendInvitation(
        planId,
        selected.group.id,
        message,
      );
      setSelected(null);
      toast.success("Convite enviado.");
      router.push(`/convites/${invitationId}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível convidar.",
      );
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Button asChild variant="ghost" className="-ml-2 mb-4">
        <Link href="/inicio">
          <ArrowLeft data-icon="inline-start" />
          Início
        </Link>
      </Button>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-primary">
                O vosso plano
              </p>
              <h1 className="mt-2 text-xl font-semibold">{plan.titulo}</h1>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-4" />
                  {formatPlanDate(plan.data)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock3 className="size-4" />
                  {plan.horaInicio}–{plan.horaFim}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" />
                  {plan.cidade}
                  {plan.zonaAproximada ? ` · ${plan.zonaAproximada}` : ""}
                </span>
              </div>
            </div>
            <Badge className="bg-primary text-primary-foreground">
              {plan.intencao}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Grupos compatíveis
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Mostramos no máximo dois. A decisão é sempre vossa.
          </p>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          {pendingCount}/2 convites pendentes
        </span>
      </div>

      {loadingMatches ? (
        <Card className="mt-5 border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            A procurar grupos compatíveis…
          </CardContent>
        </Card>
      ) : matches.length === 0 ? (
        <Card className="mt-5 border-dashed">
          <CardContent className="py-10 text-center">
            <p className="font-medium">Sem outros grupos por agora</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              {demoMode
                ? "Para este demo, experimenta um book club no domingo à tarde ou jogos no sábado à noite, em Lisboa."
                : "Ainda não há outro grupo compatível. Volta a verificar mais tarde."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {matches.map((match) => {
            const existingInvitation = invitations.find(
              (invitation) =>
                invitation.planId === plan.id &&
                invitation.toGroupId === match.group.id &&
                invitation.status !== "recusado",
            );
            return (
              <Card key={match.group.id} className="overflow-hidden">
                <CardHeader className="border-b bg-card/70">
                  <div className="flex items-start gap-3">
                    <Avatar className="size-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {initials(match.group.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg">
                        {match.group.nome}
                      </CardTitle>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Users className="size-3.5" />
                        {match.group.numeroPessoas} pessoas · {match.group.cidade}
                        {match.group.zonaAproximada
                          ? ` · ${match.group.zonaAproximada}`
                          : ""}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 pt-5">
                  <div className="flex flex-wrap gap-1.5">
                    {match.group.interesses.map((interest) => (
                      <Badge key={interest} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Plano ativo
                    </p>
                    <p className="mt-1 font-medium">{match.plan.titulo}</p>
                    <Badge variant="outline" className="mt-2 text-primary">
                      {match.plan.intencao}
                    </Badge>
                  </div>

                  <div className="rounded-xl bg-background p-3 text-sm leading-6">
                    {match.explanation}
                  </div>

                  <ul className="space-y-1.5">
                    {match.reasons.slice(0, 3).map((reason) => (
                      <li
                        key={reason}
                        className="flex gap-2 text-xs text-muted-foreground"
                      >
                        <Check className="size-3.5 shrink-0 text-primary" />
                        {reason}
                      </li>
                    ))}
                  </ul>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setDismissed((current) => [
                          ...current,
                          match.group.id,
                        ])
                      }
                    >
                      Agora não
                    </Button>
                    <Button
                      onClick={() => setSelected(match)}
                      disabled={
                        plan.status !== "ativo" ||
                        pendingCount >= 2 ||
                        Boolean(existingInvitation)
                      }
                    >
                      <Send />
                      {existingInvitation ? "Enviado" : "Convidar"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar {selected?.group.nome}</DialogTitle>
            <DialogDescription>
              A mensagem é sempre enviada por vocês e pode ser editada.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            aria-label="Mensagem do convite"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="min-h-28"
            maxLength={500}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Cancelar
            </Button>
            <Button onClick={invite} disabled={!message.trim()}>
              Enviar convite
              <Send data-icon="inline-end" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatPlanDate, initials } from "@/lib/format";
import { usePonto } from "@/lib/store/ponto-store";
import {
  ArrowLeft,
  Check,
  Clock3,
  Eye,
  MapPin,
  MessageCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function InvitationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const {
    invitations,
    groups,
    plans,
    conversations,
    currentGroup,
    demoMode,
    respondToInvitation,
  } = usePonto();
  const invitation = invitations.find((item) => item.id === id);

  if (!invitation) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="space-y-4 pt-6 text-center">
          <h1 className="text-xl font-semibold">Convite não encontrado</h1>
          <Button asChild>
            <Link href="/inicio">Voltar ao início</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const fromGroup = groups.find(
    (group) => group.id === invitation.fromGroupId,
  );
  const toGroup = groups.find((group) => group.id === invitation.toGroupId);
  const plan = plans.find((item) => item.id === invitation.planId);
  const conversation = conversations.find(
    (item) => item.invitationId === invitation.id,
  );

  if (!fromGroup || !toGroup || !plan) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="space-y-4 pt-6 text-center">
          <h1 className="text-xl font-semibold">Convite incompleto</h1>
          <p className="text-sm text-muted-foreground">
            Os dados deste convite já não estão disponíveis.
          </p>
          <Button asChild>
            <Link href="/inicio">Voltar ao início</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  const invitationId = invitation.id;

  const canRespond =
    demoMode || currentGroup?.id === invitation.toGroupId;

  async function respond(response: "aceite" | "recusado") {
    try {
      const conversationId = await respondToInvitation(invitationId, response);
      if (response === "aceite" && conversationId) {
        toast.success("Convite aceite. A conversa está aberta.");
        router.push(`/conversas/${conversationId}`);
      } else if (response === "recusado") {
        toast(demoMode ? "Convite recusado no modo demo." : "Convite recusado.");
        router.push("/convites");
      } else {
        toast.error("Este plano já expirou e o convite não pode ser aceite.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível responder.",
      );
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <Button asChild variant="ghost" className="-ml-2 mb-4">
        <Link href={demoMode ? `/planos/${plan.id}/compatibilidades` : "/convites"}>
          <ArrowLeft data-icon="inline-start" />
          Compatibilidades
        </Link>
      </Button>

      {demoMode ? (
        <div className="mb-5 flex gap-3 rounded-xl border border-warning/30 bg-warning/8 p-4">
          <Eye className="mt-0.5 size-5 shrink-0 text-warning" />
          <div>
            <p className="text-sm font-medium text-warning">
              Perspetiva do grupo convidado
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Para testar o fluxo sem uma segunda conta, estás agora a ver o
              convite como <span className="text-foreground">{toGroup.nome}</span>.
            </p>
          </div>
        </div>
      ) : null}

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <Avatar className="size-12">
              <AvatarFallback className="bg-primary/10 text-primary">
                {initials(fromGroup.nome)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-muted-foreground">Convite de</p>
              <h1 className="text-xl font-semibold">{fromGroup.nome}</h1>
            </div>
            <Badge variant="outline" className="ml-auto">
              {invitation.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <blockquote className="rounded-xl bg-background p-4 leading-7">
            “{invitation.mensagem}”
          </blockquote>

          <div className="rounded-xl border p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Plano em comum
                </p>
                <h2 className="mt-1 font-semibold">{plan.titulo}</h2>
              </div>
              <Badge className="bg-primary text-primary-foreground">
                {plan.intencao}
              </Badge>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
              <span className="flex items-center gap-1.5">
                <Clock3 className="size-4" />
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

          {invitation.status === "pendente" && canRespond ? (
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => respond("recusado")}>
                <X />
                Recusar
              </Button>
              <Button onClick={() => respond("aceite")}>
                <Check />
                Aceitar
              </Button>
            </div>
          ) : invitation.status === "pendente" ? (
            <p className="text-center text-sm text-muted-foreground">
              A aguardar resposta de {toGroup.nome}.
            </p>
          ) : conversation ? (
            <Button asChild className="h-11 w-full">
              <Link href={`/conversas/${conversation.id}`}>
                Abrir conversa
                <MessageCircle data-icon="inline-end" />
              </Link>
            </Button>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Este convite foi recusado.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

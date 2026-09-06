"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPlanDate } from "@/lib/format";
import { usePonto } from "@/lib/store/ponto-store";
import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function InvitationsPage() {
  const {
    currentGroup,
    invitations,
    groups,
    plans,
    demoMode,
    refreshLiveData,
  } = usePonto();

  useEffect(() => {
    if (!demoMode) void refreshLiveData();
  }, [demoMode, refreshLiveData]);

  const ordered = [...invitations].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  return (
    <div className="mx-auto max-w-2xl">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Convites</h1>
        <p className="mt-2 text-muted-foreground">
          Recebidos e enviados pelo vosso grupo.
        </p>
      </div>

      {ordered.length === 0 ? (
        <Card className="mt-7 border-dashed">
          <CardContent className="py-12 text-center">
            <Mail className="mx-auto size-7 text-muted-foreground" />
            <p className="mt-3 font-medium">Ainda não há convites</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Publica um plano para encontrares grupos compatíveis.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-7 space-y-3">
          {ordered.map((invitation) => {
            const incoming = invitation.toGroupId === currentGroup?.id;
            const otherGroup = groups.find(
              (group) =>
                group.id ===
                (incoming ? invitation.fromGroupId : invitation.toGroupId),
            );
            const plan = plans.find((item) => item.id === invitation.planId);
            return (
              <Card key={invitation.id}>
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">
                        {incoming ? "De" : "Para"} {otherGroup?.nome ?? "outro grupo"}
                      </p>
                      <Badge variant="outline">{invitation.status}</Badge>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {plan?.titulo ?? "Plano"}
                      {plan ? ` · ${formatPlanDate(plan.data)}` : ""}
                    </p>
                  </div>
                  <Button asChild size="icon" variant="ghost">
                    <Link
                      href={`/convites/${invitation.id}`}
                      aria-label="Abrir convite"
                    >
                      <ArrowRight />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

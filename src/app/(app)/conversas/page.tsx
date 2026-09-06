"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePonto } from "@/lib/store/ponto-store";
import { ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function ConversationsPage() {
  const {
    conversations,
    invitations,
    groups,
    currentGroup,
    demoMode,
    refreshLiveData,
  } = usePonto();

  useEffect(() => {
    if (!demoMode) void refreshLiveData();
  }, [demoMode, refreshLiveData]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight">Conversas</h1>
      <p className="mt-2 text-muted-foreground">
        Temporárias, privadas e apenas entre os dois grupos.
      </p>

      {conversations.length === 0 ? (
        <Card className="mt-7 border-dashed">
          <CardContent className="py-12 text-center">
            <MessageCircle className="mx-auto size-7 text-muted-foreground" />
            <p className="mt-3 font-medium">Ainda não há conversas</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Uma conversa abre quando um convite é aceite.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-7 space-y-3">
          {conversations.map((conversation) => {
            const invitation = invitations.find(
              (item) => item.id === conversation.invitationId,
            );
            const otherGroupId =
              invitation?.fromGroupId === currentGroup?.id
                ? invitation?.toGroupId
                : invitation?.fromGroupId;
            const otherGroup = groups.find((group) => group.id === otherGroupId);
            return (
              <Card key={conversation.id}>
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {otherGroup?.nome ?? "Outro grupo"}
                    </p>
                    <Badge variant="outline" className="mt-2">
                      {conversation.status}
                    </Badge>
                  </div>
                  <Button asChild size="icon" variant="ghost">
                    <Link
                      href={`/conversas/${conversation.id}`}
                      aria-label="Abrir conversa"
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

"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  action: "review_report" | "deactivate_group" | "close_plan" | "anonymize_user";
  targetId: string;
  label: string;
  destructive?: boolean;
  confirmation?: string;
};

export function AdminActionButton({
  action,
  targetId,
  label,
  destructive,
  confirmation,
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function run() {
    if (confirmation && !window.confirm(confirmation)) return;
    setPending(true);
    const response = await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, targetId }),
    });
    const payload = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      toast.error(payload.error ?? "Ação rejeitada.");
      return;
    }
    toast.success("Ação concluída e registada.");
    router.refresh();
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={destructive ? "destructive" : "outline"}
      onClick={run}
      disabled={pending}
    >
      {pending ? "A processar…" : label}
    </Button>
  );
}

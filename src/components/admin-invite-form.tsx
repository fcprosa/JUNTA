"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

export function AdminInviteForm() {
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email"));
    const response = await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve_email", email }),
    });
    setPending(false);
    if (!response.ok) {
      toast.error("Não foi possível aprovar este email.");
      return;
    }
    form.reset();
    toast.success("Email aprovado para a beta.");
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <Input
        name="email"
        type="email"
        required
        placeholder="novo@universidade.pt"
        aria-label="Email a aprovar"
      />
      <Button type="submit" disabled={pending}>
        Aprovar
      </Button>
    </form>
  );
}

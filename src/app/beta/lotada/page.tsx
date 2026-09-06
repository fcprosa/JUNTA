"use client";

import { PontoLogo } from "@/components/ponto-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Mail } from "lucide-react";
import { FormEvent, useState } from "react";

export default function BetaFullPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const email = String(new FormData(event.currentTarget).get("email"));
    const response = await fetch("/api/beta/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (response.ok) setSent(true);
    else setError("Não foi possível guardar o email. Tenta novamente.");
  }

  return (
    <main className="grid min-h-svh place-items-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-6 pt-6 text-center">
          <PontoLogo />
          <div>
            <h1 className="text-2xl font-semibold">
              A primeira vaga da beta já está completa.
            </h1>
            <p className="mt-3 text-muted-foreground">
              Podes deixar o teu email para a próxima.
            </p>
          </div>
          {sent ? (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-primary/10 p-4 text-sm text-primary">
              <Check className="size-4" />
              Email guardado. Obrigado pelo interesse.
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4 text-left">
              <div className="space-y-2">
                <Label htmlFor="waitlist-email">Email</Label>
                <Input
                  id="waitlist-email"
                  name="email"
                  type="email"
                  required
                  placeholder="nome@universidade.pt"
                />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" className="w-full">
                <Mail />
                Avisem-me da próxima vaga
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

"use client";

import { PontoLogo } from "@/components/ponto-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function SignInPage() {
  const [state, setState] = useState<
    "idle" | "loading" | "sent" | "full" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");
    const email = String(new FormData(event.currentTarget).get("email"));

    try {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = (await response.json()) as {
        status?: string;
        error?: string;
      };
      if (response.status === 409 || payload.status === "full") {
        setState("full");
        return;
      }
      if (!response.ok) {
        setMessage(payload.error ?? "Não foi possível enviar o link.");
        setState("error");
        return;
      }
      setState("sent");
    } catch {
      setMessage("O serviço está temporariamente indisponível.");
      setState("error");
    }
  }

  return (
    <main className="grid min-h-svh place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <PontoLogo />
          <h1 className="mt-8 text-3xl font-semibold tracking-tight">
            Entrar na beta
          </h1>
          <p className="mt-3 text-muted-foreground">
            Recebe um link seguro no teu email. Não precisas de palavra-passe.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {state === "sent" ? (
              <div className="space-y-5 text-center">
                <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                  <Mail />
                </span>
                <div>
                  <h2 className="font-semibold">Verifica o teu email</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Enviámos um link de utilização única. Pode demorar alguns
                    segundos a chegar.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setState("idle")}>
                  Usar outro email
                </Button>
              </div>
            ) : state === "full" ? (
              <div className="space-y-5 text-center">
                <h2 className="font-semibold">
                  A primeira vaga da beta já está completa.
                </h2>
                <p className="text-sm text-muted-foreground">
                  Podes deixar o teu email para a próxima.
                </p>
                <Button asChild className="w-full">
                  <Link href="/beta/lotada">Entrar na lista de espera</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nome@universidade.pt"
                    autoComplete="email"
                    required
                  />
                </div>
                {state === "error" ? (
                  <p role="alert" className="text-sm text-destructive">
                    {message}
                  </p>
                ) : null}
                <Button
                  type="submit"
                  className="h-11 w-full"
                  disabled={state === "loading"}
                >
                  {state === "loading" ? "A enviar…" : "Enviar magic link"}
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-5 flex gap-3 rounded-xl border p-4 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
          <p>
            A beta é limitada e apenas para maiores de 18 anos. Ao continuar,
            aceitas os nossos <Link href="/termos" className="underline">termos</Link>{" "}
            e a <Link href="/privacidade" className="underline">política de privacidade</Link>.
          </p>
        </div>
      </div>
    </main>
  );
}

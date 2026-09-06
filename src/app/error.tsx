"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro de interface Ponto.", {
      digest: error.digest,
      name: error.name,
    });
  }, [error]);

  return (
    <main className="grid min-h-svh place-items-center px-4">
      <Card className="max-w-md">
        <CardContent className="space-y-4 pt-6 text-center">
          <h1 className="text-xl font-semibold">Algo não correu como esperado</h1>
          <p className="text-sm text-muted-foreground">
            Os teus dados não foram alterados. Tenta novamente.
          </p>
          <Button onClick={reset}>Tentar novamente</Button>
        </CardContent>
      </Card>
    </main>
  );
}

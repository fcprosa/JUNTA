import { PontoLogo } from "@/components/ponto-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function BetaDeniedPage() {
  return (
    <main className="grid min-h-svh place-items-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-5 pt-6 text-center">
          <PontoLogo />
          <h1 className="text-2xl font-semibold">Este email ainda não tem acesso</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            A beta é fechada. Usa um domínio aprovado ou pede um convite
            individual à equipa Ponto.
          </p>
          <Button asChild variant="outline">
            <Link href="/">Voltar</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

import { PontoLogo } from "@/components/ponto-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <main className="grid min-h-svh place-items-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-5 pt-6 text-center">
          <PontoLogo />
          <h1 className="text-2xl font-semibold">O link já não é válido</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            O link pode ter expirado ou já ter sido utilizado. Pede um novo
            link para continuares.
          </p>
          <Button asChild>
            <Link href="/entrar">Pedir novo link</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

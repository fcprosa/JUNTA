import { PontoLogo } from "@/components/ponto-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="grid min-h-svh place-items-center px-4">
      <Card className="max-w-md">
        <CardContent className="space-y-5 pt-6 text-center">
          <PontoLogo />
          <h1 className="text-xl font-semibold">Esta página não existe</h1>
          <Button asChild>
            <Link href="/">Voltar ao Ponto</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

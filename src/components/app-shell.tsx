"use client";

import { PontoLogo } from "@/components/ponto-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePonto } from "@/lib/store/ponto-store";
import { Home, LogOut, Mail, MessageCircle, RotateCcw, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isHydrated, currentGroup, demoMode, resetDemo } = usePonto();

  if (!isHydrated) {
    return (
      <main className="grid min-h-svh place-items-center px-6 text-sm text-muted-foreground">
        A preparar o Ponto…
      </main>
    );
  }

  if (!currentGroup) {
    return (
      <main className="grid min-h-svh place-items-center px-5">
        <Card className="w-full max-w-sm">
          <CardContent className="space-y-5 pt-6 text-center">
            <PontoLogo />
            <div>
              <h1 className="text-xl font-semibold">Cria primeiro o teu grupo</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Demora menos de um minuto.
              </p>
            </div>
            <Button asChild className="h-11 w-full">
              <Link href="/onboarding">Criar grupo</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  function restart() {
    resetDemo();
    router.push("/");
  }

  return (
    <div className="min-h-svh pb-[calc(5rem+env(safe-area-inset-bottom))] sm:pb-0">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <PontoLogo href="/inicio" />
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {currentGroup.nome}
            </span>
            {demoMode ? (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Recomeçar demonstração"
                onClick={restart}
              >
                <RotateCcw />
              </Button>
            ) : (
              <form action="/api/auth/sign-out" method="post">
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  aria-label="Terminar sessão"
                >
                  <LogOut />
                </Button>
              </form>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-6">{children}</main>

      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-4">
          <Link
            href="/inicio"
            aria-current={pathname === "/inicio" ? "page" : undefined}
            className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs ${
              pathname === "/inicio" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Home className="size-5" />
            Início
          </Link>
          <Link
            href="/convites"
            aria-current={pathname.startsWith("/convites") ? "page" : undefined}
            className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs ${
              pathname.startsWith("/convites")
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <Mail className="size-5" />
            Convites
          </Link>
          <Link
            href="/conversas"
            aria-current={pathname.startsWith("/conversas") ? "page" : undefined}
            className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs ${
              pathname.startsWith("/conversas")
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <MessageCircle className="size-5" />
            Conversas
          </Link>
          <div className="flex min-h-16 flex-col items-center justify-center gap-1 text-xs text-muted-foreground">
            <Users className="size-5" />
            {currentGroup.nome}
          </div>
        </div>
      </nav>
    </div>
  );
}

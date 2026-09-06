import { PontoLogo } from "@/components/ponto-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isDemoMode } from "@/lib/config";
import {
  ArrowRight,
  BookOpen,
  Coffee,
  Dumbbell,
  Map,
  Music,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";

const examples = [
  ["Estudar juntos", BookOpen],
  ["Ir a um concerto", Music],
  ["Criar um book club", BookOpen],
  ["Jogar padel", Dumbbell],
  ["Conhecer pessoas novas", Users],
  ["Fazer uma esplanada", Coffee],
  ["Jogos de tabuleiro", Sparkles],
  ["Explorar a cidade", Map],
] as const;

const steps = [
  "Criem o vosso grupo",
  "Publiquem uma ideia de plano",
  "Conheçam outro grupo",
  "Combinem algo no mundo real",
];

export default function LandingPage() {
  return (
    <main className="min-h-svh overflow-hidden">
      <header className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5">
        <PontoLogo />
        <span className="rounded-full border px-3 py-1.5 text-xs text-muted-foreground">
          {isDemoMode ? "Demonstração local" : "Beta fechada · Lisboa"}
        </span>
      </header>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:pt-24">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 text-sm text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            Planos entre grupos, sem swipe nem feed
          </div>
          <h1 className="text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-7xl">
            Conhece outro grupo.{" "}
            <span className="text-primary">Façam um plano.</span>
          </h1>
          <p className="mt-7 max-w-xl text-pretty text-lg leading-8 text-muted-foreground">
            Criem um grupo com amigos, digam o que vos apetece fazer e conheçam
            outro grupo que também queira.
          </p>
          <Button asChild size="lg" className="mt-9 h-12 px-5 text-base">
            <Link href={isDemoMode ? "/onboarding" : "/entrar"}>
              {isDemoMode ? "Começar demonstração" : "Entrar na beta"}
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            {isDemoMode
              ? "Demonstração local — os dados não são partilhados com outros utilizadores."
              : "Acesso limitado a utilizadores convidados."}
          </p>
        </div>

        <Card className="border-border/80 bg-card/70 shadow-2xl shadow-black/20">
          <CardContent className="p-5 sm:p-7">
            <p className="text-sm text-muted-foreground">
              O que vos apetece fazer?
            </p>
            <div className="mt-3 rounded-xl border bg-background p-4 text-base leading-7">
              “Somos quatro e queremos conhecer outro grupo para fazer um book
              club descontraído este domingo em Lisboa.”
            </div>
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-primary/10 p-4">
              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                <Users className="size-4" />
              </div>
              <p className="text-sm leading-6">
                Encontrámos dois grupos disponíveis para o mesmo tipo de plano.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="border-y bg-card/35">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Como funciona
          </p>
          <div className="mt-7 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step} className="bg-card p-5">
                <span className="text-sm font-medium text-primary">
                  0{index + 1}
                </span>
                <p className="mt-5 font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">
          Um plano pode ser simples.
        </h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {examples.map(([label, Icon]) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-2 text-sm text-muted-foreground"
            >
              <Icon className="size-4 text-primary" />
              {label}
            </span>
          ))}
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-7 text-xs text-muted-foreground">
          <span>Ponto · Beta fechada</span>
          <nav aria-label="Informação legal" className="flex gap-5">
            <Link href="/privacidade" className="hover:text-foreground">
              Privacidade
            </Link>
            <Link href="/termos" className="hover:text-foreground">
              Termos
            </Link>
            <Link href="/seguranca" className="hover:text-foreground">
              Segurança
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}

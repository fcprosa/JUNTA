import { PontoLogo } from "@/components/ponto-logo";
import Link from "next/link";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-svh px-5 py-7">
      <article className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <PontoLogo />
          <Link href="/" className="text-sm text-muted-foreground">
            Voltar
          </Link>
        </div>
        <h1 className="mt-12 text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última atualização: {updated}
        </p>
        <div className="mt-9 space-y-7 text-sm leading-7 text-muted-foreground [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_strong]:text-foreground">
          {children}
        </div>
      </article>
    </main>
  );
}

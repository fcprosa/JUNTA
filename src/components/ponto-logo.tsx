import Link from "next/link";

export function PontoLogo({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight"
    >
      <span className="grid size-7 place-items-center rounded-full bg-primary text-sm font-black text-primary-foreground">
        P
      </span>
      Ponto
    </Link>
  );
}

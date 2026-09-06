"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-PT">
      <body>
        <main className="grid min-h-svh place-items-center px-4 text-center">
          <div>
            <h1 className="text-2xl font-semibold">O Ponto ficou indisponível</h1>
            <button className="mt-5 rounded-lg border px-4 py-2" onClick={reset}>
              Tentar novamente
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}

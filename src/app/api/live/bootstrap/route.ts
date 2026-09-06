import { isDemoMode } from "@/lib/config";
import { getLiveBootstrap } from "@/lib/server/live-bootstrap";

export const dynamic = "force-dynamic";

export async function GET() {
  if (isDemoMode) {
    return Response.json(
      { error: "Endpoint indisponível em modo demo." },
      { status: 404 },
    );
  }
  try {
    return Response.json(await getLiveBootstrap(), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    const unauthenticated =
      error instanceof Error && error.message === "UNAUTHENTICATED";
    if (!unauthenticated) {
      console.error("Falha segura no bootstrap live.", {
        name: error instanceof Error ? error.name : "DatabaseError",
      });
    }
    return Response.json(
      { error: unauthenticated ? "Sessão necessária." : "Não foi possível carregar os dados." },
      { status: unauthenticated ? 401 : 500 },
    );
  }
}

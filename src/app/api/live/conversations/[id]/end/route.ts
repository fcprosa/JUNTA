import { safeDatabaseMessage } from "@/lib/server/api-errors";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Sessão necessária." }, { status: 401 });
    const { error } = await supabase.rpc("end_conversation", {
      p_conversation_id: id,
    });
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Falha segura ao terminar conversa.", {
      name: error instanceof Error ? error.name : "DatabaseError",
    });
    return Response.json({ error: safeDatabaseMessage(error) }, { status: 400 });
  }
}

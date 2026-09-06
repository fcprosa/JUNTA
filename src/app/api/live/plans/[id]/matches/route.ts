import { safeDatabaseMessage } from "@/lib/server/api-errors";
import { createClient } from "@/lib/supabase/server";

export async function GET(
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

    const { data, error } = await supabase.rpc("find_plan_matches", {
      p_plan_id: id,
    });
    if (error) throw error;
    return Response.json({ matches: data ?? [] });
  } catch (error) {
    console.error("Falha segura no matching.", {
      name: error instanceof Error ? error.name : "DatabaseError",
    });
    return Response.json({ error: safeDatabaseMessage(error) }, { status: 400 });
  }
}

import { safeDatabaseMessage } from "@/lib/server/api-errors";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({ blockedGroupId: z.uuid() });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const [{ id }, input] = await Promise.all([
      params,
      request.json().then((value) => schema.parse(value)),
    ]);
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Sessão necessária." }, { status: 401 });
    const { error } = await supabase.rpc("block_group", {
      p_conversation_id: id,
      p_blocked_group_id: input.blockedGroupId,
    });
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Falha segura ao bloquear grupo.", {
      name: error instanceof Error ? error.name : "DatabaseError",
    });
    return Response.json({ error: safeDatabaseMessage(error) }, { status: 400 });
  }
}

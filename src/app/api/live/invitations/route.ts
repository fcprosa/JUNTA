import { safeDatabaseMessage } from "@/lib/server/api-errors";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  planId: z.uuid(),
  toGroupId: z.uuid(),
  message: z.string().trim().min(1).max(500),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Sessão necessária." }, { status: 401 });

    const { data: invitationId, error } = await supabase.rpc("send_invitation", {
      p_plan_id: input.planId,
      p_to_group_id: input.toGroupId,
      p_message: input.message,
    });
    if (error) throw error;
    return Response.json({ invitationId });
  } catch (error) {
    console.error("Falha segura ao enviar convite.", {
      name: error instanceof Error ? error.name : "DatabaseError",
    });
    return Response.json({ error: safeDatabaseMessage(error) }, { status: 400 });
  }
}

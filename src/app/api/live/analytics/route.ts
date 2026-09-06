import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  eventName: z.enum(["signed_in", "matches_viewed", "conversation_opened"]),
  groupId: z.uuid().optional(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
    .default({}),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Sessão necessária." }, { status: 401 });
    const { error } = await supabase.rpc("record_analytics_event", {
      p_event_name: input.eventName,
      p_group_id: input.groupId ?? null,
      p_metadata: input.metadata,
    });
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Falha segura no evento analítico.", {
      name: error instanceof Error ? error.name : "DatabaseError",
    });
    return Response.json({ error: "Evento rejeitado." }, { status: 400 });
  }
}

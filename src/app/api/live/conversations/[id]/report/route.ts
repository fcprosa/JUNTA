import { reportReasons } from "@/lib/domain/schemas";
import { safeDatabaseMessage } from "@/lib/server/api-errors";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  reportedGroupId: z.uuid(),
  reason: z.enum(reportReasons),
});

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
    const { data: reportId, error } = await supabase.rpc("report_group", {
      p_conversation_id: id,
      p_reported_group_id: input.reportedGroupId,
      p_reason: input.reason,
      p_description: null,
    });
    if (error) throw error;
    return Response.json({ reportId });
  } catch (error) {
    console.error("Falha segura ao denunciar grupo.", {
      name: error instanceof Error ? error.name : "DatabaseError",
    });
    return Response.json({ error: safeDatabaseMessage(error) }, { status: 400 });
  }
}

import { safeDatabaseMessage } from "@/lib/server/api-errors";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({ response: z.enum(["aceite", "recusado"]) });

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

    const { data: conversationId, error } = await supabase.rpc(
      "respond_invitation",
      {
        p_invitation_id: id,
        p_response: input.response === "aceite" ? "accepted" : "declined",
      },
    );
    if (error) throw error;
    return Response.json({ conversationId });
  } catch (error) {
    console.error("Falha segura ao responder ao convite.", {
      name: error instanceof Error ? error.name : "DatabaseError",
    });
    return Response.json({ error: safeDatabaseMessage(error) }, { status: 400 });
  }
}

import { safeDatabaseMessage } from "@/lib/server/api-errors";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({ content: z.string().trim().min(1).max(1000) });

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

    const { data: messageId, error } = await supabase.rpc("send_message", {
      p_conversation_id: id,
      p_content: input.content,
    });
    if (error) throw error;
    return Response.json({ messageId });
  } catch (error) {
    console.error("Falha segura ao enviar mensagem.", {
      name: error instanceof Error ? error.name : "DatabaseError",
    });
    return Response.json({ error: safeDatabaseMessage(error) }, { status: 400 });
  }
}

import { parsePlanWithAI } from "@/lib/ai/parse-plan";
import { isDemoMode } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const requestSchema = z.object({
  text: z.string().trim().min(10).max(1000),
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    if (!isDemoMode) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return Response.json({ error: "Sessão necessária." }, { status: 401 });
      }
    }
    const plan = await parsePlanWithAI(body.text);
    return Response.json({ plan });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Escreve um pouco mais sobre o vosso plano." },
        { status: 400 },
      );
    }

    console.error("Falha inesperada ao estruturar o plano.", error);
    return Response.json(
      { error: "Não foi possível estruturar o plano." },
      { status: 500 },
    );
  }
}

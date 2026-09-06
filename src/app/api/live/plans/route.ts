import { intencoes, vibes } from "@/lib/domain/schemas";
import { safeDatabaseMessage } from "@/lib/server/api-errors";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  titulo: z.string().trim().min(2).max(120),
  descricao: z.string().trim().min(10).max(1000),
  tipo: z.string().trim().max(100).nullable(),
  intencao: z.enum(intencoes),
  vibe: z.enum(vibes),
  numeroPessoas: z.number().int().min(2).max(8),
  cidade: z.string().trim().min(2).max(80),
  zonaAproximada: z.string().trim().max(100).nullable(),
  data: z.iso.date(),
  horaInicio: z.string().regex(/^\d{2}:\d{2}$/),
  horaFim: z.string().regex(/^\d{2}:\d{2}$/),
  orcamento: z.number().min(0).max(100000).nullable(),
  tags: z.array(z.string().trim().min(1).max(50)).max(20),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Sessão necessária." }, { status: 401 });

    const { data: planId, error } = await supabase.rpc("create_plan", {
      p_titulo: input.titulo,
      p_descricao: input.descricao,
      p_tipo: input.tipo ?? "",
      p_intencao: input.intencao,
      p_vibe: input.vibe,
      p_numero_pessoas: input.numeroPessoas,
      p_cidade: input.cidade,
      p_zona_aproximada: input.zonaAproximada ?? "",
      p_data: input.data,
      p_hora_inicio: input.horaInicio,
      p_hora_fim: input.horaFim,
      p_orcamento: input.orcamento,
      p_tags: input.tags,
    });
    if (error) throw error;
    return Response.json({ planId });
  } catch (error) {
    console.error("Falha segura ao publicar plano.", {
      name: error instanceof Error ? error.name : "DatabaseError",
    });
    return Response.json({ error: safeDatabaseMessage(error) }, { status: 400 });
  }
}

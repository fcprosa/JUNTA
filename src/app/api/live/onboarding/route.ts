import { safeDatabaseMessage } from "@/lib/server/api-errors";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  nomePessoa: z.string().trim().min(1).max(80),
  idade: z.number().int().min(18).max(120),
  cidade: z.string().trim().min(2).max(80),
  nomeGrupo: z.string().trim().min(2).max(80),
  descricao: z.string().trim().max(500),
  zonaAproximada: z.string().trim().max(100).nullable(),
  numeroPessoas: z.number().int().min(2).max(8),
  interesses: z.array(z.string().trim().min(1).max(50)).min(1).max(20),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Sessão necessária." }, { status: 401 });

    const { data: groupId, error } = await supabase.rpc("complete_onboarding", {
      p_nome: input.nomePessoa,
      p_idade: input.idade,
      p_is_adult: true,
      p_cidade: input.cidade,
      p_zona_aproximada: input.zonaAproximada ?? "",
      p_group_nome: input.nomeGrupo,
      p_group_descricao: input.descricao,
      p_numero_pessoas: input.numeroPessoas,
      p_interesses: input.interesses,
    });
    if (error) throw error;
    return Response.json({ groupId });
  } catch (error) {
    console.error("Falha segura no onboarding.", {
      name: error instanceof Error ? error.name : "DatabaseError",
    });
    return Response.json({ error: safeDatabaseMessage(error) }, { status: 400 });
  }
}

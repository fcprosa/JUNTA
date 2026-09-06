import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const schema = z.object({ email: z.string().trim().toLowerCase().email() });

export async function POST(request: Request) {
  try {
    const { email } = schema.parse(await request.json());
    const admin = createAdminClient();
    const { error } = await admin.from("beta_invites").upsert(
      { email, status: "pending" },
      { onConflict: "email", ignoreDuplicates: true },
    );
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Falha segura na lista de espera.", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return Response.json(
      { error: "Não foi possível guardar o email." },
      { status: 400 },
    );
  }
}

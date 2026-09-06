import { getServerEnv, isAllowedDomain } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({ email: z.string().trim().toLowerCase().email() });

export async function POST(request: Request) {
  try {
    const { email } = schema.parse(await request.json());
    const admin = createAdminClient();
    const env = getServerEnv();
    const [{ data: invite }, { data: existingProfile }, { count }] = await Promise.all([
      admin
        .from("beta_invites")
        .select("status")
        .eq("email", email)
        .eq("status", "approved")
        .maybeSingle(),
      admin
        .from("profiles")
        .select("beta_status")
        .eq("email", email)
        .maybeSingle(),
      admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("beta_status", "approved"),
    ]);

    if (
      existingProfile?.beta_status !== "approved" &&
      !isAllowedDomain(email) &&
      !invite
    ) {
      return Response.json(
        { error: "Este email ainda não tem acesso à beta." },
        { status: 403 },
      );
    }
    if (
      existingProfile?.beta_status !== "approved" &&
      (count ?? 0) >= env.MAX_BETA_USERS
    ) {
      return Response.json({ status: "full" }, { status: 409 });
    }

    const supabase = await createClient();
    const origin = new URL(request.url).origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/confirm`,
        shouldCreateUser: true,
      },
    });
    if (error) throw error;
    return Response.json({ status: "sent" });
  } catch (error) {
    console.error("Falha segura ao enviar magic link.", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return Response.json(
      { error: "Não foi possível enviar o link. Tenta novamente." },
      { status: 500 },
    );
  }
}

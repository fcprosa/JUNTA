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
    const [inviteResult, profileResult, countResult] = await Promise.all([
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

    const adminQueryErrors = [
      { context: "beta_invites", error: inviteResult.error },
      { context: "profiles", error: profileResult.error },
      { context: "profiles.count", error: countResult.error },
    ].filter((entry) => entry.error);

    if (adminQueryErrors.length > 0) {
      console.error("magic-link: falha nas consultas admin.", {
        errors: adminQueryErrors.map(({ context, error }) => ({
          context,
          code: error!.code,
          message: error!.message,
          hint: error!.hint,
        })),
      });
      return Response.json({ status: "sent" });
    }

    const { data: invite } = inviteResult;
    const { data: existingProfile } = profileResult;
    const { count } = countResult;

    if (
      existingProfile?.beta_status !== "approved" &&
      !isAllowedDomain(email) &&
      !invite
    ) {
      return Response.json({ status: "sent" });
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

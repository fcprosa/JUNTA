import { getServerEnv, isAllowedDomain } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const supabase = await createClient();

  try {
    if (tokenHash) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: "email",
      });
      if (error) throw error;
    } else if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
    } else {
      throw new Error("Token ausente");
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user?.email) throw userError ?? new Error("Sem utilizador");

    const admin = createAdminClient();
    const env = getServerEnv();
    const { data: status, error: claimError } = await admin.rpc(
      "claim_beta_access",
      {
        p_user_id: user.id,
        p_email: user.email,
        p_domain_allowed: isAllowedDomain(user.email),
        p_max_users: env.MAX_BETA_USERS,
      },
    );
    if (claimError) throw claimError;

    if (status === "full") {
      return NextResponse.redirect(new URL("/beta/lotada", request.url));
    }
    if (status !== "approved") {
      return NextResponse.redirect(new URL("/beta/sem-acesso", request.url));
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .single();
    await admin.from("analytics_events").insert({
      profile_id: user.id,
      event_name: "signed_in",
      metadata: {},
    });

    return NextResponse.redirect(
      new URL(profile?.onboarding_completed ? "/inicio" : "/onboarding", request.url),
    );
  } catch (error) {
    console.error("Falha segura na confirmação do magic link.", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return NextResponse.redirect(new URL("/auth/erro", request.url));
  }
}

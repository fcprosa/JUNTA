import { isAdminEmail } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  action: z.enum([
    "review_report",
    "deactivate_group",
    "close_plan",
    "anonymize_user",
    "approve_email",
  ]),
  targetId: z.uuid().optional(),
  email: z.string().trim().toLowerCase().email().optional(),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !isAdminEmail(user.email)) {
      return Response.json({ error: "Sem permissão." }, { status: 403 });
    }

    const admin = createAdminClient();
    if (input.action === "approve_email") {
      if (!input.email) throw new Error("Email em falta");
      const { error } = await admin.from("beta_invites").upsert(
        {
          email: input.email,
          status: "approved",
          invited_by: user.id,
        },
        { onConflict: "email" },
      );
      if (error) throw error;
      await admin.from("admin_audit_log").insert({
        admin_profile_id: user.id,
        action: "beta_email_approved",
        target_type: "beta_invite",
        metadata: { domain: input.email.split("@")[1] },
      });
      return Response.json({ ok: true });
    }

    if (!input.targetId) throw new Error("Alvo em falta");
    if (input.action === "anonymize_user") {
      const { error } = await admin.rpc("admin_anonymize_user", {
        p_admin_profile_id: user.id,
        p_user_id: input.targetId,
      });
      if (error) throw error;
      const { error: banError } = await admin.auth.admin.updateUserById(input.targetId, {
        ban_duration: "876000h",
      });
      if (banError) throw banError;
    } else {
      const { error } = await admin.rpc("admin_moderate", {
        p_admin_profile_id: user.id,
        p_action: input.action,
        p_target_id: input.targetId,
      });
      if (error) throw error;
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Falha segura numa ação administrativa.", {
      name: error instanceof Error ? error.name : "AdminError",
    });
    return Response.json(
      { error: "Não foi possível concluir a ação administrativa." },
      { status: 400 },
    );
  }
}

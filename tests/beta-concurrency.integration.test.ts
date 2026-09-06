import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const localOnly = /^http:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(url);
const createdUserIds: string[] = [];
const admin =
  localOnly && serviceKey
    ? createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

describe.skipIf(!localOnly || !serviceKey)("limite beta concorrente", () => {
  afterAll(async () => {
    if (!admin || createdUserIds.length === 0) return;
    await admin.from("profiles").delete().in("id", createdUserIds);
    await Promise.all(
      createdUserIds.map((id) => admin.auth.admin.deleteUser(id)),
    );
  });

  it("aprova apenas um de dois pedidos para a última vaga", async () => {
    if (!admin) throw new Error("Supabase local não configurado");
    const { count } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("beta_status", "approved");
    const maxUsers = (count ?? 0) + 1;
    const suffix = randomUUID();
    const users = await Promise.all(
      ["a", "b"].map((prefix) =>
        admin.auth.admin.createUser({
          email: `${prefix}-${suffix}@example.edu`,
          email_confirm: true,
        }),
      ),
    );
    for (const result of users) {
      if (result.error || !result.data.user) throw result.error;
      createdUserIds.push(result.data.user.id);
    }

    const claims = await Promise.all(
      users.map((result) =>
        admin.rpc("claim_beta_access", {
          p_user_id: result.data.user!.id,
          p_email: result.data.user!.email!,
          p_domain_allowed: true,
          p_max_users: maxUsers,
        }),
      ),
    );

    expect(claims.map((claim) => claim.data).sort()).toEqual([
      "approved",
      "full",
    ]);
  });
});

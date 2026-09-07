import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const schema = z.object({ email: z.string().trim().toLowerCase().email() });
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const hits = new Map<string, number[]>();
const GENERIC = { ok: true } as const;

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((stamp) => now - stamp < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function POST(request: Request) {
  try {
    if (rateLimited(clientIp(request))) {
      return Response.json(GENERIC);
    }

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json(GENERIC);
    }

    const admin = createAdminClient();
    const { error } = await admin.from("beta_invites").upsert(
      { email: parsed.data.email, status: "pending" },
      { onConflict: "email", ignoreDuplicates: true },
    );
    if (error) throw error;
    return Response.json(GENERIC);
  } catch (error) {
    console.error("Falha segura na lista de espera.", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return Response.json(GENERIC);
  }
}

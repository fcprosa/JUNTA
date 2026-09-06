import "server-only";

import { z } from "zod";

const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  BETA_ALLOWED_EMAIL_DOMAINS: z.string().default(""),
  MAX_BETA_USERS: z.coerce.number().int().positive().default(100),
  ADMIN_EMAILS: z.string().default(""),
});

export function getServerEnv() {
  const result = serverEnvSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(
      "A configuração Supabase da beta está incompleta. Consulta o ficheiro .env.example.",
    );
  }
  return result.data;
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function getAllowedDomains() {
  return splitList(getServerEnv().BETA_ALLOWED_EMAIL_DOMAINS).map((domain) =>
    domain.replace(/^@/, ""),
  );
}

export function getAdminEmails() {
  return splitList(getServerEnv().ADMIN_EMAILS);
}

export function isAllowedDomain(email: string) {
  const domain = email.toLowerCase().split("@").at(1);
  return Boolean(domain && getAllowedDomains().includes(domain));
}

export function isAdminEmail(email: string | null | undefined) {
  return Boolean(email && getAdminEmails().includes(email.toLowerCase()));
}

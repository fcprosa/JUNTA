export const isDemoMode =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const hasPublicSupabaseConfig = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

import "server-only";

import { getServerEnv } from "@/lib/env";
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const env = getServerEnv();
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

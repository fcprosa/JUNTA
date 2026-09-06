import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { hasPublicSupabaseConfig, isDemoMode } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isDemoMode) {
    if (!hasPublicSupabaseConfig) {
      return (
        <main className="grid min-h-svh place-items-center px-4">
          <Card className="max-w-lg">
            <CardContent className="space-y-3 pt-6 text-center">
              <h1 className="text-xl font-semibold">Beta ainda não configurada</h1>
              <p className="text-sm text-muted-foreground">
                Define as variáveis Supabase ou ativa explicitamente
                NEXT_PUBLIC_DEMO_MODE=true.
              </p>
            </CardContent>
          </Card>
        </main>
      );
    }
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/entrar");

    const { data: profile } = await supabase
      .from("profiles")
      .select("beta_status,onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile || profile.beta_status !== "approved") redirect("/beta/sem-acesso");
    if (!profile.onboarding_completed) redirect("/onboarding");
  }

  return <AppShell>{children}</AppShell>;
}

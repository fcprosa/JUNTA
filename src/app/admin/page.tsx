import { AdminActionButton } from "@/components/admin-action-button";
import { AdminInviteForm } from "@/components/admin-invite-form";
import { PontoLogo } from "@/components/ponto-logo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdminEmail } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { analyticsTimeBoundaries } from "@/lib/server/time";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  if (!isAdminEmail(user.email)) notFound();

  const admin = createAdminClient();
  const { since30Iso, since7Timestamp } = analyticsTimeBoundaries();
  const [
    profilesResult,
    groupsResult,
    plansResult,
    invitationsResult,
    conversationsResult,
    reportsResult,
    eventsResult,
    approvedResult,
  ] = await Promise.all([
    admin.from("profiles").select("id,nome,email,beta_status,created_at").order("created_at", { ascending: false }).limit(30),
    admin.from("groups").select("id,nome,owner_id,is_active").eq("is_active", true),
    admin.from("plans").select("id,titulo,group_id,status,expires_at").eq("status", "active"),
    admin.from("invitations").select("id", { count: "exact" }).eq("status", "pending"),
    admin.from("conversations").select("id", { count: "exact" }).eq("status", "active"),
    admin.from("reports").select("*").eq("status", "open").order("created_at", { ascending: false }).limit(30),
    admin.from("analytics_events").select("event_name,created_at").gte("created_at", since30Iso),
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("beta_status", "approved"),
  ]);

  const profiles = profilesResult.data ?? [];
  const groups = groupsResult.data ?? [];
  const plans = plansResult.data ?? [];
  const reports = reportsResult.data ?? [];
  const events = eventsResult.data ?? [];
  const accepted7 = events.filter(
    (event) =>
      event.event_name === "invitation_accepted" &&
      new Date(event.created_at).getTime() >= since7Timestamp,
  ).length;
  const accepted30 = events.filter(
    (event) => event.event_name === "invitation_accepted",
  ).length;

  const metrics = [
    ["Utilizadores aprovados", approvedResult.count ?? 0],
    ["Grupos ativos", groups.length],
    ["Planos ativos", plans.length],
    ["Convites pendentes", invitationsResult.count ?? 0],
    ["Conversas ativas", conversationsResult.count ?? 0],
    ["Denúncias abertas", reports.length],
  ];

  return (
    <main className="min-h-svh px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <PontoLogo href="/inicio" />
          <Link href="/inicio" className="text-sm text-muted-foreground">
            Voltar à aplicação
          </Link>
        </header>

        <div className="mt-10">
          <p className="text-xs uppercase tracking-wider text-primary">
            Administração protegida
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Saúde da beta</h1>
        </div>

        <section className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map(([label, value]) => (
            <Card key={label}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-3xl font-semibold">{value}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-7 grid gap-4 md:grid-cols-2">
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="text-base">
                Métrica central · convites aceites
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-8">
              <div><strong className="text-3xl">{accepted7}</strong><p className="text-xs text-muted-foreground">últimos 7 dias</p></div>
              <div><strong className="text-3xl">{accepted30}</strong><p className="text-xs text-muted-foreground">últimos 30 dias</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Aprovar email individual</CardTitle></CardHeader>
            <CardContent><AdminInviteForm /></CardContent>
          </Card>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">Denúncias abertas</h2>
          <div className="mt-3 space-y-3">
            {reports.length === 0 ? <p className="text-sm text-muted-foreground">Sem denúncias abertas.</p> : reports.map((report) => (
              <Card key={report.id}>
                <CardContent className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{report.reason}</p>
                    <p className="text-xs text-muted-foreground">Grupo {report.reported_group_id} · {new Date(report.created_at).toLocaleDateString("pt-PT")}</p>
                  </div>
                  <AdminActionButton action="review_report" targetId={report.id} label="Marcar revista" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold">Planos ativos</h2>
            <div className="mt-3 space-y-3">
              {plans.map((plan) => (
                <Card key={plan.id}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <p className="min-w-0 flex-1 truncate">{plan.titulo}</p>
                    <AdminActionButton action="close_plan" targetId={plan.id} label="Encerrar" destructive confirmation="Encerrar este plano e os respetivos convites/conversas?" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Grupos ativos</h2>
            <div className="mt-3 space-y-3">
              {groups.map((group) => (
                <Card key={group.id}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <p className="min-w-0 flex-1 truncate">{group.nome}</p>
                    <AdminActionButton action="deactivate_group" targetId={group.id} label="Desativar" destructive confirmation="Desativar este grupo, planos, convites e conversas?" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">Utilizadores recentes</h2>
          <div className="mt-3 space-y-3">
            {profiles.map((profile) => (
              <Card key={profile.id}>
                <CardContent className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{profile.nome || profile.email}</p>
                    <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
                  </div>
                  <Badge variant="outline">{profile.beta_status}</Badge>
                  {profile.id !== user.id && profile.beta_status !== "rejected" ? (
                    <AdminActionButton action="anonymize_user" targetId={profile.id} label="Anonimizar" destructive confirmation="Esta ação remove identificadores e conteúdo enviado, bloqueia a conta e não pode ser desfeita. Continuar?" />
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

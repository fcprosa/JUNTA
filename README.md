# Ponto

> Conhece outro grupo. Façam um plano.

Aplicação mobile-first para grupos de amigos publicarem um plano, encontrarem
até dois grupos compatíveis, enviarem um convite e conversarem temporariamente.
Inclui dois modos explicitamente separados.

## Modos

### Demonstração local

Define `NEXT_PUBLIC_DEMO_MODE=true`. Mantém o percurso original em
`localStorage` (`ponto-demo-v1`), os grupos sintéticos de Lisboa, a aceitação
simulada e o controlo de remetente. Não requer Supabase nem chaves externas.

```bash
cp .env.example .env.local
npm install
npm run dev
```

### Beta real

Define `NEXT_PUBLIC_DEMO_MODE=false` e todas as variáveis Supabase. Neste modo,
localStorage nunca é a fonte dos dados principais: autenticação, grupos, planos,
convites, chat, bloqueios, denúncias e analytics são persistidos no Postgres.

## Configurar Supabase

Requisitos locais: Node.js 20.9+, npm e Docker Desktop/Podman para a stack
Supabase.

```bash
npm install
npx supabase start
npx supabase db reset
npm run test:db
```

`supabase db reset` aplica `supabase/migrations/001_beta_schema.sql` e o seed
vazio. O modo real não injeta utilizadores ou grupos sintéticos.

Copiar as chaves mostradas por `supabase status` para `.env.local`:

```env
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
BETA_ALLOWED_EMAIL_DOMAINS=universidade.pt
MAX_BETA_USERS=100
ADMIN_EMAILS=admin@universidade.pt
```

`SUPABASE_SERVICE_ROLE_KEY` é exclusivamente server-side. Nunca usar prefixo
`NEXT_PUBLIC_`.

### Magic link

No projeto alojado, configurar:

- Auth > URL Configuration > Site URL para o domínio da aplicação;
- `/auth/confirm` como Redirect URL autorizada em produção e previews;
- Email Auth ativo;
- opcionalmente o template PKCE:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">
  Entrar no Ponto
</a>
```

Localmente, os emails ficam disponíveis em
[http://127.0.0.1:54324](http://127.0.0.1:54324).

## Criar a primeira vaga da beta

Há duas formas de autorizar acesso:

1. adicionar domínios separados por vírgulas em
   `BETA_ALLOWED_EMAIL_DOMAINS`;
2. aprovar emails individuais em `beta_invites`.

Para o primeiro administrador, configura o email em `ADMIN_EMAILS` e garante
que também pertence a um domínio permitido ou o aprova após a migration:

```sql
insert into public.beta_invites (email, status)
values ('admin@universidade.pt', 'approved')
on conflict (email) do update set status = 'approved';
```

Depois do primeiro login, `/admin` permite aprovar novos emails. O limite
`MAX_BETA_USERS` é reclamado por uma RPC com lock transacional: pedidos
concorrentes não podem aprovar o utilizador 101.

## Segurança e regras no servidor

- RLS ativa em todas as tabelas expostas;
- perfis individuais e emails nunca são públicos;
- apenas participantes leem convites, conversas e mensagens;
- todas as mutações críticas usam RPCs `SECURITY DEFINER` com
  `search_path=''`, identidade derivada de `auth.uid()` e grants mínimos;
- máximo de 3 planos ativos por grupo;
- máximo de 2 convites pendentes por plano e 5 enviados por grupo/24h;
- máximo de 20 mensagens por conversa/5min;
- bloqueio bilateral remove matches e impede convites/mensagens;
- expiração validada em cada RPC e materializada a cada minuto pelo Supabase
  Cron;
- a service role só é usada em Route Handlers server-only para admissão e
  administração.

RLS limita linhas, não colunas. O matching é por isso devolvido por uma RPC que
constrói um DTO público, nunca por leitura irrestrita de perfis.

## Matching e IA

O matching é determinístico no servidor: cidade, data, overlap horário e
intenção são filtros obrigatórios; interesses/tags, tipo, zona, orçamento, vibe
e dimensão ordenam os resultados. Só são devolvidos dois cartões, sem score,
com uma explicação curta.

A IA continua limitada a estruturar o texto do plano. Sem `AI_API_KEY` e
`AI_MODEL`, ou se o fornecedor falhar, é usado automaticamente o parser local.

## Chat Realtime

As mensagens são inseridas pela RPC segura e sincronizadas por Supabase
Realtime no canal `conversation:<id>`, filtrado por `conversation_id`. A RLS da
tabela continua a decidir quem recebe cada alteração. O chat expira 24 horas
após o fim do plano e as sugestões de conversa são cartões estáticos.

## Administração, privacidade e incidentes

`/admin` só aceita sessões cujo email esteja em `ADMIN_EMAILS`. Permite:

- consultar a métrica central de convites aceites em 7/30 dias;
- rever denúncias;
- desativar grupos;
- encerrar planos;
- aprovar emails da beta;
- bloquear e anonimizar uma conta.

Operações irreversíveis pedem confirmação e escrevem `admin_audit_log`.
Anonimizar remove identificadores do perfil, substitui conteúdo enviado,
desativa o grupo e termina planos/conversas. Para pedidos de acesso, correção ou
eliminação, confirmar primeiro a identidade do email e executar esta ação no
admin.

Em caso de incidente:

1. verificar logs das Functions/Route Handlers sem copiar emails ou mensagens;
2. consultar `cron.job_run_details` para falhas de expiração;
3. rever `admin_audit_log`, denúncias abertas e picos em `analytics_events`;
4. desativar o grupo/plano afetado no admin;
5. rodar a service-role key se houver suspeita de exposição.

## Verificação

```bash
npm run test
npm run lint
npm run build
npm run test:db
```

`npm run test:db` requer `npx supabase start`. Os testes pgTAP cobrem RLS,
participação no chat, limite da beta, planos, convites, mensagens e expiração.

Checklist manual com duas sessões privadas:

1. entrar com dois emails elegíveis;
2. concluir onboarding e criar um grupo em cada sessão;
3. publicar planos compatíveis em Lisboa;
4. A envia convite e B abre `/convites`;
5. B aceita e ambos abrem a conversa;
6. uma mensagem enviada por A aparece em B sem refresh;
7. um terceiro utilizador não consegue ler/enviar;
8. bloquear termina o chat e remove futuros matches.

## Deploy na Vercel

1. criar e ligar o projeto (`vercel link`);
2. definir as variáveis para Preview e Production;
3. adicionar os URLs de preview/produção à allowlist do Supabase Auth;
4. executar `supabase db push` contra o projeto Supabase correto;
5. fazer primeiro um preview (`vercel deploy`) e depois produção
   (`vercel --prod`);
6. confirmar magic link, cron, Realtime e `/admin` no domínio final.

Não colocar tokens em flags da CLI; usar variáveis de ambiente.

## Limitações atuais

- um único organizador principal por grupo;
- sem gestão completa de membros, notificações push, pagamentos, mapa,
  calendário ou feed;
- avatares continuam opcionais e a UI usa iniciais como fallback;
- o parser local reconhece um conjunto limitado de expressões em português;
- conteúdo legal deve ser revisto por aconselhamento jurídico antes de uma
  abertura pública.

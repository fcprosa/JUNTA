# Ponto — estado do projeto

> Última atualização: 3 de outubro de 2026
> Lê este ficheiro antes de qualquer trabalho neste repositório.

## O que é

Plataforma para grupos de amigos existentes conhecerem outros grupos e fazerem um
plano juntos. **"Conhece outro grupo. Façam um plano."**

Não é dating. Não é swipe. Não é feed. Não é app de discotecas.

Fluxo: criar conta → criar grupo → escrever em texto livre o que o grupo quer fazer
→ a IA estrutura num plano editável → a app mostra **no máximo dois** grupos
compatíveis → convite → só após aceitação mútua abre um chat temporário → combinam
num local público.

## Estado: em produção, não é protótipo

- **App:** https://ponto-amber.vercel.app (domínio Vercel; sem domínio próprio ainda)
- **Supabase:** projeto `zpudeopngtbvpillmghm`, região Frankfurt, plano gratuito
- **Stack:** Next.js 16 (Turbopack), Supabase Auth (magic link), Postgres com RLS,
  Supabase Realtime, Vercel

### Verificação (3 out 2026)

| | |
|---|---|
| `npm ci` | passa |
| `npm run lint` | passa |
| `npx tsc --noEmit` | passa |
| `npm run test` | 18 passam, 1 ignorado |
| `npm run test:db` | 120 testes pgTAP (requer Docker/OrbStack a correr) |

### O que está construído e testado

- Auth com magic link e SSR; modo demo preservado via `NEXT_PUBLIC_DEMO_MODE=true`
- RLS em todas as tabelas expostas. **As leituras da app usam o cliente
  autenticado, não a service role** — a RLS é a única fonte de verdade de
  autorização de leitura
- Mutações críticas em RPCs `SECURITY DEFINER` com `search_path=''` e identidade
  derivada de `auth.uid()`
- Matching determinístico no servidor. Filtros duros: mesma cidade, mesma data,
  sobreposição horária, intenção compatível. Ordenação por afinidade com desempate
  pseudo-aleatório estável (`md5(plan_id || group_id)`) para não premiar sempre
  quem se registou primeiro
- Grupos que recusaram um convite ficam fora do matching 14 dias
- Chat em Realtime; conversas terminadas ficam em arquivo de leitura; bloqueadas e
  expiradas ficam invisíveis
- Limites anti-spam: 3 planos ativos/grupo, 2 convites pendentes/plano,
  5 convites/grupo/24h, 20 mensagens/conversa/5min
- Parser local de texto livre: `"queremos jogar padel sábado à tarde em Lisboa"` →
  título "Jogar padel", 15:00–19:00, tipo Padel, tags padel/desporto
- Teto de utilizadores (`MAX_BETA_USERS=100`) reclamado por RPC com lock
  transacional, testado contra concorrência
- `/admin` com denúncias, desativação de grupos, encerramento de planos,
  anonimização e auditoria

## Armadilhas — não "corrigir" estas coisas

**O botão "Bloquear" na página de conversa NÃO tem `disabled={!active}`, e é
deliberado.** Foi removido porque a sequência mais provável de uma interação má é:
alguém diz algo desagradável → a pessoa termina a conversa por instinto → e nesse
momento perdia a única forma de garantir que aquele grupo não voltava a aparecer.
O servidor suporta bloquear uma conversa já terminada. "Terminar conversa" continua
condicionado a `active`, e isso está certo.

**O bootstrap (`src/lib/server/live-bootstrap.ts`) não deve voltar a usar
`createAdminClient()`.** A service role ignora a RLS; usá-la nas leituras duplicava
as regras de autorização em TypeScript e as duas camadas divergiram (um grupo que
recusava um convite continuava a receber o registo do outro). A service role só
pertence a: `auth/confirm`, `/admin`, `api/admin/action`, `api/beta/waitlist`,
`api/auth/magic-link`.

**`/api/auth/magic-link` devolve sempre `200 {status:"sent"}`**, elegível ou não.
É anti-enumeração, não é um bug. Erros de base de dados são registados no servidor
e distinguidos de "não convidado".

**A migration `001` faz `revoke all ... from anon, authenticated` seguido de grants
explícitos.** Não simplificar. O `service_role` precisa dos seus próprios grants
(`006`) — foi a causa de o magic link falhar silenciosamente em produção durante
horas.

## Em aberto

### Código

| Prioridade | Item |
|---|---|
| Média | O handler do Realtime em `conversas/[id]` chama `refreshLiveData()`, que refaz o bootstrap **completo** (perfil, grupos, planos, convites, conversas, mensagens, blocks) a cada mensagem recebida. Sem fetch incremental. É a causa provável da sensação de peso em telemóvel |
| Média | Fricção mobile: o onboarding tem 9 campos e o ecrã de revisão do plano tem 12, antes de a pessoa ver qualquer valor. Quando o parser acerta, o ecrã de revisão devia ser um resumo com "editar" discreto, não uma grelha de inputs |
| Baixa | O lockfile tem entradas `@emnapi` aninhadas; `npm ci` passa, mas foi gerado em macOS/ARM |

### Configuração externa (não é código)

| Prioridade | Item |
|---|---|
| **Bloqueio** | **SMTP próprio.** O serviço de email por defeito do Supabase envia poucas mensagens por hora. Com tráfego real, a maioria das pessoas não recebe o magic link e desiste em silêncio. Resend ou equivalente, em Authentication → SMTP Settings |
| Alta | `006_service_role_grants.sql` está no repositório mas **não aplicada em produção** — os grants foram aplicados à mão no SQL Editor, por isso a app funciona, mas o histórico está dessincronizado. Correr `npx supabase db push` |
| Alta | `MAX_BETA_USERS=100` pode ser atingido depressa se um vídeo correr bem |
| Média | Domínio próprio. Resolve a entrega de email e a confiança do link ao mesmo tempo |
| Média | Confirmar `BETA_ALLOWED_EMAIL_DOMAINS` no Vercel e que o `/admin` abre com o email em `ADMIN_EMAILS` |

### Decisões de produto pendentes

- O onboarding e o ecrã de revisão em telemóvel — simplificar até onde?
- Sem chave de IA configurada; corre o parser local. Quanto é que uma chave real
  melhora a extração, e isso justifica o custo?

## Estratégia de lançamento (decidida, 3 out 2026)

**Social-first, só Lisboa, agressivo.** TikTok, Instagram, Reddit, X, com criativos
produzidos com ferramentas atuais. Não depende de uma pessoa a evangelizar uma
universidade.

### O problema central

O matching exige mesma cidade, **mesma data**, sobreposição horária e intenção
compatível. Tráfego social é disperso no tempo: cem pessoas em Lisboa a publicar
planos para dias diferentes podem produzir **zero matches**. Cada uma vê "Sem outros
grupos por agora" e não volta — e o resultado parece um veredicto sobre a proposta
quando foi uma falha de coordenação.

É um problema de liquidez e de coordenação, não de aquisição. Qualquer trabalho de
crescimento tem de o resolver por desenho.

### Métrica principal

Quantos convites entre grupos são aceites **e acabam num encontro confirmado** por
semana. Downloads e seguidores não contam.

## Regras de produto inegociáveis

- Só maiores de 18
- Sem mapa público, sem localização em tempo real
- Antes de aceitação, só cidade e zona aproximada
- Perfis individuais nunca são públicos
- Chat só depois de convite aceite
- Bloqueio remove matches futuros; denúncias vão para um admin que as lê
- Planos e conversas expiram automaticamente no servidor
- Sem filtros por género, orientação, raça ou religião
- Sem swipe, likes, feed, seguidores, gamificação, compras ou anúncios dentro da app
- Um organizador com conta por grupo (decisão de MVP)

## Comandos

```bash
npm run dev          # localhost:3000
npm run lint
npx tsc --noEmit
npm run test         # vitest
npm run test:db      # pgTAP — exige npx supabase start

npx supabase start   # stack local (precisa de Docker/OrbStack)
npx supabase db reset  # APAGA a base de dados local, recria do zero
npx supabase db push   # aplica migrations ao projeto remoto
```

`npx supabase db reset` contra o remoto apagaria produção. Nunca.

Emails locais em http://127.0.0.1:54324 (Mailpit).

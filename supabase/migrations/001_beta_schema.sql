begin;

create extension if not exists pgcrypto with schema extensions;
create extension if not exists pg_cron;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  nome text not null default '',
  email text not null,
  cidade text not null default '',
  zona_aproximada text,
  idade integer check (idade is null or idade between 18 and 120),
  is_adult boolean not null default false,
  onboarding_completed boolean not null default false,
  beta_status text not null default 'pending'
    check (beta_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_email_lower_idx on public.profiles (lower(email));

create table public.beta_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'revoked')),
  invited_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index beta_invites_email_lower_idx
  on public.beta_invites (lower(email));

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  nome text not null check (char_length(btrim(nome)) between 2 and 80),
  descricao text check (descricao is null or char_length(descricao) <= 500),
  cidade text not null check (char_length(btrim(cidade)) between 2 and 80),
  zona_aproximada text check (
    zona_aproximada is null or char_length(zona_aproximada) <= 100
  ),
  numero_pessoas integer not null check (numero_pessoas between 2 and 8),
  interesses text[] not null default '{}',
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index one_active_group_per_owner_idx
  on public.groups (owner_id) where is_active;
create index groups_city_active_idx
  on public.groups (lower(cidade), is_active);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete restrict,
  titulo text not null check (char_length(btrim(titulo)) between 2 and 120),
  descricao text not null check (char_length(btrim(descricao)) between 10 and 1000),
  tipo text check (tipo is null or char_length(tipo) <= 100),
  intencao text not null check (intencao in (
    'Amizade',
    'Conhecer pessoas novas',
    'Conhecer outros solteiros',
    'Estudo e aprendizagem',
    'Desporto e atividade',
    'Cultura e lazer',
    'Networking',
    'Outro'
  )),
  vibe text check (vibe is null or vibe in (
    'Tranquila', 'Social', 'Espontânea', 'Criativa', 'Ativa', 'Qualquer uma'
  )),
  cidade text not null,
  zona_aproximada text,
  numero_pessoas integer not null check (numero_pessoas between 2 and 8),
  data date not null,
  hora_inicio time not null,
  hora_fim time not null,
  orcamento numeric(8, 2) check (orcamento is null or orcamento >= 0),
  tags text[] not null default '{}',
  status text not null default 'draft'
    check (status in ('draft', 'active', 'expired', 'closed')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (hora_fim > hora_inicio)
);

create index plans_group_status_expires_idx
  on public.plans (group_id, status, expires_at);
create index plans_matching_idx
  on public.plans (lower(cidade), data, status, hora_inicio, hora_fim);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete restrict,
  from_group_id uuid not null references public.groups(id) on delete restrict,
  to_group_id uuid not null references public.groups(id) on delete restrict,
  mensagem text not null check (char_length(btrim(mensagem)) between 1 and 500),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (from_group_id <> to_group_id),
  unique (plan_id, from_group_id, to_group_id)
);

create index invitations_from_created_idx
  on public.invitations (from_group_id, created_at desc);
create index invitations_to_status_idx
  on public.invitations (to_group_id, status);
create index invitations_plan_status_idx
  on public.invitations (plan_id, status);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null unique
    references public.invitations(id) on delete restrict,
  status text not null default 'active'
    check (status in ('active', 'ended', 'expired')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index conversations_status_expires_idx
  on public.conversations (status, expires_at);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null
    references public.conversations(id) on delete restrict,
  sender_profile_id uuid not null references public.profiles(id) on delete restrict,
  sender_group_id uuid not null references public.groups(id) on delete restrict,
  content text not null check (char_length(btrim(content)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index messages_conversation_created_idx
  on public.messages (conversation_id, created_at);

create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_group_id uuid not null references public.groups(id) on delete restrict,
  blocked_group_id uuid not null references public.groups(id) on delete restrict,
  created_at timestamptz not null default now(),
  check (blocker_group_id <> blocked_group_id),
  unique (blocker_group_id, blocked_group_id)
);

create index blocks_reverse_idx
  on public.blocks (blocked_group_id, blocker_group_id);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_profile_id uuid not null references public.profiles(id) on delete restrict,
  reported_group_id uuid not null references public.groups(id) on delete restrict,
  conversation_id uuid references public.conversations(id) on delete set null,
  reason text not null check (reason in (
    'Comportamento abusivo', 'Spam', 'Perfil falso', 'Conteúdo inadequado', 'Outro'
  )),
  description text check (description is null or char_length(description) <= 1000),
  status text not null default 'open'
    check (status in ('open', 'reviewed', 'closed')),
  created_at timestamptz not null default now()
);

create index reports_status_created_idx
  on public.reports (status, created_at desc);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  group_id uuid references public.groups(id) on delete set null,
  event_name text not null check (event_name in (
    'signed_in',
    'onboarding_completed',
    'group_created',
    'plan_created',
    'plan_published',
    'matches_viewed',
    'invitation_sent',
    'invitation_accepted',
    'invitation_declined',
    'conversation_opened',
    'message_sent',
    'conversation_ended',
    'report_created'
  )),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index analytics_event_created_idx
  on public.analytics_events (event_name, created_at desc);

create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_profile_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function private.touch_updated_at();
create trigger groups_touch_updated_at
before update on public.groups
for each row execute function private.touch_updated_at();
create trigger plans_touch_updated_at
before update on public.plans
for each row execute function private.touch_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, lower(coalesce(new.email, '')))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create or replace function private.is_approved()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.beta_status = 'approved'
      and p.is_adult
      and p.onboarding_completed
  );
$$;

create or replace function private.owns_group(
  p_group_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.groups g
    where g.id = p_group_id
      and g.owner_id = (select auth.uid())
  );
$$;

create or replace function private.is_conversation_participant(
  p_conversation_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.conversations c
    join public.invitations i on i.id = c.invitation_id
    join public.groups fg on fg.id = i.from_group_id
    join public.groups tg on tg.id = i.to_group_id
    where c.id = p_conversation_id
      and (select auth.uid()) in (fg.owner_id, tg.owner_id)
  );
$$;

create or replace function private.can_view_group(p_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.groups target
    where target.id = p_group_id
      and (
        target.owner_id = (select auth.uid())
        or exists (
          select 1
          from public.invitations i
          join public.groups own_group
            on own_group.owner_id = (select auth.uid())
          where i.status = 'accepted'
            and (
              (i.from_group_id = own_group.id and i.to_group_id = target.id)
              or (i.to_group_id = own_group.id and i.from_group_id = target.id)
            )
        )
      )
  );
$$;

create or replace function private.can_view_plan(p_plan_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.plans p
    join public.groups g on g.id = p.group_id
    where p.id = p_plan_id
      and (
        g.owner_id = (select auth.uid())
        or exists (
          select 1
          from public.invitations i
          join public.groups participant
            on participant.owner_id = (select auth.uid())
          where i.plan_id = p.id
            and participant.id in (i.from_group_id, i.to_group_id)
        )
      )
  );
$$;

create or replace function private.lock_group_pair(
  p_left_group_id uuid,
  p_right_group_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(
    hashtextextended(least(p_left_group_id, p_right_group_id)::text, 0)
  );
  perform pg_advisory_xact_lock(
    hashtextextended(greatest(p_left_group_id, p_right_group_id)::text, 0)
  );
end;
$$;

create or replace function private.groups_are_blocked(
  p_left_group_id uuid,
  p_right_group_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.blocks b
    where (b.blocker_group_id = p_left_group_id and b.blocked_group_id = p_right_group_id)
       or (b.blocker_group_id = p_right_group_id and b.blocked_group_id = p_left_group_id)
  );
$$;

create or replace function private.intentions_compatible(p_left text, p_right text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_left = p_right or (
    p_left in ('Amizade', 'Conhecer pessoas novas', 'Conhecer outros solteiros')
    and p_right in ('Amizade', 'Conhecer pessoas novas', 'Conhecer outros solteiros')
  );
$$;

create or replace function private.log_event(
  p_event_name text,
  p_profile_id uuid,
  p_group_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.analytics_events (
    event_name, profile_id, group_id, metadata
  ) values (
    p_event_name, p_profile_id, p_group_id, coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

create or replace function public.claim_beta_access(
  p_user_id uuid,
  p_email text,
  p_domain_allowed boolean,
  p_max_users integer
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles%rowtype;
  v_invited boolean;
  v_approved_count integer;
begin
  perform pg_advisory_xact_lock(hashtext('ponto_beta_capacity'));

  select * into v_profile
  from public.profiles
  where id = p_user_id
  for update;

  if not found or lower(v_profile.email) <> lower(btrim(p_email)) then
    raise exception 'Identidade inválida';
  end if;

  if v_profile.beta_status = 'approved' then
    return 'approved';
  end if;
  if v_profile.beta_status = 'rejected' then
    return 'not_allowed';
  end if;

  select exists (
    select 1 from public.beta_invites
    where lower(email) = lower(btrim(p_email))
      and status = 'approved'
  ) into v_invited;

  if not p_domain_allowed and not v_invited then
    return 'not_allowed';
  end if;

  select count(*) into v_approved_count
  from public.profiles
  where beta_status = 'approved';

  if v_approved_count >= greatest(p_max_users, 1) then
    return 'full';
  end if;

  update public.profiles
  set beta_status = 'approved'
  where id = p_user_id;

  return 'approved';
end;
$$;

create or replace function public.complete_onboarding(
  p_nome text,
  p_idade integer,
  p_is_adult boolean,
  p_cidade text,
  p_zona_aproximada text,
  p_group_nome text,
  p_group_descricao text,
  p_numero_pessoas integer,
  p_interesses text[]
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_group_id uuid;
  v_status text;
begin
  if v_user_id is null then raise exception 'Sessão necessária'; end if;
  if p_is_adult is distinct from true or p_idade is null or p_idade < 18 then
    raise exception 'Apenas maiores de 18 anos';
  end if;

  select beta_status into v_status
  from public.profiles
  where id = v_user_id
  for update;

  if v_status <> 'approved' then raise exception 'Acesso à beta não aprovado'; end if;
  if exists (select 1 from public.groups where owner_id = v_user_id and is_active) then
    raise exception 'Já existe um grupo ativo';
  end if;

  update public.profiles
  set nome = btrim(p_nome),
      idade = p_idade,
      is_adult = true,
      cidade = btrim(p_cidade),
      zona_aproximada = nullif(btrim(p_zona_aproximada), ''),
      onboarding_completed = true
  where id = v_user_id;

  insert into public.groups (
    owner_id, nome, descricao, cidade, zona_aproximada,
    numero_pessoas, interesses
  ) values (
    v_user_id, btrim(p_group_nome), nullif(btrim(p_group_descricao), ''),
    btrim(p_cidade), nullif(btrim(p_zona_aproximada), ''),
    p_numero_pessoas, coalesce(p_interesses, '{}')
  ) returning id into v_group_id;

  perform private.log_event('onboarding_completed', v_user_id, v_group_id);
  perform private.log_event('group_created', v_user_id, v_group_id);
  return v_group_id;
end;
$$;

create or replace function public.create_plan(
  p_titulo text,
  p_descricao text,
  p_tipo text,
  p_intencao text,
  p_vibe text,
  p_numero_pessoas integer,
  p_cidade text,
  p_zona_aproximada text,
  p_data date,
  p_hora_inicio time,
  p_hora_fim time,
  p_orcamento numeric,
  p_tags text[]
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_group public.groups%rowtype;
  v_plan_id uuid;
  v_expires_at timestamptz;
  v_active_count integer;
begin
  select * into v_group
  from public.groups
  where owner_id = v_user_id and is_active
  for update;

  if not found or not private.is_approved() then
    raise exception 'Grupo ativo e onboarding aprovado necessários';
  end if;
  if lower(v_group.cidade) <> lower(btrim(p_cidade)) then
    raise exception 'O plano deve ser na cidade do grupo';
  end if;
  if p_hora_fim <= p_hora_inicio then raise exception 'Horário inválido'; end if;

  v_expires_at := (p_data + p_hora_fim) at time zone 'Europe/Lisbon';
  if v_expires_at <= now() then raise exception 'O plano tem de terminar no futuro'; end if;

  select count(*) into v_active_count
  from public.plans
  where group_id = v_group.id
    and status = 'active'
    and expires_at > now();
  if v_active_count >= 3 then raise exception 'Máximo de três planos ativos'; end if;

  insert into public.plans (
    group_id, titulo, descricao, tipo, intencao, vibe,
    numero_pessoas, cidade, zona_aproximada, data,
    hora_inicio, hora_fim, orcamento, tags, status, expires_at
  ) values (
    v_group.id, btrim(p_titulo), btrim(p_descricao), nullif(btrim(p_tipo), ''),
    p_intencao, nullif(btrim(p_vibe), ''), p_numero_pessoas,
    btrim(p_cidade), nullif(btrim(p_zona_aproximada), ''), p_data,
    p_hora_inicio, p_hora_fim, p_orcamento, coalesce(p_tags, '{}'),
    'active', v_expires_at
  ) returning id into v_plan_id;

  perform private.log_event('plan_created', v_user_id, v_group.id, jsonb_build_object('plan_id', v_plan_id));
  perform private.log_event('plan_published', v_user_id, v_group.id, jsonb_build_object('plan_id', v_plan_id));
  return v_plan_id;
end;
$$;

create or replace function public.find_plan_matches(p_plan_id uuid)
returns setof jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_source public.plans%rowtype;
  v_source_group public.groups%rowtype;
begin
  select * into v_source from public.plans where id = p_plan_id;
  if not found then raise exception 'Plano não encontrado'; end if;
  select * into v_source_group from public.groups where id = v_source.group_id;

  if v_source_group.owner_id <> v_user_id or not private.is_approved() then
    raise exception 'Sem permissão';
  end if;
  if v_source.status <> 'active' or v_source.expires_at <= now() then
    raise exception 'Plano inativo';
  end if;

  perform private.log_event('matches_viewed', v_user_id, v_source.group_id, jsonb_build_object('plan_id', p_plan_id));

  return query
  with candidates as (
    select
      g.*,
      p.id as candidate_plan_id,
      p.titulo as plan_titulo,
      p.descricao as plan_descricao,
      p.tipo as plan_tipo,
      p.intencao as plan_intencao,
      p.vibe as plan_vibe,
      p.numero_pessoas as plan_numero_pessoas,
      p.data as plan_data,
      p.hora_inicio as plan_hora_inicio,
      p.hora_fim as plan_hora_fim,
      p.orcamento as plan_orcamento,
      p.tags as plan_tags,
      (
        case when lower(coalesce(p.tipo, '')) = lower(coalesce(v_source.tipo, '')) then 4 else 0 end
        + cardinality(array(
            select lower(x) from unnest(coalesce(p.tags, '{}') || coalesce(g.interesses, '{}')) x
            intersect
            select lower(y) from unnest(coalesce(v_source.tags, '{}') || coalesce(v_source_group.interesses, '{}')) y
          )) * 3
        + case when lower(coalesce(p.zona_aproximada, '')) = lower(coalesce(v_source.zona_aproximada, ''))
                    and p.zona_aproximada is not null then 2 else 0 end
        + case when p.orcamento is not null and v_source.orcamento is not null
                    and abs(p.orcamento - v_source.orcamento) <= 5 then 2 else 0 end
        + case when p.vibe = v_source.vibe or p.vibe = 'Qualquer uma'
                    or v_source.vibe = 'Qualquer uma' then 2 else 0 end
        + case when abs(p.numero_pessoas - v_source.numero_pessoas) <= 1 then 1 else 0 end
      ) as rank_value
    from public.plans p
    join public.groups g on g.id = p.group_id
    where p.group_id <> v_source.group_id
      and p.status = 'active'
      and p.expires_at > now()
      and g.is_active
      and lower(p.cidade) = lower(v_source.cidade)
      and p.data = v_source.data
      and p.hora_inicio < v_source.hora_fim
      and v_source.hora_inicio < p.hora_fim
      and p.numero_pessoas between 2 and 8
      and private.intentions_compatible(v_source.intencao, p.intencao)
      and not private.groups_are_blocked(v_source.group_id, p.group_id)
      and not exists (
        select 1 from public.invitations i
        where i.plan_id = v_source.id
          and i.to_group_id = p.group_id
          and i.status in ('pending', 'accepted')
      )
  )
  select jsonb_build_object(
    'group', jsonb_build_object(
      'id', c.id,
      'nome', c.nome,
      'descricao', coalesce(c.descricao, ''),
      'cidade', c.cidade,
      'zonaAproximada', c.zona_aproximada,
      'avatar', c.avatar_url,
      'numeroPessoas', c.numero_pessoas,
      'interesses', c.interesses,
      'isDemo', false,
      'createdAt', c.created_at
    ),
    'plan', jsonb_build_object(
      'id', c.candidate_plan_id,
      'groupId', c.id,
      'titulo', c.plan_titulo,
      'descricao', c.plan_descricao,
      'tipo', c.plan_tipo,
      'intencao', c.plan_intencao,
      'vibe', coalesce(c.plan_vibe, 'Qualquer uma'),
      'numeroPessoas', c.plan_numero_pessoas,
      'cidade', c.cidade,
      'zonaAproximada', c.zona_aproximada,
      'data', c.plan_data,
      'horaInicio', c.plan_hora_inicio,
      'horaFim', c.plan_hora_fim,
      'orcamento', c.plan_orcamento,
      'tags', c.plan_tags,
      'status', 'ativo',
      'createdAt', c.created_at
    ),
    'explanation',
      'Este grupo também quer fazer um plano com a mesma intenção, no mesmo dia e horário, em '
      || c.cidade || '.',
    'reasons', jsonb_build_array(
      'Mesmo dia e horário compatível',
      'Mesma intenção: ' || c.plan_intencao,
      'Grupo ativo na mesma cidade'
    )
  )
  from candidates c
  order by c.rank_value desc, c.created_at asc
  limit 2;
end;
$$;

create or replace function public.send_invitation(
  p_plan_id uuid,
  p_to_group_id uuid,
  p_message text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_plan public.plans%rowtype;
  v_from_group public.groups%rowtype;
  v_to_group public.groups%rowtype;
  v_invitation_id uuid;
  v_count integer;
begin
  select * into v_plan from public.plans where id = p_plan_id;
  if not found then raise exception 'Plano não encontrado'; end if;
  select * into v_from_group from public.groups where id = v_plan.group_id;
  select * into v_to_group from public.groups where id = p_to_group_id;
  if not found then raise exception 'Grupo não encontrado'; end if;

  perform private.lock_group_pair(v_from_group.id, v_to_group.id);
  select * into v_plan from public.plans where id = p_plan_id for update;
  perform g.id from public.groups g
    where g.id in (v_from_group.id, v_to_group.id)
    order by g.id
    for update;
  select * into v_from_group from public.groups where id = v_plan.group_id;
  select * into v_to_group from public.groups where id = p_to_group_id;

  if v_from_group.owner_id <> v_user_id or not private.is_approved() then
    raise exception 'Sem permissão';
  end if;
  if not v_from_group.is_active or not v_to_group.is_active then
    raise exception 'Um dos grupos está inativo';
  end if;
  if v_plan.status <> 'active' or v_plan.expires_at <= now() then
    raise exception 'Plano inativo';
  end if;
  if private.groups_are_blocked(v_from_group.id, v_to_group.id) then
    raise exception 'Convite indisponível';
  end if;
  if not exists (
    select 1 from public.plans target
    where target.group_id = v_to_group.id
      and target.status = 'active'
      and target.expires_at > now()
      and lower(target.cidade) = lower(v_plan.cidade)
      and target.data = v_plan.data
      and target.hora_inicio < v_plan.hora_fim
      and v_plan.hora_inicio < target.hora_fim
      and private.intentions_compatible(v_plan.intencao, target.intencao)
  ) then
    raise exception 'Este grupo já não tem um plano compatível';
  end if;

  select count(*) into v_count from public.invitations
  where plan_id = p_plan_id and status = 'pending';
  if v_count >= 2 then raise exception 'Máximo de dois convites pendentes por plano'; end if;

  select count(*) into v_count from public.invitations
  where from_group_id = v_from_group.id
    and created_at >= now() - interval '24 hours';
  if v_count >= 5 then raise exception 'Máximo de cinco convites em 24 horas'; end if;

  insert into public.invitations (
    plan_id, from_group_id, to_group_id, mensagem
  ) values (
    p_plan_id, v_from_group.id, p_to_group_id, btrim(p_message)
  ) returning id into v_invitation_id;

  perform private.log_event('invitation_sent', v_user_id, v_from_group.id, jsonb_build_object('invitation_id', v_invitation_id));
  return v_invitation_id;
exception
  when unique_violation then
    raise exception 'Este grupo já recebeu um convite para este plano';
end;
$$;

create or replace function public.respond_invitation(
  p_invitation_id uuid,
  p_response text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_invitation public.invitations%rowtype;
  v_plan public.plans%rowtype;
  v_to_group public.groups%rowtype;
  v_conversation_id uuid;
begin
  if p_response not in ('accepted', 'declined') then raise exception 'Resposta inválida'; end if;
  select * into v_invitation
  from public.invitations where id = p_invitation_id;
  if not found then raise exception 'Convite indisponível'; end if;
  perform private.lock_group_pair(v_invitation.from_group_id, v_invitation.to_group_id);
  select * into v_plan
  from public.plans where id = v_invitation.plan_id for update;
  select * into v_invitation
  from public.invitations where id = p_invitation_id for update;
  perform g.id from public.groups g
    where g.id in (v_invitation.from_group_id, v_invitation.to_group_id)
    order by g.id
    for update;
  if not found or v_invitation.status <> 'pending' then
    raise exception 'Convite indisponível';
  end if;
  select * into v_to_group from public.groups where id = v_invitation.to_group_id;

  if v_to_group.owner_id <> v_user_id or not private.is_approved() then
    raise exception 'Só o grupo convidado pode responder';
  end if;
  if not v_to_group.is_active or not exists (
    select 1 from public.groups source
    where source.id = v_invitation.from_group_id and source.is_active
  ) then
    raise exception 'Um dos grupos está inativo';
  end if;
  if v_plan.status <> 'active' or v_plan.expires_at <= now() then
    raise exception 'O plano já expirou';
  end if;
  if private.groups_are_blocked(v_invitation.from_group_id, v_invitation.to_group_id) then
    raise exception 'Convite indisponível';
  end if;
  if not exists (
    select 1 from public.plans target
    where target.group_id = v_invitation.to_group_id
      and target.status = 'active'
      and target.expires_at > now()
      and lower(target.cidade) = lower(v_plan.cidade)
      and target.data = v_plan.data
      and target.hora_inicio < v_plan.hora_fim
      and v_plan.hora_inicio < target.hora_fim
      and private.intentions_compatible(v_plan.intencao, target.intencao)
  ) then
    raise exception 'O grupo convidado já não tem um plano compatível';
  end if;

  update public.invitations
  set status = p_response, responded_at = now()
  where id = p_invitation_id;

  if p_response = 'declined' then
    perform private.log_event('invitation_declined', v_user_id, v_to_group.id, jsonb_build_object('invitation_id', p_invitation_id));
    return null;
  end if;

  insert into public.conversations (invitation_id, expires_at)
  values (p_invitation_id, v_plan.expires_at + interval '24 hours')
  on conflict (invitation_id) do update
    set invitation_id = excluded.invitation_id
  returning id into v_conversation_id;

  insert into public.messages (
    conversation_id, sender_profile_id, sender_group_id, content, created_at
  )
  select
    v_conversation_id, g.owner_id, v_invitation.from_group_id,
    v_invitation.mensagem, v_invitation.created_at
  from public.groups g
  where g.id = v_invitation.from_group_id;

  perform private.log_event('invitation_accepted', v_user_id, v_to_group.id, jsonb_build_object('invitation_id', p_invitation_id));
  return v_conversation_id;
end;
$$;

create or replace function public.send_message(
  p_conversation_id uuid,
  p_content text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_conversation public.conversations%rowtype;
  v_invitation public.invitations%rowtype;
  v_sender_group_id uuid;
  v_count integer;
  v_message_id uuid;
begin
  select * into v_conversation
  from public.conversations where id = p_conversation_id for update;
  if not found or v_conversation.status <> 'active'
     or v_conversation.expires_at <= now() then
    raise exception 'Conversa inativa ou expirada';
  end if;

  select * into v_invitation
  from public.invitations where id = v_conversation.invitation_id;

  select id into v_sender_group_id
  from public.groups
  where owner_id = v_user_id
    and id in (v_invitation.from_group_id, v_invitation.to_group_id)
    and is_active;

  if v_sender_group_id is null or not private.is_approved() then
    raise exception 'Sem permissão para enviar mensagens';
  end if;
  if private.groups_are_blocked(v_invitation.from_group_id, v_invitation.to_group_id) then
    raise exception 'Conversa bloqueada';
  end if;

  select count(*) into v_count from public.messages
  where conversation_id = p_conversation_id
    and created_at >= now() - interval '5 minutes';
  if v_count >= 20 then
    raise exception 'Limite temporário de mensagens atingido';
  end if;

  insert into public.messages (
    conversation_id, sender_profile_id, sender_group_id, content
  ) values (
    p_conversation_id, v_user_id, v_sender_group_id, btrim(p_content)
  ) returning id into v_message_id;

  perform private.log_event('message_sent', v_user_id, v_sender_group_id, jsonb_build_object('conversation_id', p_conversation_id));
  return v_message_id;
end;
$$;

create or replace function public.end_conversation(p_conversation_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_group_id uuid;
begin
  if not private.is_conversation_participant(p_conversation_id) then
    raise exception 'Sem permissão';
  end if;
  update public.conversations
  set status = 'ended'
  where id = p_conversation_id and status = 'active';
  select id into v_group_id from public.groups where owner_id = v_user_id and is_active limit 1;
  perform private.log_event('conversation_ended', v_user_id, v_group_id, jsonb_build_object('conversation_id', p_conversation_id));
end;
$$;

create or replace function public.block_group(
  p_conversation_id uuid,
  p_blocked_group_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_blocker_group_id uuid;
  v_expected_blocked_group_id uuid;
begin
  select
    case when fg.owner_id = v_user_id then fg.id
         when tg.owner_id = v_user_id then tg.id end,
    case when fg.owner_id = v_user_id then tg.id
         when tg.owner_id = v_user_id then fg.id end
  into v_blocker_group_id, v_expected_blocked_group_id
  from public.conversations c
  join public.invitations i on i.id = c.invitation_id
  join public.groups fg on fg.id = i.from_group_id
  join public.groups tg on tg.id = i.to_group_id
  where c.id = p_conversation_id;

  if v_blocker_group_id is null
     or v_expected_blocked_group_id is distinct from p_blocked_group_id then
    raise exception 'Grupo inválido';
  end if;
  perform private.lock_group_pair(v_blocker_group_id, p_blocked_group_id);
  perform c.id from public.conversations c
    where c.id = p_conversation_id for update;

  insert into public.blocks (blocker_group_id, blocked_group_id)
  values (v_blocker_group_id, p_blocked_group_id)
  on conflict (blocker_group_id, blocked_group_id) do nothing;

  update public.conversations c
  set status = 'ended'
  from public.invitations i
  where c.invitation_id = i.id
    and c.status = 'active'
    and (
      (i.from_group_id = v_blocker_group_id and i.to_group_id = p_blocked_group_id)
      or (i.from_group_id = p_blocked_group_id and i.to_group_id = v_blocker_group_id)
    );

  update public.invitations
  set status = 'cancelled', responded_at = now()
  where status = 'pending'
    and (
      (from_group_id = v_blocker_group_id and to_group_id = p_blocked_group_id)
      or (from_group_id = p_blocked_group_id and to_group_id = v_blocker_group_id)
    );
end;
$$;

create or replace function public.report_group(
  p_conversation_id uuid,
  p_reported_group_id uuid,
  p_reason text,
  p_description text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_reporter_group_id uuid;
  v_expected_reported_group_id uuid;
  v_report_id uuid;
begin
  if not private.is_approved()
     or not private.is_conversation_participant(p_conversation_id) then
    raise exception 'Sem permissão';
  end if;
  select
    case when fg.owner_id = v_user_id then fg.id
         when tg.owner_id = v_user_id then tg.id end,
    case when fg.owner_id = v_user_id then tg.id
         when tg.owner_id = v_user_id then fg.id end
  into v_reporter_group_id, v_expected_reported_group_id
  from public.conversations c
  join public.invitations i on i.id = c.invitation_id
  join public.groups fg on fg.id = i.from_group_id
  join public.groups tg on tg.id = i.to_group_id
  where c.id = p_conversation_id;
  if v_reporter_group_id is null
     or v_expected_reported_group_id is distinct from p_reported_group_id then
    raise exception 'Grupo inválido';
  end if;

  insert into public.reports (
    reporter_profile_id, reported_group_id, conversation_id, reason, description
  ) values (
    v_user_id, p_reported_group_id, p_conversation_id,
    p_reason, nullif(btrim(p_description), '')
  ) returning id into v_report_id;

  perform private.log_event('report_created', v_user_id, v_reporter_group_id, jsonb_build_object('report_id', v_report_id));
  return v_report_id;
end;
$$;

create or replace function public.record_analytics_event(
  p_event_name text,
  p_group_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then raise exception 'Sessão necessária'; end if;
  if p_event_name not in ('signed_in', 'matches_viewed', 'conversation_opened') then
    raise exception 'Evento não permitido';
  end if;
  if p_group_id is not null and not private.owns_group(p_group_id) then
    raise exception 'Grupo inválido';
  end if;
  perform private.log_event(p_event_name, v_user_id, p_group_id, p_metadata);
end;
$$;

create or replace function public.expire_beta_entities()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.plans
  set status = 'expired'
  where status = 'active' and expires_at <= now();

  update public.invitations i
  set status = 'cancelled', responded_at = now()
  from public.plans p
  where i.plan_id = p.id
    and i.status = 'pending'
    and (p.status <> 'active' or p.expires_at <= now());

  update public.conversations
  set status = 'expired'
  where status = 'active' and expires_at <= now();
end;
$$;

create or replace function public.admin_anonymize_user(
  p_admin_profile_id uuid,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtext('ponto_beta_capacity'));

  update public.groups set is_active = false where owner_id = p_user_id;
  update public.plans set status = 'closed'
    where group_id in (
      select id from public.groups where owner_id = p_user_id
    ) and status in ('draft', 'active');
  update public.invitations set status = 'cancelled', responded_at = now()
    where status = 'pending'
      and (
        from_group_id in (select id from public.groups where owner_id = p_user_id)
        or to_group_id in (select id from public.groups where owner_id = p_user_id)
      );
  update public.conversations c set status = 'ended'
    from public.invitations i
    where c.invitation_id = i.id
      and (
        i.from_group_id in (select id from public.groups where owner_id = p_user_id)
        or i.to_group_id in (select id from public.groups where owner_id = p_user_id)
      )
      and c.status = 'active';
  update public.messages set content = '[mensagem removida]'
    where sender_profile_id = p_user_id;
  update public.profiles
    set nome = 'Utilizador removido',
        email = 'removed+' || p_user_id::text || '@invalid.local',
        cidade = '',
        zona_aproximada = null,
        idade = null,
        is_adult = false,
        onboarding_completed = false,
        beta_status = 'rejected'
    where id = p_user_id;

  insert into public.admin_audit_log (
    admin_profile_id, action, target_type, target_id
  ) values (
    p_admin_profile_id, 'user_anonymized', 'profile', p_user_id
  );
end;
$$;

create or replace function public.admin_moderate(
  p_admin_profile_id uuid,
  p_action text,
  p_target_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_action = 'review_report' then
    update public.reports set status = 'reviewed' where id = p_target_id;
  elsif p_action = 'deactivate_group' then
    update public.groups set is_active = false where id = p_target_id;
    update public.plans set status = 'closed'
      where group_id = p_target_id and status in ('draft', 'active');
    update public.invitations set status = 'cancelled', responded_at = now()
      where status = 'pending'
        and (from_group_id = p_target_id or to_group_id = p_target_id);
    update public.conversations c set status = 'ended'
      from public.invitations i
      where c.invitation_id = i.id
        and (i.from_group_id = p_target_id or i.to_group_id = p_target_id)
        and c.status = 'active';
  elsif p_action = 'close_plan' then
    update public.plans set status = 'closed' where id = p_target_id;
    update public.invitations set status = 'cancelled', responded_at = now()
      where plan_id = p_target_id and status = 'pending';
    update public.conversations c set status = 'ended'
      from public.invitations i
      where c.invitation_id = i.id
        and i.plan_id = p_target_id
        and c.status = 'active';
  else
    raise exception 'Ação de moderação inválida';
  end if;

  insert into public.admin_audit_log (
    admin_profile_id, action, target_type, target_id
  ) values (
    p_admin_profile_id,
    p_action,
    case
      when p_action = 'review_report' then 'report'
      when p_action = 'deactivate_group' then 'group'
      else 'plan'
    end,
    p_target_id
  );
end;
$$;

alter table public.profiles enable row level security;
alter table public.beta_invites enable row level security;
alter table public.groups enable row level security;
alter table public.plans enable row level security;
alter table public.invitations enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;
alter table public.analytics_events enable row level security;
alter table public.admin_audit_log enable row level security;

create policy profiles_select_own on public.profiles
for select to authenticated using (id = (select auth.uid()));
create policy profiles_update_own on public.profiles
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy groups_select_connected on public.groups
for select to authenticated
using (private.can_view_group(id));

create policy plans_select_participant on public.plans
for select to authenticated
using (private.can_view_plan(id));

create policy invitations_select_participants on public.invitations
for select to authenticated
using (
  private.owns_group(from_group_id)
  or private.owns_group(to_group_id)
);

create policy conversations_select_participants on public.conversations
for select to authenticated
using (private.is_conversation_participant(id));

create policy messages_select_participants on public.messages
for select to authenticated
using (private.is_conversation_participant(conversation_id));

create policy blocks_select_own on public.blocks
for select to authenticated
using (private.owns_group(blocker_group_id));

revoke all on all tables in schema public from anon, authenticated;
grant select on public.profiles to authenticated;
grant select (
  id, nome, descricao, cidade, zona_aproximada, numero_pessoas,
  interesses, avatar_url, is_active, created_at, updated_at
) on public.groups to authenticated;
grant select on public.plans to authenticated;
grant select on public.invitations to authenticated;
grant select on public.conversations to authenticated;
grant select on public.messages to authenticated;
grant select on public.blocks to authenticated;

grant usage on schema private to authenticated;
revoke execute on all functions in schema private from public, anon, authenticated;
grant execute on function private.is_approved() to authenticated;
grant execute on function private.owns_group(uuid) to authenticated;
grant execute on function private.is_conversation_participant(uuid) to authenticated;
grant execute on function private.can_view_group(uuid) to authenticated;
grant execute on function private.can_view_plan(uuid) to authenticated;

revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.complete_onboarding(
  text, integer, boolean, text, text, text, text, integer, text[]
) to authenticated;
grant execute on function public.create_plan(
  text, text, text, text, text, integer, text, text, date, time, time, numeric, text[]
) to authenticated;
grant execute on function public.find_plan_matches(uuid) to authenticated;
grant execute on function public.send_invitation(uuid, uuid, text) to authenticated;
grant execute on function public.respond_invitation(uuid, text) to authenticated;
grant execute on function public.send_message(uuid, text) to authenticated;
grant execute on function public.end_conversation(uuid) to authenticated;
grant execute on function public.block_group(uuid, uuid) to authenticated;
grant execute on function public.report_group(uuid, uuid, text, text) to authenticated;
grant execute on function public.record_analytics_event(text, uuid, jsonb) to authenticated;

revoke execute on function public.claim_beta_access(uuid, text, boolean, integer)
  from public, anon, authenticated;
revoke execute on function public.expire_beta_entities()
  from public, anon, authenticated;
revoke execute on function public.admin_anonymize_user(uuid, uuid)
  from public, anon, authenticated;
revoke execute on function public.admin_moderate(uuid, text, uuid)
  from public, anon, authenticated;
grant execute on function public.claim_beta_access(uuid, text, boolean, integer)
  to service_role;
grant execute on function public.expire_beta_entities()
  to service_role;
grant execute on function public.admin_anonymize_user(uuid, uuid)
  to service_role;
grant execute on function public.admin_moderate(uuid, text, uuid)
  to service_role;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'invitations'
  ) then
    alter publication supabase_realtime add table public.invitations;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'conversations'
  ) then
    alter publication supabase_realtime add table public.conversations;
  end if;
end
$$;

select cron.schedule(
  'ponto-expire-beta-entities',
  '* * * * *',
  'select public.expire_beta_entities()'
)
where not exists (
  select 1 from cron.job where jobname = 'ponto-expire-beta-entities'
);

commit;

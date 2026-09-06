begin;
create extension if not exists pgtap with schema extensions;
select plan(5);

insert into auth.users (id, email, role, aud, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000101', 'cap-a@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000102', 'cap-b@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000103', 'cap-c@example.edu', 'authenticated', 'authenticated', now(), now());

select is(
  public.claim_beta_access(
    '00000000-0000-0000-0000-000000000101',
    'cap-a@example.edu',
    true,
    2
  ),
  'approved',
  'primeira vaga é aprovada'
);
select is(
  public.claim_beta_access(
    '00000000-0000-0000-0000-000000000102',
    'cap-b@example.edu',
    true,
    2
  ),
  'approved',
  'segunda vaga é aprovada'
);
select is(
  public.claim_beta_access(
    '00000000-0000-0000-0000-000000000103',
    'cap-c@example.edu',
    true,
    2
  ),
  'full',
  'terceira vaga é recusada atomicamente'
);
select is(
  (select count(*)::integer from public.profiles where beta_status = 'approved'),
  2,
  'o limite nunca é ultrapassado'
);

update public.profiles
set nome = 'Teste',
    cidade = 'Lisboa',
    idade = 20,
    is_adult = true,
    onboarding_completed = true
where id in (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000102'
);

insert into public.groups (id, owner_id, nome, cidade, numero_pessoas)
values
  ('10000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000101', 'Grupo Cap A', 'Lisboa', 4),
  ('10000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000102', 'Grupo Cap B', 'Lisboa', 4);

insert into public.plans (
  id, group_id, titulo, descricao, intencao, cidade, numero_pessoas,
  data, hora_inicio, hora_fim, status, expires_at
)
select
  ('20000000-0000-0000-0000-' || lpad(value::text, 12, '0'))::uuid,
  '10000000-0000-0000-0000-000000000101',
  'Plano ' || value,
  'Descrição suficientemente longa',
  'Amizade',
  'Lisboa',
  4,
  current_date + 7,
  '15:00',
  '17:00',
  'active',
  ((current_date + 7) + time '17:00') at time zone 'Europe/Lisbon'
from generate_series(101, 106) as value;

insert into public.plans (
  id, group_id, titulo, descricao, intencao, cidade, numero_pessoas,
  data, hora_inicio, hora_fim, status, expires_at
) values (
  '20000000-0000-0000-0000-000000000199',
  '10000000-0000-0000-0000-000000000102',
  'Plano alvo',
  'Descrição suficientemente longa',
  'Amizade',
  'Lisboa',
  4,
  current_date + 7,
  '15:00',
  '17:00',
  'active',
  ((current_date + 7) + time '17:00') at time zone 'Europe/Lisbon'
);

insert into public.invitations (
  plan_id, from_group_id, to_group_id, mensagem, status
)
select
  ('20000000-0000-0000-0000-' || lpad(value::text, 12, '0'))::uuid,
  '10000000-0000-0000-0000-000000000101',
  '10000000-0000-0000-0000-000000000102',
  'Convite ' || value,
  'declined'
from generate_series(101, 105) as value;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);
select throws_ok(
  $$select public.send_invitation(
    '20000000-0000-0000-0000-000000000106',
    '10000000-0000-0000-0000-000000000102',
    'Sexto convite'
  )$$,
  'P0001',
  'Máximo de cinco convites em 24 horas',
  'sexto convite diário é rejeitado'
);

select * from finish();
rollback;

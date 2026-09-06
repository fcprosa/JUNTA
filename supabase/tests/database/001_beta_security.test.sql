begin;
create extension if not exists pgtap with schema extensions;
select plan(19);

select has_table('public', 'profiles', 'profiles existe');
select has_table('public', 'messages', 'messages existe');
select has_function(
  'public',
  'send_invitation',
  array['uuid', 'uuid', 'text'],
  'send_invitation existe'
);

insert into auth.users (id, email, role, aud, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000001', 'a@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000002', 'b@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000003', 'c@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000004', 'd@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000005', 'e@example.edu', 'authenticated', 'authenticated', now(), now());

update public.profiles
set nome = 'Teste',
    cidade = 'Lisboa',
    idade = 20,
    is_adult = true,
    onboarding_completed = true,
    beta_status = 'approved';

insert into public.groups (
  id, owner_id, nome, cidade, numero_pessoas, interesses
)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Grupo A', 'Lisboa', 4, array['Livros']),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Grupo B', 'Lisboa', 4, array['Livros']),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Grupo C', 'Lisboa', 4, array['Livros']),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'Grupo D', 'Lisboa', 4, array['Livros']),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'Grupo E', 'Lisboa', 4, array['Livros']);

insert into public.plans (
  id, group_id, titulo, descricao, tipo, intencao, vibe,
  cidade, numero_pessoas, data, hora_inicio, hora_fim, tags,
  status, expires_at
)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Plano A', 'Descrição do plano A', 'Book club', 'Conhecer pessoas novas', 'Tranquila', 'Lisboa', 4, current_date + 7, '15:00', '17:00', array['Livros'], 'active', ((current_date + 7) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Plano B', 'Descrição do plano B', 'Book club', 'Conhecer pessoas novas', 'Tranquila', 'Lisboa', 4, current_date + 7, '15:00', '17:00', array['Livros'], 'active', ((current_date + 7) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Plano C', 'Descrição do plano C', 'Book club', 'Conhecer pessoas novas', 'Tranquila', 'Lisboa', 4, current_date + 7, '15:00', '17:00', array['Livros'], 'active', ((current_date + 7) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Plano D', 'Descrição do plano D', 'Book club', 'Conhecer pessoas novas', 'Tranquila', 'Lisboa', 4, current_date + 7, '15:00', '17:00', array['Livros'], 'active', ((current_date + 7) + time '17:00') at time zone 'Europe/Lisbon');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);

select lives_ok(
  $$select public.send_invitation('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Olá B')$$,
  'primeiro convite é aceite'
);
select lives_ok(
  $$select public.send_invitation('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Olá C')$$,
  'segundo convite é aceite'
);
select throws_ok(
  $$select public.send_invitation('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Olá D')$$,
  'P0001',
  'Máximo de dois convites pendentes por plano',
  'terceiro convite pendente é rejeitado'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);
select lives_ok(
  $$select public.respond_invitation(
    (select id from public.invitations where to_group_id = '10000000-0000-0000-0000-000000000002'),
    'accepted'
  )$$,
  'destinatário aceita convite'
);

reset role;
select is(
  (select count(*)::integer from public.conversations),
  1,
  'aceitação cria exatamente uma conversa'
);
create temporary table test_ids (conversation_id uuid);
insert into test_ids select id from public.conversations limit 1;
grant select on test_ids to authenticated;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000004', true);
select is(
  (select count(*)::integer from public.messages),
  0,
  'não participante não lê mensagens'
);
select throws_ok(
  $$select public.send_message(
    (select conversation_id from test_ids limit 1),
    'mensagem indevida'
  )$$,
  'P0001',
  'Sem permissão para enviar mensagens',
  'não participante não envia mensagens'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select is(
  (select count(*)::integer from public.messages),
  1,
  'participante lê a mensagem inicial'
);

reset role;
insert into public.messages (
  conversation_id, sender_profile_id, sender_group_id, content
)
select
  (select conversation_id from test_ids limit 1),
  '00000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'mensagem ' || value
from generate_series(1, 19) as value;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select throws_ok(
  $$select public.send_message(
    (select conversation_id from test_ids limit 1),
    'vigésima primeira'
  )$$,
  'P0001',
  'Limite temporário de mensagens atingido',
  'vigésima primeira mensagem em cinco minutos é rejeitada'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000005', true);
select lives_ok(
  $$select public.create_plan('Plano E1', 'Descrição suficientemente longa', 'Café', 'Amizade', 'Social', 4, 'Lisboa', '', current_date + 8, '10:00', '11:00', 5, array['Café'])$$,
  'primeiro plano ativo é aceite'
);
select lives_ok(
  $$select public.create_plan('Plano E2', 'Descrição suficientemente longa', 'Café', 'Amizade', 'Social', 4, 'Lisboa', '', current_date + 9, '10:00', '11:00', 5, array['Café'])$$,
  'segundo plano ativo é aceite'
);
select lives_ok(
  $$select public.create_plan('Plano E3', 'Descrição suficientemente longa', 'Café', 'Amizade', 'Social', 4, 'Lisboa', '', current_date + 10, '10:00', '11:00', 5, array['Café'])$$,
  'terceiro plano ativo é aceite'
);
select throws_ok(
  $$select public.create_plan('Plano E4', 'Descrição suficientemente longa', 'Café', 'Amizade', 'Social', 4, 'Lisboa', '', current_date + 11, '10:00', '11:00', 5, array['Café'])$$,
  'P0001',
  'Máximo de três planos ativos',
  'quarto plano ativo é rejeitado'
);

reset role;
insert into public.plans (
  id, group_id, titulo, descricao, intencao, cidade, numero_pessoas,
  data, hora_inicio, hora_fim, status, expires_at
) values (
  '20000000-0000-0000-0000-000000000099',
  '10000000-0000-0000-0000-000000000004',
  'Expirado',
  'Descrição já terminada',
  'Amizade',
  'Lisboa',
  4,
  current_date - 1,
  '10:00',
  '11:00',
  'active',
  now() - interval '1 minute'
);
select public.expire_beta_entities();
select is(
  (select status from public.plans where id = '20000000-0000-0000-0000-000000000099'),
  'expired',
  'cron materializa expiração'
);

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select throws_ok(
  $$select count(*) from public.profiles$$,
  '42501',
  'permission denied for table profiles',
  'anon não tem privilégio para ler perfis'
);

reset role;
select policies_are(
  'public',
  'messages',
  array['messages_select_participants'],
  'mensagens têm política de participantes'
);

select * from finish();
rollback;

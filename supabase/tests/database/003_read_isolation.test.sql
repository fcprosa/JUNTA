begin;
create extension if not exists pgtap with schema extensions;
select plan(44);

insert into auth.users (id, email, role, aud, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000201', 'read-a@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000202', 'read-b@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000203', 'read-c@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000204', 'read-d@example.edu', 'authenticated', 'authenticated', now(), now());

update public.profiles
set nome = 'Teste de leitura',
    cidade = 'Lisboa',
    idade = 20,
    is_adult = true,
    onboarding_completed = true,
    beta_status = 'approved'
where id in (
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000202',
  '00000000-0000-0000-0000-000000000203',
  '00000000-0000-0000-0000-000000000204'
);

insert into public.groups (id, owner_id, nome, cidade, numero_pessoas)
values
  ('10000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000201', 'Grupo Leitura A', 'Lisboa', 4),
  ('10000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000202', 'Grupo Leitura B', 'Lisboa', 4),
  ('10000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000203', 'Grupo Leitura C', 'Lisboa', 4),
  ('10000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000204', 'Grupo Leitura D', 'Lisboa', 4);

insert into public.plans (
  id, group_id, titulo, descricao, intencao, cidade, numero_pessoas,
  data, hora_inicio, hora_fim, status, expires_at
)
values
  ('20000000-0000-0000-0000-000000000201', '10000000-0000-0000-0000-000000000201', 'Plano A-C', 'Descrição suficientemente longa', 'Amizade', 'Lisboa', 4, current_date + 7, '15:00', '17:00', 'active', ((current_date + 7) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000202', '10000000-0000-0000-0000-000000000201', 'Plano A-B recusado', 'Descrição suficientemente longa', 'Amizade', 'Lisboa', 4, current_date + 7, '15:00', '17:00', 'active', ((current_date + 7) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000203', '10000000-0000-0000-0000-000000000201', 'Plano A-B bloqueado', 'Descrição suficientemente longa', 'Amizade', 'Lisboa', 4, current_date + 8, '15:00', '17:00', 'active', ((current_date + 8) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000204', '10000000-0000-0000-0000-000000000201', 'Plano A-D expirado', 'Descrição suficientemente longa', 'Amizade', 'Lisboa', 4, current_date + 9, '15:00', '17:00', 'active', ((current_date + 9) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000212', '10000000-0000-0000-0000-000000000202', 'Plano B', 'Descrição suficientemente longa', 'Amizade', 'Lisboa', 4, current_date + 7, '15:00', '17:00', 'active', ((current_date + 7) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000213', '10000000-0000-0000-0000-000000000203', 'Plano C', 'Descrição suficientemente longa', 'Amizade', 'Lisboa', 4, current_date + 7, '15:00', '17:00', 'active', ((current_date + 7) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000214', '10000000-0000-0000-0000-000000000204', 'Plano D', 'Descrição suficientemente longa', 'Amizade', 'Lisboa', 4, current_date + 9, '15:00', '17:00', 'active', ((current_date + 9) + time '17:00') at time zone 'Europe/Lisbon');

insert into public.invitations (
  id, plan_id, from_group_id, to_group_id, mensagem, status
)
values
  ('30000000-0000-0000-0000-000000000201', '20000000-0000-0000-0000-000000000201', '10000000-0000-0000-0000-000000000201', '10000000-0000-0000-0000-000000000203', 'Convite A-C', 'accepted'),
  ('30000000-0000-0000-0000-000000000202', '20000000-0000-0000-0000-000000000202', '10000000-0000-0000-0000-000000000201', '10000000-0000-0000-0000-000000000202', 'Convite A-B', 'pending');

insert into public.conversations (id, invitation_id, status, expires_at)
values (
  '40000000-0000-0000-0000-000000000201',
  '30000000-0000-0000-0000-000000000201',
  'active',
  now() + interval '8 days'
);

insert into public.messages (
  id, conversation_id, sender_profile_id, sender_group_id, content
)
values (
  '50000000-0000-0000-0000-000000000201',
  '40000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000201',
  '10000000-0000-0000-0000-000000000201',
  'Mensagem privada A-C'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000204', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000204', 'identidade ativa é 00000000-0000-0000-0000-000000000204');
select is((select count(id)::integer from public.profiles where id = '00000000-0000-0000-0000-000000000201'), 0, 'grupo D não lê o perfil de A');
select is((select count(id)::integer from public.groups where id = '10000000-0000-0000-0000-000000000201'), 0, 'grupo D não lê o grupo A');
select is((select count(id)::integer from public.plans where group_id = '10000000-0000-0000-0000-000000000201'), 0, 'grupo D não lê planos de A');
select is((select count(id)::integer from public.invitations where from_group_id = '10000000-0000-0000-0000-000000000201'), 0, 'grupo D não lê convites de A');
select is((select count(id)::integer from public.conversations where id = '40000000-0000-0000-0000-000000000201'), 0, 'grupo D não lê conversas de A');
select is((select count(id)::integer from public.messages where id = '50000000-0000-0000-0000-000000000201'), 0, 'grupo D não lê mensagens de A');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000202', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000202', 'identidade ativa é 00000000-0000-0000-0000-000000000202');
select is((select count(id)::integer from public.groups where id = '10000000-0000-0000-0000-000000000201'), 1, 'B lê o grupo A enquanto o convite está pendente');
select is((select count(id)::integer from public.plans where id = '20000000-0000-0000-0000-000000000202'), 1, 'B lê o plano A enquanto o convite está pendente');
select lives_ok(
  $$select public.respond_invitation('30000000-0000-0000-0000-000000000202', 'declined')$$,
  'B recusa o convite de A'
);
select is((select count(id)::integer from public.groups where id = '10000000-0000-0000-0000-000000000201'), 0, 'B deixa de ler o grupo A depois de recusar');
select is((select count(id)::integer from public.plans where id = '20000000-0000-0000-0000-000000000202'), 0, 'B deixa de ler o plano A depois de recusar');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000201', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000201', 'identidade ativa é 00000000-0000-0000-0000-000000000201');
select is((select count(id)::integer from public.groups where id = '10000000-0000-0000-0000-000000000202'), 0, 'A deixa de ler o grupo B depois da recusa');

reset role;
insert into public.invitations (
  id, plan_id, from_group_id, to_group_id, mensagem, status
)
values (
  '30000000-0000-0000-0000-000000000203',
  '20000000-0000-0000-0000-000000000203',
  '10000000-0000-0000-0000-000000000201',
  '10000000-0000-0000-0000-000000000202',
  'Convite para bloquear',
  'accepted'
);
insert into public.conversations (id, invitation_id, status, expires_at)
values (
  '40000000-0000-0000-0000-000000000203',
  '30000000-0000-0000-0000-000000000203',
  'active',
  now() + interval '9 days'
);
insert into public.messages (
  id, conversation_id, sender_profile_id, sender_group_id, content
)
values (
  '50000000-0000-0000-0000-000000000203',
  '40000000-0000-0000-0000-000000000203',
  '00000000-0000-0000-0000-000000000201',
  '10000000-0000-0000-0000-000000000201',
  'Mensagem antes do bloqueio'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000201', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000201', 'identidade ativa é 00000000-0000-0000-0000-000000000201');
select is((select count(id)::integer from public.groups where id = '10000000-0000-0000-0000-000000000202'), 1, 'A lê B antes do bloqueio');
select is((select count(id)::integer from public.messages where id = '50000000-0000-0000-0000-000000000203'), 1, 'A lê a mensagem antes do bloqueio');
select lives_ok(
  $$select public.block_group('40000000-0000-0000-0000-000000000203', '10000000-0000-0000-0000-000000000202')$$,
  'A bloqueia B'
);
select is((select count(id)::integer from public.groups where id = '10000000-0000-0000-0000-000000000202'), 0, 'A não lê B depois do bloqueio');
select is((select count(id)::integer from public.messages where id = '50000000-0000-0000-0000-000000000203'), 0, 'A não lê mensagens depois do bloqueio');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000202', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000202', 'identidade ativa é 00000000-0000-0000-0000-000000000202');
select is((select count(id)::integer from public.groups where id = '10000000-0000-0000-0000-000000000201'), 0, 'B não lê A depois do bloqueio');
select is((select count(id)::integer from public.messages where id = '50000000-0000-0000-0000-000000000203'), 0, 'B não lê mensagens depois do bloqueio');

reset role;
insert into public.invitations (
  id, plan_id, from_group_id, to_group_id, mensagem, status
)
values (
  '30000000-0000-0000-0000-000000000204',
  '20000000-0000-0000-0000-000000000204',
  '10000000-0000-0000-0000-000000000201',
  '10000000-0000-0000-0000-000000000204',
  'Convite expirado',
  'accepted'
);
insert into public.conversations (id, invitation_id, status, expires_at)
values (
  '40000000-0000-0000-0000-000000000204',
  '30000000-0000-0000-0000-000000000204',
  'expired',
  now() - interval '1 minute'
);
insert into public.messages (
  id, conversation_id, sender_profile_id, sender_group_id, content
)
values (
  '50000000-0000-0000-0000-000000000204',
  '40000000-0000-0000-0000-000000000204',
  '00000000-0000-0000-0000-000000000201',
  '10000000-0000-0000-0000-000000000201',
  'Mensagem expirada'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000201', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000201', 'identidade ativa é 00000000-0000-0000-0000-000000000201');
select is((select count(id)::integer from public.messages where id = '50000000-0000-0000-0000-000000000204'), 0, 'A não lê mensagens de conversa expirada');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000204', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000204', 'identidade ativa é 00000000-0000-0000-0000-000000000204');
select is((select count(id)::integer from public.messages where id = '50000000-0000-0000-0000-000000000204'), 0, 'D não lê mensagens de conversa expirada');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000201', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000201', 'identidade ativa é 00000000-0000-0000-0000-000000000201');
select lives_ok(
  $$select public.end_conversation('40000000-0000-0000-0000-000000000201')$$,
  'A termina a conversa com C'
);
select is((select count(id)::integer from public.messages where id = '50000000-0000-0000-0000-000000000201'), 1, 'A continua a ler mensagens depois de terminar a conversa');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000203', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000203', 'identidade ativa é 00000000-0000-0000-0000-000000000203');
select is((select count(id)::integer from public.messages where id = '50000000-0000-0000-0000-000000000201'), 1, 'C continua a ler mensagens depois de a conversa ser terminada');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000201', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000201', 'identidade ativa é 00000000-0000-0000-0000-000000000201');
select is((select status from public.conversations where id = '40000000-0000-0000-0000-000000000201'), 'ended', 'a conversa A-C está terminada antes do bloqueio');
select is((select count(id)::integer from public.groups where id = '10000000-0000-0000-0000-000000000203'), 1, 'A ainda lê o grupo C com a conversa terminada');
select lives_ok(
  $$select public.block_group('40000000-0000-0000-0000-000000000201', '10000000-0000-0000-0000-000000000203')$$,
  'A bloqueia C com a conversa já terminada'
);
select is((select count(id)::integer from public.blocks where blocker_group_id = '10000000-0000-0000-0000-000000000201' and blocked_group_id = '10000000-0000-0000-0000-000000000203'), 1, 'o bloqueio fica registado mesmo sobre uma conversa terminada');
select is((select status from public.conversations where id = '40000000-0000-0000-0000-000000000201'), 'ended', 'a conversa continua terminada depois do bloqueio');
select is((select count(id)::integer from public.groups where id = '10000000-0000-0000-0000-000000000203'), 0, 'A não lê o grupo C depois de bloquear uma conversa terminada');
select is((select count(id)::integer from public.messages where id = '50000000-0000-0000-0000-000000000201'), 0, 'A não lê mensagens de C depois de bloquear uma conversa terminada');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000203', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000203', 'identidade ativa é 00000000-0000-0000-0000-000000000203');
select is((select count(id)::integer from public.groups where id = '10000000-0000-0000-0000-000000000201'), 0, 'C não lê o grupo A depois de ser bloqueado numa conversa terminada');
select is((select count(id)::integer from public.messages where id = '50000000-0000-0000-0000-000000000201'), 0, 'C não lê mensagens de A depois de ser bloqueado numa conversa terminada');

select * from finish();
rollback;

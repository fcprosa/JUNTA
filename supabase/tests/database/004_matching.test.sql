begin;
create extension if not exists pgtap with schema extensions;
select plan(45);

insert into auth.users (id, email, role, aud, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000401', 'match-401@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000402', 'match-402@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000411', 'match-411@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000412', 'match-412@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000421', 'match-421@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000422', 'match-422@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000431', 'match-431@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000432', 'match-432@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000441', 'match-441@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000442', 'match-442@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000451', 'match-451@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000452', 'match-452@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000461', 'match-461@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000462', 'match-462@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000471', 'match-471@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000472', 'match-472@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000481', 'match-481@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000482', 'match-482@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000491', 'match-491@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000492', 'match-492@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000493', 'match-493@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000494', 'match-494@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000501', 'match-501@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000502', 'match-502@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000511', 'match-511@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000512', 'match-512@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000521', 'match-521@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000522', 'match-522@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000531', 'match-531@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000532', 'match-532@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000541', 'match-541@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000542', 'match-542@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000543', 'match-543@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000544', 'match-544@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000545', 'match-545@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000551', 'match-551@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000552', 'match-552@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000561', 'match-561@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000571', 'match-571@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000573', 'match-573@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000574', 'match-574@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000575', 'match-575@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000576', 'match-576@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000581', 'match-581@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000582', 'match-582@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000591', 'match-591@example.edu', 'authenticated', 'authenticated', now(), now()),
  ('00000000-0000-0000-0000-000000000592', 'match-592@example.edu', 'authenticated', 'authenticated', now(), now());

update public.profiles
set nome = 'Teste matching',
    cidade = 'Lisboa',
    idade = 20,
    is_adult = true,
    onboarding_completed = true,
    beta_status = 'approved'
where id in (
  '00000000-0000-0000-0000-000000000401',
  '00000000-0000-0000-0000-000000000402',
  '00000000-0000-0000-0000-000000000411',
  '00000000-0000-0000-0000-000000000412',
  '00000000-0000-0000-0000-000000000421',
  '00000000-0000-0000-0000-000000000422',
  '00000000-0000-0000-0000-000000000431',
  '00000000-0000-0000-0000-000000000432',
  '00000000-0000-0000-0000-000000000441',
  '00000000-0000-0000-0000-000000000442',
  '00000000-0000-0000-0000-000000000451',
  '00000000-0000-0000-0000-000000000452',
  '00000000-0000-0000-0000-000000000461',
  '00000000-0000-0000-0000-000000000462',
  '00000000-0000-0000-0000-000000000471',
  '00000000-0000-0000-0000-000000000472',
  '00000000-0000-0000-0000-000000000481',
  '00000000-0000-0000-0000-000000000482',
  '00000000-0000-0000-0000-000000000491',
  '00000000-0000-0000-0000-000000000492',
  '00000000-0000-0000-0000-000000000493',
  '00000000-0000-0000-0000-000000000494',
  '00000000-0000-0000-0000-000000000501',
  '00000000-0000-0000-0000-000000000502',
  '00000000-0000-0000-0000-000000000511',
  '00000000-0000-0000-0000-000000000512',
  '00000000-0000-0000-0000-000000000521',
  '00000000-0000-0000-0000-000000000522',
  '00000000-0000-0000-0000-000000000531',
  '00000000-0000-0000-0000-000000000532',
  '00000000-0000-0000-0000-000000000541',
  '00000000-0000-0000-0000-000000000542',
  '00000000-0000-0000-0000-000000000543',
  '00000000-0000-0000-0000-000000000544',
  '00000000-0000-0000-0000-000000000545',
  '00000000-0000-0000-0000-000000000551',
  '00000000-0000-0000-0000-000000000552',
  '00000000-0000-0000-0000-000000000561',
  '00000000-0000-0000-0000-000000000571',
  '00000000-0000-0000-0000-000000000573',
  '00000000-0000-0000-0000-000000000574',
  '00000000-0000-0000-0000-000000000575',
  '00000000-0000-0000-0000-000000000576',
  '00000000-0000-0000-0000-000000000581',
  '00000000-0000-0000-0000-000000000582',
  '00000000-0000-0000-0000-000000000591',
  '00000000-0000-0000-0000-000000000592'
);

insert into public.groups (
  id, owner_id, nome, cidade, zona_aproximada, numero_pessoas, interesses, is_active
)
values
  ('10000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000401', 'Match Origem Self', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000402', 'Match Outro Self', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000411', '00000000-0000-0000-0000-000000000411', 'Match Origem Inativo', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000412', '00000000-0000-0000-0000-000000000412', 'Match Candidato Inativo', 'Lisboa', null, 4, '{}', false),
  ('10000000-0000-0000-0000-000000000421', '00000000-0000-0000-0000-000000000421', 'Match Origem Closed', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000422', '00000000-0000-0000-0000-000000000422', 'Match Candidato Closed', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000431', '00000000-0000-0000-0000-000000000431', 'Match Origem Expira', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000432', '00000000-0000-0000-0000-000000000432', 'Match Candidato Expira', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000441', '00000000-0000-0000-0000-000000000441', 'Match Origem Lisboa', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000442', '00000000-0000-0000-0000-000000000442', 'Match Candidato Porto', 'Porto', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000451', '00000000-0000-0000-0000-000000000451', 'Match Origem Caso', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000452', '00000000-0000-0000-0000-000000000452', 'Match Candidato caso', 'lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000461', '00000000-0000-0000-0000-000000000461', 'Match Origem Data', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000462', '00000000-0000-0000-0000-000000000462', 'Match Candidato Data', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000471', '00000000-0000-0000-0000-000000000471', 'Match Origem Hora', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000472', '00000000-0000-0000-0000-000000000472', 'Match Candidato Hora', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000481', '00000000-0000-0000-0000-000000000481', 'Match Origem Intencao', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000482', '00000000-0000-0000-0000-000000000482', 'Match Candidato Intencao', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000491', '00000000-0000-0000-0000-000000000491', 'Match Origem Bloqueia', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000492', '00000000-0000-0000-0000-000000000492', 'Match Candidato Bloqueado', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000493', '00000000-0000-0000-0000-000000000493', 'Match Origem Bloqueada', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000494', '00000000-0000-0000-0000-000000000494', 'Match Candidato Bloqueia', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000501', 'Match Origem Pendente', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000502', 'Match Candidato Pendente', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000511', '00000000-0000-0000-0000-000000000511', 'Match Origem Aceite', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000512', '00000000-0000-0000-0000-000000000512', 'Match Candidato Aceite', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000521', '00000000-0000-0000-0000-000000000521', 'Match Origem Sobreposicao', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000522', '00000000-0000-0000-0000-000000000522', 'Match Candidato Sobreposicao', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000531', '00000000-0000-0000-0000-000000000531', 'Match Origem Recusado', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000532', '00000000-0000-0000-0000-000000000532', 'Match Candidato Recusado', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000541', '00000000-0000-0000-0000-000000000541', 'Match Origem Limite', 'Lisboa', 'Alvalade', 4, '{quadra}', true),
  ('10000000-0000-0000-0000-000000000542', '00000000-0000-0000-0000-000000000542', 'Match Candidato Fraco 1', 'Lisboa', 'Belem', 4, '{cinema}', true),
  ('10000000-0000-0000-0000-000000000543', '00000000-0000-0000-0000-000000000543', 'Match Candidato Fraco 2', 'Lisboa', 'Ajuda', 4, '{cinema}', true),
  ('10000000-0000-0000-0000-000000000544', '00000000-0000-0000-0000-000000000544', 'Match Candidato Fraco 3', 'Lisboa', 'Marvila', 4, '{cinema}', true),
  ('10000000-0000-0000-0000-000000000545', '00000000-0000-0000-0000-000000000545', 'Match Candidato Forte', 'Lisboa', 'Alvalade', 4, '{quadra}', true),
  ('10000000-0000-0000-0000-000000000551', '00000000-0000-0000-0000-000000000551', 'Match Origem Permissao', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000552', '00000000-0000-0000-0000-000000000552', 'Match Estranho Permissao', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000561', '00000000-0000-0000-0000-000000000561', 'Match Origem Inativo', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000571', '00000000-0000-0000-0000-000000000571', 'Match Origem Fairness', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000573', '00000000-0000-0000-0000-000000000573', 'Match Fairness 1', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000574', '00000000-0000-0000-0000-000000000574', 'Match Fairness 2', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000575', '00000000-0000-0000-0000-000000000575', 'Match Fairness 3', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000576', '00000000-0000-0000-0000-000000000576', 'Match Fairness 4', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000581', '00000000-0000-0000-0000-000000000581', 'Match Origem Recusa 3d', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000582', '00000000-0000-0000-0000-000000000582', 'Match Candidato Recusa 3d', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000591', '00000000-0000-0000-0000-000000000591', 'Match Origem Recusa 20d', 'Lisboa', null, 4, '{}', true),
  ('10000000-0000-0000-0000-000000000592', '00000000-0000-0000-0000-000000000592', 'Match Candidato Recusa 20d', 'Lisboa', null, 4, '{}', true);

insert into public.plans (
  id, group_id, titulo, descricao, tipo, intencao, vibe, cidade, zona_aproximada,
  numero_pessoas, data, hora_inicio, hora_fim, tags, status, expires_at
)
values
  ('20000000-0000-0000-0000-000000000401', '10000000-0000-0000-0000-000000000401', 'Origem self', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 20, '15:00', '17:00', '{}', 'active', ((current_date + 20) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000409', '10000000-0000-0000-0000-000000000401', 'Segundo plano self', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 20, '15:00', '17:00', '{}', 'active', ((current_date + 20) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000402', '10000000-0000-0000-0000-000000000402', 'Candidato self', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 20, '15:00', '17:00', '{}', 'active', ((current_date + 20) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000411', '10000000-0000-0000-0000-000000000411', 'Origem inativo', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 21, '15:00', '17:00', '{}', 'active', ((current_date + 21) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000412', '10000000-0000-0000-0000-000000000412', 'Candidato inativo', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 21, '15:00', '17:00', '{}', 'active', ((current_date + 21) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000421', '10000000-0000-0000-0000-000000000421', 'Origem closed', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 22, '15:00', '17:00', '{}', 'active', ((current_date + 22) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000422', '10000000-0000-0000-0000-000000000422', 'Candidato closed', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 22, '15:00', '17:00', '{}', 'closed', ((current_date + 22) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000431', '10000000-0000-0000-0000-000000000431', 'Origem expira', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 23, '15:00', '17:00', '{}', 'active', ((current_date + 23) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000432', '10000000-0000-0000-0000-000000000432', 'Candidato expira', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 23, '15:00', '17:00', '{}', 'active', now() - interval '1 minute'),
  ('20000000-0000-0000-0000-000000000441', '10000000-0000-0000-0000-000000000441', 'Origem cidade', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 24, '15:00', '17:00', '{}', 'active', ((current_date + 24) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000442', '10000000-0000-0000-0000-000000000442', 'Candidato cidade', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Porto', null, 4, current_date + 24, '15:00', '17:00', '{}', 'active', ((current_date + 24) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000451', '10000000-0000-0000-0000-000000000451', 'Origem caso', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 25, '15:00', '17:00', '{}', 'active', ((current_date + 25) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000452', '10000000-0000-0000-0000-000000000452', 'Candidato caso', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'lisboa', null, 4, current_date + 25, '15:00', '17:00', '{}', 'active', ((current_date + 25) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000461', '10000000-0000-0000-0000-000000000461', 'Origem data', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 26, '15:00', '17:00', '{}', 'active', ((current_date + 26) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000462', '10000000-0000-0000-0000-000000000462', 'Candidato data', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 27, '15:00', '17:00', '{}', 'active', ((current_date + 27) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000471', '10000000-0000-0000-0000-000000000471', 'Origem hora', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 28, '15:00', '17:00', '{}', 'active', ((current_date + 28) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000472', '10000000-0000-0000-0000-000000000472', 'Candidato hora', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 28, '10:00', '11:00', '{}', 'active', ((current_date + 28) + time '11:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000481', '10000000-0000-0000-0000-000000000481', 'Origem intencao', 'Descrição suficientemente longa', null, 'Networking', 'Tranquila', 'Lisboa', null, 4, current_date + 29, '15:00', '17:00', '{}', 'active', ((current_date + 29) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000482', '10000000-0000-0000-0000-000000000482', 'Candidato intencao', 'Descrição suficientemente longa', null, 'Desporto e atividade', 'Tranquila', 'Lisboa', null, 4, current_date + 29, '15:00', '17:00', '{}', 'active', ((current_date + 29) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000491', '10000000-0000-0000-0000-000000000491', 'Origem bloqueia', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 30, '15:00', '17:00', '{}', 'active', ((current_date + 30) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000492', '10000000-0000-0000-0000-000000000492', 'Candidato bloqueado', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 30, '15:00', '17:00', '{}', 'active', ((current_date + 30) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000493', '10000000-0000-0000-0000-000000000493', 'Origem bloqueada', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 31, '15:00', '17:00', '{}', 'active', ((current_date + 31) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000494', '10000000-0000-0000-0000-000000000494', 'Candidato bloqueia', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 31, '15:00', '17:00', '{}', 'active', ((current_date + 31) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000501', '10000000-0000-0000-0000-000000000501', 'Origem pendente', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 32, '15:00', '17:00', '{}', 'active', ((current_date + 32) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000502', '10000000-0000-0000-0000-000000000502', 'Candidato pendente', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 32, '15:00', '17:00', '{}', 'active', ((current_date + 32) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000511', '10000000-0000-0000-0000-000000000511', 'Origem aceite', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 33, '15:00', '17:00', '{}', 'active', ((current_date + 33) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000512', '10000000-0000-0000-0000-000000000512', 'Candidato aceite', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 33, '15:00', '17:00', '{}', 'active', ((current_date + 33) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000521', '10000000-0000-0000-0000-000000000521', 'Origem sobreposição', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 34, '15:00', '17:00', '{}', 'active', ((current_date + 34) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000522', '10000000-0000-0000-0000-000000000522', 'Candidato sobreposição', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 34, '16:00', '18:00', '{}', 'active', ((current_date + 34) + time '18:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000531', '10000000-0000-0000-0000-000000000531', 'Origem recusado', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 35, '15:00', '17:00', '{}', 'active', ((current_date + 35) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000532', '10000000-0000-0000-0000-000000000532', 'Candidato recusado', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 35, '15:00', '17:00', '{}', 'active', ((current_date + 35) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000541', '10000000-0000-0000-0000-000000000541', 'Origem limite', 'Descrição suficientemente longa', 'Padel', 'Amizade', 'Tranquila', 'Lisboa', 'Alvalade', 4, current_date + 36, '15:00', '17:00', '{quadra}', 'active', ((current_date + 36) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000542', '10000000-0000-0000-0000-000000000542', 'Candidato fraco 1', 'Descrição suficientemente longa', 'Café', 'Amizade', 'Tranquila', 'Lisboa', 'Belem', 4, current_date + 36, '15:00', '17:00', '{brunch}', 'active', ((current_date + 36) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000543', '10000000-0000-0000-0000-000000000543', 'Candidato fraco 2', 'Descrição suficientemente longa', 'Café', 'Amizade', 'Tranquila', 'Lisboa', 'Ajuda', 4, current_date + 36, '15:00', '17:00', '{brunch}', 'active', ((current_date + 36) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000544', '10000000-0000-0000-0000-000000000544', 'Candidato fraco 3', 'Descrição suficientemente longa', 'Café', 'Amizade', 'Tranquila', 'Lisboa', 'Marvila', 4, current_date + 36, '15:00', '17:00', '{brunch}', 'active', ((current_date + 36) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000545', '10000000-0000-0000-0000-000000000545', 'Candidato forte', 'Descrição suficientemente longa', 'Padel', 'Amizade', 'Tranquila', 'Lisboa', 'Alvalade', 4, current_date + 36, '15:00', '17:00', '{quadra}', 'active', ((current_date + 36) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000551', '10000000-0000-0000-0000-000000000551', 'Origem permissão', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 37, '15:00', '17:00', '{}', 'active', ((current_date + 37) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000561', '10000000-0000-0000-0000-000000000561', 'Origem expirado', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 38, '15:00', '17:00', '{}', 'expired', ((current_date + 38) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000571', '10000000-0000-0000-0000-000000000571', 'Origem fairness A', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 42, '15:00', '17:00', '{}', 'active', ((current_date + 42) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000572', '10000000-0000-0000-0000-000000000571', 'Origem fairness B', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 42, '15:00', '17:00', '{}', 'active', ((current_date + 42) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000573', '10000000-0000-0000-0000-000000000573', 'Candidato fairness 1', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 42, '15:00', '17:00', '{}', 'active', ((current_date + 42) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000574', '10000000-0000-0000-0000-000000000574', 'Candidato fairness 2', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 42, '15:00', '17:00', '{}', 'active', ((current_date + 42) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000575', '10000000-0000-0000-0000-000000000575', 'Candidato fairness 3', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 42, '15:00', '17:00', '{}', 'active', ((current_date + 42) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000576', '10000000-0000-0000-0000-000000000576', 'Candidato fairness 4', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 42, '15:00', '17:00', '{}', 'active', ((current_date + 42) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000581', '10000000-0000-0000-0000-000000000581', 'Origem recusa 3d', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 40, '15:00', '17:00', '{}', 'active', ((current_date + 40) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000582', '10000000-0000-0000-0000-000000000582', 'Candidato recusa 3d', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 40, '15:00', '17:00', '{}', 'active', ((current_date + 40) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000591', '10000000-0000-0000-0000-000000000591', 'Origem recusa 20d', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 41, '15:00', '17:00', '{}', 'active', ((current_date + 41) + time '17:00') at time zone 'Europe/Lisbon'),
  ('20000000-0000-0000-0000-000000000592', '10000000-0000-0000-0000-000000000592', 'Candidato recusa 20d', 'Descrição suficientemente longa', null, 'Amizade', 'Tranquila', 'Lisboa', null, 4, current_date + 41, '15:00', '17:00', '{}', 'active', ((current_date + 41) + time '17:00') at time zone 'Europe/Lisbon');

insert into public.blocks (blocker_group_id, blocked_group_id)
values
  ('10000000-0000-0000-0000-000000000491', '10000000-0000-0000-0000-000000000492'),
  ('10000000-0000-0000-0000-000000000494', '10000000-0000-0000-0000-000000000493');

insert into public.invitations (
  id, plan_id, from_group_id, to_group_id, mensagem, status
)
values
  ('30000000-0000-0000-0000-000000000501', '20000000-0000-0000-0000-000000000501', '10000000-0000-0000-0000-000000000501', '10000000-0000-0000-0000-000000000502', 'Convite pendente', 'pending'),
  ('30000000-0000-0000-0000-000000000511', '20000000-0000-0000-0000-000000000511', '10000000-0000-0000-0000-000000000511', '10000000-0000-0000-0000-000000000512', 'Convite aceite', 'accepted'),
  ('30000000-0000-0000-0000-000000000531', '20000000-0000-0000-0000-000000000531', '10000000-0000-0000-0000-000000000531', '10000000-0000-0000-0000-000000000532', 'Convite recusado', 'declined'),
  ('30000000-0000-0000-0000-000000000581', '20000000-0000-0000-0000-000000000581', '10000000-0000-0000-0000-000000000581', '10000000-0000-0000-0000-000000000582', 'Convite recusado há 3 dias', 'declined'),
  ('30000000-0000-0000-0000-000000000591', '20000000-0000-0000-0000-000000000591', '10000000-0000-0000-0000-000000000591', '10000000-0000-0000-0000-000000000592', 'Convite recusado há 20 dias', 'declined');

update public.invitations
set responded_at = now() - interval '3 days'
where id = '30000000-0000-0000-0000-000000000581';
update public.invitations
set responded_at = now() - interval '20 days'
where id = '30000000-0000-0000-0000-000000000591';

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000401', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000401', 'identidade ativa é 00000000-0000-0000-0000-000000000401');
select is(
  (
    select count(*)::integer
    from public.find_plan_matches('20000000-0000-0000-0000-000000000401') m
    where m->'group'->>'id' = '10000000-0000-0000-0000-000000000401'
  ),
  0,
  'o próprio grupo do plano de origem não aparece'
);
select is(
  (
    select count(*)::integer
    from public.find_plan_matches('20000000-0000-0000-0000-000000000401') m
    where m->'group'->>'id' = '10000000-0000-0000-0000-000000000402'
  ),
  1,
  'um grupo terceiro compatível continua a aparecer no cenário self'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000411', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000411', 'identidade ativa é 00000000-0000-0000-0000-000000000411');
select is(
  (select count(*)::integer from public.find_plan_matches('20000000-0000-0000-0000-000000000411')),
  0,
  'grupo candidato inativo não aparece'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000421', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000421', 'identidade ativa é 00000000-0000-0000-0000-000000000421');
select is(
  (select count(*)::integer from public.find_plan_matches('20000000-0000-0000-0000-000000000421')),
  0,
  'plano candidato com status closed não aparece'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000431', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000431', 'identidade ativa é 00000000-0000-0000-0000-000000000431');
select is(
  (select count(*)::integer from public.find_plan_matches('20000000-0000-0000-0000-000000000431')),
  0,
  'plano candidato com expires_at no passado não aparece'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000441', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000441', 'identidade ativa é 00000000-0000-0000-0000-000000000441');
select is(
  (select count(*)::integer from public.find_plan_matches('20000000-0000-0000-0000-000000000441')),
  0,
  'cidade diferente não aparece'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000451', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000451', 'identidade ativa é 00000000-0000-0000-0000-000000000451');
select is(
  (
    select count(*)::integer
    from public.find_plan_matches('20000000-0000-0000-0000-000000000451') m
    where m->'group'->>'id' = '10000000-0000-0000-0000-000000000452'
  ),
  1,
  'lisboa e Lisboa são tratadas como a mesma cidade'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000461', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000461', 'identidade ativa é 00000000-0000-0000-0000-000000000461');
select is(
  (select count(*)::integer from public.find_plan_matches('20000000-0000-0000-0000-000000000461')),
  0,
  'data diferente não aparece'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000471', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000471', 'identidade ativa é 00000000-0000-0000-0000-000000000471');
select is(
  (select count(*)::integer from public.find_plan_matches('20000000-0000-0000-0000-000000000471')),
  0,
  'janelas horárias sem sobreposição não aparecem'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000481', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000481', 'identidade ativa é 00000000-0000-0000-0000-000000000481');
select is(
  (select count(*)::integer from public.find_plan_matches('20000000-0000-0000-0000-000000000481')),
  0,
  'intenções incompatíveis não aparecem'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000491', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000491', 'identidade ativa é 00000000-0000-0000-0000-000000000491');
select is(
  (select count(*)::integer from public.find_plan_matches('20000000-0000-0000-0000-000000000491')),
  0,
  'bloqueio da origem para o candidato exclui o match'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000493', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000493', 'identidade ativa é 00000000-0000-0000-0000-000000000493');
select is(
  (select count(*)::integer from public.find_plan_matches('20000000-0000-0000-0000-000000000493')),
  0,
  'bloqueio do candidato para a origem exclui o match'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000501', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000501', 'identidade ativa é 00000000-0000-0000-0000-000000000501');
select is(
  (select count(*)::integer from public.find_plan_matches('20000000-0000-0000-0000-000000000501')),
  0,
  'invitation pending para esse grupo nesse plano exclui o match'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000511', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000511', 'identidade ativa é 00000000-0000-0000-0000-000000000511');
select is(
  (select count(*)::integer from public.find_plan_matches('20000000-0000-0000-0000-000000000511')),
  0,
  'invitation accepted para esse grupo nesse plano exclui o match'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000521', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000521', 'identidade ativa é 00000000-0000-0000-0000-000000000521');
select is(
  (
    select count(*)::integer
    from public.find_plan_matches('20000000-0000-0000-0000-000000000521') m
    where m->'group'->>'id' = '10000000-0000-0000-0000-000000000522'
  ),
  1,
  'sobreposição horária parcial é devolvida'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000531', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000531', 'identidade ativa é 00000000-0000-0000-0000-000000000531');
select is(
  (
    select count(*)::integer
    from public.find_plan_matches('20000000-0000-0000-0000-000000000531') m
    where m->'group'->>'id' = '10000000-0000-0000-0000-000000000532'
  ),
  0,
  'invitation declined recente não aparece'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000541', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000541', 'identidade ativa é 00000000-0000-0000-0000-000000000541');
select is(
  (select count(*)::integer from public.find_plan_matches('20000000-0000-0000-0000-000000000541')),
  2,
  'com 4 candidatos válidos devolve exatamente 2'
);
select is(
  (
    select m->'group'->>'id'
    from public.find_plan_matches('20000000-0000-0000-0000-000000000541') m
    limit 1
  ),
  '10000000-0000-0000-0000-000000000545',
  'candidato com mais afinidade aparece primeiro'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000552', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000552', 'identidade ativa é 00000000-0000-0000-0000-000000000552');
select throws_ok(
  $$select * from public.find_plan_matches('20000000-0000-0000-0000-000000000551')$$,
  'P0001',
  'Sem permissão',
  'utilizador que não é dono do grupo do plano recebe Sem permissão'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000561', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000561', 'identidade ativa é 00000000-0000-0000-0000-000000000561');
select throws_ok(
  $$select * from public.find_plan_matches('20000000-0000-0000-0000-000000000561')$$,
  'P0001',
  'Plano inativo',
  'plano com status expired recebe Plano inativo'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000581', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000581', 'identidade ativa é 00000000-0000-0000-0000-000000000581');
select is(
  (
    select count(*)::integer
    from public.find_plan_matches('20000000-0000-0000-0000-000000000581') m
    where m->'group'->>'id' = '10000000-0000-0000-0000-000000000582'
  ),
  0,
  'grupo que recusou há 3 dias não aparece'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000591', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000591', 'identidade ativa é 00000000-0000-0000-0000-000000000591');
select is(
  (
    select count(*)::integer
    from public.find_plan_matches('20000000-0000-0000-0000-000000000591') m
    where m->'group'->>'id' = '10000000-0000-0000-0000-000000000592'
  ),
  1,
  'grupo que recusou há 20 dias volta a aparecer'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000571', true);
select is((select auth.uid())::text, '00000000-0000-0000-0000-000000000571', 'identidade ativa é 00000000-0000-0000-0000-000000000571');
select is(
  array(
    select m->'group'->>'id'
    from public.find_plan_matches('20000000-0000-0000-0000-000000000571') m
  ),
  array(
    select m->'group'->>'id'
    from public.find_plan_matches('20000000-0000-0000-0000-000000000571') m
  ),
  'ordem estável entre duas chamadas do mesmo plano'
);
select isnt(
  array(
    select m->'group'->>'id'
    from public.find_plan_matches('20000000-0000-0000-0000-000000000571') m
  ),
  array(
    select m->'group'->>'id'
    from public.find_plan_matches('20000000-0000-0000-0000-000000000572') m
  ),
  'ordem difere para planos diferentes com o mesmo rank'
);

select * from finish();
rollback;

begin;

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
          where i.status in ('pending', 'accepted')
            and (
              (i.from_group_id = own_group.id and i.to_group_id = target.id)
              or (i.to_group_id = own_group.id and i.from_group_id = target.id)
            )
            and not private.groups_are_blocked(own_group.id, target.id)
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
    join public.groups plan_group on plan_group.id = p.group_id
    where p.id = p_plan_id
      and (
        plan_group.owner_id = (select auth.uid())
        or exists (
          select 1
          from public.invitations i
          join public.groups own_group
            on own_group.owner_id = (select auth.uid())
          where i.plan_id = p.id
            and i.status in ('pending', 'accepted')
            and own_group.id in (i.from_group_id, i.to_group_id)
            and not private.groups_are_blocked(own_group.id, plan_group.id)
        )
      )
  );
$$;

create or replace function public.get_my_group_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select g.id
  from public.groups g
  where g.owner_id = (select auth.uid())
    and g.is_active
  limit 1;
$$;

drop policy if exists messages_select_participants on public.messages;
create policy messages_select_participants on public.messages
for select to authenticated
using (
  private.is_conversation_participant(conversation_id)
  and exists (
    select 1
    from public.conversations c
    where c.id = conversation_id
      and c.status = 'active'
  )
);

revoke select on public.plans from authenticated;
grant select (
  id,
  group_id,
  titulo,
  descricao,
  tipo,
  intencao,
  vibe,
  cidade,
  zona_aproximada,
  numero_pessoas,
  data,
  hora_inicio,
  hora_fim,
  orcamento,
  tags,
  status,
  created_at
) on public.plans to authenticated;

revoke select on public.invitations from authenticated;
grant select (
  id,
  plan_id,
  from_group_id,
  to_group_id,
  mensagem,
  status,
  created_at
) on public.invitations to authenticated;

revoke execute on function public.get_my_group_id()
  from public, anon, authenticated;
grant execute on function public.get_my_group_id()
  to authenticated;

commit;

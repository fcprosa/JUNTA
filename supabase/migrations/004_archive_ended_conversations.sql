begin;

drop policy if exists messages_select_participants on public.messages;
create policy messages_select_participants on public.messages
for select to authenticated
using (
  private.is_conversation_participant(conversation_id)
  and exists (
    select 1
    from public.conversations c
    join public.invitations i on i.id = c.invitation_id
    where c.id = conversation_id
      and c.status in ('active', 'ended')
      and not private.groups_are_blocked(i.from_group_id, i.to_group_id)
  )
);

grant execute on function private.groups_are_blocked(uuid, uuid) to authenticated;

commit;

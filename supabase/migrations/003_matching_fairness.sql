begin;

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
      and not exists (
        select 1 from public.invitations i
        where i.from_group_id = v_source.group_id
          and i.to_group_id = p.group_id
          and i.status = 'declined'
          and coalesce(i.responded_at, i.created_at) > now() - interval '14 days'
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
  order by c.rank_value desc, md5(p_plan_id::text || c.id::text)
  limit 2;
end;
$$;

commit;

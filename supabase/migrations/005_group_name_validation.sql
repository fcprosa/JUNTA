begin;

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
  v_group_nome text := btrim(coalesce(p_group_nome, ''));
begin
  if v_user_id is null then raise exception 'Sessão necessária'; end if;
  if p_is_adult is distinct from true or p_idade is null or p_idade < 18 then
    raise exception 'Apenas maiores de 18 anos';
  end if;

  if char_length(v_group_nome) < 3
     or char_length(regexp_replace(v_group_nome, '[^[:alpha:]À-ÿ]', '', 'g')) < 2 then
    raise exception 'O nome do grupo precisa de 3 caracteres e 2 letras';
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
    v_user_id, v_group_nome, nullif(btrim(p_group_descricao), ''),
    btrim(p_cidade), nullif(btrim(p_zona_aproximada), ''),
    p_numero_pessoas, coalesce(p_interesses, '{}')
  ) returning id into v_group_id;

  perform private.log_event('onboarding_completed', v_user_id, v_group_id);
  perform private.log_event('group_created', v_user_id, v_group_id);
  return v_group_id;
end;
$$;

commit;

create index if not exists raffle_numbers_order_id_idx
on public.raffle_numbers(order_id);

create index if not exists raffle_numbers_reserved_until_idx
on public.raffle_numbers(reserved_until)
where status = 'reserved';

create index if not exists order_items_order_id_idx
on public.order_items(order_id);

create or replace view public.public_raffle_numbers as
select
  rn.id,
  rn.raffle_id,
  rn.number,
  case
    when rn.status = 'reserved'
      and rn.reserved_until is not null
      and rn.reserved_until < now()
      then 'available'
    else rn.status
  end as status
from public.raffle_numbers rn
join public.raffles r on r.id = rn.raffle_id
join public.tenants t on t.id = r.tenant_id
where r.status = 'active'
  and t.status = 'active';

create or replace function public.expire_old_reservations()
returns table(expired_orders integer, released_numbers integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order_ids uuid[] := '{}'::uuid[];
  v_released_numbers integer := 0;
  v_expired_orders integer := 0;
begin
  select coalesce(array_agg(distinct rn.order_id), '{}'::uuid[])
  into v_order_ids
  from public.raffle_numbers rn
  where rn.status = 'reserved'
    and rn.reserved_until is not null
    and rn.reserved_until < now()
    and rn.order_id is not null;

  update public.raffle_numbers rn
  set
    status = 'available',
    user_id = null,
    order_id = null,
    reserved_until = null,
    updated_at = now()
  where rn.status = 'reserved'
    and rn.reserved_until is not null
    and rn.reserved_until < now();

  get diagnostics v_released_numbers = row_count;

  update public.orders o
  set
    status = 'expired',
    updated_at = now()
  where o.status = 'pending'
    and o.id = any(v_order_ids);

  get diagnostics v_expired_orders = row_count;

  expired_orders := v_expired_orders;
  released_numbers := v_released_numbers;
  return next;
end;
$$;

create or replace function public.reserve_raffle_numbers(
  p_raffle_id uuid,
  p_numbers integer[],
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text
)
returns table(
  order_id uuid,
  amount numeric,
  reserved_until timestamptz,
  reserved_numbers integer[]
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_numbers integer[];
  v_original_count integer := 0;
  v_distinct_count integer := 0;
  v_locked_count integer := 0;
  v_unavailable_numbers integer[];
  v_missing_numbers integer[];
  v_tenant_id uuid;
  v_price numeric(10, 2);
  v_order_id uuid;
  v_amount numeric(10, 2);
  v_reserved_until timestamptz := now() + interval '15 minutes';
  v_customer_name text := nullif(trim(p_customer_name), '');
  v_customer_email text := nullif(lower(trim(p_customer_email)), '');
  v_customer_phone text := nullif(trim(p_customer_phone), '');
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select
    coalesce(array_agg(distinct raw_number order by raw_number), '{}'::integer[]),
    count(*),
    count(distinct raw_number)
  into v_numbers, v_original_count, v_distinct_count
  from unnest(coalesce(p_numbers, '{}'::integer[])) as raw(raw_number);

  if v_original_count = 0 then
    raise exception 'NO_NUMBERS_SELECTED';
  end if;

  if v_original_count <> v_distinct_count then
    raise exception 'DUPLICATED_NUMBERS';
  end if;

  if v_original_count > 100 then
    raise exception 'TOO_MANY_NUMBERS';
  end if;

  if exists (
    select 1
    from unnest(coalesce(p_numbers, '{}'::integer[])) as raw(raw_number)
    where raw_number is null
      or raw_number <= 0
  ) then
    raise exception 'INVALID_NUMBERS';
  end if;

  if v_customer_name is null or length(v_customer_name) < 3 then
    raise exception 'INVALID_CUSTOMER_NAME';
  end if;

  if v_customer_email is null or position('@' in v_customer_email) <= 1 then
    raise exception 'INVALID_CUSTOMER_EMAIL';
  end if;

  if v_customer_phone is null or length(v_customer_phone) < 8 then
    raise exception 'INVALID_CUSTOMER_PHONE';
  end if;

  perform public.expire_old_reservations();

  select r.tenant_id, r.price_per_number
  into v_tenant_id, v_price
  from public.raffles r
  join public.tenants t on t.id = r.tenant_id
  where r.id = p_raffle_id
    and r.status = 'active'
    and t.status = 'active';

  if v_tenant_id is null then
    raise exception 'RAFFLE_NOT_AVAILABLE';
  end if;

  select count(*)
  into v_locked_count
  from (
    select rn.id
    from public.raffle_numbers rn
    where rn.raffle_id = p_raffle_id
      and rn.number = any(v_numbers)
    order by rn.number
    for update
  ) locked_numbers;

  if v_locked_count <> array_length(v_numbers, 1) then
    select array_agg(selected_number order by selected_number)
    into v_missing_numbers
    from unnest(v_numbers) as selected(selected_number)
    where not exists (
      select 1
      from public.raffle_numbers rn
      where rn.raffle_id = p_raffle_id
        and rn.number = selected.selected_number
    );

    raise exception 'NUMBERS_NOT_FOUND' using detail = coalesce(array_to_string(v_missing_numbers, ','), '');
  end if;

  update public.raffle_numbers rn
  set
    status = 'available',
    user_id = null,
    order_id = null,
    reserved_until = null,
    updated_at = now()
  where rn.raffle_id = p_raffle_id
    and rn.number = any(v_numbers)
    and rn.status = 'reserved'
    and rn.reserved_until is not null
    and rn.reserved_until < now();

  select array_agg(rn.number order by rn.number)
  into v_unavailable_numbers
  from public.raffle_numbers rn
  where rn.raffle_id = p_raffle_id
    and rn.number = any(v_numbers)
    and rn.status <> 'available';

  if v_unavailable_numbers is not null then
    raise exception 'NUMBERS_UNAVAILABLE' using detail = array_to_string(v_unavailable_numbers, ',');
  end if;

  v_amount := (v_price * array_length(v_numbers, 1))::numeric(10, 2);

  insert into public.orders (
    tenant_id,
    user_id,
    raffle_id,
    customer_name,
    customer_email,
    customer_phone,
    amount,
    status
  )
  values (
    v_tenant_id,
    v_user_id,
    p_raffle_id,
    v_customer_name,
    v_customer_email,
    v_customer_phone,
    v_amount,
    'pending'
  )
  returning id into v_order_id;

  update public.raffle_numbers rn
  set
    status = 'reserved',
    user_id = v_user_id,
    order_id = v_order_id,
    reserved_until = v_reserved_until,
    updated_at = now()
  where rn.raffle_id = p_raffle_id
    and rn.number = any(v_numbers)
    and rn.status = 'available';

  insert into public.order_items (
    order_id,
    raffle_number_id,
    number,
    price
  )
  select
    v_order_id,
    rn.id,
    rn.number,
    v_price
  from public.raffle_numbers rn
  where rn.raffle_id = p_raffle_id
    and rn.number = any(v_numbers)
    and rn.order_id = v_order_id
  order by rn.number;

  order_id := v_order_id;
  amount := v_amount;
  reserved_until := v_reserved_until;
  reserved_numbers := v_numbers;
  return next;
end;
$$;

revoke all on function public.reserve_raffle_numbers(uuid, integer[], text, text, text) from public;
grant execute on function public.reserve_raffle_numbers(uuid, integer[], text, text, text) to authenticated;

revoke all on function public.expire_old_reservations() from public;
grant execute on function public.expire_old_reservations() to authenticated;

grant select on public.public_raffle_numbers to anon, authenticated;

create index if not exists raffle_numbers_raffle_status_number_idx
on public.raffle_numbers(raffle_id, status, number);

create or replace function public.get_random_available_raffle_numbers(
  p_raffle_id uuid,
  p_quantity integer,
  p_excluded_numbers integer[] default '{}'::integer[]
)
returns integer[]
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_quantity integer := least(greatest(coalesce(p_quantity, 0), 0), 100);
  v_numbers integer[] := '{}'::integer[];
begin
  if v_quantity = 0 then
    return v_numbers;
  end if;

  if not exists (
    select 1
    from public.raffles r
    join public.tenants t on t.id = r.tenant_id
    where r.id = p_raffle_id
      and r.status = 'active'
      and t.status = 'active'
  ) then
    return v_numbers;
  end if;

  select coalesce(array_agg(candidate.number order by candidate.random_sort), '{}'::integer[])
  into v_numbers
  from (
    select rn.number, random() as random_sort
    from public.raffle_numbers rn
    where rn.raffle_id = p_raffle_id
      and rn.number <> all(coalesce(p_excluded_numbers, '{}'::integer[]))
      and (
        rn.status = 'available'
        or (
          rn.status = 'reserved'
          and rn.reserved_until is not null
          and rn.reserved_until < now()
        )
      )
    order by random_sort
    limit v_quantity
  ) candidate;

  return v_numbers;
end;
$$;

revoke all on function public.get_random_available_raffle_numbers(
  uuid,
  integer,
  integer[]
) from public;

grant execute on function public.get_random_available_raffle_numbers(
  uuid,
  integer,
  integer[]
) to anon, authenticated;

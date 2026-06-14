create or replace function public.is_admin_for_tenant(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    join public.tenants t on t.id = p.tenant_id
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.tenant_id = p_tenant_id
      and t.status = 'active'
  )
$$;

create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() = old.id then
    new.role = old.role;
    new.tenant_id = old.tenant_id;
    new.email = old.email;
  end if;

  return new;
end;
$$;

create or replace function public.get_public_result_raffle(
  p_slug text,
  p_tenant_id uuid
)
returns table(
  id uuid,
  title text,
  slug text,
  main_image_url text,
  status text,
  draw_date timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    r.id,
    r.title,
    r.slug,
    r.main_image_url,
    r.status,
    r.draw_date
  from public.raffles r
  join public.tenants t on t.id = r.tenant_id
  where r.slug = p_slug
    and r.tenant_id = p_tenant_id
    and r.status in ('active', 'finished')
    and t.status = 'active'
  order by r.created_at desc
  limit 1
$$;

revoke all on function public.is_admin_for_tenant(uuid) from public;
grant execute on function public.is_admin_for_tenant(uuid) to anon, authenticated;

revoke all on function public.get_public_result_raffle(text, uuid) from public;
grant execute on function public.get_public_result_raffle(text, uuid) to anon, authenticated;

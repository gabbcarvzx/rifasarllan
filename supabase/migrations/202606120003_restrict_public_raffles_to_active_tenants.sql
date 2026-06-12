drop policy if exists "Public can read active raffles" on public.raffles;

create policy "Public can read active raffles"
on public.raffles
for select
to anon, authenticated
using (
  (
    status = 'active'
    and exists (
      select 1
      from public.tenants t
      where t.id = raffles.tenant_id
        and t.status = 'active'
    )
  )
  or public.is_admin_for_tenant(tenant_id)
);

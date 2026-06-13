create table if not exists public.asaas_customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  asaas_customer_id text not null,
  name text not null,
  email text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint asaas_customers_tenant_user_unique unique (tenant_id, user_id),
  constraint asaas_customers_tenant_provider_id_unique unique (
    tenant_id,
    asaas_customer_id
  )
);

create index if not exists asaas_customers_tenant_id_idx
on public.asaas_customers(tenant_id);

create index if not exists asaas_customers_user_id_idx
on public.asaas_customers(user_id);

create index if not exists asaas_customers_tenant_email_idx
on public.asaas_customers(tenant_id, lower(email));

drop trigger if exists set_asaas_customers_updated_at on public.asaas_customers;

create trigger set_asaas_customers_updated_at
before update on public.asaas_customers
for each row execute function public.set_updated_at();

alter table public.payments
add column if not exists provider_raw_status text,
add column if not exists invoice_url text,
add column if not exists expires_at timestamptz,
add column if not exists due_date date,
add column if not exists pix_end_to_end_identifier text,
add column if not exists last_provider_sync timestamptz,
add column if not exists provider_response jsonb;

create unique index if not exists payments_provider_payment_id_unique
on public.payments(provider, provider_payment_id)
where provider is not null and provider_payment_id is not null;

create unique index if not exists payments_order_asaas_unique
on public.payments(order_id)
where provider = 'asaas';

create index if not exists payments_provider_status_idx
on public.payments(provider, status);

create index if not exists payments_expires_at_idx
on public.payments(expires_at)
where status = 'pending';

alter table public.asaas_customers enable row level security;

create policy "Users can read own Asaas customer"
on public.asaas_customers
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin_for_tenant(tenant_id)
);

create policy "Admins can manage own tenant Asaas customers"
on public.asaas_customers
for all
to authenticated
using (public.is_admin_for_tenant(tenant_id))
with check (public.is_admin_for_tenant(tenant_id));

create or replace function public.sync_asaas_payment(
  p_payment_id uuid,
  p_status text,
  p_provider_raw_status text,
  p_provider_payment_id text,
  p_pix_copy_paste text,
  p_pix_qr_code text,
  p_invoice_url text,
  p_expires_at timestamptz,
  p_due_date date,
  p_pix_end_to_end_identifier text,
  p_provider_response jsonb
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order_id uuid;
begin
  if p_status not in ('pending', 'paid', 'failed', 'cancelled', 'refunded') then
    raise exception 'INVALID_PAYMENT_STATUS';
  end if;

  update public.payments p
  set
    status = p_status,
    provider_raw_status = p_provider_raw_status,
    provider_payment_id = coalesce(p_provider_payment_id, p.provider_payment_id),
    pix_copy_paste = coalesce(p_pix_copy_paste, p.pix_copy_paste),
    pix_qr_code = coalesce(p_pix_qr_code, p.pix_qr_code),
    invoice_url = coalesce(p_invoice_url, p.invoice_url),
    expires_at = coalesce(p_expires_at, p.expires_at),
    due_date = coalesce(p_due_date, p.due_date),
    pix_end_to_end_identifier = coalesce(
      p_pix_end_to_end_identifier,
      p.pix_end_to_end_identifier
    ),
    last_provider_sync = now(),
    provider_response = coalesce(p_provider_response, p.provider_response),
    paid_at = case
      when p_status = 'paid' then coalesce(p.paid_at, now())
      else p.paid_at
    end,
    updated_at = now()
  where p.id = p_payment_id
    and p.provider = 'asaas'
  returning p.order_id into v_order_id;

  if v_order_id is null then
    raise exception 'PAYMENT_NOT_FOUND';
  end if;

  if p_status = 'paid' then
    update public.orders
    set status = 'paid', payment_method = 'pix', updated_at = now()
    where id = v_order_id
      and status = 'pending';

    update public.raffle_numbers
    set status = 'paid', reserved_until = null, updated_at = now()
    where order_id = v_order_id
      and status = 'reserved';
  elsif p_status = 'cancelled' then
    update public.orders
    set status = 'cancelled', updated_at = now()
    where id = v_order_id
      and status = 'pending';

    update public.raffle_numbers
    set
      status = 'available',
      user_id = null,
      order_id = null,
      reserved_until = null,
      updated_at = now()
    where order_id = v_order_id
      and status = 'reserved';
  elsif p_status = 'refunded' then
    update public.orders
    set status = 'refunded', updated_at = now()
    where id = v_order_id
      and status = 'paid';

    update public.raffle_numbers
    set status = 'cancelled', reserved_until = null, updated_at = now()
    where order_id = v_order_id
      and status = 'paid';
  end if;
end;
$$;

revoke all on function public.sync_asaas_payment(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  timestamptz,
  date,
  text,
  jsonb
) from public, anon, authenticated;

grant execute on function public.sync_asaas_payment(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  timestamptz,
  date,
  text,
  jsonb
) to service_role;

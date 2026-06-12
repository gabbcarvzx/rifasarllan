create extension if not exists "pgcrypto";

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_id uuid references auth.users(id),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tenants_status_check check (status in ('active', 'inactive'))
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  role text not null default 'customer',
  tenant_id uuid references public.tenants(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('admin', 'customer'))
);

create table public.platform_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  platform_name text not null,
  logo_url text,
  primary_color text,
  whatsapp_number text,
  instagram_url text,
  hero_title text,
  hero_subtitle text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint platform_settings_tenant_unique unique (tenant_id)
);

create table public.raffles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  slug text not null,
  short_description text,
  description text,
  rules text,
  price_per_number numeric(10, 2) not null,
  total_numbers integer not null,
  min_number integer not null default 1,
  max_number integer not null,
  draw_date timestamptz,
  status text not null default 'draft',
  main_image_url text,
  featured boolean not null default false,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint raffles_status_check check (
    status in ('draft', 'active', 'paused', 'finished', 'cancelled')
  ),
  constraint raffles_price_per_number_check check (price_per_number > 0),
  constraint raffles_total_numbers_check check (total_numbers > 0),
  constraint raffles_number_range_check check (
    min_number > 0
    and max_number > 0
    and min_number <= max_number
  ),
  constraint raffles_tenant_slug_unique unique (tenant_id, slug)
);

create table public.raffle_images (
  id uuid primary key default gen_random_uuid(),
  raffle_id uuid not null references public.raffles(id) on delete cascade,
  image_url text not null,
  alt_text text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.raffle_prizes (
  id uuid primary key default gen_random_uuid(),
  raffle_id uuid not null references public.raffles(id) on delete cascade,
  title text not null,
  description text,
  image_url text,
  position integer not null default 1,
  quantity integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint raffle_prizes_position_check check (position > 0),
  constraint raffle_prizes_quantity_check check (quantity > 0)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid references auth.users(id),
  raffle_id uuid not null references public.raffles(id) on delete cascade,
  customer_name text,
  customer_email text,
  customer_phone text,
  amount numeric(10, 2) not null,
  status text not null default 'pending',
  payment_method text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_status_check check (
    status in ('pending', 'paid', 'expired', 'cancelled', 'refunded')
  ),
  constraint orders_amount_check check (amount > 0)
);

create table public.raffle_numbers (
  id uuid primary key default gen_random_uuid(),
  raffle_id uuid not null references public.raffles(id) on delete cascade,
  number integer not null,
  status text not null default 'available',
  user_id uuid references auth.users(id),
  reserved_until timestamptz,
  order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint raffle_numbers_status_check check (
    status in ('available', 'reserved', 'paid', 'cancelled')
  ),
  constraint raffle_numbers_number_check check (number > 0),
  constraint raffle_numbers_raffle_number_unique unique (raffle_id, number)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  raffle_number_id uuid not null references public.raffle_numbers(id) on delete cascade,
  number integer not null,
  price numeric(10, 2) not null,
  created_at timestamptz not null default now(),
  constraint order_items_number_check check (number > 0),
  constraint order_items_price_check check (price > 0),
  constraint order_items_order_number_unique unique (order_id, raffle_number_id)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text,
  provider_payment_id text,
  pix_qr_code text,
  pix_copy_paste text,
  amount numeric(10, 2),
  status text not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_status_check check (
    status in ('pending', 'paid', 'failed', 'cancelled', 'refunded')
  ),
  constraint payments_amount_check check (amount is null or amount > 0)
);

create table public.winners (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  raffle_id uuid not null references public.raffles(id) on delete cascade,
  prize_id uuid references public.raffle_prizes(id),
  user_id uuid references auth.users(id),
  order_id uuid references public.orders(id),
  number integer not null,
  winner_name text,
  winner_phone text,
  drawn_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint winners_number_check check (number > 0)
);

create index tenants_slug_idx on public.tenants(slug);
create index profiles_tenant_id_idx on public.profiles(tenant_id);
create index raffles_tenant_id_idx on public.raffles(tenant_id);
create index raffles_slug_idx on public.raffles(slug);
create index raffles_status_idx on public.raffles(status);
create index raffles_tenant_status_idx on public.raffles(tenant_id, status);
create index raffle_numbers_raffle_id_idx on public.raffle_numbers(raffle_id);
create index raffle_numbers_status_idx on public.raffle_numbers(status);
create index raffle_numbers_raffle_status_idx on public.raffle_numbers(raffle_id, status);
create index orders_tenant_id_idx on public.orders(tenant_id);
create index orders_user_id_idx on public.orders(user_id);
create index orders_raffle_id_idx on public.orders(raffle_id);
create index orders_tenant_status_idx on public.orders(tenant_id, status);
create index payments_order_id_idx on public.payments(order_id);
create index winners_raffle_id_idx on public.winners(raffle_id);
create index winners_tenant_raffle_idx on public.winners(tenant_id, raffle_id);
create index platform_settings_tenant_id_idx on public.platform_settings(tenant_id);
create index raffle_images_raffle_id_idx on public.raffle_images(raffle_id);
create index raffle_prizes_raffle_id_idx on public.raffle_prizes(raffle_id);
create index order_items_order_id_idx on public.order_items(order_id);
create index order_items_raffle_number_id_idx on public.order_items(raffle_number_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_tenants_updated_at
before update on public.tenants
for each row execute function public.set_updated_at();

create trigger set_platform_settings_updated_at
before update on public.platform_settings
for each row execute function public.set_updated_at();

create trigger set_raffles_updated_at
before update on public.raffles
for each row execute function public.set_updated_at();

create trigger set_raffle_prizes_updated_at
before update on public.raffle_prizes
for each row execute function public.set_updated_at();

create trigger set_raffle_numbers_updated_at
before update on public.raffle_numbers
for each row execute function public.set_updated_at();

create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create trigger set_payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

create or replace function public.current_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.tenant_id
  from public.profiles p
  where p.id = auth.uid()
  limit 1
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
$$;

create or replace function public.is_admin_for_tenant(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.tenant_id = p_tenant_id
  )
$$;

create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = old.id and not public.is_admin_for_tenant(old.tenant_id) then
    new.role = old.role;
    new.tenant_id = old.tenant_id;
  end if;

  return new;
end;
$$;

create trigger protect_profiles_privileged_fields
before update on public.profiles
for each row execute function public.protect_profile_privileged_fields();

create or replace function public.generate_raffle_numbers(p_raffle_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_min_number integer;
  v_max_number integer;
  v_tenant_id uuid;
  v_inserted integer;
begin
  select r.min_number, r.max_number, r.tenant_id
  into v_min_number, v_max_number, v_tenant_id
  from public.raffles r
  where r.id = p_raffle_id;

  if v_tenant_id is null then
    raise exception 'Raffle % not found', p_raffle_id using errcode = 'P0002';
  end if;

  if not public.is_admin_for_tenant(v_tenant_id) then
    raise exception 'Only tenant admins can generate raffle numbers'
      using errcode = '42501';
  end if;

  insert into public.raffle_numbers (raffle_id, number)
  select p_raffle_id, generated_number.number
  from generate_series(v_min_number, v_max_number) as generated_number(number)
  on conflict (raffle_id, number) do nothing;

  get diagnostics v_inserted = row_count;
  return v_inserted;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    'customer'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace view public.public_raffle_numbers as
select
  rn.id,
  rn.raffle_id,
  rn.number,
  rn.status
from public.raffle_numbers rn
join public.raffles r on r.id = rn.raffle_id
join public.tenants t on t.id = r.tenant_id
where r.status = 'active'
  and t.status = 'active';

alter table public.profiles enable row level security;
alter table public.tenants enable row level security;
alter table public.platform_settings enable row level security;
alter table public.raffles enable row level security;
alter table public.raffle_images enable row level security;
alter table public.raffle_prizes enable row level security;
alter table public.raffle_numbers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.winners enable row level security;

create policy "Public can read active tenants"
on public.tenants
for select
to anon, authenticated
using (status = 'active' or public.is_admin_for_tenant(id));

create policy "Admins can update own tenant"
on public.tenants
for update
to authenticated
using (public.is_admin_for_tenant(id))
with check (public.is_admin_for_tenant(id));

create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin_for_tenant(tenant_id));

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Admins can manage profiles in own tenant"
on public.profiles
for all
to authenticated
using (public.is_admin_for_tenant(tenant_id))
with check (public.is_admin_for_tenant(tenant_id));

create policy "Public can read platform settings for active tenants"
on public.platform_settings
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.tenants t
    where t.id = platform_settings.tenant_id
      and t.status = 'active'
  )
  or public.is_admin_for_tenant(tenant_id)
);

create policy "Admins can manage platform settings"
on public.platform_settings
for all
to authenticated
using (public.is_admin_for_tenant(tenant_id))
with check (public.is_admin_for_tenant(tenant_id));

create policy "Public can read active raffles"
on public.raffles
for select
to anon, authenticated
using (
  status = 'active'
  or public.is_admin_for_tenant(tenant_id)
);

create policy "Admins can manage own tenant raffles"
on public.raffles
for all
to authenticated
using (public.is_admin_for_tenant(tenant_id))
with check (public.is_admin_for_tenant(tenant_id));

create policy "Public can read active raffle images"
on public.raffle_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.raffles r
    where r.id = raffle_images.raffle_id
      and r.status = 'active'
  )
  or exists (
    select 1
    from public.raffles r
    where r.id = raffle_images.raffle_id
      and public.is_admin_for_tenant(r.tenant_id)
  )
);

create policy "Admins can manage own tenant raffle images"
on public.raffle_images
for all
to authenticated
using (
  exists (
    select 1
    from public.raffles r
    where r.id = raffle_images.raffle_id
      and public.is_admin_for_tenant(r.tenant_id)
  )
)
with check (
  exists (
    select 1
    from public.raffles r
    where r.id = raffle_images.raffle_id
      and public.is_admin_for_tenant(r.tenant_id)
  )
);

create policy "Public can read active raffle prizes"
on public.raffle_prizes
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.raffles r
    where r.id = raffle_prizes.raffle_id
      and r.status = 'active'
  )
  or exists (
    select 1
    from public.raffles r
    where r.id = raffle_prizes.raffle_id
      and public.is_admin_for_tenant(r.tenant_id)
  )
);

create policy "Admins can manage own tenant raffle prizes"
on public.raffle_prizes
for all
to authenticated
using (
  exists (
    select 1
    from public.raffles r
    where r.id = raffle_prizes.raffle_id
      and public.is_admin_for_tenant(r.tenant_id)
  )
)
with check (
  exists (
    select 1
    from public.raffles r
    where r.id = raffle_prizes.raffle_id
      and public.is_admin_for_tenant(r.tenant_id)
  )
);

create policy "Anon can read active raffle numbers"
on public.raffle_numbers
for select
to anon
using (
  exists (
    select 1
    from public.raffles r
    where r.id = raffle_numbers.raffle_id
      and r.status = 'active'
  )
);

create policy "Users can read own raffle numbers"
on public.raffle_numbers
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.orders o
    where o.id = raffle_numbers.order_id
      and o.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.raffles r
    where r.id = raffle_numbers.raffle_id
      and public.is_admin_for_tenant(r.tenant_id)
  )
);

create policy "Admins can manage own tenant raffle numbers"
on public.raffle_numbers
for all
to authenticated
using (
  exists (
    select 1
    from public.raffles r
    where r.id = raffle_numbers.raffle_id
      and public.is_admin_for_tenant(r.tenant_id)
  )
)
with check (
  exists (
    select 1
    from public.raffles r
    where r.id = raffle_numbers.raffle_id
      and public.is_admin_for_tenant(r.tenant_id)
  )
);

create policy "Users can create own orders"
on public.orders
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.raffles r
    join public.tenants t on t.id = r.tenant_id
    where r.id = orders.raffle_id
      and r.tenant_id = orders.tenant_id
      and r.status = 'active'
      and t.status = 'active'
  )
);

create policy "Users can read own orders"
on public.orders
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin_for_tenant(tenant_id)
);

create policy "Admins can manage own tenant orders"
on public.orders
for all
to authenticated
using (public.is_admin_for_tenant(tenant_id))
with check (public.is_admin_for_tenant(tenant_id));

create policy "Users can read own order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and (
        o.user_id = auth.uid()
        or public.is_admin_for_tenant(o.tenant_id)
      )
  )
);

create policy "Admins can manage own tenant order items"
on public.order_items
for all
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and public.is_admin_for_tenant(o.tenant_id)
  )
)
with check (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and public.is_admin_for_tenant(o.tenant_id)
  )
);

create policy "Users can read own payments"
on public.payments
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = payments.order_id
      and (
        o.user_id = auth.uid()
        or public.is_admin_for_tenant(o.tenant_id)
      )
  )
);

create policy "Admins can manage own tenant payments"
on public.payments
for all
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = payments.order_id
      and public.is_admin_for_tenant(o.tenant_id)
  )
)
with check (
  exists (
    select 1
    from public.orders o
    where o.id = payments.order_id
      and public.is_admin_for_tenant(o.tenant_id)
  )
);

create policy "Admins can manage own tenant winners"
on public.winners
for all
to authenticated
using (public.is_admin_for_tenant(tenant_id))
with check (public.is_admin_for_tenant(tenant_id));

revoke all on public.raffle_numbers from anon;
grant select on public.public_raffle_numbers to anon, authenticated;

revoke all on function public.generate_raffle_numbers(uuid) from public;
grant execute on function public.generate_raffle_numbers(uuid) to authenticated;

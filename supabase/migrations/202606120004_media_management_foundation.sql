insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'raffle-images',
    'raffle-images',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'prize-images',
    'prize-images',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'platform-assets',
    'platform-assets',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'winners',
    'winners',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'temporary',
    'temporary',
    false,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table public.media_files (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  bucket_name text not null,
  file_name text not null,
  original_name text,
  mime_type text not null,
  file_size bigint not null default 0,
  storage_path text not null,
  public_url text,
  width integer,
  height integer,
  uploaded_by uuid references auth.users(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_files_bucket_name_check check (
    bucket_name in (
      'raffle-images',
      'prize-images',
      'platform-assets',
      'winners',
      'temporary'
    )
  ),
  constraint media_files_file_size_check check (file_size >= 0),
  constraint media_files_dimensions_check check (
    (width is null or width > 0)
    and (height is null or height > 0)
  ),
  constraint media_files_storage_path_unique unique (bucket_name, storage_path)
);

create index media_files_tenant_id_idx
on public.media_files(tenant_id);

create index media_files_tenant_bucket_idx
on public.media_files(tenant_id, bucket_name);

create index media_files_tenant_active_idx
on public.media_files(tenant_id, is_active);

create index media_files_uploaded_by_idx
on public.media_files(uploaded_by);

create index media_files_created_at_idx
on public.media_files(created_at desc);

create trigger set_media_files_updated_at
before update on public.media_files
for each row execute function public.set_updated_at();

alter table public.media_files enable row level security;

create or replace function public.storage_object_tenant_id(p_name text)
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_tenant_id text;
begin
  v_tenant_id := split_part(p_name, '/', 2);

  if split_part(p_name, '/', 1) <> 'tenants' then
    return null;
  end if;

  if v_tenant_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return null;
  end if;

  return v_tenant_id::uuid;
end;
$$;

create policy "Public can read active public media metadata"
on public.media_files
for select
to anon, authenticated
using (
  is_active = true
  and bucket_name in ('raffle-images', 'prize-images', 'platform-assets', 'winners')
  and exists (
    select 1
    from public.tenants t
    where t.id = media_files.tenant_id
      and t.status = 'active'
  )
);

create policy "Admins can manage own tenant media metadata"
on public.media_files
for all
to authenticated
using (public.is_admin_for_tenant(tenant_id))
with check (public.is_admin_for_tenant(tenant_id));

drop policy if exists "Public can read active public media objects" on storage.objects;
drop policy if exists "Admins can read own tenant media objects" on storage.objects;
drop policy if exists "Admins can insert own tenant media objects" on storage.objects;
drop policy if exists "Admins can update own tenant media objects" on storage.objects;
drop policy if exists "Admins can delete own tenant media objects" on storage.objects;

create policy "Public can read active public media objects"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id in ('raffle-images', 'prize-images', 'platform-assets', 'winners')
  and exists (
    select 1
    from public.media_files mf
    join public.tenants t on t.id = mf.tenant_id
    where mf.bucket_name = storage.objects.bucket_id
      and mf.storage_path = storage.objects.name
      and mf.is_active = true
      and t.status = 'active'
  )
);

create policy "Admins can read own tenant media objects"
on storage.objects
for select
to authenticated
using (
  bucket_id in ('raffle-images', 'prize-images', 'platform-assets', 'winners', 'temporary')
  and public.is_admin_for_tenant(public.storage_object_tenant_id(name))
);

create policy "Admins can insert own tenant media objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('raffle-images', 'prize-images', 'platform-assets', 'winners', 'temporary')
  and public.is_admin_for_tenant(public.storage_object_tenant_id(name))
);

create policy "Admins can update own tenant media objects"
on storage.objects
for update
to authenticated
using (
  bucket_id in ('raffle-images', 'prize-images', 'platform-assets', 'winners', 'temporary')
  and public.is_admin_for_tenant(public.storage_object_tenant_id(name))
)
with check (
  bucket_id in ('raffle-images', 'prize-images', 'platform-assets', 'winners', 'temporary')
  and public.is_admin_for_tenant(public.storage_object_tenant_id(name))
);

create policy "Admins can delete own tenant media objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id in ('raffle-images', 'prize-images', 'platform-assets', 'winners', 'temporary')
  and public.is_admin_for_tenant(public.storage_object_tenant_id(name))
);

revoke all on function public.storage_object_tenant_id(text) from public;
grant execute on function public.storage_object_tenant_id(text) to anon, authenticated;

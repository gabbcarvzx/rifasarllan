alter table public.raffle_images
add column if not exists media_file_id uuid references public.media_files(id) on delete set null;

create index if not exists raffle_images_media_file_id_idx
on public.raffle_images(media_file_id);

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
  if split_part(p_name, '/', 1) = 'tenants' then
    v_tenant_id := split_part(p_name, '/', 2);
  else
    v_tenant_id := split_part(p_name, '/', 1);
  end if;

  if v_tenant_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return null;
  end if;

  return v_tenant_id::uuid;
end;
$$;

revoke all on function public.storage_object_tenant_id(text) from public;
grant execute on function public.storage_object_tenant_id(text) to anon, authenticated;

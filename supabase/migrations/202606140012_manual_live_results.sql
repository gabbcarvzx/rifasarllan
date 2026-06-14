alter table public.winners
add column if not exists draw_source text,
add column if not exists instagram_live_url text,
add column if not exists proof_url text,
add column if not exists notes text,
add column if not exists published boolean not null default false,
add column if not exists published_at timestamptz,
add column if not exists created_by uuid references auth.users(id) on delete set null,
add column if not exists updated_at timestamptz not null default now();

update public.winners
set draw_source = 'instagram_live'
where draw_source is null;

alter table public.winners
alter column draw_source set default 'instagram_live';

alter table public.winners
drop constraint if exists winners_publication_check;

alter table public.winners
add constraint winners_publication_check check (
  (published = false and published_at is null)
  or (published = true and published_at is not null)
);

create index if not exists winners_tenant_raffle_published_idx
on public.winners(tenant_id, raffle_id, published);

create index if not exists winners_raffle_prize_idx
on public.winners(raffle_id, prize_id);

create unique index if not exists winners_raffle_prize_number_unique
on public.winners(raffle_id, prize_id, number)
where prize_id is not null;

drop trigger if exists set_winners_updated_at on public.winners;

create trigger set_winners_updated_at
before update on public.winners
for each row execute function public.set_updated_at();

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
    and t.status = 'active'
  order by r.created_at desc
  limit 1
$$;

create or replace function public.get_public_manual_results(
  p_raffle_id uuid,
  p_tenant_id uuid
)
returns table(
  winner_id uuid,
  raffle_id uuid,
  prize_id uuid,
  prize_title text,
  prize_description text,
  prize_image_url text,
  prize_position integer,
  number integer,
  winner_name text,
  drawn_at timestamptz,
  draw_source text,
  instagram_live_url text,
  proof_url text,
  published_at timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    w.id as winner_id,
    w.raffle_id,
    w.prize_id,
    coalesce(rp.title, 'Premio') as prize_title,
    rp.description as prize_description,
    rp.image_url as prize_image_url,
    coalesce(rp.position, 999999) as prize_position,
    w.number,
    coalesce(nullif(trim(w.winner_name), ''), 'Vencedor registrado') as winner_name,
    w.drawn_at,
    coalesce(w.draw_source, 'instagram_live') as draw_source,
    w.instagram_live_url,
    w.proof_url,
    w.published_at
  from public.winners w
  join public.raffles r on r.id = w.raffle_id
  join public.tenants t on t.id = w.tenant_id
  left join public.raffle_prizes rp on rp.id = w.prize_id
  where w.raffle_id = p_raffle_id
    and w.tenant_id = p_tenant_id
    and r.tenant_id = p_tenant_id
    and w.published = true
    and t.status = 'active'
  order by coalesce(rp.position, 999999), w.created_at
$$;

revoke all on function public.get_public_result_raffle(text, uuid) from public;
grant execute on function public.get_public_result_raffle(text, uuid) to anon, authenticated;

revoke all on function public.get_public_manual_results(uuid, uuid) from public;
grant execute on function public.get_public_manual_results(uuid, uuid) to anon, authenticated;

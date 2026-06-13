alter table public.raffle_prizes
add column if not exists media_file_id uuid references public.media_files(id) on delete set null;

create index if not exists raffle_prizes_media_file_id_idx
on public.raffle_prizes(media_file_id);

create index if not exists raffle_prizes_raffle_position_idx
on public.raffle_prizes(raffle_id, position);

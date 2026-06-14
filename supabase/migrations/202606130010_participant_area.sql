create index if not exists orders_user_created_at_idx
on public.orders(user_id, created_at desc)
where user_id is not null;

create policy "Participants can read raffles from own orders"
on public.raffles
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.raffle_id = raffles.id
      and o.user_id = auth.uid()
  )
);

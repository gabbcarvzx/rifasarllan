create index if not exists raffles_tenant_status_draw_date_idx
on public.raffles(tenant_id, status, draw_date);

create index if not exists orders_tenant_created_at_idx
on public.orders(tenant_id, created_at desc);

create or replace function public.get_admin_dashboard_stats(p_tenant_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if p_tenant_id is null or not public.is_admin_for_tenant(p_tenant_id) then
    raise exception 'ADMIN_TENANT_ACCESS_DENIED';
  end if;

  return (
    with effective_numbers as (
      select
        rn.raffle_id,
        case
          when rn.status = 'reserved'
            and rn.reserved_until is not null
            and rn.reserved_until < now()
            then 'available'
          else rn.status
        end as effective_status
      from public.raffle_numbers rn
      join public.raffles r on r.id = rn.raffle_id
      where r.tenant_id = p_tenant_id
    ),
    numbers_by_raffle as (
      select
        en.raffle_id,
        count(*)::integer as generated_numbers,
        count(*) filter (where en.effective_status = 'available')::integer as available_numbers,
        count(*) filter (where en.effective_status = 'reserved')::integer as reserved_numbers,
        count(*) filter (where en.effective_status = 'paid')::integer as paid_numbers,
        count(*) filter (where en.effective_status = 'cancelled')::integer as cancelled_numbers
      from effective_numbers en
      group by en.raffle_id
    ),
    orders_by_raffle as (
      select
        o.raffle_id,
        count(*)::integer as order_count,
        count(*) filter (where o.status = 'pending')::integer as pending_orders,
        count(*) filter (where o.status = 'paid')::integer as paid_orders,
        coalesce(sum(o.amount) filter (where o.status = 'pending'), 0)::numeric(14, 2) as reserved_value,
        coalesce(sum(o.amount) filter (where o.status = 'paid'), 0)::numeric(14, 2) as confirmed_value
      from public.orders o
      where o.tenant_id = p_tenant_id
      group by o.raffle_id
    ),
    prizes_by_raffle as (
      select rp.raffle_id, count(*)::integer as prize_count
      from public.raffle_prizes rp
      join public.raffles r on r.id = rp.raffle_id
      where r.tenant_id = p_tenant_id
      group by rp.raffle_id
    ),
    images_by_raffle as (
      select ri.raffle_id, count(*)::integer as image_count
      from public.raffle_images ri
      join public.raffles r on r.id = ri.raffle_id
      where r.tenant_id = p_tenant_id
      group by ri.raffle_id
    ),
    raffle_stats as (
      select
        r.id,
        r.tenant_id,
        r.title,
        r.slug,
        r.short_description,
        r.description,
        r.rules,
        r.price_per_number,
        r.total_numbers,
        r.min_number,
        r.max_number,
        r.draw_date,
        r.status,
        r.main_image_url,
        r.featured,
        r.created_by,
        r.created_at,
        r.updated_at,
        coalesce(n.generated_numbers, 0) as generated_numbers,
        coalesce(n.available_numbers, 0) as available_numbers,
        coalesce(n.reserved_numbers, 0) as reserved_numbers,
        coalesce(n.paid_numbers, 0) as paid_numbers,
        coalesce(n.cancelled_numbers, 0) as cancelled_numbers,
        coalesce(o.order_count, 0) as order_count,
        coalesce(o.pending_orders, 0) as pending_orders,
        coalesce(o.paid_orders, 0) as paid_orders,
        coalesce(o.reserved_value, 0)::numeric(14, 2) as reserved_value,
        coalesce(o.confirmed_value, 0)::numeric(14, 2) as confirmed_value,
        (r.total_numbers * r.price_per_number)::numeric(14, 2) as potential_revenue,
        (coalesce(n.reserved_numbers, 0) + coalesce(n.paid_numbers, 0))::integer as occupied_numbers,
        coalesce(
          round(
            100.0 * (coalesce(n.reserved_numbers, 0) + coalesce(n.paid_numbers, 0))
            / nullif(r.total_numbers, 0),
            1
          ),
          0
        )::numeric(5, 1) as occupancy_percentage,
        coalesce(p.prize_count, 0) as prize_count,
        coalesce(i.image_count, 0) as image_count
      from public.raffles r
      left join numbers_by_raffle n on n.raffle_id = r.id
      left join orders_by_raffle o on o.raffle_id = r.id
      left join prizes_by_raffle p on p.raffle_id = r.id
      left join images_by_raffle i on i.raffle_id = r.id
      where r.tenant_id = p_tenant_id
    ),
    tenant_numbers as (
      select
        count(*)::integer as total,
        count(*) filter (where effective_status = 'available')::integer as available,
        count(*) filter (where effective_status = 'reserved')::integer as reserved,
        count(*) filter (where effective_status = 'paid')::integer as paid,
        count(*) filter (where effective_status = 'cancelled')::integer as cancelled
      from effective_numbers
    ),
    tenant_orders as (
      select
        count(*)::integer as total,
        count(*) filter (where o.status = 'pending')::integer as pending,
        count(*) filter (where o.status = 'paid')::integer as paid,
        count(*) filter (where o.status = 'expired')::integer as expired,
        count(*) filter (where o.status = 'cancelled')::integer as cancelled,
        count(*) filter (where o.status = 'refunded')::integer as refunded,
        count(distinct o.user_id)::integer as participants,
        coalesce(sum(o.amount) filter (where o.status = 'pending'), 0)::numeric(14, 2) as reserved_value,
        coalesce(sum(o.amount) filter (where o.status = 'paid'), 0)::numeric(14, 2) as confirmed_value
      from public.orders o
      where o.tenant_id = p_tenant_id
    ),
    order_items_by_order as (
      select oi.order_id, count(*)::integer as number_count
      from public.order_items oi
      join public.orders o on o.id = oi.order_id
      where o.tenant_id = p_tenant_id
      group by oi.order_id
    ),
    reservations_by_order as (
      select rn.order_id, max(rn.reserved_until) as reserved_until
      from public.raffle_numbers rn
      join public.raffles r on r.id = rn.raffle_id
      where r.tenant_id = p_tenant_id
        and rn.order_id is not null
      group by rn.order_id
    ),
    recent_orders as (
      select
        o.id,
        o.raffle_id,
        r.title as raffle_title,
        r.slug as raffle_slug,
        o.customer_name,
        o.customer_email,
        o.amount,
        o.status,
        o.created_at,
        coalesce(oi.number_count, 0) as number_count,
        reservation.reserved_until
      from public.orders o
      join public.raffles r on r.id = o.raffle_id and r.tenant_id = p_tenant_id
      left join order_items_by_order oi on oi.order_id = o.id
      left join reservations_by_order reservation on reservation.order_id = o.id
      where o.tenant_id = p_tenant_id
      order by o.created_at desc
      limit 8
    ),
    dashboard_alerts as (
      select
        format('missing_prize:%s', rs.id) as alert_key,
        'missing_prize'::text as kind,
        'warning'::text as severity,
        'Rifa sem premio'::text as title,
        format('%s ainda nao possui premio cadastrado.', rs.title) as description,
        format('/admin/rifas/%s/editar', rs.id) as href,
        rs.created_at,
        1 as priority
      from raffle_stats rs
      where rs.status in ('draft', 'active', 'paused') and rs.prize_count = 0

      union all

      select
        format('missing_image:%s', rs.id),
        'missing_image',
        'warning',
        'Rifa sem imagem',
        format('%s ainda nao possui imagem principal ou galeria.', rs.title),
        format('/admin/rifas/%s/editar', rs.id),
        rs.created_at,
        2
      from raffle_stats rs
      where rs.status in ('draft', 'active', 'paused')
        and rs.main_image_url is null
        and rs.image_count = 0

      union all

      select
        format('missing_draw_date:%s', rs.id),
        'missing_draw_date',
        'danger',
        'Rifa ativa sem sorteio',
        format('%s esta ativa sem data de sorteio.', rs.title),
        format('/admin/rifas/%s/editar', rs.id),
        rs.created_at,
        0
      from raffle_stats rs
      where rs.status = 'active' and rs.draw_date is null

      union all

      select
        format('low_occupancy:%s', rs.id),
        'low_occupancy',
        'info',
        'Baixa ocupacao',
        format('%s esta com %s%% de ocupacao.', rs.title, rs.occupancy_percentage),
        format('/admin/rifas/%s/editar', rs.id),
        rs.created_at,
        4
      from raffle_stats rs
      where rs.status = 'active'
        and rs.occupancy_percentage < 10

      union all

      select
        format('reservation_expiring:%s', o.id),
        'reservation_expiring',
        'danger',
        'Reserva prestes a expirar',
        format('O pedido de %s expira em menos de 5 minutos.', coalesce(o.customer_name, 'um participante')),
        format('/admin/rifas/%s/editar', o.raffle_id),
        o.created_at,
        0
      from public.orders o
      where o.tenant_id = p_tenant_id
        and o.status = 'pending'
        and exists (
          select 1
          from public.raffle_numbers rn
          where rn.order_id = o.id
            and rn.status = 'reserved'
            and rn.reserved_until > now()
            and rn.reserved_until <= now() + interval '5 minutes'
        )
    )
    select jsonb_build_object(
      'generated_at', now(),
      'summary', jsonb_build_object(
        'total_raffles', (select count(*) from raffle_stats),
        'active_raffles', (select count(*) from raffle_stats where status = 'active'),
        'paused_raffles', (select count(*) from raffle_stats where status = 'paused'),
        'finished_raffles', (select count(*) from raffle_stats where status = 'finished'),
        'cancelled_raffles', (select count(*) from raffle_stats where status = 'cancelled'),
        'draft_raffles', (select count(*) from raffle_stats where status = 'draft'),
        'participants', (select participants from tenant_orders),
        'total_orders', (select total from tenant_orders)
      ),
      'numbers', jsonb_build_object(
        'total', (select total from tenant_numbers),
        'available', (select available from tenant_numbers),
        'reserved', (select reserved from tenant_numbers),
        'paid', (select paid from tenant_numbers),
        'cancelled', (select cancelled from tenant_numbers)
      ),
      'orders', jsonb_build_object(
        'total', (select total from tenant_orders),
        'pending', (select pending from tenant_orders),
        'paid', (select paid from tenant_orders),
        'expired', (select expired from tenant_orders),
        'cancelled', (select cancelled from tenant_orders),
        'refunded', (select refunded from tenant_orders)
      ),
      'revenue', jsonb_build_object(
        'potential', coalesce((select sum(potential_revenue) from raffle_stats), 0),
        'reserved', (select reserved_value from tenant_orders),
        'confirmed', (select confirmed_value from tenant_orders)
      ),
      'raffles', coalesce(
        (select jsonb_agg(to_jsonb(rs) order by rs.created_at desc) from raffle_stats rs),
        '[]'::jsonb
      ),
      'upcoming_draws', coalesce(
        (
          select jsonb_agg(to_jsonb(upcoming) order by upcoming.draw_date)
          from (
            select *
            from raffle_stats
            where status in ('active', 'paused')
              and draw_date is not null
              and draw_date >= now()
            order by draw_date
            limit 5
          ) upcoming
        ),
        '[]'::jsonb
      ),
      'top_raffles', coalesce(
        (
          select jsonb_agg(
            to_jsonb(top_raffle)
            order by top_raffle.occupancy_percentage desc, top_raffle.occupied_numbers desc
          )
          from (
            select *
            from raffle_stats
            where status <> 'cancelled'
            order by occupancy_percentage desc, occupied_numbers desc, created_at desc
            limit 5
          ) top_raffle
        ),
        '[]'::jsonb
      ),
      'recent_orders', coalesce(
        (select jsonb_agg(to_jsonb(ro) order by ro.created_at desc) from recent_orders ro),
        '[]'::jsonb
      ),
      'alerts', coalesce(
        (
          select jsonb_agg(to_jsonb(alert_row) order by alert_row.priority, alert_row.created_at desc)
          from (
            select * from dashboard_alerts
            order by priority, created_at desc
            limit 12
          ) alert_row
        ),
        '[]'::jsonb
      )
    )
  );
end;
$$;

revoke all on function public.get_admin_dashboard_stats(uuid) from public, anon;
grant execute on function public.get_admin_dashboard_stats(uuid) to authenticated;

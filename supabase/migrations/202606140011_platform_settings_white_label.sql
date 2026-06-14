alter table public.platform_settings
add column if not exists platform_subtitle text,
add column if not exists favicon_url text,
add column if not exists hero_banner_url text,
add column if not exists secondary_color text,
add column if not exists facebook_url text,
add column if not exists youtube_url text,
add column if not exists support_email text,
add column if not exists footer_text text,
add column if not exists privacy_policy text,
add column if not exists terms_of_use text,
add column if not exists seo_title text,
add column if not exists seo_description text;

update public.platform_settings
set platform_subtitle = coalesce(
  nullif(trim(platform_subtitle), ''),
  nullif(trim(hero_subtitle), ''),
  nullif(trim(hero_title), '')
)
where platform_subtitle is null or trim(platform_subtitle) = '';

alter table public.platform_settings
drop constraint if exists platform_settings_primary_color_check;

alter table public.platform_settings
add constraint platform_settings_primary_color_check
check (primary_color is null or primary_color ~ '^#[0-9A-Fa-f]{6}$');

alter table public.platform_settings
drop constraint if exists platform_settings_secondary_color_check;

alter table public.platform_settings
add constraint platform_settings_secondary_color_check
check (secondary_color is null or secondary_color ~ '^#[0-9A-Fa-f]{6}$');

create index if not exists platform_settings_updated_at_idx
on public.platform_settings(updated_at desc);

-- Scanstone initial schema
-- Security model: RLS on everything. Users own their rows. Plan/billing
-- columns and scan inserts are service-role only. Redirect lookups use the
-- service role (no anon read of qr_codes).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  stripe_customer_id text unique,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using ((select auth.uid()) = id);
-- No user insert/update/delete policies: profile rows are created by trigger;
-- plan & billing fields change only via the service role (Stripe webhook).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- qr_codes
create table public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  slug text not null unique
    check (slug ~ '^[23456789abcdefghjkmnpqrstuvwxyz]{4,16}$'),
  name text not null check (char_length(name) between 1 and 80),
  destination_url text not null check (char_length(destination_url) <= 2048),
  design jsonb not null default '{}'::jsonb,
  scan_count bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index qr_codes_user_idx on public.qr_codes (user_id, created_at desc);

alter table public.qr_codes enable row level security;

create policy "codes_select_own" on public.qr_codes
  for select using ((select auth.uid()) = user_id);
create policy "codes_insert_own" on public.qr_codes
  for insert with check ((select auth.uid()) = user_id);
create policy "codes_update_own" on public.qr_codes
  for update using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "codes_delete_own" on public.qr_codes
  for delete using ((select auth.uid()) = user_id);

-- ------------------------------------------------------------------- scans
-- Privacy: no IP, no fingerprint, no precise location — coarse country/region
-- from CDN headers and a coarse device class only.
create table public.scans (
  id bigint generated always as identity primary key,
  code_id uuid not null references public.qr_codes (id) on delete cascade,
  scanned_at timestamptz not null default now(),
  country text,
  region text,
  device text,
  os text,
  referer text
);

create index scans_code_time_idx on public.scans (code_id, scanned_at desc);

alter table public.scans enable row level security;

create policy "scans_select_own" on public.scans
  for select using (
    exists (
      select 1 from public.qr_codes c
      where c.id = scans.code_id and c.user_id = (select auth.uid())
    )
  );
-- Inserts happen only through record_scan() below, called with the service role.

create or replace function public.record_scan(
  p_code_id uuid,
  p_country text,
  p_region text,
  p_device text,
  p_os text,
  p_referer text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.scans (code_id, country, region, device, os, referer)
  values (p_code_id, left(p_country, 8), left(p_region, 64), left(p_device, 16),
          left(p_os, 16), left(p_referer, 512));
  update public.qr_codes set scan_count = scan_count + 1 where id = p_code_id;
end;
$$;

revoke execute on function public.record_scan(uuid, text, text, text, text, text)
  from public, anon, authenticated;

-- ----------------------------------------------------- stripe idempotency
create table public.stripe_events (
  id text primary key,
  type text,
  processed_at timestamptz not null default now()
);

alter table public.stripe_events enable row level security;
-- no policies: service-role only.

-- ------------------------------------------------------------ rate limits
create table public.rate_limits (
  key text primary key,
  count integer not null default 0,
  window_start timestamptz not null default now()
);

alter table public.rate_limits enable row level security;
-- no policies: accessed via hit_rate_limit() with the service role.

create or replace function public.hit_rate_limit(
  p_key text,
  p_max integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.rate_limits as rl (key, count, window_start)
  values (p_key, 1, now())
  on conflict (key) do update set
    count = case
      when rl.window_start < now() - make_interval(secs => p_window_seconds)
        then 1 else rl.count + 1 end,
    window_start = case
      when rl.window_start < now() - make_interval(secs => p_window_seconds)
        then now() else rl.window_start end
  returning count into v_count;
  return v_count <= p_max;
end;
$$;

revoke execute on function public.hit_rate_limit(text, integer, integer)
  from public, anon, authenticated;

-- ------------------------------------------------------------- updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger qr_codes_updated_at
  before update on public.qr_codes
  for each row execute function public.set_updated_at();

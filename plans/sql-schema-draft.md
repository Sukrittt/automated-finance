# SQL Schema Draft (M0-T3)

Target: Supabase Postgres (v1 draft).  
Scope: core auth-adjacent profile data, ingestion, transaction ledger, and weekly insights.

## Extensions and enums
```sql
create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'source_app_t') then
    create type public.source_app_t as enum ('gpay', 'phonepe', 'paytm', 'bhim', 'other');
  end if;

  if not exists (select 1 from pg_type where typname = 'txn_direction_t') then
    create type public.txn_direction_t as enum ('debit', 'credit');
  end if;

  if not exists (select 1 from pg_type where typname = 'review_status_t') then
    create type public.review_status_t as enum ('pending', 'confirmed', 'edited');
  end if;

  if not exists (select 1 from pg_type where typname = 'consent_type_t') then
    create type public.consent_type_t as enum ('notification_read', 'analytics', 'marketing');
  end if;
end
$$;
```

## Tables
```sql
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  phone_e164 text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  install_id uuid not null,
  platform text not null check (platform in ('android')),
  manufacturer text,
  model text,
  os_version text,
  app_version text,
  notification_permission text check (notification_permission in ('granted', 'denied', 'unknown')),
  listener_service_status text check (listener_service_status in ('enabled', 'disabled', 'unknown')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, install_id)
);

create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type public.consent_type_t not null,
  granted boolean not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, consent_type)
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  key text not null,
  label text not null,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, key)
);

create table if not exists public.notification_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id uuid not null references public.devices(id) on delete cascade,
  event_id uuid not null,
  source_app public.source_app_t not null,
  received_at timestamptz not null,
  notification_title text,
  notification_body text,
  raw_payload_hash text not null,
  parse_status text not null default 'pending' check (parse_status in ('pending', 'parsed', 'failed')),
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  notification_event_id uuid references public.notification_events(id) on delete set null,
  capture_source text not null default 'notification' check (capture_source in ('notification')),
  source_app public.source_app_t not null,
  amount_paise integer not null check (amount_paise > 0),
  direction public.txn_direction_t not null,
  merchant_raw text not null,
  merchant_normalized text,
  category_id uuid references public.categories(id) on delete set null,
  parse_confidence numeric(4,3) check (parse_confidence >= 0 and parse_confidence <= 1),
  review_status public.review_status_t not null default 'pending',
  txn_at timestamptz not null,
  upi_ref text,
  dedupe_fingerprint text not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, dedupe_fingerprint)
);

create table if not exists public.merchant_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pattern text not null,
  normalized_merchant text not null,
  category_id uuid references public.categories(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, pattern)
);

create table if not exists public.corrections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  old_category_id uuid references public.categories(id) on delete set null,
  new_category_id uuid references public.categories(id) on delete set null,
  old_merchant_normalized text,
  new_merchant_normalized text,
  old_txn_at timestamptz,
  new_txn_at timestamptz,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.weekly_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  status text not null default 'pending' check (status in ('pending', 'ready', 'failed')),
  summary text,
  top_leak text,
  improvement_tip text,
  projected_monthly_overrun_paise integer,
  win_highlight text,
  generated_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_code text not null,
  status text not null check (status in ('trialing', 'active', 'past_due', 'canceled')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);
```

## Indexes
```sql
create index if not exists idx_devices_user_created_at
  on public.devices (user_id, created_at desc);

create index if not exists idx_notification_events_user_received_at
  on public.notification_events (user_id, received_at desc);

create index if not exists idx_transactions_user_txn_at
  on public.transactions (user_id, txn_at desc);

create index if not exists idx_transactions_user_review_status_txn_at
  on public.transactions (user_id, review_status, txn_at desc);

create index if not exists idx_transactions_category
  on public.transactions (category_id);

create index if not exists idx_weekly_insights_user_week_start
  on public.weekly_insights (user_id, week_start desc);
```

## Trigger helper (updated_at)
```sql
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_devices_set_updated_at on public.devices;
create trigger trg_devices_set_updated_at
before update on public.devices
for each row execute function public.set_updated_at();

drop trigger if exists trg_transactions_set_updated_at on public.transactions;
create trigger trg_transactions_set_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();
```

## RLS notes and draft policies
```sql
alter table public.profiles enable row level security;
alter table public.devices enable row level security;
alter table public.consents enable row level security;
alter table public.categories enable row level security;
alter table public.notification_events enable row level security;
alter table public.transactions enable row level security;
alter table public.merchant_rules enable row level security;
alter table public.corrections enable row level security;
alter table public.weekly_insights enable row level security;
alter table public.subscriptions enable row level security;

create policy "profiles_own_rows"
  on public.profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "devices_own_rows"
  on public.devices
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "consents_own_rows"
  on public.consents
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "categories_read_system_or_own"
  on public.categories
  for select
  using (is_system = true or auth.uid() = user_id);

create policy "categories_mutate_own_non_system"
  on public.categories
  for all
  using (auth.uid() = user_id and is_system = false)
  with check (auth.uid() = user_id and is_system = false);

create policy "notification_events_own_rows"
  on public.notification_events
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "transactions_own_rows"
  on public.transactions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "merchant_rules_own_rows"
  on public.merchant_rules
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "corrections_own_rows"
  on public.corrections
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "weekly_insights_own_rows"
  on public.weekly_insights
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "subscriptions_own_rows"
  on public.subscriptions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

Implementation notes:
- Service role bypasses RLS (Supabase default); reserve for ingestion workers and aggregate/insight jobs.
- Client key should only read/write rows where `user_id = auth.uid()`.
- `categories.is_system = true` rows should be seeded by privileged backend only.
- For production hardening, split broad `for all` into verb-specific policies where needed.

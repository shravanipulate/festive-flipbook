create table if not exists public.site_visits (
  id bigint generated always as identity primary key,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer not null default 0
);

create index if not exists site_visits_started_at_idx
  on public.site_visits (started_at desc);

alter table public.site_visits enable row level security;
revoke all on public.site_visits from anon, authenticated;

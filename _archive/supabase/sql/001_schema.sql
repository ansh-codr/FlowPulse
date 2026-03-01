-- Base tables for FlowPulse
create extension if not exists "uuid-ossp";

create table if not exists public.users (
  id uuid primary key default auth.uid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_events (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  ts timestamptz not null,
  url text not null,
  title text,
  active_seconds int not null check (active_seconds >= 0),
  is_idle boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists activity_events_user_ts_idx on public.activity_events (user_id, ts desc);
create index if not exists activity_events_url_gin on public.activity_events using gin (to_tsvector('simple', coalesce(url,'')));

create table if not exists public.daily_summary (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  summary_date date not null,
  total_active_minutes int not null default 0,
  total_idle_minutes int not null default 0,
  focus_score int not null default 0 check (focus_score between 0 and 100),
  top_apps jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique(user_id, summary_date)
);

create table if not exists public.focus_sessions (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz,
  total_minutes int
);

create table if not exists public.app_settings (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  timezone text not null default 'UTC',
  distraction_domains text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique(user_id)
);

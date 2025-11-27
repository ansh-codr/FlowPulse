-- Row Level Security policies for FlowPulse

alter table public.users enable row level security;
drop policy if exists "Users read own profile" on public.users;
create policy "Users read own profile" on public.users
  for select using (auth.uid() = id);
drop policy if exists "Users insert self" on public.users;
create policy "Users insert self" on public.users
  for insert with check (auth.uid() = id);

alter table public.activity_events enable row level security;
drop policy if exists "Insert own events" on public.activity_events;
create policy "Insert own events" on public.activity_events
  for insert with check (auth.uid() = user_id);
drop policy if exists "Select own events" on public.activity_events;
create policy "Select own events" on public.activity_events
  for select using (auth.uid() = user_id);

alter table public.daily_summary enable row level security;
drop policy if exists "Access own summaries" on public.daily_summary;
create policy "Access own summaries" on public.daily_summary
  using (auth.uid() = user_id);

alter table public.focus_sessions enable row level security;
drop policy if exists "Access own focus sessions" on public.focus_sessions;
create policy "Access own focus sessions" on public.focus_sessions
  using (auth.uid() = user_id);

alter table public.app_settings enable row level security;
drop policy if exists "Access own settings" on public.app_settings;
create policy "Access own settings" on public.app_settings
  using (auth.uid() = user_id);
drop policy if exists "Insert own settings" on public.app_settings;
create policy "Insert own settings" on public.app_settings
  for insert with check (auth.uid() = user_id);
drop policy if exists "Update own settings" on public.app_settings;
create policy "Update own settings" on public.app_settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

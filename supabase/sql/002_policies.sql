-- Row Level Security policies for FlowPulse

alter table public.users enable row level security;
create policy if not exists "Users read own profile" on public.users
  for select using (auth.uid() = id);
create policy if not exists "Users insert self" on public.users
  for insert with check (auth.uid() = id);

alter table public.activity_events enable row level security;
create policy if not exists "Insert own events" on public.activity_events
  for insert with check (auth.uid() = user_id);
create policy if not exists "Select own events" on public.activity_events
  for select using (auth.uid() = user_id);

alter table public.daily_summary enable row level security;
create policy if not exists "Access own summaries" on public.daily_summary
  using (auth.uid() = user_id);

alter table public.focus_sessions enable row level security;
create policy if not exists "Access own focus sessions" on public.focus_sessions
  using (auth.uid() = user_id);

alter table public.app_settings enable row level security;
create policy if not exists "Access own settings" on public.app_settings
  using (auth.uid() = user_id);
create policy if not exists "Insert own settings" on public.app_settings
  for insert with check (auth.uid() = user_id);
create policy if not exists "Update own settings" on public.app_settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

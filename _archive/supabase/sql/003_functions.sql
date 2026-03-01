-- Helper function to recompute summary metrics for a user/date
create or replace function public.recompute_daily_summary(target_user uuid, target_date date)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  agg record;
begin
  select
    coalesce(sum(case when is_idle then 0 else active_seconds end),0) / 60 as active_minutes,
    coalesce(sum(case when is_idle then active_seconds else 0 end),0) / 60 as idle_minutes,
    jsonb_agg(obj order by obj->>'total' desc) filter (where obj is not null) as top_apps
  into agg
  from (
    select
      url,
      sum(active_seconds) as total
    from public.activity_events
    where user_id = target_user
      and ts::date = target_date
    group by url
    order by total desc
    limit 5
  ) as app,
  lateral jsonb_build_object('url', app.url, 'total', app.total) obj
  where true;

  insert into public.daily_summary as ds (
    user_id, summary_date, total_active_minutes, total_idle_minutes, focus_score, top_apps
  ) values (
    target_user,
    target_date,
    coalesce(agg.active_minutes, 0)::int,
    coalesce(agg.idle_minutes, 0)::int,
    case
      when coalesce(agg.active_minutes,0) + coalesce(agg.idle_minutes,0) = 0 then 0
      else round(100 * coalesce(agg.active_minutes,0)::numeric /
        (coalesce(agg.active_minutes,0) + coalesce(agg.idle_minutes,0)))::int
    end,
    coalesce(agg.top_apps, '[]'::jsonb)
  )
  on conflict (user_id, summary_date) do update
  set total_active_minutes = excluded.total_active_minutes,
      total_idle_minutes = excluded.total_idle_minutes,
      focus_score = excluded.focus_score,
      top_apps = excluded.top_apps,
      created_at = now();
end;
$$;

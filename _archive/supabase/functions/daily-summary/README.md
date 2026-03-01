Deployed as a scheduled Supabase Edge Function. Configure a cron job in the Supabase dashboard:

```
select cron.schedule(
  'flowpulse_daily_summary',
  '0 2 * * *',
  $$
  select net.http_post(
    url := 'https://<project-ref>.functions.supabase.co/daily-summary',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role')),
    body := jsonb_build_object('date', (now() - interval '1 day')::date)
  );
  $$
);
```

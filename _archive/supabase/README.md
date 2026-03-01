# Supabase backend

Contains SQL migrations and Edge Functions for FlowPulse.

## Applying schema

```bash
supabase db push
```

## Deploying functions

```bash
supabase functions deploy events-ingest --project-ref $SUPABASE_PROJECT_ID
supabase functions deploy daily-summary --project-ref $SUPABASE_PROJECT_ID --no-verify-jwt
```

Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` secrets for both functions.

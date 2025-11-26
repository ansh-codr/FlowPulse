# FlowPulse Chrome Extension

Tracks browser activity and syncs batched events to the Supabase Edge Function `events-ingest`.

## Scripts

- `npm install`
- `npm run dev` – Vite watch for popup and scripts
- `npm run build` – create production bundle
- `npm run zip` – build and archive for Chrome Web Store upload

Update `.env` with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_SUPABASE_FUNCTION_URL` before building.

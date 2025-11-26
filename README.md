# FlowPulse

FlowPulse is a Supabase-powered productivity tracker that combines a Chrome extension for activity capture, a realtime analytics dashboard, and serverless Supabase Edge Functions for ingestion and summarization. The stack avoids any self-hosted services: the dashboard deploys to Netlify, the backend lives entirely in Supabase, and the browser extension syncs directly to Supabase APIs.

## Structure

```
.
├── dashboard                # React + Vite + Tailwind UI
├── extension                # Chrome Manifest v3 tracker
└── supabase
    ├── functions
    │   ├── daily-summary    # Scheduled summary job
    │   └── events-ingest    # Event ingestion endpoint
    └── sql                  # Database schema, policies, helpers
```

See the per-folder README snippets for setup details.

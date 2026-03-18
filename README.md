# FlowPulse

FlowPulse is a Firebase + Cloudflare architecture:

- Firestore stores lightweight realtime daily user summaries only.
- Cloudflare R2 stores static artifacts (`extension.zip`, images/config payloads).
- A Cloudflare Worker is the only public API layer for reading R2 assets.
- Chrome extension writes batched summary updates (not per-second/per-event writes).
- Dashboard subscribes to Firestore realtime updates and uses local cache fallback.

## Structure

```
.
├── dashboard                  # React + Vite + Tailwind UI (Firestore realtime)
├── extension                  # Chrome MV3 tracker (batched Firestore summary writes)
├── functions                  # Firebase Cloud Functions (mobile activity + analytics)
├── cloudflare-worker          # Worker API for R2 static asset access
└── shared                     # Shared types and transforms
```

## Firestore Data Model (Client-Writable)

Only this lightweight document is written by the extension:

`users/{uid}/dailyRealtime/{YYYY-MM-DD}`

```json
{
    "userId": "<uid>",
    "date": "2026-03-18",
    "steps": 5234,
    "activitySummary": {
        "activeMinutes": 132,
        "productiveMinutes": 92,
        "distractionCount": 7,
        "focusScore": 70,
        "topDomain": "github.com",
        "sessionCount": 18
    },
    "lastUpdated": "<server timestamp>"
}
```

## Cloudflare Worker Endpoints

- `GET /download-extension` -> streams `extension.zip` from R2
- `GET /config` -> returns static config JSON from R2

The Worker is read-only and does not expose any public write path to R2.

## Security Notes

- No Firebase Storage reads/writes are used.
- Frontend and extension use only public Firebase client config values.
- Sensitive operations remain backend-only.
- Extension does not store admin secrets or private API keys.

## Performance and Failsafe

- Extension writes are batched via alarm flush (every 30 seconds) and manual sync.
- Dashboard subscribes realtime and falls back to cached data when Firestore is unavailable.
- Download page shows fallback messaging if Worker endpoints are unavailable.

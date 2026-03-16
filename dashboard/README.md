# FlowPulse Dashboard

React + TypeScript + Vite dashboard for FlowPulse analytics.

## Quick Start

1. Copy env template:
   - `cp .env.example .env.local`
2. Install dependencies:
   - `npm install`
3. Start dev server:
   - `npm run dev`

## Required Firebase Env Vars

The app reads these from `import.meta.env` in `src/lib/firebase.ts`:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID` (optional analytics)

Use `.env.example` as the source template.

## Verified App Routes

Top-level routes in `src/App.tsx`:

- `/`
- `/login`
- `/extension`
- `/app`

Nested dashboard routes under `/app`:

- `/app`
- `/app/timeline`
- `/app/heatmap`
- `/app/top-apps`
- `/app/sessions`
- `/app/leaderboard`
- `/app/insights`
- `/app/settings`

## Build Commands

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

## Pre-Run Checklist

1. Firebase env vars are set in `.env.local`.
2. Firebase Auth provider (Google) is enabled in the Firebase project.
3. Firestore rules and indexes are deployed from the root project.
4. Local route navigation reaches `/app` after sign-in.

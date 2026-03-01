# FlowPulse Prototype (Mock Edition)

Liquid-glass productivity HUD built for hackathon demo purposes. Everything runs locally with mock data—no Supabase, no auth, no data storage.

```
flowpulse/
├── dashboard/      # React + Vite + Tailwind UI
├── extension/      # Manifest V3 Chrome extension
├── mock-server/    # Express endpoints with static JSON
├── shared/         # Reusable TypeScript types
└── README.md
```

## Quick Start

### 1. Mock API
```bash
cd flowpulse/mock-server
npm install
npm run dev   # serves http://localhost:5055
```

### 2. Dashboard
```bash
cd flowpulse/dashboard
npm install
npm run dev   # Vite dev server (proxying /mock-api/*)
```
- Routes: `/`, `/timeline`, `/heatmap`, `/top-apps`, `/sessions`
- Uses Tailwind, Framer Motion, Recharts, and neon glass styling.

### 3. Chrome Extension
1. Build-free: simply load `flowpulse/extension` as **Unpacked extension** from `chrome://extensions`.
2. Popup shows mock focus stats. `Open Dashboard` button launches the Vite app.
3. Background script jitters stats every few seconds; options page toggles theme + mock modes.

## Mock Endpoints
The server exposes the required hardcoded routes:
- `GET /overview`
- `GET /timeline`
- `GET /heatmap`
- `GET /sessions`
- `GET /top-apps`

When the dashboard is running via Vite it calls them through `/mock-api/*` thanks to the proxy config. If the server is offline the UI falls back to its in-memory generator so the demo still works.

## Screenshot Helper
Need hero shots for submissions? Run the helper (depends on Playwright installing itself automatically):

```bash
cd flowpulse
chmod +x scripts/capture-screenshots.sh
./scripts/capture-screenshots.sh "http://localhost:5173" ./shots
```

This will drop `overview.png` inside `shots/` after waiting a moment for the UI to stabilize.

## Screens + Assets
- GlassCard + charts mimic a "VisionOS x Cyberpunk" aesthetic.
- Focus ring, streak counter, heatmap grid, parallax gradients, and animated stats.

Use this repo solely for showcasing the concept—no production hookups yet.

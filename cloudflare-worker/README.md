# FlowPulse Cloudflare Worker (R2 API Layer)

This worker provides read-only access to static R2 assets.

## Endpoints

- `GET /download-extension`:
  - Streams `extension.zip` from R2 with attachment headers.
- `GET /config`:
  - Returns static JSON config from `config/config.json` in R2.

## Security Model

- R2 is only accessed through the Worker binding (`ASSETS_BUCKET`).
- No write endpoints are exposed.
- No direct public R2 write path is used.

## Setup

1. Create an R2 bucket (for example: `flowpulse-static-assets`).
2. Upload these objects:
   - `extension.zip`
   - `config/config.json`
3. Update `wrangler.toml` bucket name if needed.
4. Deploy:

```bash
cd cloudflare-worker
npx wrangler deploy
```

## Example `config/config.json`

```json
{
  "version": "1.0.0",
  "downloadUrl": "https://<your-worker-domain>/download-extension",
  "installNotes": [
    "Open chrome://extensions",
    "Enable Developer mode",
    "Drag and drop the downloaded extension.zip"
  ]
}
```

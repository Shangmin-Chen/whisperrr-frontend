# Whisperrr Frontend

React (TypeScript) UI for Whisperrr transcription.

## Prerequisites

- Node.js 18+

## Configuration

**Local development (recommended):** do **not** set `VITE_API_URL`. The app requests `/api?…` relative to the Vite dev origin; `vite.config.ts` proxies `/api` to Spring (default `http://127.0.0.1:7331`).

Optional `.env`:

- `VITE_DEV_PROXY_TARGET` — override Spring proxy target when the gateway is elsewhere.
- `VITE_API_URL` — **full Spring base URL including `/api`** when building or running without that proxy (tunnels, `npm run build` served from nginx/Worker-only static hosting).
- `VITE_MAX_FILE_SIZE` — max upload size in MB (integer).
- `VITE_DEBUG_API` — `true` for verbose API logging.

Interactive helper:

```bash
./setup-env.sh
```

(Enter answers use proxy mode — only the comments template; paste a URL to write `VITE_API_URL`.)

## Run locally

```bash
npm install
npm run dev
```

Default dev URL: http://localhost:3737 (or `127.0.0.1:3737` — both work with the proxy + gateway defaults).

## Tests & lint

```bash
npm test
npm run lint
```

## Production build

Build with **`VITE_API_URL`** pointing at your public API (`https://your-api.example.com/api`):

```bash
VITE_API_URL=https://your-api.example.com/api npm run build
```

Serve the `build/` output from your CDN/Worker/nginx (see Dockerfile production stage).

## License

MIT — see [LICENSE](LICENSE).

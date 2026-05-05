# Whisperrr Frontend

React (TypeScript) UI for Whisperrr transcription.

## Prerequisites

- Node.js 18+

## Configuration

### Environment files

| File | Role |
|------|------|
| **`.env.local`** | Your **local machine only** (usually gitignored). Put **real** values here for dev: Supabase URL + publishable key, and any optional `VITE_*` overrides. Vite loads it automatically. |
| **`.env`** | Optional shared defaults; same variable names as below. Often gitignored in this repo—use `.env.local` if unsure. |
| **`.env.test`** | Loaded when Vite runs in **`test`** mode (e.g. **`npm test`** / Vitest). Contains **non-secret placeholders** only so `src/lib/supabase.ts` can load without throwing when `.env.local` is missing (CI, fresh clone). **Do not** put production keys here; keep dummy strings that are merely non-empty. |

**Local development (recommended):** do **not** set `VITE_API_URL` unless you need a direct API URL. The app requests `/api?…` relative to the Vite dev origin; `vite.config.ts` proxies `/api` to Spring (default `http://127.0.0.1:7331`).

**Supabase auth:** create or edit **`.env.local`** with:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
```

Without these, the dev app throws on startup when the Supabase client module loads.

### Variables

- `VITE_SUPABASE_URL` — Supabase project URL (public; inlined at build time).
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase publishable (anon) key (public; inlined at build time).
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

Vitest uses **`test`** mode, so **`VITE_*` from [`.env.test`](.env.test)** are applied for unit tests. You do not need a filled **`.env.local`** for `npm test` to pass, as long as `.env.test` stays committed with placeholder Supabase values.

## Production build

Build with **`VITE_API_URL`** pointing at your public API (`https://your-api.example.com/api`):

```bash
VITE_API_URL=https://your-api.example.com/api npm run build
```

Serve the `build/` output from your CDN/Worker/nginx or another static host.

## License

MIT — see [LICENSE](LICENSE).

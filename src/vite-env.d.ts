/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  /** Vite dev-server only: where to proxy `/api` (Spring). Not exposed to the browser. */
  readonly VITE_DEV_PROXY_TARGET?: string;
  readonly VITE_MAX_FILE_SIZE?: string;
  readonly VITE_DEBUG_API?: string;
  /** Supabase project URL (public, baked into the bundle). */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase publishable / anon key (public, baked into the bundle). */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

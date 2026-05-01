/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  /** Vite dev-server only: where to proxy `/api` (Spring). Not exposed to the browser. */
  readonly VITE_DEV_PROXY_TARGET?: string;
  readonly VITE_MAX_FILE_SIZE?: string;
  readonly VITE_DEBUG_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

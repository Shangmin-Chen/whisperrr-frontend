import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  /** Spring Boot API origin; dev browser uses `/api` on the same host unless VITE_API_URL overrides. */
  const springTarget = env.VITE_DEV_PROXY_TARGET || 'http://127.0.0.1:7331';

  return {
  plugins: [react()],
  server: {
    port: 3737,
    host: true,
    /**
     * Same-origin `/api/*` avoids browser CORS (common pain with localhost vs 127.0.0.1 vs LAN IPs).
     * Override with explicit `VITE_API_URL`; use `VITE_DEV_PROXY_TARGET` if Spring runs elsewhere.
     */
    proxy: {
      '/api': {
        target: springTarget,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'build',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  };
});

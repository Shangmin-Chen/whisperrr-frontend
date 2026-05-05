/// <reference types="@cloudflare/workers-types" />

interface Env {
  ASSETS: Fetcher;
  SPRING_ORIGIN: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      const upstream = new URL(url.pathname + url.search, env.SPRING_ORIGIN);
      return fetch(upstream, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: "manual",
      });
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
/**
 * Client helpers for job progress over Server-Sent Events (SSE).
 *
 * Intended to replace HTTP polling once `GET /audio/jobs/:id/stream` (or similar)
 * exists on the backend. See `docs/backend-realtime-job-progress.md`.
 */

import type { JobProgressResponse } from '../types/transcription';

export type JobProgressSsePayload =
  | JobProgressResponse
  | { event?: string; data?: Partial<JobProgressResponse> };

export interface SubscribeJobProgressSseOptions {
  /** Absolute URL or path accepted by EventSource (cookie-auth-friendly GET). */
  streamUrl: string;
  /** Called for each SSE message whose data parses as JSON. */
  onProgress: (payload: JobProgressSsePayload) => void;
  onConnectionError?: (event: Event) => void;
}

/**
 * Subscribe to job updates via browser EventSource (SSE).
 *
 * Backend should emit `data: {"jobId":"…","status":"PROCESSING","progress":42,...}\n\n`
 * for each progress tick and close the stream when the job reaches a terminal state.
 *
 * @returns cleanup function — always call on unmount or when switching jobs.
 */
export function subscribeJobProgressSse(options: SubscribeJobProgressSseOptions): () => void {
  const { streamUrl, onProgress, onConnectionError } = options;
  const es = new EventSource(streamUrl);

  es.onmessage = (event: MessageEvent<string>) => {
    try {
      const parsed = JSON.parse(event.data) as JobProgressSsePayload;
      onProgress(parsed);
    } catch {
      // Ignore malformed chunks; backend contract should avoid this.
    }
  };

  es.onerror = (event) => {
    onConnectionError?.(event);
  };

  return () => {
    es.close();
  };
}

/**
 * Alternative when you cannot use EventSource (custom headers, POST handshake).
 * Reads `text/event-stream` via fetch() and parses minimal SSE frames (`data:` lines).
 *
 * Not wired into `useTranscription` yet — swap polling loop for `onProgress` callbacks.
 */
export async function readJobProgressSseFetch(params: {
  streamUrl: string;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  onProgress: (payload: JobProgressSsePayload) => void;
}): Promise<void> {
  const response = await fetch(params.streamUrl, {
    headers: {
      Accept: 'text/event-stream',
      ...params.headers,
    },
    signal: params.signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`SSE connection failed: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trimEnd();
        if (!trimmed.startsWith('data:')) continue;
        const json = trimmed.slice(5).trimStart();
        if (!json || json === '[DONE]') continue;
        try {
          params.onProgress(JSON.parse(json) as JobProgressSsePayload);
        } catch {
          // skip bad JSON lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

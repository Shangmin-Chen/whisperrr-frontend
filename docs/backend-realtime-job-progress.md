# Backend: realtime job progress (SSE / WebSocket)

This complements the frontend stubs in `src/lib/jobProgressStream.ts`. Today the app polls `GET /audio/jobs/:jobId/progress`. To eliminate polling, expose a **single long-lived stream** per job that emits the same JSON shape as `JobProgressResponse`.

## Recommended shape (SSE)

Add an endpoint such as:

`GET /api/audio/jobs/{jobId}/stream`

### Behaviour

1. Validate `jobId` and return **404** if unknown (same semantics as polling).
2. Set headers:
   - `Content-Type: text/event-stream`
   - `Cache-Control: no-cache`
   - `Connection: keep-alive`
   - Optionally `X-Accel-Buffering: no` behind nginx so chunks flush immediately.
3. For each progress change (or on a bounded heartbeat interval while idle), write one SSE event:

```http
data: {"jobId":"abc","status":"PROCESSING","progress":35,"message":"Transcoding…","createdAt":"…","updatedAt":"…"}

```

Use UTF-8 JSON on one line (no bare newlines inside the payload).

4. When `status` is `COMPLETED`, include `result` inside the payload (same object as polling returns), then **close** the stream.
5. When `status` is `FAILED`, include `error` / `message`, then close.
6. If the server shuts down mid-job, close the connection; the client can fall back to polling or ask the user to refresh.

### Spring Boot sketch (SSE)

```java
@GetMapping(value = "/audio/jobs/{jobId}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<ServerSentEvent<String>> streamJob(@PathVariable String jobId) {
    return jobRegistry.progressFlux(jobId)
        .map(progress -> ServerSentEvent.<String>builder()
            .data(objectMapper.writeValueAsString(progress))
            .build());
}
```

Use a hot publisher (`Sinks.Many` or messaging bridge) fed from whatever updates job state today.

### Authentication

`EventSource` in browsers **cannot** set custom headers on GET. Options:

- **Cookie-based session**: SSE GET inherits cookies (typical for same-site deployments).
- **Token in query**: `...?token=` (short-lived, leak-sensitive — prefer cookies).
- If you require `Authorization: Bearer`, use **`fetch` + ReadableStream** instead (`readJobProgressSseFetch` in `src/lib/jobProgressStream.ts`) from a POST that returns `text/event-stream`, or open a **WebSocket**.

## WebSocket variant

Use the same JSON payloads as events:

```json
{"type":"progress","payload":{ ... JobProgressResponse ... }}
```

Close with normal closure when the job is terminal.

## Frontend integration (later)

1. After `submitTranscriptionJob` returns `jobId`, call `subscribeJobProgressSse({ streamUrl: apiBase + '/audio/jobs/' + jobId + '/stream', onProgress })`.
2. Map each payload through existing `reduceSuccessfulPollResponse`-style logic or dispatch the same reducer actions (`POLL_PROGRESS`, `POLL_COMPLETE`, `WORKFLOW_FAILED`).
3. Remove `setTimeout` polling loop; keep polling as fallback when SSE fails (`EventSource.onerror`).

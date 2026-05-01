import type { JobProgressResponse, TranscriptionResultResponse } from '../types/transcription';
import { normalizeUnknownApiError } from '../utils/apiErrors';

/** Mirrors `TRANSCRIPTION_CONFIG` shape so logic stays testable without React. */
export interface TranscriptionPollingConfig {
  INITIAL_POLL_INTERVAL_MS: number;
  MAX_POLL_INTERVAL_MS: number;
  POLL_INTERVAL_BACKOFF_MS: number;
  MAX_JOB_DURATION_MS: number;
  MAX_STALL_TIME_MS: number;
}

export const DEFAULT_MAX_CONSECUTIVE_POLL_ERRORS = 5;

/** Mutable polling/session counters kept outside React render (refs in the hook). */
export interface PollingTracking {
  jobStartTime: number;
  lastProgressUpdateTime: number;
  lastProgressValue: number;
  currentIntervalMs: number;
  consecutiveErrors: number;
}

export function createPollingTracking(
  now: number,
  config: TranscriptionPollingConfig
): PollingTracking {
  return {
    jobStartTime: now,
    lastProgressUpdateTime: now,
    lastProgressValue: 0,
    currentIntervalMs: config.INITIAL_POLL_INTERVAL_MS,
    consecutiveErrors: 0,
  };
}

export type TimeoutBeforePollOutcome =
  | { kind: 'job_timeout'; message: string }
  | { kind: 'stall_timeout'; message: string };

/**
 * Same ordering as the legacy hook: job duration, then stall, before calling the API.
 */
export function checkTimeoutsBeforePoll(
  tracking: PollingTracking,
  now: number,
  config: TranscriptionPollingConfig
): TimeoutBeforePollOutcome | null {
  const elapsed = now - tracking.jobStartTime;
  if (elapsed > config.MAX_JOB_DURATION_MS) {
    return {
      kind: 'job_timeout',
      message: `Transcription timed out after ${Math.round(elapsed / 60000)} minutes. The job may still be processing on the server.`,
    };
  }

  const timeSinceLastUpdate = now - tracking.lastProgressUpdateTime;
  if (timeSinceLastUpdate > config.MAX_STALL_TIME_MS) {
    return {
      kind: 'stall_timeout',
      message: `Job appears to be stuck (no progress update for ${Math.round(timeSinceLastUpdate / 60000)} minutes). Please try again.`,
    };
  }

  return null;
}

export type SuccessfulPollOutcome =
  | { kind: 'completed'; result: TranscriptionResultResponse; tracking: PollingTracking }
  | { kind: 'failed'; error: string; tracking: PollingTracking }
  | {
      kind: 'continue';
      tracking: PollingTracking;
      progress: number;
      message: string | null;
      nextDelayMs: number;
    };

/**
 * Applies adaptive backoff and terminal statuses after a successful GET progress response.
 */
export function reduceSuccessfulPollResponse(
  tracking: PollingTracking,
  response: JobProgressResponse,
  now: number,
  config: TranscriptionPollingConfig
): SuccessfulPollOutcome {
  const clearedErrors: PollingTracking = { ...tracking, consecutiveErrors: 0 };

  const progressChanged = response.progress !== clearedErrors.lastProgressValue;

  let nextTracking: PollingTracking;
  if (progressChanged) {
    nextTracking = {
      ...clearedErrors,
      lastProgressUpdateTime: now,
      lastProgressValue: response.progress,
      currentIntervalMs: config.INITIAL_POLL_INTERVAL_MS,
    };
  } else {
    nextTracking = {
      ...clearedErrors,
      currentIntervalMs: Math.min(
        clearedErrors.currentIntervalMs + config.POLL_INTERVAL_BACKOFF_MS,
        config.MAX_POLL_INTERVAL_MS
      ),
    };
  }

  if (response.status === 'COMPLETED' && response.result) {
    return { kind: 'completed', result: response.result, tracking: nextTracking };
  }

  if (response.status === 'FAILED') {
    const error = response.error || response.message || 'Transcription failed';
    return { kind: 'failed', error, tracking: nextTracking };
  }

  return {
    kind: 'continue',
    tracking: nextTracking,
    progress: response.progress,
    message: response.message ?? null,
    nextDelayMs: nextTracking.currentIntervalMs,
  };
}

export type PollFailureOutcome =
  | { kind: 'not_found'; message: string }
  | { kind: 'give_up'; message: string; tracking: PollingTracking }
  | {
      kind: 'retry';
      tracking: PollingTracking;
      nextDelayMs: number;
      retryAttempt: number;
      maxAttempts: number;
    };

function getAxiosLikeErrorParts(err: unknown): {
  status?: number;
  message: string;
  bodyMessage?: string;
} {
  const n = normalizeUnknownApiError(err);
  return {
    status: n.status,
    message: n.message,
    bodyMessage: n.bodyMessage,
  };
}

export function reducePollFailure(
  tracking: PollingTracking,
  err: unknown,
  _config: TranscriptionPollingConfig,
  maxConsecutiveErrors: number = DEFAULT_MAX_CONSECUTIVE_POLL_ERRORS
): PollFailureOutcome {
  const { status, message, bodyMessage } = getAxiosLikeErrorParts(err);

  if (status === 404) {
    return {
      kind: 'not_found',
      message: bodyMessage || message || 'Job not found',
    };
  }

  const consecutiveErrors = tracking.consecutiveErrors + 1;
  const nextTracking: PollingTracking = { ...tracking, consecutiveErrors };

  if (consecutiveErrors >= maxConsecutiveErrors) {
    return {
      kind: 'give_up',
      message: bodyMessage || message || 'Failed to check job progress',
      tracking: nextTracking,
    };
  }

  return {
    kind: 'retry',
    tracking: nextTracking,
    nextDelayMs: tracking.currentIntervalMs,
    retryAttempt: consecutiveErrors,
    maxAttempts: maxConsecutiveErrors,
  };
}

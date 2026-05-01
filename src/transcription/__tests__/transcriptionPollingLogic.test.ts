import {
  checkTimeoutsBeforePoll,
  createPollingTracking,
  reducePollFailure,
  reduceSuccessfulPollResponse,
  DEFAULT_MAX_CONSECUTIVE_POLL_ERRORS,
} from '../transcriptionPollingLogic';
import type { JobProgressResponse } from '../../types/transcription';
import { TranscriptionStatus } from '../../types/transcription';
import { TRANSCRIPTION_CONFIG } from '../../utils/constants';

const cfg = TRANSCRIPTION_CONFIG;

describe('transcriptionPollingLogic', () => {
  const now = 1_700_000_000_000;

  it('createPollingTracking seeds interval from config', () => {
    const t = createPollingTracking(now, cfg);
    expect(t.jobStartTime).toBe(now);
    expect(t.lastProgressUpdateTime).toBe(now);
    expect(t.currentIntervalMs).toBe(cfg.INITIAL_POLL_INTERVAL_MS);
    expect(t.consecutiveErrors).toBe(0);
  });

  it('checkTimeoutsBeforePoll returns job_timeout when over MAX_JOB_DURATION_MS', () => {
    const tracking = createPollingTracking(now - cfg.MAX_JOB_DURATION_MS - 1, cfg);
    const hit = checkTimeoutsBeforePoll(tracking, now, cfg);
    expect(hit?.kind).toBe('job_timeout');
  });

  it('checkTimeoutsBeforePoll returns stall_timeout when no progress heartbeat', () => {
    const tracking = {
      ...createPollingTracking(now, cfg),
      lastProgressUpdateTime: now - cfg.MAX_STALL_TIME_MS - 1,
    };
    const hit = checkTimeoutsBeforePoll(tracking, now, cfg);
    expect(hit?.kind).toBe('stall_timeout');
  });

  it('reduceSuccessfulPollResponse completes when COMPLETED + result', () => {
    const tracking = createPollingTracking(now, cfg);
    const response: JobProgressResponse = {
      jobId: 'j1',
      status: TranscriptionStatus.COMPLETED,
      progress: 100,
      message: 'done',
      result: {
        transcriptionText: 'hi',
        completedAt: new Date().toISOString(),
        status: TranscriptionStatus.COMPLETED,
      },
      createdAt: '',
      updatedAt: '',
    };
    const out = reduceSuccessfulPollResponse(tracking, response, now, cfg);
    expect(out.kind).toBe('completed');
    if (out.kind === 'completed') {
      expect(out.result.transcriptionText).toBe('hi');
      expect(out.tracking.consecutiveErrors).toBe(0);
    }
  });

  it('reduceSuccessfulPollResponse backs off interval when progress unchanged', () => {
    const tracking = {
      ...createPollingTracking(now, cfg),
      lastProgressValue: 50,
      currentIntervalMs: cfg.INITIAL_POLL_INTERVAL_MS,
    };
    const response: JobProgressResponse = {
      jobId: 'j1',
      status: TranscriptionStatus.PROCESSING,
      progress: 50,
      message: 'still',
      createdAt: '',
      updatedAt: '',
    };
    const out = reduceSuccessfulPollResponse(tracking, response, now + 10, cfg);
    expect(out.kind).toBe('continue');
    if (out.kind === 'continue') {
      expect(out.nextDelayMs).toBe(cfg.INITIAL_POLL_INTERVAL_MS + cfg.POLL_INTERVAL_BACKOFF_MS);
    }
  });

  it('reducePollFailure maps 404 to not_found', () => {
    const tracking = createPollingTracking(now, cfg);
    const err = { response: { status: 404, data: { message: 'missing' } }, message: 'x' };
    const out = reducePollFailure(tracking, err, cfg);
    expect(out.kind).toBe('not_found');
    if (out.kind === 'not_found') expect(out.message).toBe('missing');
  });

  it('reducePollFailure retries until max attempts', () => {
    let tracking = createPollingTracking(now, cfg);
    const err = new Error('network');
    for (let i = 1; i < DEFAULT_MAX_CONSECUTIVE_POLL_ERRORS; i++) {
      const out = reducePollFailure(tracking, err, cfg);
      expect(out.kind).toBe('retry');
      if (out.kind === 'retry') tracking = out.tracking;
    }
    const last = reducePollFailure(tracking, err, cfg);
    expect(last.kind).toBe('give_up');
  });
});

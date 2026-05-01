/**
 * Custom hook for managing audio transcription workflow.
 *
 * Orchestrates job submission (TanStack Query mutation), HTTP polling via extracted
 * polling logic (`transcriptionPollingLogic`), and explicit workflow phases (`transcriptionWorkflowReducer`).
 */

import { useReducer, useCallback, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { TranscriptionService } from '../services/transcription';
import type {
  TranscriptionResultResponse,
  WhisperModelSize,
  TranscriptionTask,
  JobSubmissionResponse,
} from '../types/transcription';
import { TRANSCRIPTION_CONFIG } from '../utils/constants';
import { getUserFacingApiMessage } from '../utils/apiErrors';
import {
  checkTimeoutsBeforePoll,
  createPollingTracking,
  reducePollFailure,
  reduceSuccessfulPollResponse,
  type PollingTracking,
} from '../transcription/transcriptionPollingLogic';
import {
  initialTranscriptionWorkflowState,
  transcriptionWorkflowReducer,
  type TranscriptionWorkflowPhase,
} from '../transcription/transcriptionWorkflowReducer';

export interface UseTranscriptionReturn {
  transcriptionResult: TranscriptionResultResponse | null;
  error: string | null;
  progress: number;
  statusMessage: string | null;
  transcribeAudio: (
    file: File,
    modelSize?: WhisperModelSize,
    language?: string,
    task?: TranscriptionTask
  ) => Promise<void>;
  clearError: () => void;
  reset: () => void;
  isTranscribing: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  isIdle: boolean;
  /** Explicit finite-state-machine phase for UI / debugging */
  workflowPhase: TranscriptionWorkflowPhase;
}

export const useTranscription = (): UseTranscriptionReturn => {
  const [workflow, dispatch] = useReducer(
    transcriptionWorkflowReducer,
    initialTranscriptionWorkflowState
  );

  const pollIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackingRef = useRef<PollingTracking | null>(null);
  const pollJobProgressRef = useRef<(jobId: string) => Promise<void>>(async () => undefined);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current !== null) {
      clearTimeout(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    trackingRef.current = null;
  }, []);

  const pollJobProgress = useCallback(
    async (jobId: string) => {
      const tracking = trackingRef.current;
      if (!tracking) return;

      const now = Date.now();
      const timeoutHit = checkTimeoutsBeforePoll(tracking, now, TRANSCRIPTION_CONFIG);
      if (timeoutHit) {
        stopPolling();
        dispatch({ type: 'WORKFLOW_FAILED', message: timeoutHit.message });
        return;
      }

      try {
        const progressResponse = await TranscriptionService.getJobProgress(jobId);
        const outcome = reduceSuccessfulPollResponse(
          tracking,
          progressResponse,
          Date.now(),
          TRANSCRIPTION_CONFIG
        );
        trackingRef.current = outcome.tracking;

        switch (outcome.kind) {
          case 'completed':
            stopPolling();
            dispatch({ type: 'POLL_COMPLETE', result: outcome.result });
            break;
          case 'failed':
            stopPolling();
            dispatch({
              type: 'WORKFLOW_FAILED',
              message: outcome.error,
              resetProgress: true,
            });
            break;
          case 'continue':
            dispatch({
              type: 'POLL_PROGRESS',
              progress: outcome.progress,
              message: outcome.message,
            });
            if (pollIntervalRef.current !== null) {
              clearTimeout(pollIntervalRef.current);
            }
            pollIntervalRef.current = setTimeout(() => {
              void pollJobProgressRef.current(jobId);
            }, outcome.nextDelayMs);
            break;
        }
      } catch (err) {
        const tr = trackingRef.current;
        if (!tr) return;

        const failure = reducePollFailure(tr, err, TRANSCRIPTION_CONFIG);

        switch (failure.kind) {
          case 'not_found':
            stopPolling();
            dispatch({ type: 'WORKFLOW_FAILED', message: failure.message });
            break;
          case 'give_up':
            trackingRef.current = failure.tracking;
            stopPolling();
            dispatch({ type: 'WORKFLOW_FAILED', message: failure.message });
            break;
          case 'retry':
            trackingRef.current = failure.tracking;
            console.warn(
              `Polling error (${failure.retryAttempt}/${failure.maxAttempts}):`,
              err instanceof Error ? err.message : err
            );
            dispatch({
              type: 'POLL_RETRY_STATUS',
              message: 'Checking progress... (retrying after error)',
            });
            if (pollIntervalRef.current !== null) {
              clearTimeout(pollIntervalRef.current);
            }
            pollIntervalRef.current = setTimeout(() => {
              void pollJobProgressRef.current(jobId);
            }, failure.nextDelayMs);
            break;
        }
      }
    },
    [dispatch, stopPolling]
  );

  pollJobProgressRef.current = pollJobProgress;

  const jobSubmissionMutation = useMutation({
    mutationFn: ({
      file,
      modelSize,
      language,
      task,
    }: {
      file: File;
      modelSize?: WhisperModelSize;
      language?: string;
      task?: TranscriptionTask;
    }) => TranscriptionService.submitTranscriptionJob(file, modelSize, language, task),
    onSuccess: (data: JobSubmissionResponse) => {
      trackingRef.current = createPollingTracking(Date.now(), TRANSCRIPTION_CONFIG);
      dispatch({
        type: 'SUBMIT_SUCCESS',
        jobId: data.jobId,
        message: data.message ?? null,
      });
      if (data.jobId) {
        void pollJobProgressRef.current(data.jobId);
      }
    },
    onError: (error: unknown) => {
      dispatch({
        type: 'SUBMIT_FAILURE',
        message: getUserFacingApiMessage(error, 'Failed to submit transcription job'),
      });
    },
  });

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  const transcribeAudio = useCallback(
    async (
      file: File,
      modelSize?: WhisperModelSize,
      language?: string,
      task?: TranscriptionTask
    ) => {
      dispatch({ type: 'BEGIN_TRANSCRIBE' });
      stopPolling();
      await jobSubmissionMutation.mutateAsync({ file, modelSize, language, task });
    },
    [jobSubmissionMutation, stopPolling]
  );

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
    jobSubmissionMutation.reset();
  }, [jobSubmissionMutation]);

  const reset = useCallback(() => {
    stopPolling();
    dispatch({ type: 'RESET' });
    jobSubmissionMutation.reset();
  }, [jobSubmissionMutation, stopPolling]);

  const isTranscribing =
    workflow.phase === 'submitting' || workflow.phase === 'polling';
  const isCompleted = workflow.phase === 'completed';
  const isFailed = workflow.phase === 'failed';
  const isIdle = workflow.phase === 'idle';

  const mutationErrMsg =
    jobSubmissionMutation.error instanceof Error
      ? jobSubmissionMutation.error.message
      : null;

  const displayError = workflow.error ?? mutationErrMsg;

  return {
    transcriptionResult: workflow.transcriptionResult,
    error: displayError,
    progress: workflow.progress,
    statusMessage: workflow.statusMessage,
    transcribeAudio,
    clearError,
    reset,
    isTranscribing,
    isCompleted,
    isFailed,
    isIdle,
    workflowPhase: workflow.phase,
  };
};

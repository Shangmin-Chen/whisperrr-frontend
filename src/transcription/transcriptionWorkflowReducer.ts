import type { TranscriptionResultResponse } from '../types/transcription';

export type TranscriptionWorkflowPhase =
  | 'idle'
  | 'submitting'
  | 'polling'
  | 'completed'
  | 'failed';

export interface TranscriptionWorkflowState {
  phase: TranscriptionWorkflowPhase;
  jobId: string | null;
  progress: number;
  statusMessage: string | null;
  error: string | null;
  transcriptionResult: TranscriptionResultResponse | null;
}

export type TranscriptionWorkflowAction =
  | { type: 'RESET' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'BEGIN_TRANSCRIBE' }
  | { type: 'SUBMIT_SUCCESS'; jobId: string; message?: string | null }
  | { type: 'SUBMIT_FAILURE'; message: string }
  | { type: 'POLL_PROGRESS'; progress: number; message: string | null }
  | { type: 'POLL_RETRY_STATUS'; message: string }
  | { type: 'POLL_COMPLETE'; result: TranscriptionResultResponse }
  | { type: 'WORKFLOW_FAILED'; message: string; resetProgress?: boolean };

export const initialTranscriptionWorkflowState: TranscriptionWorkflowState = {
  phase: 'idle',
  jobId: null,
  progress: 0,
  statusMessage: null,
  error: null,
  transcriptionResult: null,
};

export function transcriptionWorkflowReducer(
  state: TranscriptionWorkflowState,
  action: TranscriptionWorkflowAction
): TranscriptionWorkflowState {
  switch (action.type) {
    case 'RESET':
      return initialTranscriptionWorkflowState;

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    case 'BEGIN_TRANSCRIBE':
      return {
        ...initialTranscriptionWorkflowState,
        phase: 'submitting',
        statusMessage: 'Submitting job...',
      };

    case 'SUBMIT_SUCCESS':
      return {
        ...state,
        phase: 'polling',
        jobId: action.jobId,
        progress: 0,
        statusMessage: action.message ?? 'Job submitted, starting transcription...',
        error: null,
      };

    case 'SUBMIT_FAILURE':
      return {
        ...state,
        phase: 'failed',
        progress: 0,
        statusMessage: null,
        error: action.message,
        jobId: null,
      };

    case 'POLL_PROGRESS':
      return {
        ...state,
        phase: 'polling',
        progress: action.progress,
        statusMessage: action.message,
        error: null,
      };

    case 'POLL_RETRY_STATUS':
      return {
        ...state,
        phase: 'polling',
        statusMessage: action.message,
      };

    case 'POLL_COMPLETE':
      return {
        ...state,
        phase: 'completed',
        progress: 100,
        statusMessage: 'Transcription completed',
        transcriptionResult: action.result,
        error: null,
      };

    case 'WORKFLOW_FAILED':
      return {
        ...state,
        phase: 'failed',
        progress: action.resetProgress ? 0 : state.progress,
        statusMessage: action.resetProgress ? null : state.statusMessage,
        error: action.message,
      };

    default:
      return state;
  }
}

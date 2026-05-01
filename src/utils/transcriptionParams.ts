import type { TranscriptionTask } from '../types/transcription';

/**
 * Maps UI language selection to Whisper job query params.
 * - auto: no language/task (backend detects)
 * - en: translate speech to English (Whisper translate task)
 * - other ISO codes: transcribe in that language
 */
export function resolveTranscriptionRequest(languageCode: string): {
  language?: string;
  task?: TranscriptionTask;
} {
  if (languageCode === 'auto') {
    return {};
  }
  if (languageCode === 'en') {
    return { task: 'translate' };
  }
  return { language: languageCode, task: 'transcribe' };
}

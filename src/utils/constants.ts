// Single source of truth for configuration
import { FILE_RULES } from './fileRules';

export const APP_CONFIG = {
  name: 'Whisperrr',
  version: '1.0.0',
  description: 'AI-powered audio transcription platform',
  maxFileSize: FILE_RULES.maxFileSizeBytes,
  supportedFormats: [...FILE_RULES.supportedMimeTypes],
  supportedExtensions: [...FILE_RULES.supportedExtensions],
};

export const ROUTES = {
  HOME: '/',
} as const;

export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'File exceeds the maximum allowed size for this app.',
  INVALID_FORMAT: FILE_RULES.invalidFormatMessage,
  UPLOAD_FAILED: 'Failed to upload file. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  TRANSCRIPTION_FAILED: 'Transcription failed. Please try with a different file.',
  FILE_REQUIRED: 'Please select an audio file to upload',
} as const;

export const SUCCESS_MESSAGES = {
  UPLOAD_SUCCESS: 'File uploaded successfully!',
  TRANSCRIPTION_COMPLETE: 'Transcription completed successfully!',
} as const;

/**
 * Transcription workflow configuration constants.
 * Tuned for local dev and a single-worker Python job store (see microservice README).
 */
export const TRANSCRIPTION_CONFIG = {
  /** Initial poll interval for job progress checks in milliseconds. */
  INITIAL_POLL_INTERVAL_MS: 1500, // Start with 1.5 seconds (faster initial polling)

  /** Maximum poll interval (adaptive polling will increase up to this). */
  MAX_POLL_INTERVAL_MS: 5000, // Max 5 seconds between polls (reduced for better responsiveness)

  /** How much to increase polling interval each time (adaptive backoff). */
  POLL_INTERVAL_BACKOFF_MS: 500, // Increase by 500ms each time (gentler backoff)

  /** Maximum time to wait for a job to complete (in milliseconds). */
  MAX_JOB_DURATION_MS: 2 * 60 * 60 * 1000, // 2 hours (supports very long audio files)

  /** Maximum time without progress update before considering job hung (in milliseconds). */
  MAX_STALL_TIME_MS: 10 * 60 * 1000, // 10 minutes without update = hung
} as const;

/**
 * Verbose API logging (resolved URL in constants, request/response in axios interceptors).
 * On in development, or when VITE_DEBUG_API=true at build time.
 */
export const API_DEBUG_LOGGING =
  import.meta.env.DEV || import.meta.env.VITE_DEBUG_API === 'true';

/**
 * API configuration constants.
 * Resolve base URL: explicit `VITE_API_URL`, else dev-time `/api` proxy path, else production default.
 */
const getApiUrl = (): string => {
  /** Explicit URL (tunnel, preview, staging, production builds). */
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  /**
   * Local dev default: relative `/api` is proxied by Vite to Spring (same origin → no CORS).
   * Production static hosting without a proxy still needs `VITE_API_URL` at build time.
   */
  if (import.meta.env.DEV) {
    return '/api';
  }
  return 'http://localhost:7331/api';
};

const resolvedApiUrl = getApiUrl();

if (API_DEBUG_LOGGING) {
  console.log('[API Config] ============================================');
  console.log('[API Config] Environment Variable Debug Info:');
  console.log('[API Config]   VITE_API_URL:', import.meta.env.VITE_API_URL || '(not set)');
  console.log('[API Config]   MODE:', import.meta.env.MODE || '(not set)');
  if (import.meta.env.VITE_API_URL) {
    console.log('[API Config]   ✓ Using API URL from VITE_API_URL');
  } else if (import.meta.env.DEV) {
    console.log('[API Config]   ✓ Using relative `/api` (Vite proxies to Spring in dev)');
  } else {
    console.log('[API Config]   ✓ Using bundled default URL (set VITE_API_URL when building without a gateway)');
  }
  console.log('[API Config]   Resolved API URL:', resolvedApiUrl);
  console.log('[API Config] ============================================');
}

export const API_CONFIG = {
  /** Default API base URL. */
  BASE_URL: resolvedApiUrl,

  /** Request timeout in milliseconds (0 = no timeout for long-running jobs). */
  TIMEOUT: 0,
} as const;

/**
 * File upload configuration constants.
 */
export const UPLOAD_CONFIG = {
  /** Maximum number of files allowed per upload. */
  MAX_FILES: 1,
} as const;

/**
 * UI configuration constants.
 */
export const UI_CONFIG = {
  /** Copy feedback timeout in milliseconds. */
  COPY_FEEDBACK_TIMEOUT_MS: 2000,
} as const;

/**
 * File size formatting constants.
 */
export const FILE_SIZE_CONFIG = {
  /** Bytes conversion factor. */
  BYTES_PER_KB: 1024,

  /** File size unit labels. */
  UNITS: ['Bytes', 'KB', 'MB', 'GB'] as const,
} as const;

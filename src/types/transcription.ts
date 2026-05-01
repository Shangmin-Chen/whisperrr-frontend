
export interface TranscriptionResultResponse {
  /** The complete transcribed text from the audio file */
  transcriptionText: string;
  
  /** Detected language code in ISO 639-1 format (e.g., "en", "es", "fr") */
  language?: string;
  
  /** Confidence score from 0.0 to 1.0 indicating transcription quality */
  confidence?: number;
  
  /** Duration of the audio file in seconds */
  duration?: number;
  
  /** Whisper model used for transcription (e.g., "base", "large") */
  modelUsed?: string;
  
  /** Processing time in seconds taken to transcribe the audio */
  processingTime?: number;
  
  /** Timestamp when transcription was completed */
  completedAt: string;
  
  /** Status of the transcription (should always be COMPLETED) */
  status: TranscriptionStatus;
  
  /** Individual segments with timing information */
  segments?: TranscriptionSegment[];
}

export interface TranscriptionSegment {
  /** Optional segment id from the backend (preferred for stable list keys). */
  id?: string | number;

  /** Start time of the segment in seconds */
  startTime: number;
  
  /** End time of the segment in seconds */
  endTime: number;
  
  /** Transcribed text for this time segment */
  text: string;
  
  /** Confidence score for this segment (0.0 to 1.0) */
  confidence?: number;
}

export enum TranscriptionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}


export interface AudioFileInfo {
  /** Original filename of the uploaded file */
  filename: string;
  
  /** File size in bytes */
  size: number;
  
  /** Audio format/extension (e.g., "mp3", "wav") */
  format: string;
  
  /** MIME type of the audio file */
  mimeType: string;
  
  /** Duration of the audio file in seconds (if available) */
  duration?: number;
}

export interface TranscriptionError {
  /** Type of error that occurred */
  errorType: string;
  
  /** Human-readable error message */
  message: string;
  
  /** Additional error details */
  details?: Record<string, any>;
  
  /** Request correlation ID for debugging */
  correlationId?: string;
  
  /** Timestamp when the error occurred */
  timestamp: string;
}

export type WhisperModelSize = 'tiny' | 'base' | 'small' | 'medium' | 'large' | 'large-v2' | 'large-v3';

export interface ModelInfo {
  /** Model size identifier */
  size: WhisperModelSize;
  
  /** Human-readable description */
  description: string;
  
  /** Model size in MB */
  sizeMB: number;
  
  /** Speed description */
  speed: string;
  
  /** Accuracy description */
  accuracy: string;
}

export interface LanguageInfo {
  /** ISO 639-1 language code */
  code: string;
  
  /** Human-readable language name */
  name: string;
}

/** Whisper API task: transcribe in a given language, or translate speech to English */
export type TranscriptionTask = 'transcribe' | 'translate';

export interface TranscriptionOptions {
  /** Preferred Whisper model size */
  modelSize?: WhisperModelSize;
  
  /** Language hint for better accuracy (ISO 639-1 code) */
  language?: string;
  
  /** Temperature for sampling (0.0 = deterministic, higher = more random) */
  temperature?: number;
  
  /** Task type: transcribe or translate to English */
  task?: TranscriptionTask;
}

export interface JobSubmissionResponse {
  /** Unique job identifier */
  jobId: string;
  
  /** Initial job status */
  status: string;
  
  /** Status message */
  message: string;
}

export interface JobProgressResponse {
  /** Job identifier */
  jobId: string;
  
  /** Current job status */
  status: string;
  
  /** Progress percentage (0-100) */
  progress: number;
  
  /** Status message */
  message: string;
  
  /** Transcription result (available when status is COMPLETED) */
  result?: TranscriptionResultResponse;
  
  /** Error message (available when status is FAILED) */
  error?: string;
  
  /** Job creation timestamp */
  createdAt: string;
  
  /** Last update timestamp */
  updatedAt: string;
}
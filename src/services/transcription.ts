/**
 * Transcription service for API communication.
 * 
 * This service handles asynchronous job submission and job progress tracking.
 * 
 * @author shangmin
 * @version 1.0
 * @since 2024
 */

import apiClient from './api';
import {
  JobSubmissionResponse,
  JobProgressResponse,
  TranscriptionTask,
} from '../types/transcription';
import { FILE_RULES } from '../utils/fileRules';

function buildSubmitParams(
  modelSize?: string,
  language?: string,
  task?: TranscriptionTask
): Record<string, string> {
  const params: Record<string, string> = {};
  if (modelSize) {
    params.modelSize = modelSize;
  }
  if (language && language !== 'auto') {
    params.language = language;
  }
  if (task) {
    params.task = task;
  }
  return params;
}

/**
 * Service class for transcription API operations.
 */
export class TranscriptionService {
  static async submitTranscriptionJob(
    file: File,
    modelSize?: string,
    language?: string,
    task?: TranscriptionTask
  ): Promise<JobSubmissionResponse> {
    const formData = new FormData();
    formData.append('audioFile', file);

    const params = buildSubmitParams(modelSize, language, task);

    const response = await apiClient.post<JobSubmissionResponse>('/audio/jobs/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...FILE_RULES.clientUploadHintHeaders,
      },
      params,
    });

    if (!response.data?.jobId) {
      throw new Error('Invalid job submission response');
    }

    return response.data;
  }

  static async getJobProgress(jobId: string): Promise<JobProgressResponse> {
    const response = await apiClient.get<JobProgressResponse>(`/audio/jobs/${jobId}/progress`);
    if (!response.data) {
      throw new Error('Invalid progress response');
    }
    return response.data;
  }

  /**
   * Backend returns plain text `OK` (not JSON).
   */
  static async healthCheck(): Promise<string> {
    const response = await apiClient.get<string>('/audio/health', {
      responseType: 'text',
      transformResponse: [(data) => data],
    });
    if (typeof response.data !== 'string' || response.data.length === 0) {
      throw new Error('Invalid health response');
    }
    return response.data;
  }
}

export default TranscriptionService;

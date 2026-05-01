/**
 * File validation utilities for audio file uploads.
 *
 * @author shangmin
 * @version 1.0
 * @since 2024
 */

import { ERROR_MESSAGES, FILE_SIZE_CONFIG } from './constants';
import { FILE_RULES, MIME_TO_DISPLAY_LABEL } from './fileRules';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate audio file against size and format constraints.
 *
 * @param file file to validate
 * @returns validation result with isValid flag and optional error message
 */
export const validateAudioFile = (file: File): ValidationResult => {
  if (!file) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.FILE_REQUIRED,
    };
  }

  if (file.size > FILE_RULES.maxFileSizeBytes) {
    const maxSizeFormatted = formatFileSize(FILE_RULES.maxFileSizeBytes);
    return {
      isValid: false,
      error: `File size must be ${maxSizeFormatted} or less (current: ${formatFileSize(file.size)})`,
    };
  }

  const extension = getFileExtension(file.name);
  if (!extension || !FILE_RULES.supportedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_FORMAT,
    };
  }

  // Validate MIME type if available
  if (file.type) {
    const isValidMimeType =
      file.type.startsWith('audio/') ||
      file.type.startsWith('video/') ||
      FILE_RULES.supportedMimeTypeSet.has(file.type);

    if (!isValidMimeType) {
      return {
        isValid: false,
        error: ERROR_MESSAGES.INVALID_FORMAT,
      };
    }
  }

  return { isValid: true };
};

/**
 * Extract file extension from filename.
 *
 * @param filename filename with or without path
 * @returns file extension in lowercase with leading dot, or empty string
 */
export const getFileExtension = (filename: string): string => {
  if (!filename || !filename.includes('.')) {
    return '';
  }
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
    return '';
  }
  return filename.toLowerCase().substring(lastDotIndex);
};

/**
 * Format file size in bytes to human-readable format (Bytes, KB, MB, GB).
 *
 * @param bytes file size in bytes
 * @returns formatted size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = FILE_SIZE_CONFIG.BYTES_PER_KB;
  const sizes = FILE_SIZE_CONFIG.UNITS;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get display name for MIME type.
 *
 * @param mimeType MIME type string
 * @returns display name or original MIME type if not mapped
 */
export const getFileTypeDisplayName = (mimeType: string): string => {
  return MIME_TO_DISPLAY_LABEL[mimeType] ?? mimeType;
};

/**
 * Check if file is an audio or video file.
 *
 * @param file file to check
 * @returns true if file is audio or video format
 */
export const isAudioFile = (file: File): boolean => {
  // Check by MIME type if available
  if (file.type) {
    if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
      return true;
    }
  }

  // Fallback to extension check
  return FILE_RULES.supportedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
};

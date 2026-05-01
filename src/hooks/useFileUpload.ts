/**
 * Custom hook for file upload functionality with drag-and-drop support.
 * 
 * This hook provides file upload state management, validation, and drag-and-drop
 * functionality using react-dropzone. It handles file validation, error states,
 * and provides computed values for UI rendering.
 * 
 * @author shangmin
 * @version 1.0
 * @since 2024
 */

import { useState, useCallback } from 'react';
import type { DragEvent } from 'react';
import { useDropzone, type DropzoneState, type FileRejection } from 'react-dropzone';
import { validateAudioFile, formatFileSize } from '../utils/fileValidation';
import { ERROR_MESSAGES, UPLOAD_CONFIG } from '../utils/constants';
import { FILE_RULES } from '../utils/fileRules';

export interface FileUploadState {
  file: File | null;
  isDragActive: boolean;
  isDragReject: boolean;
  error: string | null;
  isValid: boolean;
}

export interface UseFileUploadOptions {
  onFileSelect?: (file: File) => void;
  onError?: (error: string) => void;
  maxFiles?: number;
  disabled?: boolean;
}

export interface UseFileUploadReturn extends FileUploadState {
  // Actions
  selectFile: (file: File) => void;
  clearFile: () => void;
  clearError: () => void;
  
  // Dropzone props
  getRootProps: DropzoneState['getRootProps'];
  getInputProps: DropzoneState['getInputProps'];
  
  // Computed
  fileSize: string;
  fileName: string;
  canUpload: boolean;
}

export const useFileUpload = (options: UseFileUploadOptions = {}): UseFileUploadReturn => {
  const { onFileSelect, onError, maxFiles = UPLOAD_CONFIG.MAX_FILES, disabled = false } = options;
  
  const [state, setState] = useState<FileUploadState>({
    file: null,
    isDragActive: false,
    isDragReject: false,
    error: null,
    isValid: false,
  });


  const validateAndSetFile = useCallback((file: File) => {
    const validation = validateAudioFile(file);
    
    setState(prev => ({
      ...prev,
      file: validation.isValid ? file : null,
      error: validation.error || null,
      isValid: validation.isValid,
    }));

    if (validation.isValid) {
      onFileSelect?.(file);
    } else {
      onError?.(validation.error || ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  }, [onFileSelect, onError]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (disabled) return;

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      // Use the actual error message from the validator if available
      const firstError = rejection.errors[0];
      const errorMessage = firstError?.message || ERROR_MESSAGES.INVALID_FORMAT;

      setState(prev => ({
        ...prev,
        error: errorMessage,
        isValid: false,
        file: null,
      }));
      
      onError?.(errorMessage);
      return;
    }

    // Handle accepted files
    if (acceptedFiles.length > 0) {
      validateAndSetFile(acceptedFiles[0]);
    }
  }, [disabled, validateAndSetFile, onError]);

  const onDragEnter = useCallback(() => {
    if (disabled) return;
    setState(prev => ({ ...prev, isDragActive: true }));
  }, [disabled]);

  const onDragLeave = useCallback(() => {
    setState(prev => ({ ...prev, isDragActive: false, isDragReject: false }));
  }, []);

  const onDragOver = useCallback((event: DragEvent<HTMLElement>) => {
    if (disabled) return;
    event.preventDefault();
  }, [disabled]);

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    const rejection = fileRejections[0];
    // Use the actual error message from the validator if available
    const firstError = rejection.errors[0];
    const errorMessage = firstError?.message || ERROR_MESSAGES.INVALID_FORMAT;

    setState(prev => ({ 
      ...prev, 
      isDragReject: true, 
      error: errorMessage 
    }));
    onError?.(errorMessage);
  }, [onError]);

  const validator = useCallback((file: File) => {
    const validation = validateAudioFile(file);
    if (validation.isValid) {
      return null;
    }
    return {
      code: 'audio-validation-failed',
      message: validation.error ?? ERROR_MESSAGES.UNKNOWN_ERROR,
    };
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDropRejected,
    accept: FILE_RULES.dropzoneAccept,
    validator,
    maxFiles,
    // Don't use maxSize here - let validator handle it to allow files exactly at limit
    disabled,
    noClick: disabled,
    noKeyboard: disabled,
  });

  const selectFile = useCallback((file: File) => {
    if (disabled) return;
    validateAndSetFile(file);
  }, [disabled, validateAndSetFile]);

  const clearFile = useCallback(() => {
    setState(prev => ({
      ...prev,
      file: null,
      error: null,
      isValid: false,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Computed values
  const fileSize = state.file ? formatFileSize(state.file.size) : '';
  const fileName = state.file?.name || '';
  const canUpload = state.isValid && !!state.file && !disabled;

  return {
    ...state,
    selectFile,
    clearFile,
    clearError,
    getRootProps,
    getInputProps,
    fileSize,
    fileName,
    canUpload,
  };
};

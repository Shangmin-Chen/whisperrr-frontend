/**
 * Drag-and-drop audio upload: validation and UI state live in `useFileUpload`;
 * supported formats and size come from `../utils/fileRules`.
 */

import React from 'react';
import { useFileUpload } from '../../hooks/useFileUpload';
import { Button } from '../common/Button';
import { Upload, FileAudio, X, AlertCircle, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { getFileTypeDisplayName, formatFileSize } from '../../utils/fileValidation';
import { FILE_RULES, getUploadSupportsCaption } from '../../utils/fileRules';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  disabled = false,
  className,
}) => {
  const {
    file,
    isDragActive,
    isDragReject,
    error,
    isValid,
    getRootProps,
    getInputProps,
    fileSize,
    fileName,
    clearFile,
    clearError,
  } = useFileUpload({
    onFileSelect,
    disabled,
  });

  const handleClearFile = () => {
    clearFile();
    clearError();
  };

  return (
    <div className={clsx('w-full', className)}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={clsx(
          'relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer',
          {
            // Default state
            'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20': 
              !isDragActive && !isDragReject && !file,
            
            // Drag active state
            'border-blue-400 bg-blue-50 dark:bg-blue-900/20': isDragActive && !isDragReject,
            
            // Drag reject state
            'border-red-400 bg-red-50 dark:bg-red-900/20': isDragReject,
            
            // File selected state
            'border-green-400 bg-green-50 dark:bg-green-900/20': file && isValid,
            
            // Disabled state
            'opacity-50 cursor-not-allowed': disabled,
          }
        )}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          {/* Icon */}
          <div className="flex justify-center">
            {file && isValid ? (
              <CheckCircle className="h-12 w-12 text-green-500" />
            ) : isDragReject ? (
              <AlertCircle className="h-12 w-12 text-red-500" />
            ) : (
              <Upload className="h-12 w-12 text-gray-400" />
            )}
          </div>
          
          {/* Text Content */}
          <div className="space-y-2">
            {file && isValid ? (
              <>
                <h3 className="text-lg font-medium text-green-700 dark:text-green-300">
                  File Ready
                </h3>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {fileName} ({fileSize})
                </p>
              </>
            ) : isDragReject ? (
              <>
                <h3 className="text-lg font-medium text-red-700 dark:text-red-300">
                  Invalid File
                </h3>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Please select a valid audio file
                </p>
              </>
            ) : isDragActive ? (
              <>
                <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300">
                  Drop your audio file here
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Release to upload
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  Upload Audio File
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Drag and drop your audio file here, or click to browse
                </p>
              </>
            )}
          </div>
          
          {/* Supported Formats */}
          {!file && (
            <div className="text-xs text-gray-400 dark:text-gray-500">
              {getUploadSupportsCaption(formatFileSize(FILE_RULES.maxFileSizeBytes))}
            </div>
          )}
        </div>
      </div>
      
      {/* File Details */}
      {file && isValid && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileAudio className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  {fileName}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {getFileTypeDisplayName(file.type)} • {fileSize}
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFile}
              className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

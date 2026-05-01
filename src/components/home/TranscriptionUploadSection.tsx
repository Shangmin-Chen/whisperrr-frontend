import React from 'react';
import { FileUpload } from '../upload/FileUpload';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';
import { ModelSelector } from '../common/ModelSelector';
import { LanguageSelector } from '../common/LanguageSelector';
import type { WhisperModelSize } from '../../types/transcription';

export interface TranscriptionUploadSectionProps {
  selectedFile: File | null;
  selectedModel: WhisperModelSize;
  selectedLanguage: string;
  onFileSelect: (file: File) => void;
  onLanguageChange: (code: string) => void;
  onModelChange: (model: WhisperModelSize) => void;
  onTranscribe: () => void;
  onChooseDifferentFile: () => void;
  isTranscribing: boolean;
  progress: number;
  statusMessage: string | null;
  error: string | null;
}

export const TranscriptionUploadSection: React.FC<TranscriptionUploadSectionProps> = ({
  selectedFile,
  selectedModel,
  selectedLanguage,
  onFileSelect,
  onLanguageChange,
  onModelChange,
  onTranscribe,
  onChooseDifferentFile,
  isTranscribing,
  progress,
  statusMessage,
  error,
}) => (
  <div className="max-w-3xl mx-auto">
    <div className="card p-8 lg:p-10 shadow-xl">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Upload Your Audio</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Drag and drop your audio file or click to browse
          </p>
        </div>

        <FileUpload onFileSelect={onFileSelect} disabled={isTranscribing} />

        {selectedFile && (
          <div className="transition-all duration-200 space-y-6">
            <LanguageSelector
              language={selectedLanguage}
              onLanguageChange={onLanguageChange}
              disabled={isTranscribing}
            />
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={onModelChange}
              disabled={isTranscribing}
            />
          </div>
        )}

        {selectedFile && !isTranscribing && (
          <div className="space-y-4 pt-2">
            <div className="flex justify-center">
              <Button
                onClick={onTranscribe}
                size="lg"
                className="w-full md:w-auto px-8 py-3 text-lg"
              >
                Transcribe Audio
              </Button>
            </div>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={onChooseDifferentFile}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                Choose Different File
              </Button>
            </div>
          </div>
        )}

        {isTranscribing && (
          <div className="space-y-4">
            <ProgressBar
              progress={progress}
              message={statusMessage || 'Processing...'}
              showPercentage={true}
            />
          </div>
        )}

        {error && (
          <div className="p-5 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-sm text-red-700 dark:text-red-300 text-center font-medium">{error}</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

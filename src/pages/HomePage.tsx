/**
 * Home Page Component for audio transcription workflow.
 *
 * This is the main page component that orchestrates the complete transcription
 * workflow including file upload, model selection, transcription execution,
 * progress tracking, and results display.
 *
 * Features:
 * - File upload with drag-and-drop support
 * - Language / translation mode (auto-detect, transcribe in language, or translate to English)
 * - Real-time progress tracking
 * - Transcription results display
 * - Error handling and user feedback
 *
 * @author shangmin
 * @version 1.0
 * @since 2024
 */

import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import { ResultsView } from '../components/results/ResultsView';
import { DemoNotice } from '../components/common/DemoNotice';
import { LandingHero } from '../components/home/LandingHero';
import { FeatureHighlights } from '../components/home/FeatureHighlights';
import { TranscriptionUploadSection } from '../components/home/TranscriptionUploadSection';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { useTranscription } from '../hooks/useTranscription';
import { WhisperModelSize } from '../types/transcription';
import { resolveTranscriptionRequest } from '../utils/transcriptionParams';
import { ArrowLeft } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState<WhisperModelSize>('base');
  const [selectedLanguage, setSelectedLanguage] = useState('auto');

  const {
    transcribeAudio,
    transcriptionResult,
    isTranscribing,
    isCompleted,
    error,
    progress,
    statusMessage,
    clearError,
    reset,
  } = useTranscription();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    clearError();
  };

  const handleTranscribe = async () => {
    if (!selectedFile) return;
    try {
      const { language, task } = resolveTranscriptionRequest(selectedLanguage);
      await transcribeAudio(selectedFile, selectedModel, language, task);
    } catch {
      // Errors are handled by useTranscription hook which updates error state
    }
  };

  const handleStartOver = () => {
    setSelectedFile(null);
    reset();
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <DemoNotice />

      {isCompleted && transcriptionResult ? (
        <div className="space-y-6">
          <div className="flex justify-center">
            <Button
              onClick={handleStartOver}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Transcribe Another File
            </Button>
          </div>

          <ResultsView result={transcriptionResult} />
        </div>
      ) : (
        <>
          <LandingHero />
          <FeatureHighlights />
          <TranscriptionUploadSection
            selectedFile={selectedFile}
            selectedModel={selectedModel}
            selectedLanguage={selectedLanguage}
            onFileSelect={handleFileSelect}
            onLanguageChange={(code) => {
              setSelectedLanguage(code);
              clearError();
            }}
            onModelChange={setSelectedModel}
            onTranscribe={handleTranscribe}
            onChooseDifferentFile={handleStartOver}
            isTranscribing={isTranscribing}
            progress={progress}
            statusMessage={statusMessage}
            error={error}
          />
          <HowItWorksSection />
        </>
      )}
    </div>
  );
};

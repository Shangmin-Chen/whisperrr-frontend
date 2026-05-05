/**
 * Main App component for the Whisperrr audio transcription platform.
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Github } from 'lucide-react';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Loading } from './components/common/Loading';
import { useAuth } from './contexts/AuthContext';
import { LoginScreen } from './pages/LoginScreen';
import { HomePage } from './pages/HomePage';
import './App.css';

function AppContent() {
  const { session, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen text="Loading session…" />;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <LoginScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">🎤 Whisperrr</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            AI-powered audio transcription platform
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="text-center mt-12 text-gray-500 dark:text-gray-400">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center gap-2">
              <a
                href="https://github.com/Shangmin-Chen/Whisperrr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                aria-label="GitHub Repository"
              >
                <Github className="h-5 w-5" />
                <span className="font-medium">GitHub Repository</span>
              </a>
            </div>
            <p className="text-sm">
              &copy; 2025 Whisperrr. Powered by{' '}
              <a
                href="https://github.com/guillaumekln/faster-whisper"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                faster-whisper
              </a>
              .
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;

import React from 'react';
import { Mic } from 'lucide-react';

export const LandingHero: React.FC = () => (
  <div className="text-center space-y-8 pt-8">
    <div className="flex justify-center">
      <div className="p-5 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl shadow-lg">
        <Mic className="h-16 w-16 text-blue-600 dark:text-blue-400" />
      </div>
    </div>

    <div className="space-y-4">
      <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white tracking-tight">
        Transform Audio to Text
        <span className="block text-blue-600 dark:text-blue-400 mt-2">Instantly</span>
      </h1>

      <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
        Upload your audio files and get accurate transcriptions with segment-level timestamps.
        Powered by advanced AI transcription technology.
      </p>
    </div>
  </div>
);

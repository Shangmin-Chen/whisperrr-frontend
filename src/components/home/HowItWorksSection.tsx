import React from 'react';

export const HowItWorksSection: React.FC = () => (
  <div className="max-w-5xl mx-auto pb-8">
    <div className="card p-8 lg:p-10">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
        How it works
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Upload Audio</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Select your audio file using drag & drop or file browser
          </p>
        </div>

        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">2</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">AI Processing</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Our AI transcribes your audio with segment-level timestamps
          </p>
        </div>

        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">3</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">View Results</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            See your transcription with timestamps and quality metrics
          </p>
        </div>
      </div>
    </div>
  </div>
);

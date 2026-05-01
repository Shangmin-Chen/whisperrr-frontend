import React from 'react';
import { Upload, Zap, Shield } from 'lucide-react';
import { FILE_RULES, getFeatureFormatsBlurb } from '../../utils/fileRules';
import { formatFileSize } from '../../utils/fileValidation';

export const FeatureHighlights: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
    <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-center mb-5">
        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl">
          <Zap className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Instant Results</h3>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
        Get your transcriptions immediately with real-time progress tracking
      </p>
    </div>

    <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-center mb-5">
        <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
          <Shield className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Secure & Private</h3>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
        Your files are processed securely and not stored permanently
      </p>
    </div>

    <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-center mb-5">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
          <Upload className="h-10 w-10 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Multiple Formats</h3>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
        {getFeatureFormatsBlurb(formatFileSize(FILE_RULES.maxFileSizeBytes))}
      </p>
    </div>
  </div>
);

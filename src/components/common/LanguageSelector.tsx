/**
 * Language Selector Component for choosing transcription / translation behavior.
 */

import React from 'react';
import { AVAILABLE_LANGUAGES } from '../../data/languages.catalog';
import { Info, Languages } from 'lucide-react';

interface LanguageSelectorProps {
  /** Selected language mode: auto, or ISO 639-1 code (en triggers translate-to-English) */
  language: string;

  onLanguageChange: (language: string) => void;

  disabled?: boolean;

  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  language,
  onLanguageChange,
  disabled = false,
  className = '',
}) => {
  const langInfo = AVAILABLE_LANGUAGES.find((lang) => lang.code === language);

  const helpText =
    language === 'auto'
      ? 'The model will detect the spoken language and transcribe it in that language.'
      : language === 'en'
        ? 'Non-English speech is translated to English text (Whisper translate task).'
        : `Transcription is constrained to ${langInfo?.name ?? language} for better accuracy.`;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Languages className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Language
        </label>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
          Transcription mode
        </label>

        <div className="relative">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            disabled={disabled}
            className={`
              w-full px-4 py-2 pr-10
              bg-white dark:bg-gray-800
              border border-gray-300 dark:border-gray-600
              rounded-lg
              text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              appearance-none
              cursor-pointer
            `}
          >
            {AVAILABLE_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {formatLanguageOptionLabel(lang)}
              </option>
            ))}
          </select>

          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">
            {langInfo?.name ?? language}
          </p>
          <p className="text-blue-600 dark:text-blue-400">{helpText}</p>
        </div>
      </div>
    </div>
  );
};

function formatLanguageOptionLabel(lang: { code: string; name: string }): string {
  if (lang.code === 'auto') {
    return `${lang.name} (recommended)`;
  }
  return lang.name;
}

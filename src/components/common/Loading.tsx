// Loading Component

import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  className,
  fullScreen = false,
}) => {
  const spinner = (
    <div className={clsx('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className={clsx('animate-spin text-blue-600', sizeClasses[size])} />
        {text && (
          <p className="text-sm text-gray-600 dark:text-gray-300 animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Loading overlay for specific containers
export const LoadingOverlay: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
}> = ({ isLoading, children, text }) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <Loading text={text} />
        </div>
      )}
    </div>
  );
};

// Skeleton loading components
export const Skeleton: React.FC<{
  className?: string;
  lines?: number;
}> = ({ className, lines = 1 }) => {
  if (lines === 1) {
    return (
      <div className={clsx('animate-pulse bg-gray-200 dark:bg-gray-700 rounded', className)} />
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            'animate-pulse bg-gray-200 dark:bg-gray-700 rounded',
            i === lines - 1 ? 'w-3/4' : 'w-full',
            className
          )}
        />
      ))}
    </div>
  );
};

// Card skeleton
export const CardSkeleton: React.FC = () => {
  return (
    <div className="card p-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
        </div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24" />
      </div>
    </div>
  );
};

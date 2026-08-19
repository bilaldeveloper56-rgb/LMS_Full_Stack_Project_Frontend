import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this content.',
  onRetry,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center rounded-lg border border-danger-200 bg-danger-50", className)}>
      <AlertTriangle className="h-10 w-10 text-danger-500 mb-3" />
      <h3 className="text-lg font-medium text-danger-700 mb-1">{title}</h3>
      <p className="text-sm text-danger-600 max-w-sm mb-5">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-500 disabled:opacity-50 disabled:pointer-events-none bg-danger-600 text-white hover:bg-danger-700 h-9 px-4 py-2"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;

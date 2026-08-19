import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export const Spinner = ({ className, size = 24, ...props }) => {
  return (
    <Loader2 
      className={cn("animate-spin text-primary-500", className)} 
      size={size} 
      {...props} 
    />
  );
};

export const LoadingState = ({
  variant = 'spinner',
  message = 'Loading...',
  rows = 5,
  className
}) => {
  if (variant === 'skeleton') {
    return (
      <div className={cn("w-full space-y-3", className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 animate-pulse">
            <div className="h-12 w-12 rounded-md bg-surface-muted border border-border-muted"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-surface-muted rounded w-3/4 border border-border-muted"></div>
              <div className="h-3 bg-surface-muted rounded w-1/2 border border-border-muted"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      <Spinner size={32} className="mb-4" />
      {message && <p className="text-sm text-text-muted">{message}</p>}
    </div>
  );
};

export default LoadingState;

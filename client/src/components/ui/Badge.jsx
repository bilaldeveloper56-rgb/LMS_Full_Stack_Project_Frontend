import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Badge = forwardRef(({
  variant = 'neutral',
  size = 'md',
  dot = false,
  className,
  children,
  ...rest
}, ref) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';
  
  const variants = {
    neutral: 'bg-surface-muted text-text-secondary border border-border-muted',
    primary: 'bg-primary-50 text-primary-700 border border-primary-200',
    success: 'bg-success-50 text-success-700 border border-success-200',
    warning: 'bg-warning-50 text-warning-700 border border-warning-200',
    danger: 'bg-danger-50 text-danger-700 border border-danger-200',
    info: 'bg-info-50 text-info-700 border border-info-200',
  };

  const dotColors = {
    neutral: 'bg-text-muted',
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
    info: 'bg-info-500',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
  };

  return (
    <span
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {dot && (
        <span className={cn('mr-1.5 h-1.5 w-1.5 rounded-full', dotColors[variant])} aria-hidden="true" />
      )}
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

export { Badge };
export default Badge;

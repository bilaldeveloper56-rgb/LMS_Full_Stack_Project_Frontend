import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Input = forwardRef(({
  label,
  helperText,
  error,
  id,
  className,
  type = 'text',
  ...rest
}, ref) => {
  const generatedId = React.useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className={cn('flex flex-col w-full', className)}>
      {label && (
        <label htmlFor={inputId} className="mb-1 text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary transition-base',
          'placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-danger-500 focus:ring-danger-500'
        )}
        aria-invalid={!!error}
        aria-describedby={
          error ? errorId : helperText ? helperId : undefined
        }
        {...rest}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-danger-600">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={helperId} className="mt-1 text-sm text-text-muted">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
export default Input;

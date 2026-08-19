import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({
  label,
  helperText,
  error,
  id,
  className,
  options = [],
  placeholder,
  ...rest
}, ref) => {
  const generatedId = React.useId();
  const selectId = id || generatedId;
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;

  return (
    <div className={cn('flex flex-col w-full', className)}>
      {label && (
        <label htmlFor={selectId} className="mb-1 text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'flex h-10 w-full appearance-none rounded-md border border-border bg-surface px-3 py-2 pr-10 text-sm text-text-primary transition-base',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-danger-500 focus:ring-danger-500'
          )}
          aria-invalid={!!error}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          {...rest}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-text-muted pointer-events-none" />
      </div>
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

Select.displayName = 'Select';

export { Select };
export default Select;

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Textarea = forwardRef(({
  label,
  helperText,
  error,
  id,
  className,
  maxLength,
  value,
  defaultValue,
  onChange,
  ...rest
}, ref) => {
  const generatedId = React.useId();
  const textareaId = id || generatedId;
  const errorId = `${textareaId}-error`;
  const helperId = `${textareaId}-helper`;

  const [charCount, setCharCount] = React.useState(
    (value?.length || defaultValue?.length || 0)
  );

  const handleChange = (e) => {
    if (maxLength) {
      setCharCount(e.target.value.length);
    }
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className={cn('flex flex-col w-full', className)}>
      {label && (
        <label htmlFor={textareaId} className="mb-1 text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        maxLength={maxLength}
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary transition-base',
          'placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50 resize-y',
          error && 'border-danger-500 focus:ring-danger-500'
        )}
        aria-invalid={!!error}
        aria-describedby={
          error ? errorId : helperText ? helperId : undefined
        }
        {...rest}
      />
      <div className="flex justify-between items-start mt-1">
        <div className="flex-1">
          {error && (
            <p id={errorId} className="text-sm text-danger-600">
              {error}
            </p>
          )}
          {!error && helperText && (
            <p id={helperId} className="text-sm text-text-muted">
              {helperText}
            </p>
          )}
        </div>
        {maxLength && (
          <p className="text-xs text-text-muted ml-4 mt-0.5 whitespace-nowrap">
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };
export default Textarea;

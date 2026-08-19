import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Checkbox = forwardRef(({
  label,
  description,
  id,
  className,
  ...rest
}, ref) => {
  const generatedId = React.useId();
  const checkboxId = id || generatedId;
  const descriptionId = `${checkboxId}-desc`;

  return (
    <div className={cn('flex items-start', className)}>
      <div className="flex items-center h-5">
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          aria-describedby={description ? descriptionId : undefined}
          className="h-4 w-4 rounded border-border text-primary-600 focus:ring-ring focus:ring-offset-1 transition-base cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          {...rest}
        />
      </div>
      <div className="ml-3 text-sm">
        {label && (
          <label htmlFor={checkboxId} className="font-medium text-text-primary cursor-pointer">
            {label}
          </label>
        )}
        {description && (
          <p id={descriptionId} className="text-text-muted mt-0.5">
            {description}
          </p>
        )}
      </div>
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export { Checkbox };
export default Checkbox;

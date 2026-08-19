import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

const Alert = forwardRef(({
  variant = 'info',
  title,
  children,
  onDismiss,
  className,
  ...rest
}, ref) => {
  const variants = {
    info: 'bg-info-50 border-info-200 text-info-800',
    success: 'bg-success-50 border-success-200 text-success-800',
    warning: 'bg-warning-50 border-warning-200 text-warning-800',
    error: 'bg-danger-50 border-danger-200 text-danger-800',
  };

  const icons = {
    info: <Info className="h-5 w-5 text-info-500" />,
    success: <CheckCircle className="h-5 w-5 text-success-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning-500" />,
    error: <XCircle className="h-5 w-5 text-danger-500" />,
  };

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        'relative w-full rounded-lg border p-4 flex items-start',
        variants[variant],
        className
      )}
      {...rest}
    >
      <div className="flex-shrink-0 mr-3 mt-0.5">
        {icons[variant]}
      </div>
      <div className="flex-1">
        {title && (
          <h5 className="font-medium mb-1 leading-none tracking-tight">
            {title}
          </h5>
        )}
        <div className="text-sm opacity-90">
          {children}
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 ml-3 -mt-1 -mr-1 p-1 rounded-md opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring transition-base"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});

Alert.displayName = 'Alert';

export { Alert };
export default Alert;

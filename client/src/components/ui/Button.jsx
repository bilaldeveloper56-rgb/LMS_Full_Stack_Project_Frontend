import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className,
  children,
  type = 'button',
  ...rest
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm',
    secondary: 'bg-primary-50 text-primary-700 hover:bg-primary-100 active:bg-primary-200',
    outline: 'border border-border bg-transparent hover:bg-surface-muted text-text-primary',
    ghost: 'bg-transparent hover:bg-surface-muted text-text-primary',
    danger: 'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800 shadow-sm',
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {isLoading && <Spinner className="mr-2" size="sm" />}
      {!isLoading && LeftIcon && <LeftIcon className="mr-2 h-4 w-4" aria-hidden="true" />}
      {children}
      {!isLoading && RightIcon && <RightIcon className="ml-2 h-4 w-4" aria-hidden="true" />}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
export default Button;

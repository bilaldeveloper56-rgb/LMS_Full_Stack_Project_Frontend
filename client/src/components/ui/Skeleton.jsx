import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Skeleton = forwardRef(({ 
  className, 
  variant = 'rectangular',
  width,
  height,
  ...rest 
}, ref) => {
  const variants = {
    rectangular: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded-md h-4',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'animate-skeleton bg-surface-muted',
        variants[variant],
        className
      )}
      style={{ width, height }}
      {...rest}
    />
  );
});

Skeleton.displayName = 'Skeleton';

export { Skeleton };
export default Skeleton;

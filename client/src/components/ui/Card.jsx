import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const CardBase = forwardRef(({ className, children, ...rest }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('rounded-lg border border-border bg-surface text-text-primary shadow-xs', className)}
      {...rest}
    >
      {children}
    </div>
  );
});
CardBase.displayName = 'Card';

const CardHeader = forwardRef(({ className, children, ...rest }, ref) => {
  return (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...rest}>
      {children}
    </div>
  );
});
CardHeader.displayName = 'Card.Header';

const CardBody = forwardRef(({ className, children, ...rest }, ref) => {
  return (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...rest}>
      {children}
    </div>
  );
});
CardBody.displayName = 'Card.Body';

const CardFooter = forwardRef(({ className, children, ...rest }, ref) => {
  return (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...rest}>
      {children}
    </div>
  );
});
CardFooter.displayName = 'Card.Footer';

export const Card = Object.assign(CardBase, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});

export default Card;

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = forwardRef(({ items = [], className, ...rest }, ref) => {
  return (
    <nav ref={ref} aria-label="Breadcrumb" className={cn('flex', className)} {...rest}>
      <ol className="flex items-center space-x-2 text-sm text-text-muted">
        <li>
          <a href="/" className="hover:text-primary-600 transition-base flex items-center">
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </a>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center space-x-2">
              <ChevronRight className="h-4 w-4 text-border" />
              {isLast ? (
                <span className="font-medium text-text-primary" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <a href={item.href} className="hover:text-primary-600 transition-base">
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});

Breadcrumb.displayName = 'Breadcrumb';

export { Breadcrumb };
export default Breadcrumb;

import React from 'react';
import { cn } from '@/lib/utils';
import { FileQuestion } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = FileQuestion,
  title = 'No results found',
  description = 'There is no data to display at this time.',
  action,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-border bg-surface-muted/50", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface mb-4 shadow-sm border border-border">
        <Icon className="h-6 w-6 text-text-muted" />
      </div>
      <h3 className="text-lg font-medium text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-muted max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;

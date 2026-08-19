import React from 'react';
import { Card, Skeleton } from '@/components/ui';

/**
 * Skeleton placeholder for dashboard loading states.
 */
export function DashboardSkeleton({ cardsCount = 4, sectionsCount = 2 }) {
  return (
    <div className="space-y-8 animate-pulse" aria-busy="true" aria-label="Loading dashboard metrics">
      {Array.from({ length: sectionsCount }).map((_, sIdx) => (
        <div key={sIdx} className="space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-20" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: cardsCount }).map((_, cIdx) => (
              <Card key={cIdx} className="p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton variant="circular" className="h-8 w-8" />
                </div>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32" />
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default DashboardSkeleton;

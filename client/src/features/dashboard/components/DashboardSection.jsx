import React from 'react';
import { cn } from '@/lib/utils';

const GRID_COLS = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

/**
 * Reusable Dashboard Section grouping cards and metrics.
 *
 * @param {object} props
 * @param {string} [props.title] - Section heading
 * @param {string} [props.subtitle] - Section subtext
 * @param {React.ReactNode} [props.actions] - Header action controls
 * @param {1|2|3|4} [props.columns=4] - Grid column count
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export function DashboardSection({
  title,
  subtitle,
  actions,
  columns = 4,
  className,
  children,
}) {
  return (
    <section className={cn('space-y-3', className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h2 className="text-base font-semibold text-text-primary tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-text-muted mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      <div className={cn('grid gap-4', GRID_COLS[columns] || GRID_COLS[4])}>
        {children}
      </div>
    </section>
  );
}

export default DashboardSection;

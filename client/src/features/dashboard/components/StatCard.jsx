import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const VARIANT_STYLES = {
  primary: {
    bg: 'bg-primary-50',
    iconText: 'text-primary-600',
  },
  success: {
    bg: 'bg-success-50',
    iconText: 'text-success-600',
  },
  warning: {
    bg: 'bg-warning-50',
    iconText: 'text-warning-600',
  },
  danger: {
    bg: 'bg-danger-50',
    iconText: 'text-danger-600',
  },
  info: {
    bg: 'bg-info-50',
    iconText: 'text-info-600',
  },
  neutral: {
    bg: 'bg-surface-muted',
    iconText: 'text-text-muted',
  },
};

/**
 * Reusable Stat/Metric Card component.
 *
 * @param {object} props
 * @param {string} props.title - Metric title
 * @param {string|number} props.value - Main metric value
 * @param {React.ComponentType} [props.icon] - Lucide icon
 * @param {string} [props.description] - Subtext or detail
 * @param {'up'|'down'} [props.trend] - Direction of trend indicator
 * @param {string} [props.trendLabel] - Text label beside trend indicator
 * @param {'primary'|'success'|'warning'|'danger'|'info'|'neutral'} [props.variant='primary'] - Theme color
 * @param {string} [props.className]
 */
export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendLabel,
  variant = 'primary',
  className,
}) {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;

  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-lg p-5 shadow-xs hover:border-border-muted transition-colors duration-150 flex flex-col justify-between',
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            {title}
          </span>
          {Icon && (
            <div
              className={cn(
                'w-9 h-9 rounded-md flex items-center justify-center shrink-0',
                styles.bg
              )}
            >
              <Icon className={cn('w-5 h-5', styles.iconText)} aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="text-2xl font-bold text-text-primary tracking-tight">
          {value ?? '—'}
        </div>
      </div>

      {(description || trendLabel) && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {trend && (
            <span
              className={cn(
                'inline-flex items-center font-medium',
                trend === 'up' ? 'text-success-600' : 'text-danger-600'
              )}
            >
              {trend === 'up' ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
            </span>
          )}
          {trendLabel && (
            <span
              className={cn(
                'font-medium',
                trend === 'up'
                  ? 'text-success-600'
                  : trend === 'down'
                  ? 'text-danger-600'
                  : 'text-text-muted'
              )}
            >
              {trendLabel}
            </span>
          )}
          {description && <span className="text-text-muted truncate">{description}</span>}
        </div>
      )}
    </div>
  );
}

export default StatCard;

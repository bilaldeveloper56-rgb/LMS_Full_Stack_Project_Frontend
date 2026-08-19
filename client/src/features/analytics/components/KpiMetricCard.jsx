import React from 'react';
import { Card } from '@/components/ui';

const ACCENT_COLORS = {
  primary: {
    iconBg: 'bg-primary-50 text-primary-700',
    border: 'border-primary-200',
    progress: 'bg-primary-600',
  },
  success: {
    iconBg: 'bg-success-50 text-success-700',
    border: 'border-success-200',
    progress: 'bg-success-600',
  },
  warning: {
    iconBg: 'bg-warning-50 text-warning-700',
    border: 'border-warning-200',
    progress: 'bg-warning-600',
  },
  danger: {
    iconBg: 'bg-danger-50 text-danger-700',
    border: 'border-danger-200',
    progress: 'bg-danger-600',
  },
  neutral: {
    iconBg: 'bg-surface-muted text-text-secondary',
    border: 'border-border',
    progress: 'bg-text-secondary',
  },
};

/**
 * KpiMetricCard component.
 * @param {object} props
 * @param {string} props.title
 * @param {string|number} props.value
 * @param {string} [props.subtitle]
 * @param {React.ElementType} [props.icon]
 * @param {'primary'|'success'|'warning'|'danger'|'neutral'} [props.accent='primary']
 * @param {number} [props.percentage]
 */
export function KpiMetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = 'primary',
  percentage,
}) {
  const colors = ACCENT_COLORS[accent] || ACCENT_COLORS.primary;

  return (
    <Card className="p-5 border border-border bg-surface shadow-2xs hover:shadow-xs transition-all space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
            {title}
          </span>
          <div className="text-2xl font-black text-text-primary tracking-tight">
            {value}
          </div>
        </div>

        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {percentage !== undefined && (
        <div className="space-y-1.5 pt-1">
          <div className="w-full h-2 bg-surface-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${colors.progress}`}
              style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-text-muted">
            <span>Rate</span>
            <span className="font-bold text-text-primary">{percentage}%</span>
          </div>
        </div>
      )}

      {subtitle && (
        <p className="text-xs text-text-secondary line-clamp-1 pt-0.5">
          {subtitle}
        </p>
      )}
    </Card>
  );
}

export default KpiMetricCard;

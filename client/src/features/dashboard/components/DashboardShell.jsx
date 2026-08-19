import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button, Badge } from '@/components/ui';

/**
 * Standardized Dashboard Page Shell wrapper.
 *
 * @param {object} props
 * @param {string} props.title - Dashboard title
 * @param {string} [props.subtitle] - Contextual description
 * @param {string} [props.roleLabel] - Badge role label (e.g. 'School Admin', 'Super Admin')
 * @param {Function} [props.onRefresh] - Trigger query refetch
 * @param {boolean} [props.isRefreshing] - Refetch in-flight state
 * @param {React.ReactNode} [props.actions] - Extra action buttons/filters
 * @param {React.ReactNode} props.children
 */
export function DashboardShell({
  title,
  subtitle,
  roleLabel,
  onRefresh,
  isRefreshing = false,
  actions,
  children,
}) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              {title}
            </h1>
            {roleLabel && (
              <Badge variant="info" size="sm">
                {roleLabel}
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-sm text-text-secondary">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {actions}

          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              isLoading={isRefreshing}
              leftIcon={RefreshCw}
              className="cursor-pointer"
            >
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {children}
    </div>
  );
}

export default DashboardShell;

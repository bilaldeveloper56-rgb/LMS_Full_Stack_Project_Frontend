import React from 'react';
import { Badge } from '@/components/ui';

const STATUS_CONFIG = {
  UPCOMING: { label: 'Upcoming', variant: 'info' },
  ACTIVE: { label: 'Active', variant: 'success' },
  COMPLETED: { label: 'Completed', variant: 'neutral' },
  ARCHIVED: { label: 'Archived', variant: 'neutral' },
};

/**
 * SessionStatusBadge component for displaying academic session status.
 *
 * @param {object} props
 * @param {string} props.status
 * @param {'sm'|'md'|'lg'} [props.size='sm']
 */
export function SessionStatusBadge({ status, size = 'sm' }) {
  const config = STATUS_CONFIG[status] || { label: status || 'Unknown', variant: 'neutral' };

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
}

export default SessionStatusBadge;

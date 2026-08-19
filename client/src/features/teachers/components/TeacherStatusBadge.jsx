import React from 'react';
import { Badge } from '@/components/ui';

const STATUS_CONFIG = {
  ACTIVE: { label: 'Active', variant: 'success' },
  ON_LEAVE: { label: 'On Leave', variant: 'warning' },
  SUSPENDED: { label: 'Suspended', variant: 'danger' },
  TERMINATED: { label: 'Terminated', variant: 'danger' },
  RESIGNED: { label: 'Resigned', variant: 'neutral' },
};

/**
 * TeacherStatusBadge component for displaying teacher employment status.
 *
 * @param {object} props
 * @param {string} props.status - Employment status enum
 * @param {'sm'|'md'|'lg'} [props.size='sm']
 */
export function TeacherStatusBadge({ status, size = 'sm' }) {
  const config = STATUS_CONFIG[status] || { label: status || 'Unknown', variant: 'neutral' };

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
}

export default TeacherStatusBadge;

import React from 'react';
import { Badge } from '@/components/ui';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', variant: 'warning' },
  APPROVED: { label: 'Approved', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'danger' },
  CANCELLED: { label: 'Cancelled', variant: 'neutral' },
};

/**
 * LeaveStatusBadge component for displaying leave lifecycle state.
 *
 * @param {object} props
 * @param {string} props.status
 * @param {'sm'|'md'|'lg'} [props.size='sm']
 */
export function LeaveStatusBadge({ status, size = 'sm' }) {
  const config = STATUS_CONFIG[status] || { label: status || 'Unknown', variant: 'neutral' };

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
}

export default LeaveStatusBadge;

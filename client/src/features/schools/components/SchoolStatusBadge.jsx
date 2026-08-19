import React from 'react';
import { Badge } from '@/components/ui';

const STATUS_CONFIG = {
  ACTIVE: { label: 'Active', variant: 'success' },
  PENDING: { label: 'Pending Setup', variant: 'warning' },
  SUSPENDED: { label: 'Suspended', variant: 'danger' },
  INACTIVE: { label: 'Inactive / Archived', variant: 'neutral' },
};

/**
 * SchoolStatusBadge component.
 * @param {object} props
 * @param {string} props.status
 */
export function SchoolStatusBadge({ status = 'ACTIVE' }) {
  const config = STATUS_CONFIG[status] || { label: status, variant: 'neutral' };

  return (
    <Badge variant={config.variant} size="sm">
      {config.label}
    </Badge>
  );
}

export default SchoolStatusBadge;

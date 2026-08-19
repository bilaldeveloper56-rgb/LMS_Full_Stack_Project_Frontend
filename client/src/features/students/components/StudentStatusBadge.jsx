import React from 'react';
import { Badge } from '@/components/ui';

const STATUS_CONFIG = {
  ACTIVE: { label: 'Active', variant: 'success' },
  INACTIVE: { label: 'Inactive', variant: 'neutral' },
  GRADUATED: { label: 'Graduated', variant: 'info' },
  TRANSFERRED: { label: 'Transferred', variant: 'warning' },
  EXPELLED: { label: 'Expelled', variant: 'danger' },
};

/**
 * Status badge component for Student Enrollment Status.
 *
 * @param {object} props
 * @param {string} props.status - Status enum value
 * @param {'sm'|'md'|'lg'} [props.size='sm']
 */
export function StudentStatusBadge({ status, size = 'sm' }) {
  const config = STATUS_CONFIG[status] || { label: status || 'Unknown', variant: 'neutral' };

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
}

export default StudentStatusBadge;

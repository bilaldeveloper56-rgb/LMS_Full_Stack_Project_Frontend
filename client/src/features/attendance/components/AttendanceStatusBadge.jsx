import React from 'react';
import { Badge } from '@/components/ui';

const STATUS_CONFIG = {
  PRESENT: { label: 'Present', variant: 'success' },
  ABSENT: { label: 'Absent', variant: 'danger' },
  LATE: { label: 'Late', variant: 'warning' },
  HALF_DAY: { label: 'Half Day', variant: 'info' },
  EXCUSED: { label: 'Excused', variant: 'primary' },
  LEAVE: { label: 'On Leave', variant: 'neutral' },
};

/**
 * AttendanceStatusBadge component for displaying student attendance state.
 *
 * @param {object} props
 * @param {string} props.status
 * @param {'sm'|'md'|'lg'} [props.size='sm']
 */
export function AttendanceStatusBadge({ status, size = 'sm' }) {
  const config = STATUS_CONFIG[status] || { label: status || 'Unknown', variant: 'neutral' };

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
}

export default AttendanceStatusBadge;

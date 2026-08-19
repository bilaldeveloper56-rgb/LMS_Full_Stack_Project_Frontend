import React from 'react';
import { Badge } from '@/components/ui';

const TYPE_CONFIG = {
  SICK: 'Sick Leave',
  CASUAL: 'Casual Leave',
  EMERGENCY: 'Emergency',
  MEDICAL: 'Medical',
  MATERNITY: 'Maternity',
  PATERNITY: 'Paternity',
  OTHER: 'Other',
};

/**
 * LeaveTypeBadge component for rendering leave category tag.
 *
 * @param {object} props
 * @param {string} props.leaveType
 * @param {'sm'|'md'|'lg'} [props.size='sm']
 */
export function LeaveTypeBadge({ leaveType, size = 'sm' }) {
  const label = TYPE_CONFIG[leaveType] || leaveType || 'General';

  return (
    <Badge variant="neutral" size={size}>
      {label}
    </Badge>
  );
}

export default LeaveTypeBadge;

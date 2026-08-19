import React from 'react';
import { Badge } from '@/components/ui';

const STATUS_CONFIG = {
  SUBMITTED: { label: 'Submitted', variant: 'primary' },
  LATE: { label: 'Late', variant: 'warning' },
  GRADED: { label: 'Graded', variant: 'success' },
  RESUBMITTED: { label: 'Resubmitted', variant: 'info' },
};

/**
 * SubmissionStatusBadge component.
 *
 * @param {object} props
 * @param {string} props.status
 * @param {'sm'|'md'|'lg'} [props.size='sm']
 */
export function SubmissionStatusBadge({ status, size = 'sm' }) {
  const config = STATUS_CONFIG[status] || { label: status || 'Pending', variant: 'neutral' };

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
}

export default SubmissionStatusBadge;

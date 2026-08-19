import React from 'react';
import { Badge } from '@/components/ui';

const STATUS_CONFIG = {
  IN_PROGRESS: { label: 'In Progress', variant: 'warning' },
  SUBMITTED: { label: 'Submitted (Pending Review)', variant: 'primary' },
  EVALUATED: { label: 'Evaluated', variant: 'success' },
};

/**
 * AttemptStatusBadge component.
 *
 * @param {object} props
 * @param {string} props.status
 * @param {'sm'|'md'|'lg'} [props.size='sm']
 */
export function AttemptStatusBadge({ status, size = 'sm' }) {
  const config = STATUS_CONFIG[status] || { label: status || 'Pending', variant: 'neutral' };

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
}

export default AttemptStatusBadge;

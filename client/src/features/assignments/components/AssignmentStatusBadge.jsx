import React from 'react';
import { Badge } from '@/components/ui';

const STATUS_CONFIG = {
  DRAFT: { label: 'Draft', variant: 'neutral' },
  PUBLISHED: { label: 'Published', variant: 'success' },
  ARCHIVED: { label: 'Archived', variant: 'warning' },
};

/**
 * AssignmentStatusBadge component.
 *
 * @param {object} props
 * @param {string} props.status
 * @param {'sm'|'md'|'lg'} [props.size='sm']
 */
export function AssignmentStatusBadge({ status, size = 'sm' }) {
  const config = STATUS_CONFIG[status] || { label: status || 'Unknown', variant: 'neutral' };

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
}

export default AssignmentStatusBadge;

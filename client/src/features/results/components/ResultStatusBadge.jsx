import React from 'react';
import { Badge } from '@/components/ui';

const STATUS_CONFIG = {
  PUBLISHED: { label: 'Published', variant: 'success' },
  LOCKED: { label: 'Locked', variant: 'warning' },
  DRAFT: { label: 'Draft', variant: 'neutral' },
};

/**
 * ResultStatusBadge component.
 * @param {object} props
 * @param {boolean} [props.isPublished]
 * @param {boolean} [props.isLocked]
 */
export function ResultStatusBadge({ isPublished, isLocked }) {
  let status = 'DRAFT';
  if (isPublished) {
    status = 'PUBLISHED';
  } else if (isLocked) {
    status = 'LOCKED';
  }

  const config = STATUS_CONFIG[status];

  return (
    <Badge variant={config.variant} size="sm">
      {config.label}
    </Badge>
  );
}

export default ResultStatusBadge;

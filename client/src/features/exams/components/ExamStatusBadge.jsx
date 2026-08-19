import React from 'react';
import { Badge } from '@/components/ui';

const STATUS_CONFIG = {
  DRAFT: { label: 'Draft', variant: 'warning' },
  PUBLISHED: { label: 'Published', variant: 'success' },
  COMPLETED: { label: 'Completed', variant: 'info' },
  ARCHIVED: { label: 'Archived', variant: 'neutral' },
};

/**
 * ExamStatusBadge component.
 * @param {object} props
 * @param {string} props.status
 * @param {boolean} [props.isPublished]
 */
export function ExamStatusBadge({ status, isPublished }) {
  const effectiveStatus = isPublished ? 'PUBLISHED' : status || 'DRAFT';
  const config = STATUS_CONFIG[effectiveStatus] || { label: effectiveStatus, variant: 'neutral' };

  return (
    <Badge variant={config.variant} size="sm">
      {config.label}
    </Badge>
  );
}

export default ExamStatusBadge;

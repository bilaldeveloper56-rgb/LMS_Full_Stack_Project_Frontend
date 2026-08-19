import React from 'react';
import { Badge } from '@/components/ui';

const PRIORITY_CONFIG = {
  URGENT: { label: 'Urgent', variant: 'danger' },
  NORMAL: { label: 'Normal', variant: 'primary' },
  LOW: { label: 'Low', variant: 'neutral' },
};

/**
 * NoticePriorityBadge component.
 * @param {object} props
 * @param {string} props.priority
 */
export function NoticePriorityBadge({ priority = 'NORMAL' }) {
  const config = PRIORITY_CONFIG[priority] || { label: priority, variant: 'neutral' };

  return (
    <Badge variant={config.variant} size="sm">
      {config.label}
    </Badge>
  );
}

export default NoticePriorityBadge;

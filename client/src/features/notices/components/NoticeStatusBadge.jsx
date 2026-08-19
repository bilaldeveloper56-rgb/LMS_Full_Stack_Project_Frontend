import React from 'react';
import { Badge } from '@/components/ui';

/**
 * NoticeStatusBadge component.
 * @param {object} props
 * @param {boolean} props.isPublished
 */
export function NoticeStatusBadge({ isPublished }) {
  if (isPublished) {
    return (
      <Badge variant="success" size="sm">
        Published
      </Badge>
    );
  }

  return (
    <Badge variant="warning" size="sm">
      Draft
    </Badge>
  );
}

export default NoticeStatusBadge;

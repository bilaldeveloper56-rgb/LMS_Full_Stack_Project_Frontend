import React from 'react';
import { Badge } from '@/components/ui';

/**
 * Categorize event name into appropriate Badge variant.
 * @param {string} event
 */
function getEventBadgeVariant(event = '') {
  const upper = String(event).toUpperCase();

  if (upper.includes('DELETE') || upper.includes('FAILED') || upper.includes('FAILURE') || upper.includes('LOCKED')) {
    return 'danger';
  }
  if (upper.includes('CREATE') || upper.includes('SUCCESS') || upper.includes('PUBLISHED') || upper.includes('APPROVED')) {
    return 'success';
  }
  if (upper.includes('UPDATE') || upper.includes('EDIT') || upper.includes('MODIFIED')) {
    return 'primary';
  }
  if (upper.includes('AUTH') || upper.includes('LOGIN') || upper.includes('SECURITY') || upper.includes('LOGOUT')) {
    return 'warning';
  }
  return 'neutral';
}

/**
 * AuditEventBadge component.
 * @param {object} props
 * @param {string} props.event
 */
export function AuditEventBadge({ event = 'UNKNOWN_EVENT' }) {
  const variant = getEventBadgeVariant(event);

  return (
    <Badge variant={variant} size="sm" className="font-mono text-[11px] uppercase tracking-wide">
      {event}
    </Badge>
  );
}

export default AuditEventBadge;

import React from 'react';
import { Badge } from '@/components/ui';

const STATUS_CONFIG = {
  PAID: { label: 'Paid', variant: 'success' },
  PARTIALLY_PAID: { label: 'Partial', variant: 'warning' },
  UNPAID: { label: 'Unpaid', variant: 'danger' },
  OVERDUE: { label: 'Overdue', variant: 'danger' },
  CANCELLED: { label: 'Cancelled', variant: 'neutral' },
};

/**
 * InvoiceStatusBadge component.
 * @param {object} props
 * @param {string} props.status
 */
export function InvoiceStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status || 'Unpaid', variant: 'neutral' };

  return (
    <Badge variant={config.variant} size="sm">
      {config.label}
    </Badge>
  );
}

export default InvoiceStatusBadge;

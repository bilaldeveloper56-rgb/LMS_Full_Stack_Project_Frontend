import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, CreditCard, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

/**
 * FeeInvoicesTable component.
 * @param {object} props
 * @param {Array} props.invoices
 * @param {Function} [props.onRecordPayment]
 * @param {boolean} [props.isLoading=false]
 */
export function FeeInvoicesTable({
  invoices = [],
  onRecordPayment,
  isLoading = false,
}) {
  const { hasPermission } = useAuthorization();
  const canRecordPayment = hasPermission(PERMISSIONS.PAYMENTS_CREATE);

  if (isLoading) {
    return (
      <div className="p-8 space-y-3 animate-pulse" aria-busy="true">
        <div className="h-12 bg-surface-muted rounded-lg" />
        <div className="h-12 bg-surface-muted rounded-lg" />
        <div className="h-12 bg-surface-muted rounded-lg" />
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-text-muted bg-surface rounded-xl border border-border">
        No fee invoices found. Click "Generate Invoices" to issue new fee challans.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-2xs">
      <table className="w-full text-left text-xs">
        <thead className="bg-surface-muted/60 text-text-secondary border-b border-border font-semibold uppercase tracking-wider">
          <tr>
            <th className="p-3.5">Invoice / Challan #</th>
            <th className="p-3.5">Student & Class</th>
            <th className="p-3.5">Title</th>
            <th className="p-3.5">Total Amount</th>
            <th className="p-3.5">Balance Due</th>
            <th className="p-3.5">Due Date</th>
            <th className="p-3.5">Status</th>
            <th className="p-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {invoices.map((inv) => {
            const id = inv._id || inv.id;
            const student = inv.studentId || {};
            const studentName =
              student.firstName && student.lastName
                ? `${student.firstName} ${student.lastName}`
                : student.name || 'Student';
            const cls = inv.classId || student.classId || {};

            return (
              <tr key={id} className="hover:bg-surface-muted/40 transition-colors">
                {/* Invoice Number */}
                <td className="p-3.5">
                  <Link
                    to={`/fees/invoices/${id}`}
                    className="font-mono font-bold text-primary-700 hover:text-primary-800 transition-colors block"
                  >
                    {inv.invoiceNumber}
                  </Link>
                </td>

                {/* Student & Class */}
                <td className="p-3.5">
                  <div className="font-bold text-text-primary">{studentName}</div>
                  <span className="text-[11px] text-text-muted">{cls.name || 'Class'}</span>
                </td>

                {/* Title */}
                <td className="p-3.5 font-medium text-text-secondary">
                  {inv.title}
                </td>

                {/* Total */}
                <td className="p-3.5 font-bold text-text-primary">
                  {formatCurrency(inv.totalAmount)}
                </td>

                {/* Balance */}
                <td className="p-3.5 font-bold">
                  <span className={inv.balanceAmount > 0 ? 'text-danger-700' : 'text-success-700'}>
                    {formatCurrency(inv.balanceAmount)}
                  </span>
                </td>

                {/* Due Date */}
                <td className="p-3.5 text-text-secondary">
                  {formatDate(inv.dueDate)}
                </td>

                {/* Status */}
                <td className="p-3.5">
                  <InvoiceStatusBadge status={inv.status} />
                </td>

                {/* Actions */}
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {inv.balanceAmount > 0 && canRecordPayment && onRecordPayment && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-primary-600 hover:text-primary-700 px-2 py-0"
                        onClick={() => onRecordPayment(inv)}
                        leftIcon={CreditCard}
                      >
                        Pay
                      </Button>
                    )}

                    <Link to={`/fees/invoices/${id}`} title="View Challan" aria-label="View Challan">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="w-4 h-4 text-text-secondary" />
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default FeeInvoicesTable;

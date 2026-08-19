import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Eye, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

/**
 * FeeDefaultersTable component.
 * @param {object} props
 * @param {Array} props.defaulters
 * @param {Function} [props.onRecordPayment]
 * @param {boolean} [props.isLoading=false]
 */
export function FeeDefaultersTable({
  defaulters = [],
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
      </div>
    );
  }

  if (defaulters.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-text-muted bg-surface rounded-xl border border-border">
        No fee defaulters! All active invoices are currently in good standing.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-2xs">
      <table className="w-full text-left text-xs">
        <thead className="bg-surface-muted/60 text-text-secondary border-b border-border font-semibold uppercase tracking-wider">
          <tr>
            <th className="p-3.5">Student Name</th>
            <th className="p-3.5">Class & Section</th>
            <th className="p-3.5">Challan / Invoice #</th>
            <th className="p-3.5">Overdue Since</th>
            <th className="p-3.5">Outstanding Balance</th>
            <th className="p-3.5 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {defaulters.map((inv) => {
            const id = inv._id || inv.id;
            const student = inv.studentId || {};
            const studentName =
              student.firstName && student.lastName
                ? `${student.firstName} ${student.lastName}`
                : student.name || 'Student';
            const cls = inv.classId || student.classId || {};
            const section = inv.sectionId || student.sectionId || {};

            return (
              <tr key={id} className="hover:bg-surface-muted/40 transition-colors">
                {/* Student */}
                <td className="p-3.5 font-bold text-text-primary">
                  {studentName}
                </td>

                {/* Class */}
                <td className="p-3.5 text-text-secondary">
                  {cls.name || 'Class'} {section.name ? `(${section.name})` : ''}
                </td>

                {/* Invoice */}
                <td className="p-3.5">
                  <Link
                    to={`/fees/invoices/${id}`}
                    className="font-mono font-bold text-primary-700 hover:text-primary-800"
                  >
                    {inv.invoiceNumber}
                  </Link>
                </td>

                {/* Due Date */}
                <td className="p-3.5 text-danger-700 font-medium">
                  {formatDate(inv.dueDate)}
                </td>

                {/* Balance */}
                <td className="p-3.5 font-black text-danger-700 text-sm">
                  {formatCurrency(inv.balanceAmount)}
                </td>

                {/* Action */}
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {canRecordPayment && onRecordPayment && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-primary-600 hover:text-primary-700 px-2 py-0"
                        onClick={() => onRecordPayment(inv)}
                        leftIcon={CreditCard}
                      >
                        Collect Fee
                      </Button>
                    )}

                    <Link to={`/fees/invoices/${id}`}>
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

export default FeeDefaultersTable;

import React from 'react';
import { Badge } from '@/components/ui';
import { formatDate } from '@/lib/utils';

/**
 * FeeDefaultersReportTable component.
 * @param {object} props
 * @param {Array} props.defaulters
 * @param {boolean} [props.isLoading=false]
 */
export function FeeDefaultersReportTable({ defaulters = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="p-8 space-y-3 animate-pulse" aria-busy="true">
        <div className="h-12 bg-surface-muted rounded-lg" />
        <div className="h-12 bg-surface-muted rounded-lg" />
        <div className="h-12 bg-surface-muted rounded-lg" />
      </div>
    );
  }

  if (defaulters.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-text-muted bg-surface rounded-xl border border-border">
        No fee defaulters found! All student accounts meet the balance threshold.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-2xs">
      <table className="w-full text-left text-xs">
        <thead className="bg-surface-muted/70 text-text-secondary border-b border-border font-semibold uppercase tracking-wider">
          <tr>
            <th className="p-3.5">Invoice #</th>
            <th className="p-3.5">Student Name</th>
            <th className="p-3.5">Class & Section</th>
            <th className="p-3.5">Parent Contact</th>
            <th className="p-3.5 text-right">Invoiced</th>
            <th className="p-3.5 text-right">Paid</th>
            <th className="p-3.5 text-right">Balance Due</th>
            <th className="p-3.5 text-center">Due Date / Overdue</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {defaulters.map((item, idx) => {
            return (
              <tr key={item.invoiceId || idx} className="hover:bg-surface-muted/40 transition-colors">
                <td className="p-3.5 font-mono font-bold text-primary-700">
                  {item.invoiceNumber || '—'}
                </td>
                <td className="p-3.5">
                  <div className="font-bold text-text-primary">{item.studentName}</div>
                  <span className="text-[11px] text-text-muted font-mono">{item.admissionNumber}</span>
                </td>
                <td className="p-3.5 text-text-secondary">
                  {item.class} {item.section ? `(${item.section})` : ''}
                </td>
                <td className="p-3.5 text-text-muted">
                  {item.parentPhone || '—'}
                </td>
                <td className="p-3.5 text-right font-medium text-text-secondary">
                  ${item.totalAmount}
                </td>
                <td className="p-3.5 text-right font-bold text-success-700">
                  ${item.paidAmount}
                </td>
                <td className="p-3.5 text-right font-black text-danger-700 text-sm">
                  ${item.balanceAmount}
                </td>
                <td className="p-3.5 text-center">
                  <div className="text-[11px] text-text-secondary">{formatDate(item.dueDate)}</div>
                  {item.isOverdue && item.daysOverdue > 0 && (
                    <Badge variant="danger" size="sm" className="mt-0.5">
                      {item.daysOverdue} days overdue
                    </Badge>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default FeeDefaultersReportTable;

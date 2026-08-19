import React from 'react';
import { Printer, CheckCircle2, DollarSign, Calendar, User, CreditCard } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { formatDate, formatCurrency } from '@/lib/utils';

/**
 * InvoiceReceiptView component.
 * @param {object} props
 * @param {object} props.invoice
 */
export function InvoiceReceiptView({ invoice }) {
  if (!invoice) return null;

  const student = invoice.studentId || {};
  const studentUser = student.userId || {};
  const studentName =
    student.firstName && student.lastName
      ? `${student.firstName} ${student.lastName}`
      : studentUser.name || 'Student';

  const cls = invoice.classId || student.classId || {};
  const section = invoice.sectionId || student.sectionId || {};
  const items = invoice.items || [];
  const payments = invoice.payments || [];

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between no-print">
        <h2 className="text-base font-bold text-text-primary">Official Fee Challan & Receipt</h2>
        <Button
          variant="outline"
          size="sm"
          leftIcon={Printer}
          onClick={() => window.print()}
          className="text-xs"
        >
          Print Challan
        </Button>
      </div>

      {/* Printable Challan Sheet */}
      <Card className="p-8 space-y-6 border border-border bg-surface print:border-none print:shadow-none print:p-0">
        {/* Header */}
        <div className="border-b-2 border-primary-600 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary-700">
              Accounts & Fee Billing Division
            </span>
            <h1 className="text-2xl font-black text-text-primary mt-0.5">
              Fee Invoice & Receipt
            </h1>
            <p className="text-xs font-semibold text-text-secondary mt-0.5">
              {invoice.title || 'Student Fee Challan'}
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1.5">
            <InvoiceStatusBadge status={invoice.status} />
            <span className="text-xs font-bold text-text-primary">
              Challan #: <span className="font-mono text-primary-700">{invoice.invoiceNumber}</span>
            </span>
          </div>
        </div>

        {/* Student Demographics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-surface-muted/50 rounded-xl border border-border text-xs">
          <div>
            <span className="text-text-muted block text-[11px]">Student Name</span>
            <span className="font-bold text-text-primary text-sm">{studentName}</span>
          </div>

          <div>
            <span className="text-text-muted block text-[11px]">Roll / Admission No</span>
            <span className="font-semibold text-text-primary">
              {student.rollNumber || student.admissionNumber || '—'}
            </span>
          </div>

          <div>
            <span className="text-text-muted block text-[11px]">Class & Section</span>
            <span className="font-semibold text-text-primary">
              {cls.name || 'Class'} {section.name ? `(${section.name})` : ''}
            </span>
          </div>

          <div>
            <span className="text-text-muted block text-[11px]">Payment Due Date</span>
            <span className="font-bold text-danger-700">
              {formatDate(invoice.dueDate)}
            </span>
          </div>
        </div>

        {/* Fee Line Items Table */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-muted/70 text-text-secondary border-b border-border font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Fee Head / Description</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Original Amount</th>
                <th className="p-3.5">Discount</th>
                <th className="p-3.5 text-right">Net Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-text-muted">
                    No individual fee items listed.
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-surface-muted/40">
                    <td className="p-3.5 font-bold text-text-primary">
                      {item.name || 'Tuition Fee'}
                    </td>
                    <td className="p-3.5 text-text-secondary">
                      {item.categoryName || 'General'}
                    </td>
                    <td className="p-3.5 font-medium text-text-secondary">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="p-3.5 text-success-700">
                      {item.discount ? `-${formatCurrency(item.discount)}` : formatCurrency(0)}
                    </td>
                    <td className="p-3.5 font-bold text-text-primary text-right">
                      {formatCurrency(item.netAmount || (item.amount - (item.discount || 0)))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Financial Aggregates Breakdown */}
        <div className="flex flex-col sm:flex-row sm:justify-end">
          <div className="w-full sm:w-80 p-4 bg-surface-muted/30 rounded-xl border border-border space-y-2 text-xs">
            <div className="flex items-center justify-between text-text-secondary">
              <span>Subtotal:</span>
              <span className="font-semibold">{formatCurrency(invoice.subtotal ?? invoice.totalAmount)}</span>
            </div>

            {invoice.totalDiscount > 0 && (
              <div className="flex items-center justify-between text-success-700 font-semibold">
                <span>Concession / Discount:</span>
                <span>-{formatCurrency(invoice.totalDiscount)}</span>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border/80 pt-2 font-bold text-text-primary">
              <span>Total Invoiced:</span>
              <span>{formatCurrency(invoice.totalAmount)}</span>
            </div>

            <div className="flex items-center justify-between text-success-700 font-semibold">
              <span>Paid to Date:</span>
              <span>{formatCurrency(invoice.paidAmount ?? 0)}</span>
            </div>

            <div className="flex items-center justify-between border-t-2 border-primary-600 pt-2 text-sm font-black">
              <span className="text-text-primary">Outstanding Balance:</span>
              <span className="text-danger-700">{formatCurrency(invoice.balanceAmount ?? 0)}</span>
            </div>
          </div>
        </div>

        {/* Payment History Log (if any payments recorded) */}
        {payments.length > 0 && (
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-text-primary">Recorded Payment Transactions</h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-muted/60 text-text-secondary border-b border-border font-semibold">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Receipt #</th>
                    <th className="p-2.5">Method</th>
                    <th className="p-2.5">Amount Paid</th>
                    <th className="p-2.5">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.map((p, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 text-text-secondary">{formatDate(p.paymentDate || p.createdAt)}</td>
                      <td className="p-2.5 font-mono text-primary-700 font-bold">{p.receiptNumber || '—'}</td>
                      <td className="p-2.5 font-medium">{p.paymentMethod}</td>
                      <td className="p-2.5 font-bold text-success-700">{formatCurrency(p.amountPaid)}</td>
                      <td className="p-2.5 text-text-muted">{p.transactionReference || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Signatures Footer */}
        <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="border-t border-text-muted/40 pt-2">
            <span className="font-semibold text-text-secondary">Depositor / Parent Signature</span>
          </div>
          <div className="border-t border-text-muted/40 pt-2">
            <span className="font-semibold text-text-secondary">Authorized Cashier / School Seal</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default InvoiceReceiptView;

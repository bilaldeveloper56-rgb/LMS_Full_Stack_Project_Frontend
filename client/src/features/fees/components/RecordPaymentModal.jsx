import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, Input, Select, Textarea, Button, Badge } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { recordPaymentSchema, PAYMENT_METHODS } from '../schemas/fee.schema';
import { useRecordPayment } from '../hooks/useFees';

/**
 * RecordPaymentModal component.
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {object} props.invoice
 */
export function RecordPaymentModal({ isOpen, onClose, invoice }) {
  const recordPaymentMutation = useRecordPayment();

  const balanceAmount = invoice?.balanceAmount ?? 0;
  const student = invoice?.studentId || {};
  const studentName =
    student.firstName && student.lastName
      ? `${student.firstName} ${student.lastName}`
      : student.name || 'Student';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      invoiceId: invoice?._id || invoice?.id || '',
      amountPaid: balanceAmount,
      paymentMethod: 'CASH',
      transactionReference: '',
      remarks: '',
    },
  });

  useEffect(() => {
    if (invoice) {
      reset({
        invoiceId: invoice._id || invoice.id,
        amountPaid: invoice.balanceAmount,
        paymentMethod: 'CASH',
        transactionReference: '',
        remarks: '',
      });
    }
  }, [invoice, reset]);

  const handleFormSubmit = async (data) => {
    await recordPaymentMutation.mutateAsync({
      ...data,
      amountPaid: Number(data.amountPaid),
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Fee Payment"
      className="max-w-md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Invoice Summary Card */}
        <div className="p-3.5 bg-surface-muted/50 rounded-xl border border-border space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Invoice No:</span>
            <span className="font-bold text-text-primary">
              {invoice?.invoiceNumber || '—'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-text-muted">Student:</span>
            <span className="font-bold text-text-primary">{studentName}</span>
          </div>

          <div className="flex items-center justify-between border-t border-border/60 pt-2">
            <span className="text-text-muted">Total Amount:</span>
            <span className="font-semibold text-text-primary">
              {formatCurrency(invoice?.totalAmount ?? 0)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-text-muted">Already Paid:</span>
            <span className="font-semibold text-success-700">
              {formatCurrency(invoice?.paidAmount ?? 0)}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-border/60 pt-2 text-sm font-black">
            <span className="text-text-primary">Remaining Balance:</span>
            <span className="text-danger-700">{formatCurrency(balanceAmount)}</span>
          </div>
        </div>

        {/* Amount to Pay */}
        <Input
          label="Payment Amount (₨ / PKR) *"
          type="number"
          min={1}
          max={balanceAmount}
          step="any"
          error={errors.amountPaid?.message}
          {...register('amountPaid')}
        />

        {/* Payment Method */}
        <Select
          label="Payment Method *"
          options={PAYMENT_METHODS}
          error={errors.paymentMethod?.message}
          {...register('paymentMethod')}
        />

        {/* Reference */}
        <Input
          label="Transaction Ref / Cheque No"
          placeholder="e.g. TXN-948102 / CHQ-1049"
          error={errors.transactionReference?.message}
          {...register('transactionReference')}
        />

        {/* Remarks */}
        <Textarea
          label="Payment Remarks"
          placeholder="e.g. Received by school bursar"
          rows={2}
          error={errors.remarks?.message}
          {...register('remarks')}
        />

        <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={recordPaymentMutation.isPending}
          >
            Confirm Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default RecordPaymentModal;

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { Breadcrumb, Button } from '@/components/ui';
import { ErrorState, EmptyState } from '@/components/feedback';
import { InvoiceReceiptView } from '../components/InvoiceReceiptView';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import { useInvoice } from '../hooks/useFees';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

export function FeeInvoiceDetailsPage() {
  const { id } = useParams();
  const { hasPermission } = useAuthorization();
  const canRecordPayment = hasPermission(PERMISSIONS.PAYMENTS_CREATE);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { data: invoice, isLoading, isError, error, refetch } = useInvoice(id);

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl animate-pulse" aria-busy="true">
        <div className="h-6 w-48 bg-surface-muted rounded-md" />
        <div className="h-96 bg-surface-muted rounded-xl" />
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <ErrorState
        title="Failed to load invoice"
        message={error?.message || 'The requested fee invoice could not be found.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Fees', href: '/fees' },
          { label: invoice.invoiceNumber || 'Challan Details' },
        ]}
      />

      {/* Navigation & Payment Trigger */}
      <div className="flex items-center justify-between no-print">
        <Link to="/fees">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={ArrowLeft}
            className="text-xs"
          >
            Back to Fees
          </Button>
        </Link>

        {invoice.balanceAmount > 0 && canRecordPayment && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={CreditCard}
            onClick={() => setIsPaymentModalOpen(true)}
          >
            Record Payment
          </Button>
        )}
      </div>

      {/* Printable Receipt View */}
      <InvoiceReceiptView invoice={invoice} />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        invoice={invoice}
      />
    </div>
  );
}

export default FeeInvoiceDetailsPage;

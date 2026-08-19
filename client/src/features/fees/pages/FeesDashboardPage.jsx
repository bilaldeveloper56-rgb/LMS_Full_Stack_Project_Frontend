import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Settings, CreditCard, RefreshCw, Layers, ShieldAlert, Tag, Award } from 'lucide-react';
import { Breadcrumb, Button, Pagination, Select } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { ErrorState, EmptyState } from '@/components/feedback';
import { FinancialSummaryCards } from '../components/FinancialSummaryCards';
import { FeeInvoicesTable } from '../components/FeeInvoicesTable';
import { FeeDefaultersTable } from '../components/FeeDefaultersTable';
import { GenerateInvoiceModal } from '../components/GenerateInvoiceModal';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import { FeeStructureModal } from '../components/FeeStructureModal';
import { FeeCategoryModal } from '../components/FeeCategoryModal';
import { FeeConcessionModal } from '../components/FeeConcessionModal';
import {
  useInvoices,
  useFeeDefaulters,
  useFinancialSummary,
  useFeeStructures,
} from '../hooks/useFees';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'UNPAID', label: 'Unpaid' },
  { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
  { value: 'PAID', label: 'Fully Paid' },
  { value: 'OVERDUE', label: 'Overdue' },
];

export function FeesDashboardPage() {
  const { hasPermission } = useAuthorization();
  const canCreateFees = hasPermission(PERMISSIONS.FEES_CREATE);
  const canManageFees = hasPermission(PERMISSIONS.FEES_MANAGE);

  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'defaulters' | 'structures'
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
    limit: 15,
  });

  // Modals state
  const [isGenerateInvoiceOpen, setIsGenerateInvoiceOpen] = useState(false);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isConcessionModalOpen, setIsConcessionModalOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState(null);

  // Queries
  const { data: summaryData, isLoading: isLoadingSummary } = useFinancialSummary();
  const { data: defaulters = [], isLoading: isLoadingDefaulters } = useFeeDefaulters();
  const { data: invoicesData, isLoading: isLoadingInvoices, refetch: refetchInvoices } = useInvoices(filters);
  const { data: structures = [], isLoading: isLoadingStructures } = useFeeStructures();

  const invoices = invoicesData?.invoices || [];
  const pagination = invoicesData?.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 };
  const summary = summaryData?.summary || summaryData || {};

  const handleRecordPayment = (inv) => {
    setPaymentInvoice(inv);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Fee Management' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Fee Management & Accounts
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage fee structures, generate challans, record payments, and track overdue accounts
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canCreateFees && (
            <>
              <Button
                variant="outline"
                size="sm"
                leftIcon={Tag}
                onClick={() => setIsCategoryModalOpen(true)}
                className="text-xs"
              >
                Categories
              </Button>

              <Button
                variant="outline"
                size="sm"
                leftIcon={Award}
                onClick={() => setIsConcessionModalOpen(true)}
                className="text-xs"
              >
                Concessions
              </Button>

              <Button
                variant="outline"
                size="sm"
                leftIcon={Layers}
                onClick={() => setIsStructureModalOpen(true)}
                className="text-xs"
              >
                Structures
              </Button>

              <Button
                variant="primary"
                size="sm"
                leftIcon={Plus}
                onClick={() => setIsGenerateInvoiceOpen(true)}
              >
                Generate Invoices
              </Button>
            </>
          )}
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <FinancialSummaryCards
        summary={summary}
        defaultersCount={defaulters.length}
        isLoading={isLoadingSummary}
      />

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'invoices'
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            All Invoices & Challans ({pagination.total || invoices.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('defaulters')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'defaulters'
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            Overdue Defaulters ({defaulters.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('structures')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'structures'
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            Configured Structures ({structures.length})
          </button>
        </div>

        {activeTab === 'invoices' && (
          <div className="w-44 mb-2">
            <Select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
              options={STATUS_OPTIONS}
            />
          </div>
        )}
      </div>

      {/* Tab Contents */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <FeeInvoicesTable
            invoices={invoices}
            onRecordPayment={handleRecordPayment}
            isLoading={isLoadingInvoices}
          />

          {pagination.totalPages > 1 && (
            <div className="flex justify-center sm:justify-end pt-2">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                pageSize={pagination.limit}
                onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
              />
            </div>
          )}
        </div>
      )}

      {activeTab === 'defaulters' && (
        <div className="space-y-4">
          <FeeDefaultersTable
            defaulters={defaulters}
            onRecordPayment={handleRecordPayment}
            isLoading={isLoadingDefaulters}
          />
        </div>
      )}

      {activeTab === 'structures' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            {canCreateFees && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={Plus}
                onClick={() => setIsStructureModalOpen(true)}
              >
                Add Structure
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {structures.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-surface rounded-xl border border-border text-xs text-text-muted">
                No fee structures configured yet. Click "Add Structure" above to define rates.
              </div>
            ) : (
              structures.map((s) => (
                <div
                  key={s._id || s.id}
                  className="p-4 bg-surface rounded-xl border border-border space-y-2 hover:shadow-xs transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary">{s.name}</span>
                    <span className="text-sm font-black text-primary-700">{formatCurrency(s.amount)}</span>
                  </div>
                  <div className="text-[11px] text-text-muted space-y-0.5">
                    <div>Class: <span className="text-text-secondary font-medium">{s.classId?.name || 'Class'}</span></div>
                    <div>Category: <span className="text-text-secondary font-medium">{s.feeCategoryId?.name || 'General'}</span></div>
                    <div>Frequency: <span className="text-text-secondary font-medium">{s.frequency}</span></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <GenerateInvoiceModal
        isOpen={isGenerateInvoiceOpen}
        onClose={() => setIsGenerateInvoiceOpen(false)}
      />

      <RecordPaymentModal
        isOpen={Boolean(paymentInvoice)}
        onClose={() => setPaymentInvoice(null)}
        invoice={paymentInvoice}
      />

      <FeeStructureModal
        isOpen={isStructureModalOpen}
        onClose={() => setIsStructureModalOpen(false)}
      />

      <FeeCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      <FeeConcessionModal
        isOpen={isConcessionModalOpen}
        onClose={() => setIsConcessionModalOpen(false)}
      />
    </div>
  );
}

export default FeesDashboardPage;

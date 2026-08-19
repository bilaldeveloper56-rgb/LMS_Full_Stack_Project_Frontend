import React from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Percent,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  FileBarChart,
} from 'lucide-react';
import { useSchoolAnalytics } from '../hooks/useDashboardData';
import { DashboardShell } from '../components/DashboardShell';
import { DashboardSection } from '../components/DashboardSection';
import { StatCard } from '../components/StatCard';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { ErrorState, EmptyState } from '@/components/feedback';
import { Button, Card } from '@/components/ui';
import { formatNumber, formatCurrency } from '@/lib/utils';

export function AccountantDashboard() {
  const { data, isLoading, isError, error, refetch, isFetching } = useSchoolAnalytics();

  if (isLoading) {
    return (
      <DashboardShell
        title="Financial & Accounts Dashboard"
        subtitle="Institutional fee collection, billing and invoice recovery"
        roleLabel="Accountant"
      >
        <DashboardSkeleton cardsCount={4} sectionsCount={2} />
      </DashboardShell>
    );
  }

  if (isError) {
    return (
      <DashboardShell
        title="Financial & Accounts Dashboard"
        subtitle="Institutional fee collection, billing and invoice recovery"
        roleLabel="Accountant"
      >
        <ErrorState
          title="Failed to load financial metrics"
          message={error?.message || 'Could not retrieve fee analytics from the server.'}
          onRetry={refetch}
        />
      </DashboardShell>
    );
  }

  const financials = data?.financials;

  return (
    <DashboardShell
      title="Financial & Accounts Dashboard"
      subtitle="Live institutional fee collection, billing, and invoice recovery"
      roleLabel="Accountant"
      onRefresh={refetch}
      isRefreshing={isFetching}
      actions={
        <div className="flex items-center gap-2">
          <Link to="/fees">
            <Button variant="primary" size="sm" rightIcon={ArrowRight}>
              Manage Fees
            </Button>
          </Link>
          <Link to="/reports">
            <Button variant="outline" size="sm" leftIcon={FileBarChart}>
              Fee Reports
            </Button>
          </Link>
        </div>
      }
    >
      {/* 1. Collection & Revenue KPIs */}
      <DashboardSection
        title="Revenue & Collection Overview"
        subtitle="Current billing cycle collection performance"
        columns={4}
      >
        <StatCard
          title="Total Billed"
          value={formatCurrency(financials?.totalInvoiced || 0)}
          icon={CreditCard}
          description={`Total Invoices: ${formatNumber(financials?.totalInvoices || 0)}`}
          variant="primary"
        />
        <StatCard
          title="Total Collected"
          value={formatCurrency(financials?.totalPaid || 0)}
          icon={CheckCircle2}
          description="Net revenue received"
          variant="success"
        />
        <StatCard
          title="Outstanding Dues"
          value={formatCurrency(financials?.totalBalance || 0)}
          icon={AlertCircle}
          description={`Unpaid count: ${formatNumber(financials?.unpaidInvoices || 0)}`}
          variant={financials?.totalBalance > 0 ? 'warning' : 'success'}
        />
        <StatCard
          title="Collection Efficiency"
          value={`${financials?.collectionRatePercentage || 0}%`}
          icon={Percent}
          description={financials?.totalDiscount > 0 ? `Discounts: ${formatCurrency(financials.totalDiscount)}` : 'Collection rate'}
          variant={financials?.collectionRatePercentage >= 80 ? 'success' : 'warning'}
        />
      </DashboardSection>

      {/* 2. Invoice Breakdown */}
      <DashboardSection
        title="Invoice Status Breakdown"
        subtitle="Distribution of invoices by settlement status"
        columns={3}
      >
        <StatCard
          title="Fully Paid Invoices"
          value={formatNumber(financials?.paidInvoices || 0)}
          icon={CheckCircle2}
          description="Settled in full"
          variant="success"
        />
        <StatCard
          title="Partially Paid Invoices"
          value={formatNumber(financials?.partiallyPaidInvoices || 0)}
          icon={Clock}
          description="Installments in progress"
          variant="warning"
        />
        <StatCard
          title="Unpaid / Overdue"
          value={formatNumber(financials?.unpaidInvoices || 0)}
          icon={AlertCircle}
          description="Pending full payment"
          variant="danger"
        />
      </DashboardSection>
    </DashboardShell>
  );
}

export default AccountantDashboard;

import React from 'react';
import { CreditCard, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui';
import { KpiMetricCard } from './KpiMetricCard';
import { formatCurrency } from '@/lib/utils';

/**
 * FinancialAnalyticsSection component.
 * @param {object} props
 * @param {object} props.financials
 */
export function FinancialAnalyticsSection({ financials = {} }) {
  const collectionRate = financials.collectionRatePercentage ?? 0;
  const invoiced = financials.totalInvoiced || 0;
  const collected = financials.totalPaid || 0;
  const balance = financials.totalBalance || 0;

  const totalInvoices = financials.totalInvoices || 0;
  const paidInvoices = financials.paidInvoices || 0;
  const unpaidInvoices = financials.unpaidInvoices || 0;
  const partiallyPaidInvoices = financials.partiallyPaidInvoices || 0;

  const paidPct = totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0;
  const unpaidPct = totalInvoices > 0 ? Math.round((unpaidInvoices / totalInvoices) * 100) : 0;
  const partialPct = totalInvoices > 0 ? Math.round((partiallyPaidInvoices / totalInvoices) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CreditCard className="w-4 h-4 text-primary-600" />
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
          Financial Analytics & Fee Collections
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiMetricCard
          title="Collection Rate"
          value={`${collectionRate}%`}
          subtitle="Realized revenue ratio"
          icon={TrendingUp}
          accent={collectionRate >= 80 ? 'success' : collectionRate >= 50 ? 'warning' : 'danger'}
          percentage={collectionRate}
        />

        <KpiMetricCard
          title="Total Invoiced"
          value={formatCurrency(invoiced)}
          subtitle={`${totalInvoices} total fee invoices`}
          icon={DollarSign}
          accent="primary"
        />

        <KpiMetricCard
          title="Total Collected"
          value={formatCurrency(collected)}
          subtitle="Deposited payments"
          icon={DollarSign}
          accent="success"
        />

        <KpiMetricCard
          title="Outstanding Receivables"
          value={formatCurrency(balance)}
          subtitle="Pending student balances"
          icon={AlertTriangle}
          accent={balance > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Invoice Settlement Distribution */}
      <Card className="p-5 border border-border bg-surface shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-text-primary">Invoice Settlement Status Distribution</span>
          <span className="text-text-muted">{totalInvoices} Invoices Generated</span>
        </div>

        <div className="w-full h-3 bg-surface-muted rounded-full overflow-hidden flex">
          <div
            className="bg-success-600 h-full transition-all"
            style={{ width: `${paidPct}%` }}
            title={`Paid: ${paidInvoices} (${paidPct}%)`}
          />
          <div
            className="bg-warning-500 h-full transition-all"
            style={{ width: `${partialPct}%` }}
            title={`Partially Paid: ${partiallyPaidInvoices} (${partialPct}%)`}
          />
          <div
            className="bg-danger-600 h-full transition-all"
            style={{ width: `${unpaidPct}%` }}
            title={`Unpaid: ${unpaidInvoices} (${unpaidPct}%)`}
          />
        </div>

        <div className="flex items-center gap-6 text-xs pt-1 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-success-600" />
            <span className="text-text-secondary">Fully Paid: <strong>{paidInvoices}</strong> ({paidPct}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-warning-500" />
            <span className="text-text-secondary">Partially Paid: <strong>{partiallyPaidInvoices}</strong> ({partialPct}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-danger-600" />
            <span className="text-text-secondary">Unpaid / Overdue: <strong>{unpaidInvoices}</strong> ({unpaidPct}%)</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default FinancialAnalyticsSection;

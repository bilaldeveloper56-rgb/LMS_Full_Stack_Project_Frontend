import React from 'react';
import { DollarSign, CheckCircle2, AlertCircle, Users, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

/**
 * FinancialSummaryCards component.
 * @param {object} props
 * @param {object} props.summary
 * @param {number} [props.defaultersCount=0]
 * @param {boolean} [props.isLoading=false]
 */
export function FinancialSummaryCards({
  summary = {},
  defaultersCount = 0,
  isLoading = false,
}) {
  const totalInvoiced = summary.totalInvoiced ?? 0;
  const totalPaid = summary.totalPaid ?? 0;
  const totalOutstanding = summary.totalOutstanding ?? 0;

  const collectionRate =
    totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100 * 10) / 10 : 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse" aria-busy="true">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-24 bg-surface-muted rounded-xl border border-border" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Invoiced */}
      <Card className="p-4.5 border border-border bg-surface shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-text-muted">Total Invoiced</span>
            <h3 className="text-xl font-black text-text-primary mt-1">
              {formatCurrency(totalInvoiced)}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 text-[11px] text-text-muted">
          All generated fee challans
        </div>
      </Card>

      {/* Total Collected */}
      <Card className="p-4.5 border border-border bg-surface shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-text-muted">Total Collected</span>
            <h3 className="text-xl font-black text-success-700 mt-1">
              {formatCurrency(totalPaid)}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-success-50 text-success-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 text-[11px] font-semibold text-success-700 flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{collectionRate}% Collection Rate</span>
        </div>
      </Card>

      {/* Outstanding Balance */}
      <Card className="p-4.5 border border-border bg-surface shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-text-muted">Outstanding Dues</span>
            <h3 className="text-xl font-black text-danger-700 mt-1">
              {formatCurrency(totalOutstanding)}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-danger-50 text-danger-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 text-[11px] text-text-muted">
          Pending receivable fees
        </div>
      </Card>

      {/* Overdue Defaulters */}
      <Card className="p-4.5 border border-border bg-surface shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-text-muted">Fee Defaulters</span>
            <h3 className="text-xl font-black text-amber-700 mt-1">
              {defaultersCount}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 text-[11px] text-text-muted">
          Overdue unpaid student accounts
        </div>
      </Card>
    </div>
  );
}

export default FinancialSummaryCards;

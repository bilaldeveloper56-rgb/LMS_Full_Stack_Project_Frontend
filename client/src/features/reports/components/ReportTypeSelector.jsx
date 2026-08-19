import React from 'react';
import { Users, CheckSquare, CreditCard, Award } from 'lucide-react';
import { Card } from '@/components/ui';
import { REPORT_TYPES } from '../schemas/report.schema';

const ICONS = {
  students: Users,
  attendance: CheckSquare,
  financial: CreditCard,
  academic: Award,
};

/**
 * ReportTypeSelector component.
 * @param {object} props
 * @param {string} props.selectedType
 * @param {Function} props.onSelectType
 */
export function ReportTypeSelector({ selectedType, onSelectType }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
      {REPORT_TYPES.map((type) => {
        const isSelected = selectedType === type.id;
        const Icon = ICONS[type.id] || Users;

        return (
          <button
            key={type.id}
            type="button"
            onClick={() => onSelectType(type.id)}
            className="text-left w-full focus:outline-hidden"
          >
            <Card
              className={`p-4 h-full transition-all border cursor-pointer ${
                isSelected
                  ? 'border-primary-600 bg-primary-50/20 ring-2 ring-primary-500/20 shadow-xs'
                  : 'border-border bg-surface hover:border-text-muted hover:bg-surface-muted/30 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-primary-600 text-white shadow-2xs'
                      : 'bg-surface-muted text-text-secondary'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    className={`text-sm font-bold tracking-tight ${
                      isSelected ? 'text-primary-900' : 'text-text-primary'
                    }`}
                  >
                    {type.label}
                  </h3>
                  <p className="text-[11px] text-text-muted line-clamp-2 mt-0.5">
                    {type.description}
                  </p>
                </div>
              </div>
            </Card>
          </button>
        );
      })}
    </div>
  );
}

export default ReportTypeSelector;

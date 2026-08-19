import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Input, Select, Button } from '@/components/ui';

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All School Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PENDING', label: 'Pending Setup' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'INACTIVE', label: 'Inactive / Archived' },
];

/**
 * SchoolFilters component.
 * @param {object} props
 * @param {object} props.filters
 * @param {Function} props.onFilterChange
 * @param {Function} props.onReset
 */
export function SchoolFilters({ filters = {}, onFilterChange, onReset }) {
  return (
    <div className="p-4 bg-surface rounded-xl border border-border space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
          Filter & Search Tenant Schools
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          leftIcon={RotateCcw}
          className="text-xs h-7 px-2 text-text-muted hover:text-text-primary"
        >
          Reset Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="sm:col-span-2">
          <Input
            placeholder="Search by school name, code, or email..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            leftIcon={Search}
          />
        </div>

        {/* Status */}
        <Select
          value={filters.status || ''}
          onChange={(e) => onFilterChange({ status: e.target.value, page: 1 })}
          options={STATUS_FILTER_OPTIONS}
        />
      </div>
    </div>
  );
}

export default SchoolFilters;

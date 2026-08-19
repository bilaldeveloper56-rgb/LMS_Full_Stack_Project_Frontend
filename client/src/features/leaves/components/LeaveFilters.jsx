import React from 'react';
import { X } from 'lucide-react';
import { Select, Input, Button } from '@/components/ui';
import { LEAVE_STATUS_OPTIONS, LEAVE_TYPE_OPTIONS } from '../schemas/leave.schema';

/**
 * LeaveFilters component for scoping leave requests.
 *
 * @param {object} props
 * @param {object} props.filters
 * @param {Function} props.onFilterChange
 * @param {Function} props.onReset
 */
export function LeaveFilters({ filters, onFilterChange, onReset }) {
  const hasActiveFilters = Boolean(
    filters.status || filters.leaveType || filters.startDate || filters.endDate
  );

  return (
    <div className="bg-surface border border-border rounded-lg p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full lg:w-auto flex-1">
        {/* Status Filter */}
        <Select
          label="Leave Status"
          value={filters.status || ''}
          onChange={(e) => onFilterChange({ status: e.target.value || undefined, page: 1 })}
          options={[
            { value: '', label: 'All Statuses' },
            ...LEAVE_STATUS_OPTIONS,
          ]}
        />

        {/* Leave Type Filter */}
        <Select
          label="Leave Type"
          value={filters.leaveType || ''}
          onChange={(e) => onFilterChange({ leaveType: e.target.value || undefined, page: 1 })}
          options={[
            { value: '', label: 'All Types' },
            ...LEAVE_TYPE_OPTIONS,
          ]}
        />

        {/* Start Date */}
        <Input
          label="From Date"
          type="date"
          value={filters.startDate || ''}
          onChange={(e) => onFilterChange({ startDate: e.target.value || undefined, page: 1 })}
        />

        {/* End Date */}
        <Input
          label="To Date"
          type="date"
          value={filters.endDate || ''}
          onChange={(e) => onFilterChange({ endDate: e.target.value || undefined, page: 1 })}
        />
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          leftIcon={X}
          className="text-text-muted hover:text-text-primary self-end"
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
}

export default LeaveFilters;

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Select, Input, Button } from '@/components/ui';
import { COMMON_ENTITY_TYPES } from '../schemas/auditLog.schema';

/**
 * AuditLogFilters component.
 * @param {object} props
 * @param {object} props.filters
 * @param {Function} props.onFilterChange
 * @param {Function} props.onReset
 */
export function AuditLogFilters({ filters = {}, onFilterChange, onReset }) {
  return (
    <div className="p-4 bg-surface rounded-xl border border-border space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
          Audit Ledger Query Parameters
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Event Name Filter */}
        <Input
          label="Event Name"
          placeholder="e.g. AUTH_LOGIN, NOTICE_CREATED"
          value={filters.event || ''}
          onChange={(e) => onFilterChange({ event: e.target.value, page: 1 })}
        />

        {/* Entity Type Filter */}
        <Select
          label="Entity Type"
          value={filters.entityType || ''}
          onChange={(e) => onFilterChange({ entityType: e.target.value, page: 1 })}
          options={COMMON_ENTITY_TYPES}
        />

        {/* Performed By User ID Filter */}
        <Input
          label="Actor / User ID"
          placeholder="e.g. 507f1f77bcf86cd..."
          value={filters.userId || ''}
          onChange={(e) => onFilterChange({ userId: e.target.value, page: 1 })}
        />

        {/* Start Date */}
        <Input
          label="Start Date"
          type="date"
          value={filters.startDate || ''}
          onChange={(e) => onFilterChange({ startDate: e.target.value, page: 1 })}
        />

        {/* End Date */}
        <Input
          label="End Date"
          type="date"
          value={filters.endDate || ''}
          onChange={(e) => onFilterChange({ endDate: e.target.value, page: 1 })}
        />
      </div>
    </div>
  );
}

export default AuditLogFilters;

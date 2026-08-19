import React from 'react';
import { Select } from '@/components/ui';

const AUDIENCE_FILTER_OPTIONS = [
  { value: '', label: 'All Target Audiences' },
  { value: 'ALL', label: 'Entire School' },
  { value: 'TEACHERS', label: 'Teachers' },
  { value: 'STUDENTS', label: 'Students' },
  { value: 'PARENTS', label: 'Parents' },
  { value: 'CLASS_SPECIFIC', label: 'Class Specific' },
];

const PRIORITY_FILTER_OPTIONS = [
  { value: '', label: 'All Priority Levels' },
  { value: 'URGENT', label: 'Urgent' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'LOW', label: 'Low' },
];

/**
 * NoticeFilters component.
 * @param {object} props
 * @param {object} props.filters
 * @param {Function} props.onFilterChange
 */
export function NoticeFilters({ filters, onFilterChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-surface p-3.5 rounded-xl border border-border">
      <Select
        value={filters.targetAudience || ''}
        onChange={(e) => onFilterChange({ targetAudience: e.target.value, page: 1 })}
        options={AUDIENCE_FILTER_OPTIONS}
      />

      <Select
        value={filters.priority || ''}
        onChange={(e) => onFilterChange({ priority: e.target.value, page: 1 })}
        options={PRIORITY_FILTER_OPTIONS}
      />
    </div>
  );
}

export default NoticeFilters;

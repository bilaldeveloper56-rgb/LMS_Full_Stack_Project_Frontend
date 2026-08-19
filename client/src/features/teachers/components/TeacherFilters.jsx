import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input, Select, Button } from '@/components/ui';
import { EMPLOYMENT_STATUS_OPTIONS, GENDER_OPTIONS } from '../schemas/teacher.schema';

/**
 * TeacherFilters component for filtering the teachers directory.
 *
 * @param {object} props
 * @param {object} props.filters - Active filters
 * @param {Function} props.onFilterChange - Filter update callback
 * @param {Function} props.onReset - Reset callback
 */
export function TeacherFilters({ filters, onFilterChange, onReset }) {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (filters.search || '')) {
        onFilterChange({ search: searchInput || undefined, page: 1 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, filters.search, onFilterChange]);

  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  const handleStatusChange = (e) => {
    onFilterChange({ employmentStatus: e.target.value || undefined, page: 1 });
  };

  const handleGenderChange = (e) => {
    onFilterChange({ gender: e.target.value || undefined, page: 1 });
  };

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.employmentStatus ||
    filters.gender
  );

  return (
    <div className="bg-surface border border-border rounded-lg p-4 shadow-xs space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="sm:col-span-1">
          <Input
            placeholder="Search by name, employee ID, email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={Search}
            aria-label="Search teachers"
          />
        </div>

        {/* Employment Status Filter */}
        <div>
          <Select
            value={filters.employmentStatus || ''}
            onChange={handleStatusChange}
            aria-label="Filter by Status"
            options={[
              { value: '', label: 'All Statuses' },
              ...EMPLOYMENT_STATUS_OPTIONS,
            ]}
          />
        </div>

        {/* Gender Filter */}
        <div>
          <Select
            value={filters.gender || ''}
            onChange={handleGenderChange}
            aria-label="Filter by Gender"
            options={[
              { value: '', label: 'All Genders' },
              ...GENDER_OPTIONS,
            ]}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            leftIcon={X}
            className="text-text-muted hover:text-text-primary"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}

export default TeacherFilters;

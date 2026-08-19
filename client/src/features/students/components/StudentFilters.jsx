import React, { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input, Select, Button } from '@/components/ui';
import { ENROLLMENT_STATUS_OPTIONS } from '../schemas/student.schema';
import { useAcademicOptions } from '../hooks/useStudents';

/**
 * Filter bar component for Student listing page.
 *
 * @param {object} props
 * @param {object} props.filters - Current active filters
 * @param {Function} props.onFilterChange - Callback when filters change
 * @param {Function} props.onReset - Callback when filters are reset
 */
export function StudentFilters({ filters, onFilterChange, onReset }) {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const { classes, sections, sessions, isLoading: isLoadingOptions } = useAcademicOptions(filters.classId);

  // Debounce search input changes by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (filters.search || '')) {
        onFilterChange({ search: searchInput || undefined, page: 1 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, filters.search, onFilterChange]);

  // Keep local search input in sync if filters are cleared externally
  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  const handleClassChange = (e) => {
    const classId = e.target.value || undefined;
    onFilterChange({ classId, sectionId: undefined, page: 1 });
  };

  const handleSectionChange = (e) => {
    onFilterChange({ sectionId: e.target.value || undefined, page: 1 });
  };

  const handleSessionChange = (e) => {
    onFilterChange({ academicSessionId: e.target.value || undefined, page: 1 });
  };

  const handleStatusChange = (e) => {
    onFilterChange({ enrollmentStatus: e.target.value || undefined, page: 1 });
  };

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.classId ||
    filters.sectionId ||
    filters.academicSessionId ||
    filters.enrollmentStatus
  );

  return (
    <div className="bg-surface border border-border rounded-lg p-4 shadow-xs space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search Input */}
        <div className="lg:col-span-2">
          <Input
            placeholder="Search by name, admission #, email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={Search}
            aria-label="Search students"
          />
        </div>

        {/* Academic Session Filter */}
        <div>
          <Select
            value={filters.academicSessionId || ''}
            onChange={handleSessionChange}
            disabled={isLoadingOptions}
            aria-label="Filter by Academic Session"
            options={[
              { value: '', label: 'All Sessions' },
              ...sessions.map((s) => ({ value: s._id || s.id, label: s.name })),
            ]}
          />
        </div>

        {/* Class Filter */}
        <div>
          <Select
            value={filters.classId || ''}
            onChange={handleClassChange}
            disabled={isLoadingOptions}
            aria-label="Filter by Class"
            options={[
              { value: '', label: 'All Classes' },
              ...classes.map((c) => ({ value: c._id || c.id, label: c.name })),
            ]}
          />
        </div>

        {/* Section Filter */}
        <div>
          <Select
            value={filters.sectionId || ''}
            onChange={handleSectionChange}
            disabled={isLoadingOptions || !filters.classId}
            aria-label="Filter by Section"
            options={[
              { value: '', label: filters.classId ? 'All Sections' : 'Select Class First' },
              ...sections.map((sec) => ({ value: sec._id || sec.id, label: sec.name })),
            ]}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        {/* Status Filter */}
        <div className="w-48">
          <Select
            value={filters.enrollmentStatus || ''}
            onChange={handleStatusChange}
            aria-label="Filter by Status"
            options={[
              { value: '', label: 'All Statuses' },
              ...ENROLLMENT_STATUS_OPTIONS,
            ]}
          />
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            leftIcon={X}
            className="text-text-muted hover:text-text-primary"
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}

export default StudentFilters;

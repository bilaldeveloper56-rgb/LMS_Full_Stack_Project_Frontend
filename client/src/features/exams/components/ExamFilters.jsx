import React from 'react';
import { Select, Input } from '@/components/ui';
import { Search } from 'lucide-react';
import { EXAM_TYPES } from '../schemas/exam.schema';
import { useAcademicSessions } from '@/features/academics';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'COMPLETED', label: 'Completed' },
];

/**
 * ExamFilters component.
 * @param {object} props
 * @param {object} props.filters
 * @param {Function} props.onFilterChange
 */
export function ExamFilters({ filters, onFilterChange }) {
  const { data: sessionsData, isLoading: isLoadingSessions } = useAcademicSessions();
  const sessions = sessionsData?.academicSessions || sessionsData?.sessions || sessionsData || [];

  const sessionOptions = [
    { value: '', label: isLoadingSessions ? 'Loading sessions...' : 'All Academic Sessions' },
    ...sessions.map((s) => ({
      value: s._id || s.id,
      label: s.name,
    })),
  ];

  const typeOptions = [
    { value: '', label: 'All Exam Types' },
    ...EXAM_TYPES,
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-surface p-3.5 rounded-xl border border-border">
      {/* Search by Name */}
      <Input
        placeholder="Search exam name..."
        leftIcon={Search}
        value={filters.search || ''}
        onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
      />

      {/* Session Filter */}
      <Select
        value={filters.academicSessionId || ''}
        onChange={(e) => onFilterChange({ academicSessionId: e.target.value, page: 1 })}
        options={sessionOptions}
      />

      {/* Type Filter */}
      <Select
        value={filters.examType || ''}
        onChange={(e) => onFilterChange({ examType: e.target.value, page: 1 })}
        options={typeOptions}
      />

      {/* Status Filter */}
      <Select
        value={filters.status || ''}
        onChange={(e) => onFilterChange({ status: e.target.value, page: 1 })}
        options={STATUS_OPTIONS}
      />
    </div>
  );
}

export default ExamFilters;

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Select, Input, Button } from '@/components/ui';
import { useAcademicSessions, useClasses } from '@/features/academics';

/**
 * AnalyticsFilters component.
 * @param {object} props
 * @param {object} props.filters
 * @param {Function} props.onFilterChange
 * @param {Function} props.onReset
 */
export function AnalyticsFilters({ filters = {}, onFilterChange, onReset }) {
  const { data: sessionsData } = useAcademicSessions();
  const { data: classesData } = useClasses();

  const sessions = sessionsData?.academicSessions || sessionsData?.sessions || sessionsData || [];
  const classes = classesData?.classes || classesData || [];

  const sessionOptions = [
    { value: '', label: 'All Academic Sessions' },
    ...sessions.map((s) => ({ value: s._id || s.id, label: s.name })),
  ];

  const classOptions = [
    { value: '', label: 'All Classes' },
    ...classes.map((c) => ({ value: c._id || c.id, label: c.name })),
  ];

  return (
    <div className="p-4 bg-surface rounded-xl border border-border space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
          Analytics Parameters & Scope
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Academic Session */}
        <Select
          label="Academic Session"
          value={filters.academicSessionId || ''}
          onChange={(e) => onFilterChange({ academicSessionId: e.target.value })}
          options={sessionOptions}
        />

        {/* Class */}
        <Select
          label="Class"
          value={filters.classId || ''}
          onChange={(e) => onFilterChange({ classId: e.target.value })}
          options={classOptions}
        />

        {/* Start Date */}
        <Input
          label="Date From"
          type="date"
          value={filters.startDate || ''}
          onChange={(e) => onFilterChange({ startDate: e.target.value })}
        />

        {/* End Date */}
        <Input
          label="Date To"
          type="date"
          value={filters.endDate || ''}
          onChange={(e) => onFilterChange({ endDate: e.target.value })}
        />
      </div>
    </div>
  );
}

export default AnalyticsFilters;

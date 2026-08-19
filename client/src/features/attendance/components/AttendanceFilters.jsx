import React from 'react';
import { X } from 'lucide-react';
import { Select, Input, Button } from '@/components/ui';
import { useAcademicSessions, useClasses, useSections } from '@/features/academics';
import { ATTENDANCE_STATUS_OPTIONS } from '../schemas/attendance.schema';

/**
 * AttendanceFilters component for scoping attendance views.
 *
 * @param {object} props
 * @param {object} props.filters
 * @param {Function} props.onFilterChange
 * @param {Function} props.onReset
 * @param {boolean} [props.showStatus=true]
 */
export function AttendanceFilters({
  filters,
  onFilterChange,
  onReset,
  showStatus = true,
}) {
  const { data: sessionsData } = useAcademicSessions({ limit: 100 });
  const { data: classesData } = useClasses({ limit: 100 });
  const { data: sectionsData } = useSections(
    filters.classId ? { classId: filters.classId, limit: 100 } : { limit: 100 }
  );

  const sessions = sessionsData?.sessions || [];
  const classes = classesData?.classes || [];
  const sections = sectionsData?.sections || [];

  const handleClassChange = (e) => {
    const classId = e.target.value;
    onFilterChange({ classId: classId || undefined, sectionId: undefined, page: 1 });
  };

  const hasActiveFilters = Boolean(
    filters.academicSessionId || filters.classId || filters.sectionId || filters.status || filters.date
  );

  return (
    <div className="bg-surface border border-border rounded-lg p-4 shadow-xs space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Session Filter */}
        <Select
          label="Academic Session"
          value={filters.academicSessionId || ''}
          onChange={(e) => onFilterChange({ academicSessionId: e.target.value || undefined, page: 1 })}
          options={[
            { value: '', label: 'Select Session' },
            ...sessions.map((s) => ({
              value: s._id || s.id,
              label: `${s.name}${s.isCurrent ? ' (Active)' : ''}`,
            })),
          ]}
        />

        {/* Class Filter */}
        <Select
          label="Class"
          value={filters.classId || ''}
          onChange={handleClassChange}
          options={[
            { value: '', label: 'All Classes' },
            ...classes.map((c) => ({ value: c._id || c.id, label: c.name })),
          ]}
        />

        {/* Section Filter */}
        <Select
          label="Section"
          value={filters.sectionId || ''}
          disabled={!filters.classId}
          onChange={(e) => onFilterChange({ sectionId: e.target.value || undefined, page: 1 })}
          options={[
            { value: '', label: filters.classId ? 'All Sections' : 'Select Class First' },
            ...sections.map((s) => ({ value: s._id || s.id, label: s.name })),
          ]}
        />

        {/* Date Filter */}
        <Input
          label="Date"
          type="date"
          value={filters.date || ''}
          onChange={(e) => onFilterChange({ date: e.target.value || undefined, page: 1 })}
        />
      </div>

      {showStatus && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/70">
          <div className="w-full sm:w-60">
            <Select
              label="Attendance Status"
              value={filters.status || ''}
              onChange={(e) => onFilterChange({ status: e.target.value || undefined, page: 1 })}
              options={[
                { value: '', label: 'All Statuses' },
                ...ATTENDANCE_STATUS_OPTIONS,
              ]}
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
      )}
    </div>
  );
}

export default AttendanceFilters;

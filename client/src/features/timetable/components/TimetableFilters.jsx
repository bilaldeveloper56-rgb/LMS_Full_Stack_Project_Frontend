import React from 'react';
import { Select, Button } from '@/components/ui';
import { useAcademicSessions, useClasses, useSections } from '@/features/academics';
import { useTeachers } from '@/features/teachers';

/**
 * TimetableFilters component for selecting timetable perspective.
 *
 * @param {object} props
 * @param {'section'|'teacher'} props.viewMode
 * @param {Function} props.onViewModeChange
 * @param {object} props.filters
 * @param {Function} props.onFilterChange
 */
export function TimetableFilters({
  viewMode = 'section',
  onViewModeChange,
  filters,
  onFilterChange,
}) {
  const { data: sessionsData } = useAcademicSessions({ limit: 100 });
  const { data: classesData } = useClasses({ limit: 100 });
  const { data: sectionsData } = useSections(
    filters.classId ? { classId: filters.classId, limit: 100 } : { limit: 100 }
  );
  const { data: teachersData } = useTeachers({ limit: 100 });

  const sessions = sessionsData?.sessions || [];
  const classes = classesData?.classes || [];
  const sections = sectionsData?.sections || [];
  const teachers = teachersData?.teachers || [];

  const handleClassChange = (e) => {
    const classId = e.target.value;
    onFilterChange({ classId: classId || undefined, sectionId: undefined });
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4 shadow-xs space-y-3">
      {/* Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
        <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-md border border-border">
          <button
            type="button"
            onClick={() => onViewModeChange('section')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              viewMode === 'section'
                ? 'bg-surface text-primary-700 shadow-2xs font-bold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Class & Section Schedule
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('teacher')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              viewMode === 'teacher'
                ? 'bg-surface text-primary-700 shadow-2xs font-bold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Faculty / Teacher Schedule
          </button>
        </div>
      </div>

      {/* Select Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Session Filter */}
        <Select
          label="Academic Session"
          value={filters.academicSessionId || ''}
          onChange={(e) => onFilterChange({ academicSessionId: e.target.value || undefined })}
          options={[
            { value: '', label: 'Select Session' },
            ...sessions.map((s) => ({
              value: s._id || s.id,
              label: `${s.name}${s.isCurrent ? ' (Active)' : ''}`,
            })),
          ]}
        />

        {viewMode === 'section' ? (
          <>
            {/* Class Filter */}
            <Select
              label="Class"
              value={filters.classId || ''}
              onChange={handleClassChange}
              options={[
                { value: '', label: 'Select Class' },
                ...classes.map((c) => ({ value: c._id || c.id, label: c.name })),
              ]}
            />

            {/* Section Filter */}
            <Select
              label="Section"
              value={filters.sectionId || ''}
              disabled={!filters.classId}
              onChange={(e) => onFilterChange({ sectionId: e.target.value || undefined })}
              options={[
                { value: '', label: filters.classId ? 'Select Section' : 'Select Class First' },
                ...sections.map((s) => ({ value: s._id || s.id, label: s.name })),
              ]}
            />
          </>
        ) : (
          /* Teacher Filter */
          <Select
            label="Faculty / Teacher"
            value={filters.teacherId || ''}
            onChange={(e) => onFilterChange({ teacherId: e.target.value || undefined })}
            options={[
              { value: '', label: 'Select Teacher' },
              ...teachers.map((t) => ({
                value: t._id || t.id,
                label: `${t.firstName || ''} ${t.lastName || ''} (${t.employeeId || 'Faculty'})`,
              })),
            ]}
          />
        )}
      </div>
    </div>
  );
}

export default TimetableFilters;

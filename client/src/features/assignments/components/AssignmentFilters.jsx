import React from 'react';
import { X } from 'lucide-react';
import { Select, Input, Button } from '@/components/ui';
import { useAcademicSessions, useClasses, useSections, useSubjects } from '@/features/academics';
import { ASSIGNMENT_STATUS_OPTIONS } from '../schemas/assignment.schema';

/**
 * AssignmentFilters component.
 *
 * @param {object} props
 * @param {object} props.filters
 * @param {Function} props.onFilterChange
 * @param {Function} props.onReset
 * @param {boolean} [props.isStudentView=false]
 */
export function AssignmentFilters({
  filters,
  onFilterChange,
  onReset,
  isStudentView = false,
}) {
  const { data: sessionsData } = useAcademicSessions({ limit: 100 });
  const { data: classesData } = useClasses({ limit: 100 });
  const { data: sectionsData } = useSections(
    filters.classId ? { classId: filters.classId, limit: 100 } : { limit: 100 }
  );
  const { data: subjectsData } = useSubjects(
    filters.classId ? { classId: filters.classId, limit: 100 } : { limit: 100 }
  );

  const sessions = sessionsData?.sessions || [];
  const classes = classesData?.classes || [];
  const sections = sectionsData?.sections || [];
  const subjects = subjectsData?.subjects || [];

  const handleClassChange = (e) => {
    const classId = e.target.value;
    onFilterChange({ classId: classId || undefined, sectionId: undefined, subjectId: undefined, page: 1 });
  };

  const hasActiveFilters = Boolean(
    filters.academicSessionId ||
      filters.classId ||
      filters.sectionId ||
      filters.subjectId ||
      filters.status ||
      filters.search
  );

  return (
    <div className="bg-surface border border-border rounded-lg p-4 shadow-xs space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <Input
          placeholder="Search by title..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ search: e.target.value || undefined, page: 1 })}
        />

        {/* Session */}
        <Select
          value={filters.academicSessionId || ''}
          onChange={(e) => onFilterChange({ academicSessionId: e.target.value || undefined, page: 1 })}
          options={[
            { value: '', label: 'All Sessions' },
            ...sessions.map((s) => ({
              value: s._id || s.id,
              label: `${s.name}${s.isCurrent ? ' (Active)' : ''}`,
            })),
          ]}
        />

        {!isStudentView && (
          <>
            {/* Class */}
            <Select
              value={filters.classId || ''}
              onChange={handleClassChange}
              options={[
                { value: '', label: 'All Classes' },
                ...classes.map((c) => ({ value: c._id || c.id, label: c.name })),
              ]}
            />

            {/* Section */}
            <Select
              value={filters.sectionId || ''}
              disabled={!filters.classId}
              onChange={(e) => onFilterChange({ sectionId: e.target.value || undefined, page: 1 })}
              options={[
                { value: '', label: filters.classId ? 'All Sections' : 'Select Class First' },
                ...sections.map((s) => ({ value: s._id || s.id, label: s.name })),
              ]}
            />
          </>
        )}

        {/* Subject */}
        <Select
          value={filters.subjectId || ''}
          onChange={(e) => onFilterChange({ subjectId: e.target.value || undefined, page: 1 })}
          options={[
            { value: '', label: 'All Subjects' },
            ...subjects.map((s) => ({ value: s._id || s.id, label: s.name })),
          ]}
        />

        {!isStudentView && (
          /* Status */
          <Select
            value={filters.status || ''}
            onChange={(e) => onFilterChange({ status: e.target.value || undefined, page: 1 })}
            options={[
              { value: '', label: 'All Statuses' },
              ...ASSIGNMENT_STATUS_OPTIONS,
            ]}
          />
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            leftIcon={X}
            className="text-text-muted hover:text-text-primary text-xs"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}

export default AssignmentFilters;

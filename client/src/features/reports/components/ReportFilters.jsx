import React from 'react';
import { Select, Input, Button } from '@/components/ui';
import { RotateCcw } from 'lucide-react';
import { useAcademicSessions, useClasses, useSections } from '@/features/academics';
import { useStudents } from '@/features/students';
import { useExams } from '@/features/exams';

const ENROLLMENT_STATUS_OPTIONS = [
  { value: '', label: 'All Enrollment Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'GRADUATED', label: 'Graduated' },
  { value: 'TRANSFERRED', label: 'Transferred' },
  { value: 'DROPPED', label: 'Dropped' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

/**
 * ReportFilters component.
 * @param {object} props
 * @param {string} props.reportType
 * @param {object} props.filters
 * @param {Function} props.onFilterChange
 * @param {Function} props.onReset
 */
export function ReportFilters({
  reportType = 'students',
  filters = {},
  onFilterChange,
  onReset,
}) {
  const { data: sessionsData } = useAcademicSessions();
  const { data: classesData } = useClasses();
  const { data: sectionsData } = useSections(filters.classId);
  const { data: studentsData } = useStudents({
    classId: filters.classId || undefined,
    sectionId: filters.sectionId || undefined,
    limit: 100,
  });
  const { data: examsData } = useExams({
    academicSessionId: filters.academicSessionId || undefined,
  });

  const sessions = sessionsData?.academicSessions || sessionsData?.sessions || sessionsData || [];
  const classes = classesData?.classes || classesData || [];
  const sections = sectionsData?.sections || sectionsData || [];
  const students = studentsData?.students || studentsData || [];
  const exams = examsData?.exams || examsData || [];

  const sessionOptions = [
    { value: '', label: 'All Academic Sessions' },
    ...sessions.map((s) => ({ value: s._id || s.id, label: s.name })),
  ];

  const classOptions = [
    { value: '', label: 'All Classes' },
    ...classes.map((c) => ({ value: c._id || c.id, label: c.name })),
  ];

  const sectionOptions = [
    { value: '', label: 'All Sections' },
    ...sections.map((s) => ({ value: s._id || s.id, label: s.name })),
  ];

  const studentOptions = [
    {
      value: '',
      label: reportType === 'academic' ? 'Select Student (Required) *' : 'All Students',
    },
    ...students.map((st) => {
      const name = `${st.firstName || ''} ${st.lastName || ''}`.trim() || 'Student';
      const roll = st.rollNumber ? `[Roll: ${st.rollNumber}]` : '';
      return { value: st._id || st.id, label: `${name} ${roll}` };
    }),
  ];

  const examOptions = [
    { value: '', label: 'All Examination Terms' },
    ...exams.map((e) => ({ value: e._id || e.id, label: e.name })),
  ];

  return (
    <div className="p-4 bg-surface rounded-xl border border-border space-y-3 no-print">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
          Report Parameters & Filters
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
        {/* Academic Session Filter (Common to all) */}
        <Select
          label="Academic Session"
          value={filters.academicSessionId || ''}
          onChange={(e) => onFilterChange({ academicSessionId: e.target.value, page: 1 })}
          options={sessionOptions}
        />

        {/* Class Filter */}
        <Select
          label="Class"
          value={filters.classId || ''}
          onChange={(e) =>
            onFilterChange({ classId: e.target.value, sectionId: '', studentId: '', page: 1 })
          }
          options={classOptions}
        />

        {/* Section Filter */}
        <Select
          label="Section"
          value={filters.sectionId || ''}
          disabled={!filters.classId}
          onChange={(e) => onFilterChange({ sectionId: e.target.value, studentId: '', page: 1 })}
          options={sectionOptions}
        />

        {/* Student Filter (Required for Academic report card, optional for attendance) */}
        {(reportType === 'academic' || reportType === 'attendance') && (
          <Select
            label={reportType === 'academic' ? 'Select Student *' : 'Student (Optional)'}
            value={filters.studentId || ''}
            onChange={(e) => onFilterChange({ studentId: e.target.value, page: 1 })}
            options={studentOptions}
          />
        )}

        {/* Enrollment Status Filter (Student Roster only) */}
        {reportType === 'students' && (
          <Select
            label="Enrollment Status"
            value={filters.enrollmentStatus || ''}
            onChange={(e) => onFilterChange({ enrollmentStatus: e.target.value, page: 1 })}
            options={ENROLLMENT_STATUS_OPTIONS}
          />
        )}

        {/* Date Range (Attendance only) */}
        {reportType === 'attendance' && (
          <>
            <Input
              label="Start Date"
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => onFilterChange({ startDate: e.target.value, page: 1 })}
            />
            <Input
              label="End Date"
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => onFilterChange({ endDate: e.target.value, page: 1 })}
            />
          </>
        )}

        {/* Min Balance (Fee Defaulters only) */}
        {reportType === 'financial' && (
          <Input
            label="Minimum Balance ($)"
            type="number"
            min={0}
            value={filters.minBalance ?? 0}
            onChange={(e) => onFilterChange({ minBalance: e.target.value, page: 1 })}
          />
        )}

        {/* Exam Term (Academic only) */}
        {reportType === 'academic' && (
          <Select
            label="Examination Term"
            value={filters.examId || ''}
            onChange={(e) => onFilterChange({ examId: e.target.value })}
            options={examOptions}
          />
        )}
      </div>
    </div>
  );
}

export default ReportFilters;

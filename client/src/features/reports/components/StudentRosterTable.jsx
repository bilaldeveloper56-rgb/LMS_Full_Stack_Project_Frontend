import React from 'react';
import { Badge } from '@/components/ui';

const STATUS_VARIANTS = {
  ACTIVE: 'success',
  INACTIVE: 'warning',
  GRADUATED: 'primary',
  TRANSFERRED: 'neutral',
  DROPPED: 'danger',
  SUSPENDED: 'danger',
};

/**
 * StudentRosterTable component.
 * @param {object} props
 * @param {Array} props.roster
 * @param {boolean} [props.isLoading=false]
 */
export function StudentRosterTable({ roster = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="p-8 space-y-3 animate-pulse" aria-busy="true">
        <div className="h-12 bg-surface-muted rounded-lg" />
        <div className="h-12 bg-surface-muted rounded-lg" />
        <div className="h-12 bg-surface-muted rounded-lg" />
      </div>
    );
  }

  if (roster.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-text-muted bg-surface rounded-xl border border-border">
        No students found matching the selected report filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-2xs">
      <table className="w-full text-left text-xs">
        <thead className="bg-surface-muted/70 text-text-secondary border-b border-border font-semibold uppercase tracking-wider">
          <tr>
            <th className="p-3.5">Admission #</th>
            <th className="p-3.5">Roll #</th>
            <th className="p-3.5">Student Full Name</th>
            <th className="p-3.5">Class & Section</th>
            <th className="p-3.5">Gender / Blood</th>
            <th className="p-3.5">Email / Phone</th>
            <th className="p-3.5 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {roster.map((student, idx) => {
            const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student';
            const cls = student.class?.name || 'Unassigned';
            const sec = student.section?.name ? `(${student.section.name})` : '';
            const variant = STATUS_VARIANTS[student.enrollmentStatus] || 'neutral';

            return (
              <tr key={student.studentId || idx} className="hover:bg-surface-muted/40 transition-colors">
                <td className="p-3.5 font-mono font-bold text-primary-700">
                  {student.admissionNumber || '—'}
                </td>
                <td className="p-3.5 font-semibold text-text-secondary">
                  {student.rollNumber || '—'}
                </td>
                <td className="p-3.5 font-bold text-text-primary">
                  {fullName}
                </td>
                <td className="p-3.5 text-text-secondary">
                  {cls} {sec}
                </td>
                <td className="p-3.5 text-text-muted">
                  {student.gender || '—'} {student.bloodGroup ? `[${student.bloodGroup}]` : ''}
                </td>
                <td className="p-3.5 text-text-muted">
                  <div>{student.email || '—'}</div>
                  {student.phone && <div className="text-[11px]">{student.phone}</div>}
                </td>
                <td className="p-3.5 text-right">
                  <Badge variant={variant} size="sm">
                    {student.enrollmentStatus || 'ACTIVE'}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default StudentRosterTable;

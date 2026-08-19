import React from 'react';
import { Card, Badge } from '@/components/ui';
import { BookOpen, School, Calendar } from 'lucide-react';

/**
 * TeacherAssignmentsCard for displaying assigned classes, sections, and subjects.
 *
 * @param {object} props
 * @param {Array} props.assignments - Array of teacher assignment records
 */
export function TeacherAssignmentsCard({ assignments = [] }) {
  if (assignments.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-text-muted">
          No class or subject assignments allocated to this teacher.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="border-b border-border pb-3">
        <h2 className="text-base font-semibold text-text-primary">
          Class & Subject Allocations ({assignments.length})
        </h2>
        <p className="text-xs text-text-muted mt-0.5">
          Curricular assignments and classroom responsibilities
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignments.map((item, idx) => {
          const subject = item.subjectId;
          const classDoc = item.classId;
          const section = item.sectionId;
          const session = item.academicSessionId;

          return (
            <div
              key={idx}
              className="bg-surface-muted/50 border border-border rounded-lg p-4 space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-text-primary text-sm flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-primary-600" />
                    {subject?.name || 'Subject'}
                  </h3>
                  {subject?.code && (
                    <span className="text-xs text-text-muted">
                      Code: {subject.code}
                    </span>
                  )}
                </div>
                {subject?.subjectType && (
                  <Badge variant="primary" size="sm">
                    {subject.subjectType}
                  </Badge>
                )}
              </div>

              <div className="pt-2 border-t border-border/60 text-xs space-y-1">
                <div className="text-text-secondary flex items-center gap-1.5 font-medium">
                  <School className="w-3.5 h-3.5 text-text-muted" />{' '}
                  {classDoc?.name || 'Class'} {section?.name ? `(${section.name})` : ''}
                </div>
                {session?.name && (
                  <div className="text-text-muted flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Session: {session.name}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default TeacherAssignmentsCard;

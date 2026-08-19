import React from 'react';
import { Card, Badge } from '@/components/ui';
import { BookOpen, User, Mail } from 'lucide-react';

/**
 * Current Assigned Subjects & Teachers Card.
 *
 * @param {object} props
 * @param {Array} props.subjects - Array of current subject assignments
 */
export function StudentAcademicCard({ subjects = [] }) {
  if (subjects.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-text-muted">
          No active subject or teacher assignments found for this class & section.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="border-b border-border pb-3">
        <h2 className="text-base font-semibold text-text-primary">
          Current Class Subjects & Instructors
        </h2>
        <p className="text-xs text-text-muted mt-0.5">
          Curriculum syllabus and teaching faculty assigned to this student cohort
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((item, idx) => {
          const subject = item.subjectId;
          const teacher = item.teacherId;
          const teacherName = teacher ? `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() : 'Unassigned';

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
                  <Badge variant={subject.subjectType === 'CORE' ? 'primary' : 'neutral'} size="sm">
                    {subject.subjectType}
                  </Badge>
                )}
              </div>

              <div className="pt-2 border-t border-border/60 text-xs space-y-1">
                <div className="text-text-secondary flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5 text-text-muted" /> {teacherName}
                </div>
                {teacher?.email && (
                  <div className="text-text-muted flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> {teacher.email}
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

export default StudentAcademicCard;

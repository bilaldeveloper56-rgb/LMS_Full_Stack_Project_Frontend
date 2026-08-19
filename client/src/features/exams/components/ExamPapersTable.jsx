import React from 'react';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui';
import { Calendar, Clock, MapPin, Award, UserCheck } from 'lucide-react';

/**
 * ExamPapersTable component.
 * @param {object} props
 * @param {Array} props.papers
 */
export function ExamPapersTable({ papers = [] }) {
  if (papers.length === 0) {
    return (
      <div className="p-8 text-center bg-surface-muted/30 rounded-xl border border-dashed border-border text-xs text-text-muted">
        No exam papers scheduled yet. Click "Schedule Paper" above to add subject papers.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-2xs">
      <table className="w-full text-left text-xs">
        <thead className="bg-surface-muted/60 text-text-secondary border-b border-border font-semibold uppercase tracking-wider">
          <tr>
            <th className="p-3.5">Subject & Code</th>
            <th className="p-3.5">Class</th>
            <th className="p-3.5">Date & Time</th>
            <th className="p-3.5">Room</th>
            <th className="p-3.5">Marks (Pass / Total)</th>
            <th className="p-3.5">Invigilator</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {papers.map((paper) => {
            const id = paper._id || paper.id;
            const subject = paper.subjectId || {};
            const cls = paper.classId || {};
            const invigilator = paper.invigilatorTeacherId || {};
            const invigilatorName =
              invigilator.firstName && invigilator.lastName
                ? `${invigilator.firstName} ${invigilator.lastName}`
                : invigilator.name || 'Unassigned';

            return (
              <tr key={id} className="hover:bg-surface-muted/40 transition-colors">
                {/* Subject */}
                <td className="p-3.5">
                  <div className="font-bold text-text-primary">
                    {subject.name || 'Subject'}
                  </div>
                  {subject.code && (
                    <span className="text-[11px] text-text-muted">{subject.code}</span>
                  )}
                </td>

                {/* Class */}
                <td className="p-3.5 font-medium text-text-secondary">
                  {cls.name || 'Class'}
                </td>

                {/* Date & Time */}
                <td className="p-3.5">
                  <div className="flex items-center gap-1.5 font-medium text-text-primary">
                    <Calendar className="w-3.5 h-3.5 text-primary-600" />
                    <span>{formatDate(paper.date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-text-muted mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {paper.startTime} - {paper.endTime}
                    </span>
                  </div>
                </td>

                {/* Room */}
                <td className="p-3.5 text-text-secondary">
                  {paper.room ? (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-text-muted" />
                      <span>{paper.room}</span>
                    </div>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </td>

                {/* Marks */}
                <td className="p-3.5">
                  <div className="flex items-center gap-1.5 font-bold text-text-primary">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      {paper.passingMarks} / {paper.totalMarks}
                    </span>
                  </div>
                </td>

                {/* Invigilator */}
                <td className="p-3.5 text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-text-muted" />
                    <span>{invigilatorName}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ExamPapersTable;

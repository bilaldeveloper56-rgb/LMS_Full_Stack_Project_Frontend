import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit3, Trash2, Globe, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui';
import { ExamStatusBadge } from './ExamStatusBadge';
import { ExamTypeBadge } from './ExamTypeBadge';
import { formatDate } from '@/lib/utils';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

/**
 * ExamTable component.
 * @param {object} props
 * @param {Array} props.exams
 * @param {Function} [props.onPublish]
 * @param {Function} [props.onDelete]
 * @param {boolean} [props.isPublishing=false]
 */
export function ExamTable({ exams = [], onPublish, onDelete, isPublishing = false }) {
  const { hasPermission } = useAuthorization();
  const canUpdate = hasPermission(PERMISSIONS.EXAMS_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.EXAMS_DELETE);
  const canPublish = hasPermission(PERMISSIONS.EXAMS_PUBLISH);

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-2xs">
      <table className="w-full text-left text-xs">
        <thead className="bg-surface-muted/60 text-text-secondary border-b border-border font-semibold uppercase tracking-wider">
          <tr>
            <th className="p-3.5">Exam Name & Type</th>
            <th className="p-3.5">Academic Session</th>
            <th className="p-3.5">Schedule Duration</th>
            <th className="p-3.5">Papers</th>
            <th className="p-3.5">Status</th>
            <th className="p-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {exams.map((exam) => {
            const id = exam._id || exam.id;
            const session = exam.academicSessionId || {};
            const papersCount = exam.papers?.length ?? (exam.totalPapers || 0);

            return (
              <tr key={id} className="hover:bg-surface-muted/40 transition-colors">
                {/* Name & Type */}
                <td className="p-3.5">
                  <Link
                    to={`/exams/${id}`}
                    className="font-bold text-text-primary hover:text-primary-600 transition-colors block"
                  >
                    {exam.name}
                  </Link>
                  <div className="mt-1">
                    <ExamTypeBadge type={exam.examType} />
                  </div>
                </td>

                {/* Session */}
                <td className="p-3.5 font-medium text-text-secondary">
                  {session.name || 'Current Session'}
                </td>

                {/* Dates */}
                <td className="p-3.5 text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                    <span>
                      {formatDate(exam.startDate)} - {formatDate(exam.endDate)}
                    </span>
                  </div>
                </td>

                {/* Papers */}
                <td className="p-3.5">
                  <span className="font-semibold text-text-primary">
                    {papersCount}
                  </span>
                </td>

                {/* Status */}
                <td className="p-3.5">
                  <ExamStatusBadge status={exam.status} isPublished={exam.isPublished} />
                </td>

                {/* Actions */}
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link to={`/exams/${id}`} title="View Exam Details" aria-label="View Exam Details">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="w-4 h-4 text-text-secondary" />
                      </Button>
                    </Link>

                    {!exam.isPublished && canPublish && onPublish && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-success-600 hover:text-success-700"
                        title="Publish Exam Schedule"
                        aria-label="Publish Exam Schedule"
                        onClick={() => onPublish(id)}
                        disabled={isPublishing}
                      >
                        <Globe className="w-4 h-4" />
                      </Button>
                    )}

                    {canUpdate && (
                      <Link to={`/exams/${id}/edit`} title="Edit Exam" aria-label="Edit Exam">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-text-secondary hover:text-primary-600"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}

                    {canDelete && onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-text-secondary hover:text-danger-600"
                        title="Delete Exam"
                        aria-label="Delete Exam"
                        onClick={() => onDelete(id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
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

export default ExamTable;

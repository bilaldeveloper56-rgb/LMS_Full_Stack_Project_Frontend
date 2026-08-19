import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Unlock, Globe, ExternalLink, Award } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { ResultStatusBadge } from './ResultStatusBadge';
import {
  useLockSectionResults,
  useUnlockSectionResults,
  usePublishSectionResults,
} from '../hooks/useResults';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

/**
 * SectionResultsTable component.
 * @param {object} props
 * @param {string} props.examId
 * @param {string} props.sectionId
 * @param {Array} props.results
 * @param {boolean} [props.isLoading=false]
 */
export function SectionResultsTable({
  examId,
  sectionId,
  results = [],
  isLoading = false,
}) {
  const { hasPermission } = useAuthorization();
  const canLock = hasPermission(PERMISSIONS.RESULTS_LOCK);
  const canPublish = hasPermission(PERMISSIONS.RESULTS_PUBLISH);

  const lockMutation = useLockSectionResults();
  const unlockMutation = useUnlockSectionResults();
  const publishMutation = usePublishSectionResults();

  const isAnyLocked = results.some((r) => r.isLocked);
  const isAnyPublished = results.some((r) => r.isPublished);

  const handleLock = () => {
    lockMutation.mutate({ examId, sectionId });
  };

  const handleUnlock = () => {
    unlockMutation.mutate({ examId, sectionId });
  };

  const handlePublish = () => {
    publishMutation.mutate({ examId, sectionId });
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-3 animate-pulse" aria-busy="true">
        <div className="h-12 bg-surface-muted rounded-lg" />
        <div className="h-12 bg-surface-muted rounded-lg" />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-text-muted bg-surface rounded-xl border border-border">
        No results recorded for this section yet. Use the "Marks Entry" tab to enter student marks.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-surface p-3.5 rounded-xl border border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-text-primary">Section Status:</span>
          <ResultStatusBadge isPublished={isAnyPublished} isLocked={isAnyLocked} />
          <span className="text-xs text-text-muted">({results.length} total score entries)</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canLock && (
            <>
              {isAnyLocked ? (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={Unlock}
                  onClick={handleUnlock}
                  isLoading={unlockMutation.isPending}
                  className="text-xs"
                >
                  Unlock Section
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={Lock}
                  onClick={handleLock}
                  isLoading={lockMutation.isPending}
                  className="text-xs"
                >
                  Lock Section
                </Button>
              )}
            </>
          )}

          {canPublish && !isAnyPublished && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={Globe}
              onClick={handlePublish}
              isLoading={publishMutation.isPending}
              className="text-xs"
            >
              Publish Results
            </Button>
          )}
        </div>
      </div>

      {/* Roster Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-muted/60 text-text-secondary border-b border-border font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-3.5">Student Name</th>
              <th className="p-3.5">Subject</th>
              <th className="p-3.5">Marks Obtained</th>
              <th className="p-3.5">Percentage (%)</th>
              <th className="p-3.5">Grade</th>
              <th className="p-3.5">Grade Points</th>
              <th className="p-3.5 text-right">Report Card</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {results.map((result) => {
              const id = result._id || result.id;
              const student = result.studentId || {};
              const sId = student._id || student.id;
              const studentName =
                student.firstName && student.lastName
                  ? `${student.firstName} ${student.lastName}`
                  : 'Student';

              const subject = result.subjectId || {};

              return (
                <tr key={id} className="hover:bg-surface-muted/40 transition-colors">
                  <td className="p-3.5 font-bold text-text-primary">
                    {studentName}
                  </td>
                  <td className="p-3.5 text-text-secondary">
                    {subject.name || 'Subject'}
                  </td>
                  <td className="p-3.5 font-bold text-text-primary">
                    {result.marksObtained} / {result.maxMarks || 100}
                  </td>
                  <td className="p-3.5 font-semibold text-text-primary">
                    {result.percentage}%
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-primary-50 text-primary-800">
                      {result.grade || '—'}
                    </span>
                  </td>
                  <td className="p-3.5 text-text-secondary">
                    {result.gradePoint ?? '—'}
                  </td>
                  <td className="p-3.5 text-right">
                    {sId && (
                      <Link
                        to={`/results/students/${sId}?examId=${examId}`}
                        className="inline-flex items-center gap-1 font-semibold text-primary-600 hover:text-primary-700 text-xs"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SectionResultsTable;

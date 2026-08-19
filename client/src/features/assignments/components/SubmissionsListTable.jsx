import React from 'react';
import { Award, User, ExternalLink, Paperclip } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
} from '@/components/ui';
import { SubmissionStatusBadge } from './SubmissionStatusBadge';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';
import { formatDate } from '@/lib/utils';

/**
 * SubmissionsListTable component.
 *
 * @param {object} props
 * @param {Array} props.submissions
 * @param {number} [props.maxScore=100]
 * @param {Function} props.onGrade
 */
export function SubmissionsListTable({
  submissions = [],
  maxScore = 100,
  onGrade,
}) {
  const { hasPermission } = useAuthorization();
  const canGrade = hasPermission(PERMISSIONS.ASSIGNMENTS_GRADE);

  if (submissions.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-text-muted">
        No students have submitted responses for this assignment yet.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Submission Details</TableHead>
          <TableHead>Submitted On</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Score</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {submissions.map((sub) => {
          const subId = sub._id || sub.id;
          const student = sub.studentId;
          const studentName = student
            ? `${student.firstName || ''} ${student.lastName || ''}`.trim()
            : 'Student';

          return (
            <TableRow key={subId} className="hover:bg-surface-muted/40">
              {/* Student */}
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary text-sm">
                      {studentName}
                    </div>
                    {student?.admissionNumber && (
                      <div className="text-xs text-text-muted">
                        Adm #: {student.admissionNumber}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>

              {/* Submission Text / Attachments */}
              <TableCell className="max-w-[240px]">
                <div className="text-xs text-text-secondary truncate">
                  {sub.submissionContent || 'No written text'}
                </div>
                {sub.attachments && sub.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {sub.attachments.map((att, idx) => (
                      <a
                        key={idx}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded hover:underline"
                      >
                        <Paperclip className="w-2.5 h-2.5" />
                        <span className="truncate max-w-[100px]">{att.name}</span>
                      </a>
                    ))}
                  </div>
                )}
              </TableCell>

              {/* Submitted At */}
              <TableCell className="text-text-secondary text-xs">
                {formatDate(sub.submittedAt || sub.createdAt)}
              </TableCell>

              {/* Status */}
              <TableCell>
                <SubmissionStatusBadge status={sub.status} />
              </TableCell>

              {/* Score & Feedback */}
              <TableCell className="text-xs">
                {sub.score !== null && sub.score !== undefined ? (
                  <div>
                    <span className="font-bold text-success-700 text-sm">
                      {sub.score}
                    </span>
                    <span className="text-text-muted"> / {maxScore}</span>
                    {sub.feedback && (
                      <div className="text-[11px] text-text-muted truncate max-w-[150px] mt-0.5" title={sub.feedback}>
                        "{sub.feedback}"
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-text-muted font-mono">—</span>
                )}
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                {canGrade && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={Award}
                    onClick={() => onGrade && onGrade(sub)}
                    className="text-xs"
                  >
                    {sub.status === 'GRADED' ? 'Regrade' : 'Grade'}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default SubmissionsListTable;

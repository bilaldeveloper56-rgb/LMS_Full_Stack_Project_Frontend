import React from 'react';
import { Award, User, CheckCircle, XCircle } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Badge,
} from '@/components/ui';
import { AttemptStatusBadge } from './AttemptStatusBadge';
import { formatDate } from '@/lib/utils';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

/**
 * AttemptHistoryTable component.
 *
 * @param {object} props
 * @param {Array} props.attempts
 * @param {object} props.quiz
 * @param {Function} [props.onGrade]
 * @param {boolean} [props.isStudentView=false]
 */
export function AttemptHistoryTable({
  attempts = [],
  quiz = null,
  onGrade,
  isStudentView = false,
}) {
  const { hasPermission } = useAuthorization();
  const canGrade = hasPermission(PERMISSIONS.QUIZZES_GRADE);

  if (attempts.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-text-muted">
        No quiz attempts recorded yet.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {!isStudentView && <TableHead>Student</TableHead>}
          <TableHead>Attempt</TableHead>
          <TableHead>Date & Time</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Outcome</TableHead>
          {!isStudentView && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {attempts.map((attempt) => {
          const attemptId = attempt._id || attempt.id;
          const student = attempt.studentId;
          const studentName = student
            ? `${student.firstName || ''} ${student.lastName || ''}`.trim()
            : 'Student';

          return (
            <TableRow key={attemptId} className="hover:bg-surface-muted/40">
              {/* Student */}
              {!isStudentView && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="font-semibold text-text-primary text-xs">
                      {studentName}
                    </div>
                  </div>
                </TableCell>
              )}

              {/* Attempt Number */}
              <TableCell className="font-bold text-xs text-text-primary">
                Attempt #{attempt.attemptNumber || 1}
              </TableCell>

              {/* Date */}
              <TableCell className="text-text-secondary text-xs">
                {formatDate(attempt.submittedAt || attempt.startedAt)}
              </TableCell>

              {/* Status */}
              <TableCell>
                <AttemptStatusBadge status={attempt.status} />
              </TableCell>

              {/* Score */}
              <TableCell className="text-xs font-medium">
                {attempt.status === 'EVALUATED' ? (
                  <div>
                    <span className="font-bold text-primary-700">
                      {attempt.totalScore}
                    </span>
                    <span className="text-text-muted"> / {quiz?.totalMarks || 100}</span>
                  </div>
                ) : (
                  <span className="text-text-muted font-mono">—</span>
                )}
              </TableCell>

              {/* Outcome (Pass / Fail) */}
              <TableCell>
                {attempt.status === 'EVALUATED' ? (
                  <Badge variant={attempt.isPassed ? 'success' : 'danger'} size="sm">
                    {attempt.isPassed ? 'Passed' : 'Failed'}
                  </Badge>
                ) : (
                  <span className="text-text-muted text-xs">Pending</span>
                )}
              </TableCell>

              {/* Actions */}
              {!isStudentView && (
                <TableCell className="text-right">
                  {canGrade && (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={Award}
                      onClick={() => onGrade && onGrade(attempt)}
                      className="text-xs"
                    >
                      {attempt.status === 'EVALUATED' ? 'Regrade' : 'Grade'}
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default AttemptHistoryTable;

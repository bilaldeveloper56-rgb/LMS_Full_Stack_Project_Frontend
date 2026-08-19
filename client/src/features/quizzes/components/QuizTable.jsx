import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, Send, Play, AlertTriangle, Clock } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Modal,
} from '@/components/ui';
import { QuizStatusBadge } from './QuizStatusBadge';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS, ROLES } from '@/constants';
import { formatDate } from '@/lib/utils';

/**
 * QuizTable component.
 *
 * @param {object} props
 * @param {Array} props.quizzes
 * @param {Function} [props.onPublish]
 * @param {Function} [props.onDelete]
 * @param {boolean} [props.isActionLoading=false]
 * @param {boolean} [props.isStudentView=false]
 */
export function QuizTable({
  quizzes = [],
  onPublish,
  onDelete,
  isActionLoading = false,
  isStudentView = false,
}) {
  const { hasPermission, user } = useAuthorization();
  const [quizToDelete, setQuizToDelete] = useState(null);

  const canUpdate = hasPermission(PERMISSIONS.QUIZZES_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.QUIZZES_DELETE);
  const isStudent = user?.role === ROLES.STUDENT;

  const handleConfirmDelete = async () => {
    if (quizToDelete && onDelete) {
      await onDelete(quizToDelete.id);
      setQuizToDelete(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Quiz Title</TableHead>
            <TableHead>Subject</TableHead>
            {!isStudentView && <TableHead>Class & Section</TableHead>}
            <TableHead>Duration</TableHead>
            <TableHead>Marks</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quizzes.map((quiz) => {
            const id = quiz._id || quiz.id;
            const subjectName = quiz.subjectId?.name || '—';
            const className = quiz.classId?.name || '—';
            const sectionName = quiz.sectionId?.name || '';
            const isDraft = quiz.status === 'DRAFT';
            const isPublished = quiz.status === 'PUBLISHED';
            const questionsCount = quiz.questions?.length || 0;

            return (
              <TableRow key={id} className="hover:bg-surface-muted/50">
                {/* Title */}
                <TableCell>
                  <Link
                    to={`/quizzes/${id}`}
                    className="font-semibold text-text-primary hover:text-primary-600 transition-colors text-sm"
                  >
                    {quiz.title}
                  </Link>
                  <div className="text-[11px] text-text-muted mt-0.5">
                    {questionsCount} Questions • Max {quiz.maxAttempts || 1} Attempt(s)
                  </div>
                </TableCell>

                {/* Subject */}
                <TableCell className="text-text-secondary text-xs font-medium">
                  {subjectName}
                </TableCell>

                {/* Class & Section */}
                {!isStudentView && (
                  <TableCell className="text-text-secondary text-xs">
                    {className} {sectionName ? `(${sectionName})` : ''}
                  </TableCell>
                )}

                {/* Duration */}
                <TableCell className="text-text-secondary text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-primary-600" />
                    <span>{quiz.durationMinutes} mins</span>
                  </div>
                </TableCell>

                {/* Marks */}
                <TableCell className="text-xs">
                  <span className="font-bold text-text-primary">{quiz.totalMarks}</span>
                  <span className="text-text-muted"> (Pass: {quiz.passingMarks})</span>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <QuizStatusBadge status={quiz.status} />
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* View Details */}
                    <Link to={`/quizzes/${id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        aria-label={`View details for ${quiz.title}`}
                      >
                        <Eye className="w-4 h-4 text-text-muted hover:text-primary-600" />
                      </Button>
                    </Link>

                    {/* Student Take Quiz Button */}
                    {isStudent && isPublished && (
                      <Link to={`/quizzes/${id}/take`}>
                        <Button
                          variant="primary"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          leftIcon={Play}
                        >
                          Take
                        </Button>
                      </Link>
                    )}

                    {/* Publish Draft */}
                    {!isStudentView && isDraft && canUpdate && onPublish && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-success-700 hover:bg-success-50 text-xs"
                        onClick={() => onPublish(id)}
                        disabled={isActionLoading}
                        aria-label={`Publish ${quiz.title}`}
                      >
                        <Send className="w-3.5 h-3.5 mr-1" /> Publish
                      </Button>
                    )}

                    {/* Edit */}
                    {!isStudentView && canUpdate && (
                      <Link to={`/quizzes/${id}/edit`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          aria-label={`Edit ${quiz.title}`}
                        >
                          <Edit className="w-4 h-4 text-text-muted hover:text-primary-600" />
                        </Button>
                      </Link>
                    )}

                    {/* Delete */}
                    {!isStudentView && canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                        onClick={() => setQuizToDelete({ id, title: quiz.title })}
                        aria-label={`Delete ${quiz.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(quizToDelete)}
        onClose={() => setQuizToDelete(null)}
        title="Confirm Quiz Removal"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-danger-50 text-danger-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-text-primary font-medium">
                Are you sure you want to delete <span className="font-bold">{quizToDelete?.title}</span>?
              </p>
              <p className="text-xs text-text-muted mt-1">
                The quiz and all student attempts will be removed.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuizToDelete(null)}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              isLoading={isActionLoading}
            >
              Confirm Removal
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default QuizTable;

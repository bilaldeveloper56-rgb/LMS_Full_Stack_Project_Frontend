import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, Send, AlertTriangle, BookOpen } from 'lucide-react';
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
import { AssignmentStatusBadge } from './AssignmentStatusBadge';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';
import { formatDate } from '@/lib/utils';

/**
 * AssignmentTable component for directory table views.
 *
 * @param {object} props
 * @param {Array} props.assignments
 * @param {Function} [props.onPublish]
 * @param {Function} [props.onDelete]
 * @param {boolean} [props.isActionLoading=false]
 * @param {boolean} [props.isStudentView=false]
 */
export function AssignmentTable({
  assignments = [],
  onPublish,
  onDelete,
  isActionLoading = false,
  isStudentView = false,
}) {
  const { hasPermission } = useAuthorization();
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);

  const canUpdate = hasPermission(PERMISSIONS.ASSIGNMENTS_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.ASSIGNMENTS_DELETE);

  const handleConfirmDelete = async () => {
    if (assignmentToDelete && onDelete) {
      await onDelete(assignmentToDelete.id);
      setAssignmentToDelete(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Assignment Title</TableHead>
            <TableHead>Subject</TableHead>
            {!isStudentView && <TableHead>Class & Section</TableHead>}
            <TableHead>Due Date</TableHead>
            <TableHead>Max Points</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((assignment) => {
            const id = assignment._id || assignment.id;
            const subjectName = assignment.subjectId?.name || '—';
            const className = assignment.classId?.name || '—';
            const sectionName = assignment.sectionId?.name || '';
            const isDraft = assignment.status === 'DRAFT';

            return (
              <TableRow key={id} className="hover:bg-surface-muted/50">
                {/* Title */}
                <TableCell>
                  <Link
                    to={`/assignments/${id}`}
                    className="font-semibold text-text-primary hover:text-primary-600 transition-colors text-sm"
                  >
                    {assignment.title}
                  </Link>
                  {assignment.allowLateSubmission && assignment.lateSubmissionPenaltyPercentage > 0 && (
                    <div className="text-[11px] text-warning-700 mt-0.5">
                      {assignment.lateSubmissionPenaltyPercentage}% late penalty
                    </div>
                  )}
                </TableCell>

                {/* Subject */}
                <TableCell className="text-text-secondary text-xs">
                  <span className="font-medium text-text-primary">{subjectName}</span>
                </TableCell>

                {/* Class & Section */}
                {!isStudentView && (
                  <TableCell className="text-text-secondary text-xs">
                    {className} {sectionName ? `(${sectionName})` : ''}
                  </TableCell>
                )}

                {/* Due Date */}
                <TableCell className="text-text-secondary text-xs">
                  {formatDate(assignment.dueDate)}
                </TableCell>

                {/* Max Score */}
                <TableCell className="font-medium text-text-primary text-xs">
                  {assignment.maxScore} pts
                </TableCell>

                {/* Status */}
                <TableCell>
                  <AssignmentStatusBadge status={assignment.status} />
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* View Details */}
                    <Link to={`/assignments/${id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        aria-label={`View details for ${assignment.title}`}
                      >
                        <Eye className="w-4 h-4 text-text-muted hover:text-primary-600" />
                      </Button>
                    </Link>

                    {/* Publish Draft */}
                    {!isStudentView && isDraft && canUpdate && onPublish && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-success-700 hover:bg-success-50 text-xs"
                        onClick={() => onPublish(id)}
                        disabled={isActionLoading}
                        aria-label={`Publish ${assignment.title}`}
                      >
                        <Send className="w-3.5 h-3.5 mr-1" /> Publish
                      </Button>
                    )}

                    {/* Edit */}
                    {!isStudentView && canUpdate && (
                      <Link to={`/assignments/${id}/edit`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          aria-label={`Edit ${assignment.title}`}
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
                        onClick={() => setAssignmentToDelete({ id, title: assignment.title })}
                        aria-label={`Delete ${assignment.title}`}
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
        isOpen={Boolean(assignmentToDelete)}
        onClose={() => setAssignmentToDelete(null)}
        title="Confirm Assignment Removal"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-danger-50 text-danger-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-text-primary font-medium">
                Are you sure you want to delete{' '}
                <span className="font-bold">{assignmentToDelete?.title}</span>?
              </p>
              <p className="text-xs text-text-muted mt-1">
                The assignment and all associated student submissions will be soft-deleted.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAssignmentToDelete(null)}
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

export default AssignmentTable;

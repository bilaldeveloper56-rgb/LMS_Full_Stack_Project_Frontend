import React, { useState } from 'react';
import { Trash2, AlertTriangle, UserCheck, BookOpen, School } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Modal,
  Badge,
} from '@/components/ui';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

/**
 * TeacherAssignmentTable component for listing and managing teacher curricular assignments.
 *
 * @param {object} props
 * @param {Array} props.assignments
 * @param {Function} props.onDelete
 * @param {boolean} [props.isDeleting=false]
 */
export function TeacherAssignmentTable({
  assignments = [],
  onDelete,
  isDeleting = false,
}) {
  const { hasPermission } = useAuthorization();
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);

  const canManage = hasPermission(PERMISSIONS.TEACHERS_MANAGE);

  const handleConfirmDelete = async () => {
    if (assignmentToDelete && onDelete) {
      await onDelete(assignmentToDelete._id || assignmentToDelete.id);
      setAssignmentToDelete(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Teacher</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Class & Section</TableHead>
            <TableHead>Session</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((item) => {
            const assignmentId = item._id || item.id;
            const teacher = item.teacherId;
            const subject = item.subjectId;
            const classDoc = item.classId;
            const section = item.sectionId;
            const session = item.academicSessionId;

            const teacherName = teacher
              ? `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()
              : '—';

            return (
              <TableRow key={assignmentId} className="hover:bg-surface-muted/50">
                {/* Teacher */}
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-text-primary text-sm">
                        {teacherName}
                      </div>
                      {teacher?.employeeId && (
                        <div className="text-xs text-text-muted">
                          ID: {teacher.employeeId}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Subject */}
                <TableCell>
                  <div className="font-medium text-text-primary">
                    {subject?.name || '—'}
                  </div>
                  {subject?.code && (
                    <div className="text-xs text-text-muted">
                      Code: {subject.code}
                    </div>
                  )}
                </TableCell>

                {/* Class & Section */}
                <TableCell className="text-text-secondary">
                  {classDoc?.name || '—'} {section?.name ? `(${section.name})` : ''}
                </TableCell>

                {/* Session */}
                <TableCell className="text-text-secondary text-xs">
                  {session?.name || '—'}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                      onClick={() => setAssignmentToDelete({ assignmentId, teacherName, subjectName: subject?.name })}
                      aria-label="Unassign teacher"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
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
        title="Confirm Teacher Unassignment"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-danger-50 text-danger-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-text-primary font-medium">
                Are you sure you want to unassign <span className="font-bold">{assignmentToDelete?.teacherName}</span> from{' '}
                <span className="font-bold">{assignmentToDelete?.subjectName}</span>?
              </p>
              <p className="text-xs text-text-muted mt-1">
                The teacher will no longer be designated as the active instructor for this class section.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAssignmentToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              isLoading={isDeleting}
            >
              Confirm Unassign
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default TeacherAssignmentTable;

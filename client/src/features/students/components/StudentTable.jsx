import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, MoreVertical, AlertTriangle } from 'lucide-react';
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
import { StudentAvatar } from './StudentAvatar';
import { StudentStatusBadge } from './StudentStatusBadge';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';
import { formatDate } from '@/lib/utils';

/**
 * StudentTable component for presenting student records with actions.
 *
 * @param {object} props
 * @param {Array} props.students - Student records
 * @param {Function} [props.onDelete] - Delete handler
 * @param {boolean} [props.isDeleting] - Delete in-flight flag
 */
export function StudentTable({ students = [], onDelete, isDeleting = false }) {
  const { hasPermission } = useAuthorization();
  const [studentToDelete, setStudentToDelete] = useState(null);

  const canRead = hasPermission(PERMISSIONS.STUDENTS_READ);
  const canUpdate = hasPermission(PERMISSIONS.STUDENTS_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.STUDENTS_DELETE);

  const handleConfirmDelete = async () => {
    if (studentToDelete && onDelete) {
      await onDelete(studentToDelete._id || studentToDelete.id);
      setStudentToDelete(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Admission #</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Class & Section</TableHead>
            <TableHead>Roll #</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => {
            const studentId = student._id || student.id;
            const className = student.classId?.name || student.classId?.code || '—';
            const sectionName = student.sectionId?.name || student.sectionId?.code || '';
            const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student';

            return (
              <TableRow key={studentId} className="hover:bg-surface-muted/50">
                {/* Admission Number */}
                <TableCell className="font-semibold text-text-primary">
                  {student.admissionNumber}
                </TableCell>

                {/* Student Avatar + Name + Email */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <StudentAvatar
                      src={student.profileImage}
                      firstName={student.firstName}
                      lastName={student.lastName}
                      size="sm"
                    />
                    <div>
                      <Link
                        to={`/students/${studentId}`}
                        className="font-medium text-text-primary hover:text-primary-600 transition-colors"
                      >
                        {fullName}
                      </Link>
                      {student.email && (
                        <div className="text-xs text-text-muted">{student.email}</div>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Class & Section */}
                <TableCell className="text-text-secondary">
                  {className} {sectionName ? `(${sectionName})` : ''}
                </TableCell>

                {/* Roll Number */}
                <TableCell className="text-text-secondary">
                  {student.rollNumber || '—'}
                </TableCell>

                {/* Gender */}
                <TableCell className="capitalize text-text-secondary">
                  {student.gender ? student.gender.toLowerCase() : '—'}
                </TableCell>

                {/* Status Badge */}
                <TableCell>
                  <StudentStatusBadge status={student.enrollmentStatus} />
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {canRead && (
                      <Link to={`/students/${studentId}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          aria-label={`View ${fullName}`}
                        >
                          <Eye className="w-4 h-4 text-text-muted hover:text-text-primary" />
                        </Button>
                      </Link>
                    )}

                    {canUpdate && (
                      <Link to={`/students/${studentId}/edit`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          aria-label={`Edit ${fullName}`}
                        >
                          <Edit className="w-4 h-4 text-text-muted hover:text-primary-600" />
                        </Button>
                      </Link>
                    )}

                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                        onClick={() => setStudentToDelete(student)}
                        aria-label={`Delete ${fullName}`}
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
        isOpen={Boolean(studentToDelete)}
        onClose={() => setStudentToDelete(null)}
        title="Confirm Student Deactivation"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-danger-50 text-danger-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-text-primary font-medium">
                Are you sure you want to deactivate student{' '}
                <span className="font-bold">
                  {studentToDelete?.firstName} {studentToDelete?.lastName}
                </span>{' '}
                ({studentToDelete?.admissionNumber})?
              </p>
              <p className="text-xs text-text-muted mt-1">
                This will soft-delete the student record. The student will no longer appear in active class rosters or gradebooks.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStudentToDelete(null)}
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
              Confirm Deactivation
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default StudentTable;

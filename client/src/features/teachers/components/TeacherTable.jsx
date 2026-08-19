import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, AlertTriangle } from 'lucide-react';
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
import { TeacherAvatar } from './TeacherAvatar';
import { TeacherStatusBadge } from './TeacherStatusBadge';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

/**
 * TeacherTable component for displaying teacher records with actions.
 *
 * @param {object} props
 * @param {Array} props.teachers - Teacher records
 * @param {Function} [props.onDelete] - Delete handler
 * @param {boolean} [props.isDeleting=false] - Deletion in-flight flag
 */
export function TeacherTable({ teachers = [], onDelete, isDeleting = false }) {
  const { hasPermission } = useAuthorization();
  const [teacherToDelete, setTeacherToDelete] = useState(null);

  const canRead = hasPermission(PERMISSIONS.TEACHERS_READ);
  const canUpdate = hasPermission(PERMISSIONS.TEACHERS_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.TEACHERS_DELETE);

  const handleConfirmDelete = async () => {
    if (teacherToDelete && onDelete) {
      await onDelete(teacherToDelete._id || teacherToDelete.id);
      setTeacherToDelete(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee ID</TableHead>
            <TableHead>Teacher</TableHead>
            <TableHead>Designation & Specialization</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.map((teacher) => {
            const teacherId = teacher._id || teacher.id;
            const fullName = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || 'Teacher';

            return (
              <TableRow key={teacherId} className="hover:bg-surface-muted/50">
                {/* Employee ID */}
                <TableCell className="font-semibold text-text-primary">
                  {teacher.employeeId}
                </TableCell>

                {/* Teacher Avatar + Name + Email */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <TeacherAvatar
                      src={teacher.profileImage}
                      firstName={teacher.firstName}
                      lastName={teacher.lastName}
                      size="sm"
                    />
                    <div>
                      <Link
                        to={`/teachers/${teacherId}`}
                        className="font-medium text-text-primary hover:text-primary-600 transition-colors"
                      >
                        {fullName}
                      </Link>
                      {teacher.email && (
                        <div className="text-xs text-text-muted">{teacher.email}</div>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Designation & Specialization */}
                <TableCell className="text-text-secondary">
                  <div>{teacher.designation || 'Teacher'}</div>
                  {teacher.specialization && (
                    <div className="text-xs text-text-muted">{teacher.specialization}</div>
                  )}
                </TableCell>

                {/* Phone */}
                <TableCell className="text-text-secondary">
                  {teacher.phone || '—'}
                </TableCell>

                {/* Status Badge */}
                <TableCell>
                  <TeacherStatusBadge status={teacher.employmentStatus} />
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {canRead && (
                      <Link to={`/teachers/${teacherId}`}>
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
                      <Link to={`/teachers/${teacherId}/edit`}>
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
                        onClick={() => setTeacherToDelete(teacher)}
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
        isOpen={Boolean(teacherToDelete)}
        onClose={() => setTeacherToDelete(null)}
        title="Confirm Teacher Deactivation"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-danger-50 text-danger-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-text-primary font-medium">
                Are you sure you want to deactivate teacher{' '}
                <span className="font-bold">
                  {teacherToDelete?.firstName} {teacherToDelete?.lastName}
                </span>{' '}
                ({teacherToDelete?.employeeId})?
              </p>
              <p className="text-xs text-text-muted mt-1">
                This will soft-delete the teacher record. The teacher will be unassigned from active timetables and subject rosters.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTeacherToDelete(null)}
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

export default TeacherTable;

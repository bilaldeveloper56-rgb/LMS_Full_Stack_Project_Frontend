import React, { useState } from 'react';
import { Edit, Trash2, AlertTriangle, BookOpen } from 'lucide-react';
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
 * SubjectTable component for listing school subjects with actions.
 *
 * @param {object} props
 * @param {Array} props.subjects
 * @param {Function} props.onEdit
 * @param {Function} props.onDelete
 * @param {boolean} [props.isDeleting=false]
 */
export function SubjectTable({
  subjects = [],
  onEdit,
  onDelete,
  isDeleting = false,
}) {
  const { hasPermission } = useAuthorization();
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  const canUpdate = hasPermission(PERMISSIONS.SUBJECTS_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.SUBJECTS_DELETE);

  const handleConfirmDelete = async () => {
    if (subjectToDelete && onDelete) {
      await onDelete(subjectToDelete._id || subjectToDelete.id);
      setSubjectToDelete(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject Name</TableHead>
            <TableHead>Subject Code</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Optional / Elective</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.map((sub) => {
            const subId = sub._id || sub.id;

            return (
              <TableRow key={subId} className="hover:bg-surface-muted/50">
                {/* Name */}
                <TableCell className="font-semibold text-text-primary">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary-600" />
                    <span>{sub.name}</span>
                  </div>
                </TableCell>

                {/* Code */}
                <TableCell className="font-mono text-xs text-text-secondary">
                  {sub.code}
                </TableCell>

                {/* Subject Type */}
                <TableCell>
                  <Badge variant={sub.subjectType === 'CORE' ? 'primary' : 'neutral'} size="sm">
                    {sub.subjectType || 'CORE'}
                  </Badge>
                </TableCell>

                {/* Optional */}
                <TableCell className="text-text-secondary text-xs">
                  {sub.isOptional ? 'Elective' : 'Mandatory'}
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge variant={sub.isActive !== false ? 'success' : 'neutral'} size="sm">
                    {sub.isActive !== false ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {canUpdate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onEdit && onEdit(sub)}
                        aria-label={`Edit ${sub.name}`}
                      >
                        <Edit className="w-4 h-4 text-text-muted hover:text-primary-600" />
                      </Button>
                    )}

                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                        onClick={() => setSubjectToDelete(sub)}
                        aria-label={`Delete ${sub.name}`}
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
        isOpen={Boolean(subjectToDelete)}
        onClose={() => setSubjectToDelete(null)}
        title="Confirm Subject Deletion"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-danger-50 text-danger-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-text-primary font-medium">
                Are you sure you want to delete subject <span className="font-bold">{subjectToDelete?.name}</span> ({subjectToDelete?.code})?
              </p>
              <p className="text-xs text-text-muted mt-1">
                This will soft-delete the subject record. Existing curriculum syllabus allocations will be archived.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSubjectToDelete(null)}
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
              Confirm Deletion
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default SubjectTable;

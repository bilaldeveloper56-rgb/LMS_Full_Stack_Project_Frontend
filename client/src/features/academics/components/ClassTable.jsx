import React, { useState } from 'react';
import { Edit, Trash2, AlertTriangle, School } from 'lucide-react';
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
 * ClassTable component for presenting school classes with actions.
 *
 * @param {object} props
 * @param {Array} props.classes
 * @param {Function} props.onEdit
 * @param {Function} props.onDelete
 * @param {boolean} [props.isDeleting=false]
 */
export function ClassTable({
  classes = [],
  onEdit,
  onDelete,
  isDeleting = false,
}) {
  const { hasPermission } = useAuthorization();
  const [classToDelete, setClassToDelete] = useState(null);

  const canUpdate = hasPermission(PERMISSIONS.CLASSES_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.CLASSES_DELETE);

  const handleConfirmDelete = async () => {
    if (classToDelete && onDelete) {
      await onDelete(classToDelete._id || classToDelete.id);
      setClassToDelete(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Class Name</TableHead>
            <TableHead>Class Code</TableHead>
            <TableHead>Academic Session</TableHead>
            <TableHead>Display Order</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.map((cls) => {
            const classId = cls._id || cls.id;
            const sessionName = cls.academicSessionId?.name || '—';

            return (
              <TableRow key={classId} className="hover:bg-surface-muted/50">
                {/* Name */}
                <TableCell className="font-semibold text-text-primary">
                  <div className="flex items-center gap-2">
                    <School className="w-4 h-4 text-primary-600" />
                    <span>{cls.name}</span>
                  </div>
                </TableCell>

                {/* Code */}
                <TableCell className="font-mono text-xs text-text-secondary">
                  {cls.code}
                </TableCell>

                {/* Academic Session */}
                <TableCell className="text-text-secondary">
                  {sessionName}
                </TableCell>

                {/* Display Order */}
                <TableCell className="text-text-secondary">
                  {cls.displayOrder ?? 0}
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge variant={cls.isActive !== false ? 'success' : 'neutral'} size="sm">
                    {cls.isActive !== false ? 'Active' : 'Inactive'}
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
                        onClick={() => onEdit && onEdit(cls)}
                        aria-label={`Edit ${cls.name}`}
                      >
                        <Edit className="w-4 h-4 text-text-muted hover:text-primary-600" />
                      </Button>
                    )}

                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                        onClick={() => setClassToDelete(cls)}
                        aria-label={`Delete ${cls.name}`}
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
        isOpen={Boolean(classToDelete)}
        onClose={() => setClassToDelete(null)}
        title="Confirm Class Deletion"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-danger-50 text-danger-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-text-primary font-medium">
                Are you sure you want to delete class <span className="font-bold">{classToDelete?.name}</span> ({classToDelete?.code})?
              </p>
              <p className="text-xs text-text-muted mt-1">
                This will soft-delete the class record and archive its active course rosters.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClassToDelete(null)}
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

export default ClassTable;

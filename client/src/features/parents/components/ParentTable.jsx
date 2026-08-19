import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, AlertTriangle, UserCheck } from 'lucide-react';
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
 * ParentTable component for displaying parent records with actions.
 *
 * @param {object} props
 * @param {Array} props.parents - Parent records
 * @param {Function} [props.onDelete] - Delete handler
 * @param {boolean} [props.isDeleting=false] - Deletion in-flight flag
 */
export function ParentTable({ parents = [], onDelete, isDeleting = false }) {
  const { hasPermission } = useAuthorization();
  const [parentToDelete, setParentToDelete] = useState(null);

  const canRead = hasPermission(PERMISSIONS.PARENTS_READ);
  const canUpdate = hasPermission(PERMISSIONS.PARENTS_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.PARENTS_DELETE);

  const handleConfirmDelete = async () => {
    if (parentToDelete && onDelete) {
      await onDelete(parentToDelete._id || parentToDelete.id);
      setParentToDelete(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Parent / Guardian</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Occupation</TableHead>
            <TableHead>Relationship</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parents.map((parent) => {
            const parentId = parent._id || parent.id;
            const fullName = `${parent.firstName || ''} ${parent.lastName || ''}`.trim() || 'Parent';

            return (
              <TableRow key={parentId} className="hover:bg-surface-muted/50">
                {/* Parent Name & Email */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-semibold text-xs border border-primary-200 shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <Link
                        to={`/parents/${parentId}`}
                        className="font-medium text-text-primary hover:text-primary-600 transition-colors"
                      >
                        {fullName}
                      </Link>
                      {parent.email && (
                        <div className="text-xs text-text-muted">{parent.email}</div>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Phone */}
                <TableCell className="text-text-secondary">
                  <div>{parent.phone}</div>
                  {parent.alternatePhone && (
                    <div className="text-xs text-text-muted">Alt: {parent.alternatePhone}</div>
                  )}
                </TableCell>

                {/* Occupation */}
                <TableCell className="text-text-secondary">
                  {parent.occupation || '—'}
                </TableCell>

                {/* Relationship */}
                <TableCell>
                  {parent.relationship ? (
                    <Badge variant="neutral" size="sm">
                      {parent.relationship}
                    </Badge>
                  ) : (
                    '—'
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {canRead && (
                      <Link to={`/parents/${parentId}`}>
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
                      <Link to={`/parents/${parentId}/edit`}>
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
                        onClick={() => setParentToDelete(parent)}
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
        isOpen={Boolean(parentToDelete)}
        onClose={() => setParentToDelete(null)}
        title="Confirm Parent Record Removal"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-danger-50 text-danger-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-text-primary font-medium">
                Are you sure you want to deactivate guardian{' '}
                <span className="font-bold">
                  {parentToDelete?.firstName} {parentToDelete?.lastName}
                </span>?
              </p>
              <p className="text-xs text-text-muted mt-1">
                This will soft-delete the parent profile and unlink associated student communications.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setParentToDelete(null)}
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
              Confirm Removal
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default ParentTable;

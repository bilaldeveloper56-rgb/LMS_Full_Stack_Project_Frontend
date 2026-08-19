import React, { useState } from 'react';
import { Edit, Trash2, AlertTriangle, Users } from 'lucide-react';
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
 * SectionTable component for listing and managing class sections.
 *
 * @param {object} props
 * @param {Array} props.sections
 * @param {Function} props.onEdit
 * @param {Function} props.onDelete
 * @param {boolean} [props.isDeleting=false]
 */
export function SectionTable({
  sections = [],
  onEdit,
  onDelete,
  isDeleting = false,
}) {
  const { hasPermission } = useAuthorization();
  const [sectionToDelete, setSectionToDelete] = useState(null);

  const canUpdate = hasPermission(PERMISSIONS.SECTIONS_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.SECTIONS_DELETE);

  const handleConfirmDelete = async () => {
    if (sectionToDelete && onDelete) {
      await onDelete(sectionToDelete._id || sectionToDelete.id);
      setSectionToDelete(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Section Name</TableHead>
            <TableHead>Parent Class</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Class Teacher</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sections.map((sec) => {
            const secId = sec._id || sec.id;
            const className = sec.classId?.name || sec.classId?.code || '—';
            const teacherName = sec.classTeacherId
              ? `${sec.classTeacherId.firstName || ''} ${sec.classTeacherId.lastName || ''}`.trim()
              : '—';

            return (
              <TableRow key={secId} className="hover:bg-surface-muted/50">
                {/* Section Name & Code */}
                <TableCell className="font-semibold text-text-primary">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary-600" />
                    <span>{sec.name}</span>
                    <span className="font-mono text-xs text-text-muted">({sec.code})</span>
                  </div>
                </TableCell>

                {/* Parent Class */}
                <TableCell className="text-text-secondary">
                  {className}
                </TableCell>

                {/* Capacity */}
                <TableCell className="text-text-secondary">
                  {sec.capacity ?? 40} seats
                </TableCell>

                {/* Room */}
                <TableCell className="text-text-secondary">
                  {sec.room || '—'}
                </TableCell>

                {/* Class Teacher */}
                <TableCell className="text-text-secondary">
                  {teacherName}
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge variant={sec.isActive !== false ? 'success' : 'neutral'} size="sm">
                    {sec.isActive !== false ? 'Active' : 'Inactive'}
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
                        onClick={() => onEdit && onEdit(sec)}
                        aria-label={`Edit ${sec.name}`}
                      >
                        <Edit className="w-4 h-4 text-text-muted hover:text-primary-600" />
                      </Button>
                    )}

                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                        onClick={() => setSectionToDelete(sec)}
                        aria-label={`Delete ${sec.name}`}
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
        isOpen={Boolean(sectionToDelete)}
        onClose={() => setSectionToDelete(null)}
        title="Confirm Section Deletion"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-danger-50 text-danger-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-text-primary font-medium">
                Are you sure you want to delete section <span className="font-bold">{sectionToDelete?.name}</span>?
              </p>
              <p className="text-xs text-text-muted mt-1">
                This will soft-delete the section record. Active classroom assignments will be archived.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSectionToDelete(null)}
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

export default SectionTable;

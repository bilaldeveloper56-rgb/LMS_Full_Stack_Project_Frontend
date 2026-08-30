import React, { useState } from 'react';
import { Edit, Trash2, CheckCircle, AlertTriangle, Star } from 'lucide-react';
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
import { SessionStatusBadge } from './SessionStatusBadge';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';
import { formatDate } from '@/lib/utils';

/**
 * SessionTable component for listing and managing academic sessions.
 *
 * @param {object} props
 * @param {Array} props.sessions
 * @param {Function} props.onEdit
 * @param {Function} props.onDelete
 * @param {Function} props.onSetCurrent
 * @param {boolean} [props.isDeleting=false]
 */
export function SessionTable({
  sessions = [],
  onEdit,
  onDelete,
  onSetCurrent,
  isDeleting = false,
}) {
  const { hasPermission } = useAuthorization();
  const [sessionToDelete, setSessionToDelete] = useState(null);

  const canUpdate = hasPermission(PERMISSIONS.ACADEMIC_SESSIONS_UPDATE);
  const canManage = hasPermission(PERMISSIONS.ACADEMIC_SESSIONS_MANAGE);
  const canDelete = hasPermission(PERMISSIONS.ACADEMIC_SESSIONS_DELETE);

  const handleConfirmDelete = async () => {
    if (sessionToDelete && onDelete) {
      await onDelete(sessionToDelete._id || sessionToDelete.id);
      setSessionToDelete(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Session Name</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Current Session</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => {
            const sessionId = session._id || session.id;

            return (
              <TableRow key={sessionId} className="hover:bg-surface-muted/50">
                {/* Session Name */}
                <TableCell className="font-semibold text-text-primary">
                  {session.name}
                </TableCell>

                {/* Duration */}
                <TableCell className="text-text-secondary text-xs">
                  {formatDate(session.startDate)} — {formatDate(session.endDate)}
                </TableCell>

                {/* Status */}
                <TableCell>
                  <SessionStatusBadge status={session.status} />
                </TableCell>

                {/* Current Session Badge / Action */}
                <TableCell>
                  {session.isCurrent ? (
                    <Badge variant="primary" size="sm" className="gap-1">
                      <Star className="w-3 h-3 fill-current" /> Current Session
                    </Badge>
                  ) : canManage ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-text-muted hover:text-primary-600"
                      onClick={() => onSetCurrent && onSetCurrent(sessionId)}
                    >
                      Set as Current
                    </Button>
                  ) : (
                    <span className="text-xs text-text-muted">—</span>
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {canUpdate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onEdit && onEdit(session)}
                        aria-label={`Edit ${session.name}`}
                      >
                        <Edit className="w-4 h-4 text-text-muted hover:text-primary-600" />
                      </Button>
                    )}

                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                        onClick={() => setSessionToDelete(session)}
                        aria-label={`Delete ${session.name}`}
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
        isOpen={Boolean(sessionToDelete)}
        onClose={() => setSessionToDelete(null)}
        title="Confirm Session Deletion"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-danger-50 text-danger-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-text-primary font-medium">
                Are you sure you want to delete session <span className="font-bold">{sessionToDelete?.name}</span>?
              </p>
              <p className="text-xs text-text-muted mt-1">
                This will soft-delete the academic session record. Associated historical class enrollments will be archived.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSessionToDelete(null)}
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

export default SessionTable;

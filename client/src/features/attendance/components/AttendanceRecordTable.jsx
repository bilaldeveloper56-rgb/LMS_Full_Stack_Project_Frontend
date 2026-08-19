import React, { useState } from 'react';
import { Edit3, Trash2, AlertTriangle, UserCheck } from 'lucide-react';
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
import { AttendanceStatusBadge } from './AttendanceStatusBadge';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';
import { formatDate } from '@/lib/utils';

/**
 * AttendanceRecordTable component for listing attendance records.
 *
 * @param {object} props
 * @param {Array} props.records
 * @param {Function} props.onCorrect
 * @param {Function} props.onDelete
 * @param {boolean} [props.isDeleting=false]
 */
export function AttendanceRecordTable({
  records = [],
  onCorrect,
  onDelete,
  isDeleting = false,
}) {
  const { hasPermission } = useAuthorization();
  const [recordToDelete, setRecordToDelete] = useState(null);

  const canUpdate = hasPermission(PERMISSIONS.ATTENDANCE_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.ATTENDANCE_DELETE);

  const handleConfirmDelete = async () => {
    if (recordToDelete && onDelete) {
      await onDelete(recordToDelete._id || recordToDelete.id);
      setRecordToDelete(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Class & Section</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Remarks / Note</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((rec) => {
            const recId = rec._id || rec.id;
            const student = rec.studentId;
            const studentName = student
              ? `${student.firstName || ''} ${student.lastName || ''}`.trim()
              : '—';
            const className = rec.classId?.name || rec.classId?.code || '—';
            const sectionName = rec.sectionId?.name || rec.sectionId?.code || '';

            return (
              <TableRow key={recId} className="hover:bg-surface-muted/50">
                {/* Student */}
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-text-primary text-sm">
                        {studentName}
                      </div>
                      {student?.admissionNumber && (
                        <div className="text-xs text-text-muted">
                          Adm #: {student.admissionNumber}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Class & Section */}
                <TableCell className="text-text-secondary">
                  {className} {sectionName ? `(${sectionName})` : ''}
                </TableCell>

                {/* Date */}
                <TableCell className="text-text-secondary text-xs">
                  {formatDate(rec.date)}
                </TableCell>

                {/* Status */}
                <TableCell>
                  <div className="space-y-1">
                    <AttendanceStatusBadge status={rec.status} />
                    {rec.correctedAt && (
                      <div className="text-[10px] text-primary-600 font-medium">
                        Corrected
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Remarks */}
                <TableCell className="text-text-secondary text-xs max-w-[200px] truncate">
                  {rec.remarks || rec.correctionReason || '—'}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {canUpdate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onCorrect && onCorrect(rec)}
                        aria-label={`Correct attendance for ${studentName}`}
                      >
                        <Edit3 className="w-4 h-4 text-text-muted hover:text-primary-600" />
                      </Button>
                    )}

                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                        onClick={() => setRecordToDelete({ recId, studentName })}
                        aria-label={`Delete attendance for ${studentName}`}
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
        isOpen={Boolean(recordToDelete)}
        onClose={() => setRecordToDelete(null)}
        title="Confirm Attendance Record Removal"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-danger-50 text-danger-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-text-primary font-medium">
                Are you sure you want to delete this attendance record for{' '}
                <span className="font-bold">{recordToDelete?.studentName}</span>?
              </p>
              <p className="text-xs text-text-muted mt-1">
                The record will be removed from official attendance roll sheets and analytics.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRecordToDelete(null)}
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

export default AttendanceRecordTable;

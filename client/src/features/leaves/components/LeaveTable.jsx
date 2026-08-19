import React, { useState } from 'react';
import { Check, X, Ban, Trash2, User, AlertTriangle } from 'lucide-react';
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
import { LeaveStatusBadge } from './LeaveStatusBadge';
import { LeaveTypeBadge } from './LeaveTypeBadge';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';
import { formatDate } from '@/lib/utils';

/**
 * LeaveTable component for presenting leave applications.
 *
 * @param {object} props
 * @param {Array} props.leaves
 * @param {Function} [props.onApprove]
 * @param {Function} [props.onReject]
 * @param {Function} [props.onCancel]
 * @param {Function} [props.onDelete]
 * @param {boolean} [props.isActionLoading=false]
 * @param {boolean} [props.isMyLeavesView=false]
 */
export function LeaveTable({
  leaves = [],
  onApprove,
  onReject,
  onCancel,
  onDelete,
  isActionLoading = false,
  isMyLeavesView = false,
}) {
  const { hasPermission } = useAuthorization();
  const [leaveToDelete, setLeaveToDelete] = useState(null);
  const [leaveToCancel, setLeaveToCancel] = useState(null);

  const canApprove = hasPermission(PERMISSIONS.LEAVES_APPROVE);
  const canReject = hasPermission(PERMISSIONS.LEAVES_REJECT);
  const canDelete = hasPermission(PERMISSIONS.LEAVES_DELETE);

  const handleConfirmDelete = async () => {
    if (leaveToDelete && onDelete) {
      await onDelete(leaveToDelete._id || leaveToDelete.id);
      setLeaveToDelete(null);
    }
  };

  const handleConfirmCancel = async () => {
    if (leaveToCancel && onCancel) {
      await onCancel(leaveToCancel._id || leaveToCancel.id);
      setLeaveToCancel(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {!isMyLeavesView && <TableHead>Applicant</TableHead>}
            <TableHead>Leave Type</TableHead>
            <TableHead>Duration / Dates</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reason & Remarks</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaves.map((leave) => {
            const leaveId = leave._id || leave.id;
            const applicant = leave.applicantUserId;
            const applicantName = applicant
              ? `${applicant.firstName || ''} ${applicant.lastName || ''}`.trim()
              : 'Applicant';
            const isPending = leave.status === 'PENDING';

            return (
              <TableRow key={leaveId} className="hover:bg-surface-muted/50">
                {/* Applicant (only in directory view) */}
                {!isMyLeavesView && (
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-xs shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-text-primary text-sm">
                          {applicantName}
                        </div>
                        {applicant?.email && (
                          <div className="text-xs text-text-muted">
                            {applicant.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                )}

                {/* Type */}
                <TableCell>
                  <LeaveTypeBadge leaveType={leave.leaveType} />
                </TableCell>

                {/* Duration / Dates */}
                <TableCell className="text-text-secondary text-xs">
                  <div className="font-medium text-text-primary">
                    {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                  </div>
                  <div className="text-[11px] text-text-muted capitalize">
                    {leave.dayType?.toLowerCase().replace('_', ' ')}
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <LeaveStatusBadge status={leave.status} />
                </TableCell>

                {/* Reason & Rejection notes */}
                <TableCell className="text-text-secondary text-xs max-w-[220px]">
                  <div className="truncate font-medium text-text-primary">
                    {leave.reason}
                  </div>
                  {leave.rejectionReason && (
                    <div className="text-danger-600 text-[11px] truncate mt-0.5">
                      Rejected: {leave.rejectionReason}
                    </div>
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* Admin / In-Charge Approvals */}
                    {!isMyLeavesView && isPending && canApprove && onApprove && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-success-600 hover:text-success-700 hover:bg-success-50"
                        onClick={() => onApprove(leave)}
                        aria-label={`Approve leave for ${applicantName}`}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}

                    {!isMyLeavesView && isPending && canReject && onReject && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                        onClick={() => onReject(leave)}
                        aria-label={`Reject leave for ${applicantName}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}

                    {/* Self-service Cancel Pending Leave */}
                    {isMyLeavesView && isPending && onCancel && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-warning-700 hover:bg-warning-50 text-xs"
                        onClick={() => setLeaveToCancel(leave)}
                      >
                        <Ban className="w-3.5 h-3.5 mr-1" /> Cancel
                      </Button>
                    )}

                    {/* Delete Action */}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                        onClick={() => setLeaveToDelete(leave)}
                        aria-label="Delete leave application"
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
        isOpen={Boolean(leaveToDelete)}
        onClose={() => setLeaveToDelete(null)}
        title="Confirm Leave Application Deletion"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-danger-50 text-danger-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-text-primary font-medium">
                Are you sure you want to remove this leave application?
              </p>
              <p className="text-xs text-text-muted mt-1">
                The leave record will be soft-deleted and removed from the active register.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLeaveToDelete(null)}
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
              Confirm Deletion
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Application Modal */}
      <Modal
        isOpen={Boolean(leaveToCancel)}
        onClose={() => setLeaveToCancel(null)}
        title="Confirm Leave Application Cancellation"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-primary">
            Are you sure you want to cancel your pending leave application?
          </p>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLeaveToCancel(null)}
              disabled={isActionLoading}
            >
              No, Keep
            </Button>
            <Button
              variant="warning"
              size="sm"
              onClick={handleConfirmCancel}
              isLoading={isActionLoading}
            >
              Yes, Cancel Application
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default LeaveTable;

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Modal,
  Textarea,
  Button,
} from '@/components/ui';
import { leaveRejectionSchema } from '../schemas/leave.schema';

/**
 * LeaveDecisionModal component for approving or rejecting leave requests.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {'approve'|'reject'} props.actionType
 * @param {object} [props.leave]
 * @param {Function} props.onConfirm
 * @param {boolean} [props.isLoading=false]
 */
export function LeaveDecisionModal({
  isOpen,
  onClose,
  actionType = 'approve',
  leave = null,
  onConfirm,
  isLoading = false,
}) {
  const isReject = actionType === 'reject';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: isReject ? zodResolver(leaveRejectionSchema) : undefined,
    defaultValues: {
      rejectionReason: '',
    },
  });

  useEffect(() => {
    reset({ rejectionReason: '' });
  }, [isOpen, reset]);

  const handleFormSubmit = async (formData) => {
    if (leave) {
      const id = leave._id || leave.id;
      if (isReject) {
        await onConfirm({ id, rejectionReason: formData.rejectionReason });
      } else {
        await onConfirm(id);
      }
      reset();
      onClose();
    }
  };

  const applicantName = leave?.applicantUserId
    ? `${leave.applicantUserId.firstName || ''} ${leave.applicantUserId.lastName || ''}`.trim()
    : 'Applicant';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isReject ? 'Reject Leave Request' : 'Approve Leave Request'}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="bg-surface-muted/60 p-3 rounded-md text-xs space-y-1 text-text-secondary border border-border">
          <div>
            <span className="font-semibold text-text-primary">Applicant:</span> {applicantName}
          </div>
          <div>
            <span className="font-semibold text-text-primary">Reason:</span> {leave?.reason}
          </div>
          <div>
            <span className="font-semibold text-text-primary">Type:</span> {leave?.leaveType} ({leave?.dayType})
          </div>
        </div>

        {isReject ? (
          <Textarea
            label="Rejection Reason *"
            placeholder="Explain why this leave application is being rejected..."
            error={errors.rejectionReason?.message}
            {...register('rejectionReason')}
          />
        ) : (
          <p className="text-sm text-text-primary">
            Are you sure you want to approve this leave request? The student/teacher will be marked excused during this period.
          </p>
        )}

        <div className="flex justify-end gap-2.5 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant={isReject ? 'danger' : 'primary'}
            size="sm"
            isLoading={isLoading}
          >
            {isReject ? 'Confirm Rejection' : 'Confirm Approval'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default LeaveDecisionModal;

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Modal,
  Select,
  Input,
  Textarea,
  Button,
} from '@/components/ui';
import {
  leaveApplicationSchema,
  LEAVE_TYPE_OPTIONS,
  LEAVE_DAY_TYPE_OPTIONS,
} from '../schemas/leave.schema';

/**
 * LeaveApplicationModal component for submitting a leave request.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onSubmit
 * @param {boolean} [props.isLoading=false]
 */
export function LeaveApplicationModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) {
  const todayStr = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(leaveApplicationSchema),
    defaultValues: {
      leaveType: 'SICK',
      dayType: 'FULL_DAY',
      startDate: todayStr,
      endDate: todayStr,
      reason: '',
      studentId: '',
      teacherId: '',
    },
  });

  const handleFormSubmit = async (formData) => {
    // Sanitize empty strings
    const payload = {
      ...formData,
      studentId: formData.studentId || undefined,
      teacherId: formData.teacherId || undefined,
    };
    await onSubmit(payload);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Submit Leave Application"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Leave Type *"
            options={LEAVE_TYPE_OPTIONS}
            error={errors.leaveType?.message}
            {...register('leaveType')}
          />

          <Select
            label="Duration / Day Type *"
            options={LEAVE_DAY_TYPE_OPTIONS}
            error={errors.dayType?.message}
            {...register('dayType')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Start Date *"
            type="date"
            error={errors.startDate?.message}
            {...register('startDate')}
          />

          <Input
            label="End Date *"
            type="date"
            error={errors.endDate?.message}
            {...register('endDate')}
          />
        </div>

        <Textarea
          label="Reason for Leave *"
          placeholder="Describe the reason for leave request in detail..."
          error={errors.reason?.message}
          {...register('reason')}
        />

        <div className="flex justify-end gap-2.5 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
          >
            Submit Application
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default LeaveApplicationModal;

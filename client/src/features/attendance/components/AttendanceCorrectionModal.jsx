import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Modal,
  Select,
  Textarea,
  Button,
} from '@/components/ui';
import {
  attendanceCorrectionSchema,
  ATTENDANCE_STATUS_OPTIONS,
} from '../schemas/attendance.schema';

/**
 * AttendanceCorrectionModal component for submitting an official attendance correction.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onSubmit
 * @param {object} [props.record]
 * @param {boolean} [props.isLoading=false]
 */
export function AttendanceCorrectionModal({
  isOpen,
  onClose,
  onSubmit,
  record = null,
  isLoading = false,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(attendanceCorrectionSchema),
    defaultValues: {
      status: 'PRESENT',
      correctionReason: '',
    },
  });

  useEffect(() => {
    if (record) {
      reset({
        status: record.status || 'PRESENT',
        correctionReason: '',
      });
    }
  }, [record, reset, isOpen]);

  const handleFormSubmit = async (formData) => {
    if (record) {
      await onSubmit({ id: record._id || record.id, ...formData });
      reset();
      onClose();
    }
  };

  const studentName = record?.studentId
    ? `${record.studentId.firstName || ''} ${record.studentId.lastName || ''}`.trim()
    : 'Student';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Attendance Correction"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="bg-surface-muted/60 p-3 rounded-md text-xs space-y-1 text-text-secondary border border-border">
          <div>
            <span className="font-semibold text-text-primary">Student:</span> {studentName} ({record?.studentId?.admissionNumber || '—'})
          </div>
          <div>
            <span className="font-semibold text-text-primary">Current Status:</span> {record?.status}
          </div>
          <div>
            <span className="font-semibold text-text-primary">Date:</span> {record?.date ? new Date(record.date).toLocaleDateString() : '—'}
          </div>
        </div>

        <Select
          label="Corrected Attendance Status *"
          options={ATTENDANCE_STATUS_OPTIONS}
          error={errors.status?.message}
          {...register('status')}
        />

        <Textarea
          label="Reason for Correction *"
          placeholder="Please describe why this attendance entry is being adjusted (e.g. medical note provided, entry error)..."
          error={errors.correctionReason?.message}
          {...register('correctionReason')}
        />

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
            variant="primary"
            size="sm"
            isLoading={isLoading}
          >
            Save Correction
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default AttendanceCorrectionModal;

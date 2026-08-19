import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Modal,
  Input,
  Textarea,
  Button,
} from '@/components/ui';
import { gradeSubmissionSchema } from '../schemas/assignment.schema';

/**
 * GradeSubmissionModal component for grading student work.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onSubmit
 * @param {object} [props.submission]
 * @param {number} [props.maxScore=100]
 * @param {boolean} [props.isLoading=false]
 */
export function GradeSubmissionModal({
  isOpen,
  onClose,
  onSubmit,
  submission = null,
  maxScore = 100,
  isLoading = false,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(gradeSubmissionSchema),
    defaultValues: {
      score: 0,
      feedback: '',
    },
  });

  useEffect(() => {
    if (submission) {
      reset({
        score: submission.score ?? 0,
        feedback: submission.feedback || '',
      });
    }
  }, [submission, reset, isOpen]);

  const handleFormSubmit = async (formData) => {
    if (submission) {
      await onSubmit({
        submissionId: submission._id || submission.id,
        score: Number(formData.score),
        feedback: formData.feedback || undefined,
      });
      reset();
      onClose();
    }
  };

  const studentName = submission?.studentId
    ? `${submission.studentId.firstName || ''} ${submission.studentId.lastName || ''}`.trim()
    : 'Student';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Grade Student Submission"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Student & Max Score Card */}
        <div className="bg-surface-muted/60 p-3 rounded-md text-xs space-y-1 text-text-secondary border border-border">
          <div>
            <span className="font-semibold text-text-primary">Student:</span> {studentName} ({submission?.studentId?.admissionNumber || '—'})
          </div>
          <div>
            <span className="font-semibold text-text-primary">Max Allowable Points:</span> {maxScore} pts
          </div>
          {submission?.status === 'LATE' && (
            <div className="text-warning-700 font-medium pt-0.5">
              Status: Late Submission (applicable penalties are calculated on save)
            </div>
          )}
        </div>

        {/* Score Input */}
        <Input
          label="Awarded Score / Marks *"
          type="number"
          min={0}
          max={maxScore}
          step="0.5"
          placeholder="e.g. 85"
          error={errors.score?.message}
          {...register('score')}
        />

        {/* Teacher Feedback */}
        <Textarea
          label="Feedback & Constructive Comments (Optional)"
          placeholder="Provide specific notes on what the student did well or needs to improve..."
          rows={4}
          error={errors.feedback?.message}
          {...register('feedback')}
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
            Save Grade & Feedback
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default GradeSubmissionModal;

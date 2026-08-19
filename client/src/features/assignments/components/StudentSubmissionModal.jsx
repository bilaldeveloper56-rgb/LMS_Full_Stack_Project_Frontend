import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Paperclip, AlertCircle } from 'lucide-react';
import {
  Modal,
  Textarea,
  Input,
  Button,
} from '@/components/ui';
import { submitAssignmentSchema } from '../schemas/assignment.schema';

/**
 * StudentSubmissionModal component for submitting homework.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onSubmit
 * @param {object} props.assignment
 * @param {object} [props.existingSubmission]
 * @param {boolean} [props.isLoading=false]
 */
export function StudentSubmissionModal({
  isOpen,
  onClose,
  onSubmit,
  assignment,
  existingSubmission = null,
  isLoading = false,
}) {
  const [attachments, setAttachments] = useState(existingSubmission?.attachments || []);
  const [newAttachment, setNewAttachment] = useState({ name: '', url: '' });

  const isPastDue = assignment ? new Date(assignment.dueDate) < new Date() : false;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(submitAssignmentSchema),
    defaultValues: {
      submissionContent: existingSubmission?.submissionContent || '',
      attachments: existingSubmission?.attachments || [],
    },
  });

  useEffect(() => {
    if (existingSubmission) {
      reset({
        submissionContent: existingSubmission.submissionContent || '',
        attachments: existingSubmission.attachments || [],
      });
      setAttachments(existingSubmission.attachments || []);
    } else {
      reset({ submissionContent: '', attachments: [] });
      setAttachments([]);
    }
  }, [existingSubmission, reset, isOpen]);

  const handleAddAttachment = () => {
    if (newAttachment.name.trim() && newAttachment.url.trim()) {
      const updated = [...attachments, { ...newAttachment, fileType: 'link' }];
      setAttachments(updated);
      setValue('attachments', updated);
      setNewAttachment({ name: '', url: '' });
    }
  };

  const handleRemoveAttachment = (index) => {
    const updated = attachments.filter((_, i) => i !== index);
    setAttachments(updated);
    setValue('attachments', updated);
  };

  const handleFormSubmit = async (formData) => {
    await onSubmit({
      ...formData,
      attachments,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingSubmission ? 'Resubmit Assignment' : 'Submit Assignment'}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Assignment Brief Header */}
        <div className="bg-surface-muted/60 p-3.5 rounded-md text-xs space-y-1 text-text-secondary border border-border">
          <div className="font-semibold text-text-primary text-sm">
            {assignment?.title}
          </div>
          <div>Max Score: {assignment?.maxScore} points</div>
          {isPastDue && (
            <div className="flex items-center gap-1.5 text-warning-700 font-medium pt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>
                Note: This assignment is past due.
                {assignment?.lateSubmissionPenaltyPercentage > 0 &&
                  ` A ${assignment.lateSubmissionPenaltyPercentage}% late penalty will apply.`}
              </span>
            </div>
          )}
        </div>

        {/* Written Response */}
        <Textarea
          label="Your Submission / Solution Text"
          placeholder="Type your response, proofs, or notes here..."
          rows={5}
          error={errors.submissionContent?.message}
          {...register('submissionContent')}
        />

        {/* Attachments Section */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-primary">
            Attached File Links / Cloud Drive URLs (Optional)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="File title (e.g. Solution PDF)"
              value={newAttachment.name}
              onChange={(e) => setNewAttachment((prev) => ({ ...prev, name: e.target.value }))}
              className="text-xs"
            />
            <Input
              placeholder="https://drive.google.com/..."
              value={newAttachment.url}
              onChange={(e) => setNewAttachment((prev) => ({ ...prev, url: e.target.value }))}
              className="text-xs"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={Plus}
              onClick={handleAddAttachment}
              className="shrink-0"
            >
              Add Link
            </Button>
          </div>

          {attachments.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-surface-muted rounded text-xs border border-border"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="w-3 h-3 text-primary-600 shrink-0" />
                    <span className="font-medium text-text-primary">{att.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 text-danger-600"
                    onClick={() => handleRemoveAttachment(idx)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

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
            {existingSubmission ? 'Submit Revision' : 'Turn In Assignment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default StudentSubmissionModal;

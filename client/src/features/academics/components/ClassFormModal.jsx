import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Modal,
  Input,
  Select,
  Textarea,
  Checkbox,
  Button,
} from '@/components/ui';
import { classFormSchema } from '../schemas/academics.schema';
import { useAcademicSessions } from '../hooks/useAcademics';

/**
 * ClassFormModal component for creating and editing school classes.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onSubmit
 * @param {object} [props.initialValues]
 * @param {boolean} [props.isLoading=false]
 */
export function ClassFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues = null,
  isLoading = false,
}) {
  const isEdit = Boolean(initialValues);
  const { data: sessionsData, isLoading: isLoadingSessions } = useAcademicSessions({ limit: 100 });
  const sessions = sessionsData?.sessions || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: '',
      code: '',
      academicSessionId: '',
      description: '',
      displayOrder: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        name: initialValues.name || '',
        code: initialValues.code || '',
        academicSessionId: initialValues.academicSessionId?._id || initialValues.academicSessionId || '',
        description: initialValues.description || '',
        displayOrder: initialValues.displayOrder ?? 0,
        isActive: initialValues.isActive !== false,
      });
    } else {
      // Pick current session by default if available
      const currentSession = sessions.find((s) => s.isCurrent);
      reset({
        name: '',
        code: '',
        academicSessionId: currentSession ? (currentSession._id || currentSession.id) : '',
        description: '',
        displayOrder: 0,
        isActive: true,
      });
    }
  }, [initialValues, reset, isOpen, sessions]);

  const handleFormSubmit = async (formData) => {
    await onSubmit(formData);
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
      title={isEdit ? 'Edit Class' : 'Create Class'}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Class Name *"
          placeholder="e.g. Grade 10"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Class Code *"
            placeholder="e.g. G10"
            error={errors.code?.message}
            {...register('code')}
          />

          <Select
            label="Academic Session *"
            disabled={isLoadingSessions}
            error={errors.academicSessionId?.message}
            options={[
              { value: '', label: 'Select Session' },
              ...sessions.map((s) => ({
                value: s._id || s.id,
                label: `${s.name}${s.isCurrent ? ' (Active)' : ''}`,
              })),
            ]}
            {...register('academicSessionId')}
          />
        </div>

        <Input
          label="Display Order"
          type="number"
          placeholder="e.g. 10"
          error={errors.displayOrder?.message}
          {...register('displayOrder')}
        />

        <Textarea
          label="Description"
          placeholder="Optional notes or description..."
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="pt-1">
          <Checkbox
            label="Class is active for enrollment and attendance"
            {...register('isActive')}
          />
        </div>

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
            {isEdit ? 'Save Changes' : 'Create Class'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ClassFormModal;

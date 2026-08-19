import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Modal,
  Input,
  Select,
  Checkbox,
  Button,
} from '@/components/ui';
import {
  sessionFormSchema,
  SESSION_STATUS_OPTIONS,
} from '../schemas/academics.schema';

/**
 * SessionFormModal component for creating and editing academic sessions.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onSubmit
 * @param {object} [props.initialValues]
 * @param {boolean} [props.isLoading=false]
 */
export function SessionFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues = null,
  isLoading = false,
}) {
  const isEdit = Boolean(initialValues);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      name: '',
      startDate: '',
      endDate: '',
      status: 'UPCOMING',
      isCurrent: false,
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        name: initialValues.name || '',
        startDate: initialValues.startDate
          ? new Date(initialValues.startDate).toISOString().split('T')[0]
          : '',
        endDate: initialValues.endDate
          ? new Date(initialValues.endDate).toISOString().split('T')[0]
          : '',
        status: initialValues.status || 'UPCOMING',
        isCurrent: initialValues.isCurrent || false,
      });
    } else {
      reset({
        name: '',
        startDate: '',
        endDate: '',
        status: 'UPCOMING',
        isCurrent: false,
      });
    }
  }, [initialValues, reset, isOpen]);

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
      title={isEdit ? 'Edit Academic Session' : 'Create Academic Session'}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Session Name *"
          placeholder="e.g. 2026-2027 Academic Year"
          error={errors.name?.message}
          {...register('name')}
        />

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

        <Select
          label="Session Lifecycle Status *"
          options={SESSION_STATUS_OPTIONS}
          error={errors.status?.message}
          {...register('status')}
        />

        <div className="pt-1">
          <Checkbox
            label="Mark as current active academic session"
            {...register('isCurrent')}
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
            {isEdit ? 'Save Changes' : 'Create Session'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default SessionFormModal;

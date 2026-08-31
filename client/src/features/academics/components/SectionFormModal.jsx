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
import { sectionFormSchema } from '../schemas/academics.schema';
import { useClasses } from '../hooks/useAcademics';
import { useTeachers } from '@/features/teachers';

/**
 * SectionFormModal component for creating and editing class sections.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onSubmit
 * @param {object} [props.initialValues]
 * @param {boolean} [props.isLoading=false]
 */
export function SectionFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialValues = null,
  isLoading = false,
}) {
  const isEdit = Boolean(initialValues);
  const { data: classesData, isLoading: isLoadingClasses } = useClasses({ limit: 100 });
  const { data: teachersData, isLoading: isLoadingTeachers } = useTeachers({ limit: 100 });

  const classes = classesData?.classes || [];
  const teachers = teachersData?.teachers || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(sectionFormSchema),
    defaultValues: {
      name: '',
      code: '',
      classId: '',
      capacity: 40,
      room: '',
      classTeacherId: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (initialValues) {
      reset({
        name: initialValues.name || '',
        code: initialValues.code || '',
        classId: initialValues.classId?._id || initialValues.classId || '',
        capacity: initialValues.capacity ?? 40,
        room: initialValues.room || '',
        classTeacherId: initialValues.classTeacherId?._id || initialValues.classTeacherId || '',
        isActive: initialValues.isActive !== false,
      });
    } else {
      reset({
        name: '',
        code: '',
        classId: '',
        capacity: 40,
        room: '',
        classTeacherId: '',
        isActive: true,
      });
    }
  }, [initialValues, reset, isOpen]);

  const handleFormSubmit = async (formData) => {
    // Sanitize optional empty strings to undefined
    const payload = {
      ...formData,
      classTeacherId: formData.classTeacherId || undefined,
      room: formData.room || undefined,
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
      title={isEdit ? 'Edit Section' : 'Create Section'}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Section Name *"
          placeholder="e.g. Section A"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Section Code *"
            placeholder="e.g. SEC-A"
            error={errors.code?.message}
            {...register('code')}
          />

          <Select
            label="Parent Class *"
            disabled={isLoadingClasses}
            error={errors.classId?.message}
            options={[
              { value: '', label: 'Select Class' },
              ...classes.map((c) => ({ value: c._id || c.id, label: c.name })),
            ]}
            {...register('classId')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Student Capacity"
            type="number"
            placeholder="40"
            error={errors.capacity?.message}
            {...register('capacity')}
          />

          <Input
            label="Classroom / Room Number"
            placeholder="e.g. Room 204"
            error={errors.room?.message}
            {...register('room')}
          />
        </div>

        <Select
          label="Class Teacher / In-Charge"
          disabled={isLoadingTeachers}
          error={errors.classTeacherId?.message}
          options={[
            { value: '', label: 'None / Unassigned' },
            ...teachers.map((t) => ({
              value: t._id || t.id,
              label: `${t.firstName} ${t.lastName} (${t.employeeId})`,
            })),
          ]}
          {...register('classTeacherId')}
        />

        <div className="pt-1">
          <Checkbox
            label="Section is active for enrollment"
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
            {isEdit ? 'Save Changes' : 'Create Section'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default SectionFormModal;

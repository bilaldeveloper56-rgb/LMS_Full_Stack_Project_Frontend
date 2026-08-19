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
import {
  subjectFormSchema,
  SUBJECT_TYPE_OPTIONS,
} from '../schemas/academics.schema';

/**
 * SubjectFormModal component for creating and editing school subjects.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onSubmit
 * @param {object} [props.initialValues]
 * @param {boolean} [props.isLoading=false]
 */
export function SubjectFormModal({
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
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      subjectType: 'CORE',
      isOptional: false,
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        name: initialValues.name || '',
        code: initialValues.code || '',
        description: initialValues.description || '',
        subjectType: initialValues.subjectType || 'CORE',
        isOptional: initialValues.isOptional || false,
        isActive: initialValues.isActive !== false,
      });
    } else {
      reset({
        name: '',
        code: '',
        description: '',
        subjectType: 'CORE',
        isOptional: false,
        isActive: true,
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
      title={isEdit ? 'Edit Subject' : 'Create Subject'}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Subject Name *"
          placeholder="e.g. Mathematics / Advanced Calculus"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Subject Code *"
            placeholder="e.g. MATH-101"
            error={errors.code?.message}
            {...register('code')}
          />

          <Select
            label="Subject Type *"
            options={SUBJECT_TYPE_OPTIONS}
            error={errors.subjectType?.message}
            {...register('subjectType')}
          />
        </div>

        <Textarea
          label="Description"
          placeholder="Syllabus outline or course summary..."
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="space-y-2 pt-1">
          <Checkbox
            label="Elective / Optional Subject"
            {...register('isOptional')}
          />
          <Checkbox
            label="Subject is active for curriculum and timetables"
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
            {isEdit ? 'Save Changes' : 'Create Subject'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default SubjectFormModal;

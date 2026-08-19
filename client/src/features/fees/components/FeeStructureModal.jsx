import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, Input, Select, Button } from '@/components/ui';
import { createFeeStructureSchema, FEE_FREQUENCIES } from '../schemas/fee.schema';
import { useCreateFeeStructure, useFeeCategories } from '../hooks/useFees';
import { useAcademicSessions, useClasses } from '@/features/academics';

/**
 * FeeStructureModal component.
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 */
export function FeeStructureModal({ isOpen, onClose }) {
  const { data: sessionsData, isLoading: isLoadingSessions } = useAcademicSessions();
  const { data: classesData, isLoading: isLoadingClasses } = useClasses();
  const { data: categories = [], isLoading: isLoadingCategories } = useFeeCategories();
  const createStructureMutation = useCreateFeeStructure();

  const sessions = sessionsData?.academicSessions || sessionsData?.sessions || sessionsData || [];
  const classes = classesData?.classes || classesData || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createFeeStructureSchema),
    defaultValues: {
      academicSessionId: '',
      classId: '',
      feeCategoryId: '',
      name: '',
      amount: 0,
      frequency: 'MONTHLY',
    },
  });

  const handleFormSubmit = async (data) => {
    await createStructureMutation.mutateAsync({
      ...data,
      amount: Number(data.amount),
    });
    reset();
    onClose();
  };

  const sessionOptions = [
    { value: '', label: isLoadingSessions ? 'Loading sessions...' : 'Select Academic Session *' },
    ...sessions.map((s) => ({ value: s._id || s.id, label: s.name })),
  ];

  const classOptions = [
    { value: '', label: isLoadingClasses ? 'Loading classes...' : 'Select Class *' },
    ...classes.map((c) => ({ value: c._id || c.id, label: c.name })),
  ];

  const categoryOptions = [
    { value: '', label: isLoadingCategories ? 'Loading categories...' : 'Select Fee Category *' },
    ...categories.map((c) => ({ value: c._id || c.id, label: c.name })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Fee Structure"
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Select
          label="Academic Session *"
          options={sessionOptions}
          error={errors.academicSessionId?.message}
          {...register('academicSessionId')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Target Class *"
            options={classOptions}
            error={errors.classId?.message}
            {...register('classId')}
          />

          <Select
            label="Fee Category *"
            options={categoryOptions}
            error={errors.feeCategoryId?.message}
            {...register('feeCategoryId')}
          />
        </div>

        <Input
          label="Fee Item / Structure Name *"
          placeholder="e.g. Grade 10 Monthly Tuition"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Amount (₨ / PKR) *"
            type="number"
            min={0}
            step="any"
            placeholder="e.g. 5000"
            error={errors.amount?.message}
            {...register('amount')}
          />

          <Select
            label="Billing Frequency"
            options={FEE_FREQUENCIES}
            error={errors.frequency?.message}
            {...register('frequency')}
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={createStructureMutation.isPending}
          >
            Create Structure
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default FeeStructureModal;

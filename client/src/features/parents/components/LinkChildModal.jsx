import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Modal,
  Select,
  Checkbox,
  Button,
} from '@/components/ui';
import { linkChildSchema, RELATIONSHIP_TYPE_OPTIONS } from '../schemas/parent.schema';
import { useStudents } from '@/features/students';

/**
 * LinkChildModal for associating an existing student to a parent.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onLink
 * @param {boolean} [props.isLoading=false]
 */
export function LinkChildModal({
  isOpen,
  onClose,
  onLink,
  isLoading = false,
}) {
  const { data: studentsData, isLoading: isLoadingStudents } = useStudents({ limit: 100 });
  const students = studentsData?.students || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(linkChildSchema),
    defaultValues: {
      studentId: '',
      relationshipType: 'GUARDIAN',
      isPrimary: false,
      canPickup: true,
      emergencyContact: true,
    },
  });

  const onSubmit = async (formData) => {
    await onLink(formData);
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
      title="Link Student to Parent / Guardian"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Student Select */}
        <Select
          label="Select Student *"
          disabled={isLoadingStudents}
          error={errors.studentId?.message}
          options={[
            { value: '', label: 'Choose a student...' },
            ...students.map((s) => ({
              value: s._id || s.id,
              label: `${s.firstName} ${s.lastName} (${s.admissionNumber})`,
            })),
          ]}
          {...register('studentId')}
        />

        {/* Relationship Type */}
        <Select
          label="Relationship Type *"
          options={RELATIONSHIP_TYPE_OPTIONS}
          error={errors.relationshipType?.message}
          {...register('relationshipType')}
        />

        {/* Checkbox Options */}
        <div className="space-y-2 pt-2 border-t border-border">
          <Checkbox
            label="Primary Guardian (Main contact for notifications & billing)"
            {...register('isPrimary')}
          />
          <Checkbox
            label="Authorized for Student Pick-up"
            {...register('canPickup')}
          />
          <Checkbox
            label="Designated Emergency Contact"
            {...register('emergencyContact')}
          />
        </div>

        {/* Modal Controls */}
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
            Link Student
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default LinkChildModal;

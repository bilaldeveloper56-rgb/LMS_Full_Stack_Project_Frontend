import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, Input, Select, Button } from '@/components/ui';
import { createExamPaperSchema } from '../schemas/exam.schema';
import { useClasses, useSubjects } from '@/features/academics';
import { useTeachers } from '@/features/teachers';

/**
 * SchedulePaperModal component.
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onSubmit
 * @param {boolean} [props.isLoading=false]
 */
export function SchedulePaperModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) {
  const { data: classesData, isLoading: isLoadingClasses } = useClasses();
  const { data: subjectsData, isLoading: isLoadingSubjects } = useSubjects();
  const { data: teachersData, isLoading: isLoadingTeachers } = useTeachers();

  const classes = classesData?.classes || classesData || [];
  const subjects = subjectsData?.subjects || subjectsData || [];
  const teachers = teachersData?.teachers || teachersData || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createExamPaperSchema),
    defaultValues: {
      classId: '',
      subjectId: '',
      date: '',
      startTime: '09:00',
      endTime: '12:00',
      room: '',
      totalMarks: 100,
      passingMarks: 40,
      invigilatorTeacherId: '',
    },
  });

  const handleFormSubmit = async (data) => {
    // Format payload
    const payload = {
      ...data,
      totalMarks: Number(data.totalMarks),
      passingMarks: Number(data.passingMarks),
      invigilatorTeacherId: data.invigilatorTeacherId || undefined,
      room: data.room || undefined,
    };
    await onSubmit(payload);
    reset();
    onClose();
  };

  const classOptions = [
    { value: '', label: isLoadingClasses ? 'Loading classes...' : 'Select Class' },
    ...classes.map((c) => ({ value: c._id || c.id, label: c.name })),
  ];

  const subjectOptions = [
    { value: '', label: isLoadingSubjects ? 'Loading subjects...' : 'Select Subject' },
    ...subjects.map((s) => ({ value: s._id || s.id, label: `${s.name} (${s.code || ''})` })),
  ];

  const teacherOptions = [
    { value: '', label: isLoadingTeachers ? 'Loading teachers...' : 'Select Invigilator (Optional)' },
    ...teachers.map((t) => ({
      value: t._id || t.id,
      label: `${t.firstName || ''} ${t.lastName || ''}`.trim() || 'Teacher',
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Exam Paper"
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Class *"
            options={classOptions}
            error={errors.classId?.message}
            {...register('classId')}
          />

          <Select
            label="Subject *"
            options={subjectOptions}
            error={errors.subjectId?.message}
            {...register('subjectId')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Exam Date *"
            type="date"
            error={errors.date?.message}
            {...register('date')}
          />

          <Input
            label="Start Time *"
            type="time"
            error={errors.startTime?.message}
            {...register('startTime')}
          />

          <Input
            label="End Time *"
            type="time"
            error={errors.endTime?.message}
            {...register('endTime')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Total Marks *"
            type="number"
            min={1}
            error={errors.totalMarks?.message}
            {...register('totalMarks')}
          />

          <Input
            label="Passing Marks *"
            type="number"
            min={0}
            error={errors.passingMarks?.message}
            {...register('passingMarks')}
          />

          <Input
            label="Room / Hall"
            placeholder="e.g. Hall A, Room 204"
            error={errors.room?.message}
            {...register('room')}
          />
        </div>

        <Select
          label="Invigilator Teacher"
          options={teacherOptions}
          error={errors.invigilatorTeacherId?.message}
          {...register('invigilatorTeacherId')}
        />

        <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
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
            Schedule Paper
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default SchedulePaperModal;

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Modal,
  Select,
  Input,
  Button,
} from '@/components/ui';
import {
  timetableSlotSchema,
  DAY_OF_WEEK_OPTIONS,
  PERIOD_NUMBERS,
} from '../schemas/timetable.schema';
import { useSubjects } from '@/features/academics';
import { useTeachers } from '@/features/teachers';

/**
 * TimetableSlotModal for creating and editing periods.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onSubmit
 * @param {object} [props.slot=null]
 * @param {object} [props.defaultValues={}]
 * @param {boolean} [props.isLoading=false]
 */
export function TimetableSlotModal({
  isOpen,
  onClose,
  onSubmit,
  slot = null,
  defaultValues = {},
  isLoading = false,
}) {
  const isEditing = Boolean(slot);

  const { data: subjectsData } = useSubjects(
    defaultValues.classId ? { classId: defaultValues.classId, limit: 100 } : { limit: 100 }
  );
  const { data: teachersData } = useTeachers({ limit: 100 });

  const subjects = subjectsData?.subjects || [];
  const teachers = teachersData?.teachers || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(timetableSlotSchema),
    defaultValues: {
      academicSessionId: '',
      classId: '',
      sectionId: '',
      subjectId: '',
      teacherId: '',
      dayOfWeek: 'MONDAY',
      periodNumber: 1,
      startTime: '08:00',
      endTime: '08:45',
      room: '',
    },
  });

  useEffect(() => {
    if (slot) {
      reset({
        academicSessionId: slot.academicSessionId?._id || slot.academicSessionId || defaultValues.academicSessionId || '',
        classId: slot.classId?._id || slot.classId || defaultValues.classId || '',
        sectionId: slot.sectionId?._id || slot.sectionId || defaultValues.sectionId || '',
        subjectId: slot.subjectId?._id || slot.subjectId || '',
        teacherId: slot.teacherId?._id || slot.teacherId || '',
        dayOfWeek: slot.dayOfWeek || 'MONDAY',
        periodNumber: slot.periodNumber || 1,
        startTime: slot.startTime || '08:00',
        endTime: slot.endTime || '08:45',
        room: slot.room || '',
      });
    } else if (isOpen) {
      reset({
        academicSessionId: defaultValues.academicSessionId || '',
        classId: defaultValues.classId || '',
        sectionId: defaultValues.sectionId || '',
        subjectId: '',
        teacherId: defaultValues.teacherId || '',
        dayOfWeek: defaultValues.dayOfWeek || 'MONDAY',
        periodNumber: defaultValues.periodNumber || 1,
        startTime: defaultValues.startTime || '08:00',
        endTime: defaultValues.endTime || '08:45',
        room: '',
      });
    }
  }, [slot, defaultValues, isOpen, reset]);

  const handleFormSubmit = async (formData) => {
    const payload = {
      ...formData,
      room: formData.room || undefined,
    };
    if (isEditing) {
      await onSubmit({ id: slot._id || slot.id, ...payload });
    } else {
      await onSubmit(payload);
    }
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
      title={isEditing ? 'Edit Timetable Period' : 'Schedule Timetable Period'}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Day of Week */}
          <Select
            label="Day of Week *"
            options={DAY_OF_WEEK_OPTIONS}
            error={errors.dayOfWeek?.message}
            {...register('dayOfWeek')}
          />

          {/* Period Number */}
          <Select
            label="Period Number *"
            options={PERIOD_NUMBERS.map((p) => ({ value: String(p), label: `Period ${p}` }))}
            error={errors.periodNumber?.message}
            {...register('periodNumber')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Start Time */}
          <Input
            label="Start Time (HH:mm) *"
            placeholder="08:00"
            error={errors.startTime?.message}
            {...register('startTime')}
          />

          {/* End Time */}
          <Input
            label="End Time (HH:mm) *"
            placeholder="08:45"
            error={errors.endTime?.message}
            {...register('endTime')}
          />
        </div>

        {/* Subject Selection */}
        <Select
          label="Subject *"
          options={[
            { value: '', label: 'Select Subject' },
            ...subjects.map((s) => ({
              value: s._id || s.id,
              label: `${s.name} (${s.code || 'Sub'})`,
            })),
          ]}
          error={errors.subjectId?.message}
          {...register('subjectId')}
        />

        {/* Teacher Selection */}
        <Select
          label="Teacher / Faculty *"
          options={[
            { value: '', label: 'Select Teacher' },
            ...teachers.map((t) => ({
              value: t._id || t.id,
              label: `${t.firstName || ''} ${t.lastName || ''} (${t.employeeId || 'Faculty'})`,
            })),
          ]}
          error={errors.teacherId?.message}
          {...register('teacherId')}
        />

        {/* Room / Location */}
        <Input
          label="Room / Classroom (Optional)"
          placeholder="e.g. Lab 2, Room 104"
          error={errors.room?.message}
          {...register('room')}
        />

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
            {isEditing ? 'Save Changes' : 'Schedule Period'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default TimetableSlotModal;

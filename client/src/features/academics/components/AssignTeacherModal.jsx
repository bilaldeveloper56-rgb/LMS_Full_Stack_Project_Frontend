import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Modal,
  Select,
  Button,
} from '@/components/ui';
import { teacherAssignmentSchema } from '../schemas/academics.schema';
import {
  useAcademicSessions,
  useClasses,
  useSections,
  useSubjects,
} from '../hooks/useAcademics';
import { useTeachers } from '@/features/teachers';

/**
 * AssignTeacherModal component for assigning a teacher to a subject, class, and section.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onSubmit
 * @param {boolean} [props.isLoading=false]
 */
export function AssignTeacherModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) {
  const [selectedClassId, setSelectedClassId] = useState('');

  const { data: sessionsData, isLoading: isLoadingSessions } = useAcademicSessions({ limit: 100 });
  const { data: teachersData, isLoading: isLoadingTeachers } = useTeachers({ limit: 100 });
  const { data: classesData, isLoading: isLoadingClasses } = useClasses({ limit: 100 });
  const { data: sectionsData, isLoading: isLoadingSections } = useSections(
    selectedClassId ? { classId: selectedClassId, limit: 100 } : { limit: 100 }
  );
  const { data: subjectsData, isLoading: isLoadingSubjects } = useSubjects({ limit: 100 });

  const sessions = sessionsData?.sessions || [];
  const teachers = teachersData?.teachers || [];
  const classes = classesData?.classes || [];
  const sections = sectionsData?.sections || [];
  const subjects = subjectsData?.subjects || [];

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(teacherAssignmentSchema),
    defaultValues: {
      academicSessionId: '',
      teacherId: '',
      classId: '',
      sectionId: '',
      subjectId: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      const currentSession = sessions.find((s) => s.isCurrent);
      reset({
        academicSessionId: currentSession ? (currentSession._id || currentSession.id) : '',
        teacherId: '',
        classId: '',
        sectionId: '',
        subjectId: '',
      });
      setSelectedClassId('');
    }
  }, [isOpen, reset, sessions]);

  const classRegistration = register('classId');

  const handleClassChange = (e) => {
    classRegistration.onChange(e);
    const classId = e.target.value;
    setSelectedClassId(classId);
    setValue('sectionId', '', { shouldValidate: true });
  };

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
      title="Assign Teacher to Subject & Class"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Academic Session */}
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

        {/* Teacher Select */}
        <Select
          label="Teacher *"
          disabled={isLoadingTeachers}
          error={errors.teacherId?.message}
          options={[
            { value: '', label: 'Select Teacher' },
            ...teachers.map((t) => ({
              value: t._id || t.id,
              label: `${t.firstName} ${t.lastName} (${t.employeeId})`,
            })),
          ]}
          {...register('teacherId')}
        />

        {/* Subject Select */}
        <Select
          label="Subject *"
          disabled={isLoadingSubjects}
          error={errors.subjectId?.message}
          options={[
            { value: '', label: 'Select Subject' },
            ...subjects.map((sub) => ({
              value: sub._id || sub.id,
              label: `${sub.name} (${sub.code})`,
            })),
          ]}
          {...register('subjectId')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Class Select */}
          <Select
            label="Class *"
            disabled={isLoadingClasses}
            error={errors.classId?.message}
            options={[
              { value: '', label: 'Select Class' },
              ...classes.map((c) => ({ value: c._id || c.id, label: c.name })),
            ]}
            {...classRegistration}
            onChange={handleClassChange}
          />

          {/* Section Select */}
          <Select
            label="Section *"
            disabled={isLoadingSections || !selectedClassId}
            error={errors.sectionId?.message}
            options={[
              { value: '', label: selectedClassId ? 'Select Section' : 'Select Class First' },
              ...sections.map((sec) => ({ value: sec._id || sec.id, label: sec.name })),
            ]}
            {...register('sectionId')}
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
            Assign Teacher
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default AssignTeacherModal;

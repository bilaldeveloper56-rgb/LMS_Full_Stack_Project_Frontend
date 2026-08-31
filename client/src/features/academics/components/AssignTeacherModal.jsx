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

  const [selectedSectionIds, setSelectedSectionIds] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const currentSession = sessions.find((s) => s.isCurrent);
      reset({
        academicSessionId: currentSession ? (currentSession._id || currentSession.id) : '',
        teacherId: '',
        classId: '',
        sectionId: '',
        sectionIds: [],
        subjectId: '',
      });
      setSelectedClassId('');
      setSelectedSectionIds([]);
    }
  }, [isOpen, reset, sessions]);

  const classRegistration = register('classId');

  const handleClassChange = (e) => {
    classRegistration.onChange(e);
    const classId = e.target.value;
    setSelectedClassId(classId);
    setSelectedSectionIds([]);
    setValue('sectionId', '', { shouldValidate: true });
    setValue('sectionIds', [], { shouldValidate: true });
  };

  const handleToggleSection = (sectionId) => {
    const next = selectedSectionIds.includes(sectionId)
      ? selectedSectionIds.filter((id) => id !== sectionId)
      : [...selectedSectionIds, sectionId];
    setSelectedSectionIds(next);
    setValue('sectionIds', next, { shouldValidate: true });
    setValue('sectionId', next[0] || '', { shouldValidate: true });
  };

  const handleSelectAllSections = () => {
    const allIds = sections.map((s) => s._id || s.id);
    const next = selectedSectionIds.length === allIds.length ? [] : allIds;
    setSelectedSectionIds(next);
    setValue('sectionIds', next, { shouldValidate: true });
    setValue('sectionId', next[0] || '', { shouldValidate: true });
  };

  const handleFormSubmit = async (formData) => {
    const payload = {
      ...formData,
      sectionIds: selectedSectionIds.length > 0 ? selectedSectionIds : [formData.sectionId].filter(Boolean),
      sectionId: selectedSectionIds[0] || formData.sectionId,
    };
    await onSubmit(payload);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    setSelectedSectionIds([]);
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
              label: `${s.name}${s.isCurrent ? ' (Current Session)' : ''}`,
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

        {/* Multi-Section Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text-primary">
              Sections * {selectedSectionIds.length > 0 && `(${selectedSectionIds.length} selected)`}
            </label>
            {selectedClassId && sections.length > 1 && (
              <button
                type="button"
                onClick={handleSelectAllSections}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                {selectedSectionIds.length === sections.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          {!selectedClassId ? (
            <p className="text-xs text-text-muted italic border border-dashed border-border rounded p-3 text-center">
              Please select a class first to view available sections.
            </p>
          ) : isLoadingSections ? (
            <p className="text-xs text-text-muted border border-border rounded p-3 text-center">
              Loading sections...
            </p>
          ) : sections.length === 0 ? (
            <p className="text-xs text-warning-700 bg-warning-50 border border-warning-200 rounded p-3">
              No sections available for this class. Please create a section in Class Management.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border border-border rounded-md p-3 bg-surface-muted/30 max-h-40 overflow-y-auto">
              {sections.map((sec) => {
                const secId = sec._id || sec.id;
                const isSelected = selectedSectionIds.includes(secId);
                return (
                  <label
                    key={secId}
                    className={`flex items-center gap-2 px-3 py-2 rounded border text-xs font-medium cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 text-primary-900 dark:bg-primary-950/40 dark:text-primary-200'
                        : 'border-border bg-surface hover:bg-surface-muted text-text-primary'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSection(secId)}
                      className="rounded border-border text-primary-600 focus:ring-primary-500"
                    />
                    <span className="truncate">{sec.name} {sec.code ? `(${sec.code})` : ''}</span>
                  </label>
                );
              })}
            </div>
          )}
          {errors.sectionId && (
            <p className="text-xs text-danger-600">{errors.sectionId.message}</p>
          )}
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

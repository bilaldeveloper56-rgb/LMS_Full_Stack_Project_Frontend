import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Paperclip } from 'lucide-react';
import {
  Select,
  Input,
  Textarea,
  Checkbox,
  Button,
  Card,
} from '@/components/ui';
import { createAssignmentSchema } from '../schemas/assignment.schema';
import { useAcademicSessions, useClasses, useSections, useSubjects } from '@/features/academics';
import { useTeachers } from '@/features/teachers';
import { useAuthorization } from '@/hooks/useAuthorization';
import { ROLES } from '@/constants';

/**
 * AssignmentForm component for authoring and editing assignments.
 *
 * @param {object} props
 * @param {object} [props.defaultValues]
 * @param {Function} props.onSubmit
 * @param {boolean} [props.isLoading=false]
 * @param {boolean} [props.isEditing=false]
 */
export function AssignmentForm({
  defaultValues = {},
  onSubmit,
  isLoading = false,
  isEditing = false,
}) {
  const { user } = useAuthorization();
  const isTeacher = user?.role === ROLES.TEACHER;

  const [attachments, setAttachments] = useState(defaultValues.attachments || []);
  const [newAttachment, setNewAttachment] = useState({ name: '', url: '' });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createAssignmentSchema),
    defaultValues: {
      academicSessionId: '',
      classId: '',
      sectionId: '',
      subjectId: '',
      teacherId: '',
      title: '',
      description: '',
      dueDate: '',
      maxScore: 100,
      allowLateSubmission: true,
      lateSubmissionPenaltyPercentage: 0,
      attachments: [],
      ...defaultValues,
    },
  });

  const selectedClassId = watch('classId');
  const allowLate = watch('allowLateSubmission');

  const { data: sessionsData } = useAcademicSessions({ limit: 100 });
  const { data: classesData } = useClasses({ limit: 100 });
  const { data: sectionsData } = useSections(
    selectedClassId ? { classId: selectedClassId, limit: 100 } : { limit: 100 }
  );
  const { data: subjectsData } = useSubjects(
    selectedClassId ? { classId: selectedClassId, limit: 100 } : { limit: 100 }
  );
  const { data: teachersData } = useTeachers({ limit: 100 });

  const sessions = sessionsData?.sessions || [];
  const classes = classesData?.classes || [];
  const sections = sectionsData?.sections || [];
  const subjects = subjectsData?.subjects || [];
  const teachers = teachersData?.teachers || [];

  // Initialize active session
  useEffect(() => {
    if (!defaultValues.academicSessionId && sessions.length > 0) {
      const active = sessions.find((s) => s.isCurrent) || sessions[0];
      if (active) {
        setValue('academicSessionId', active._id || active.id);
      }
    }
  }, [sessions, defaultValues.academicSessionId, setValue]);

  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      reset({
        ...defaultValues,
        academicSessionId: defaultValues.academicSessionId?._id || defaultValues.academicSessionId || '',
        classId: defaultValues.classId?._id || defaultValues.classId || '',
        sectionId: defaultValues.sectionId?._id || defaultValues.sectionId || '',
        subjectId: defaultValues.subjectId?._id || defaultValues.subjectId || '',
        teacherId: defaultValues.teacherId?._id || defaultValues.teacherId || '',
        dueDate: defaultValues.dueDate
          ? new Date(defaultValues.dueDate).toISOString().slice(0, 16)
          : '',
      });
      setAttachments(defaultValues.attachments || []);
    }
  }, [defaultValues, reset]);

  const handleAddAttachment = () => {
    if (newAttachment.name.trim() && newAttachment.url.trim()) {
      const updated = [...attachments, { ...newAttachment, fileType: 'link' }];
      setAttachments(updated);
      setValue('attachments', updated);
      setNewAttachment({ name: '', url: '' });
    }
  };

  const handleRemoveAttachment = (index) => {
    const updated = attachments.filter((_, i) => i !== index);
    setAttachments(updated);
    setValue('attachments', updated);
  };

  const handleFormSubmit = async (formData) => {
    const payload = {
      ...formData,
      teacherId: formData.teacherId || undefined,
      attachments,
      dueDate: new Date(formData.dueDate).toISOString(),
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* 1. Academic Scope Section */}
      <Card className="p-6 space-y-4">
        <h2 className="text-base font-semibold text-text-primary border-b border-border pb-3">
          1. Academic Scope & Targeting
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Academic Session */}
          <Select
            label="Academic Session *"
            options={[
              { value: '', label: 'Select Session' },
              ...sessions.map((s) => ({
                value: s._id || s.id,
                label: `${s.name}${s.isCurrent ? ' (Active)' : ''}`,
              })),
            ]}
            error={errors.academicSessionId?.message}
            {...register('academicSessionId')}
          />

          {/* Class */}
          <Select
            label="Class *"
            options={[
              { value: '', label: 'Select Class' },
              ...classes.map((c) => ({ value: c._id || c.id, label: c.name })),
            ]}
            error={errors.classId?.message}
            {...register('classId', {
              onChange: () => {
                setValue('sectionId', '');
                setValue('subjectId', '');
              },
            })}
          />

          {/* Section */}
          <Select
            label="Section *"
            disabled={!selectedClassId}
            options={[
              { value: '', label: selectedClassId ? 'Select Section' : 'Select Class First' },
              ...sections.map((s) => ({ value: s._id || s.id, label: s.name })),
            ]}
            error={errors.sectionId?.message}
            {...register('sectionId')}
          />

          {/* Subject */}
          <Select
            label="Subject *"
            disabled={!selectedClassId}
            options={[
              { value: '', label: selectedClassId ? 'Select Subject' : 'Select Class First' },
              ...subjects.map((s) => ({ value: s._id || s.id, label: `${s.name} (${s.code || ''})` })),
            ]}
            error={errors.subjectId?.message}
            {...register('subjectId')}
          />

          {/* Teacher (optional/shown for admins) */}
          {!isTeacher && (
            <Select
              label="Assigned Teacher"
              options={[
                { value: '', label: 'Select Teacher (Optional)' },
                ...teachers.map((t) => ({
                  value: t._id || t.id,
                  label: `${t.firstName || ''} ${t.lastName || ''} (${t.employeeId || 'Faculty'})`,
                })),
              ]}
              error={errors.teacherId?.message}
              {...register('teacherId')}
            />
          )}
        </div>
      </Card>

      {/* 2. Assignment Information */}
      <Card className="p-6 space-y-4">
        <h2 className="text-base font-semibold text-text-primary border-b border-border pb-3">
          2. Assignment Information
        </h2>

        <Input
          label="Assignment Title *"
          placeholder="e.g. Chapter 4 Trigonometry Problem Set"
          error={errors.title?.message}
          {...register('title')}
        />

        <Textarea
          label="Instructions & Description *"
          placeholder="Provide comprehensive assignment guidelines, reference chapters, or questions..."
          rows={5}
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Due Date & Time *"
            type="datetime-local"
            error={errors.dueDate?.message}
            {...register('dueDate')}
          />

          <Input
            label="Maximum Score / Points *"
            type="number"
            min={1}
            error={errors.maxScore?.message}
            {...register('maxScore')}
          />
        </div>

        {/* Late Submission Controls */}
        <div className="bg-surface-muted/40 p-4 rounded-md space-y-3 border border-border">
          <Checkbox
            label="Allow late submissions after due date"
            {...register('allowLateSubmission')}
          />

          {allowLate && (
            <div className="sm:w-72 pt-1">
              <Input
                label="Late Submission Penalty Percentage (%)"
                type="number"
                min={0}
                max={100}
                placeholder="0"
                error={errors.lateSubmissionPenaltyPercentage?.message}
                {...register('lateSubmissionPenaltyPercentage')}
              />
            </div>
          )}
        </div>
      </Card>

      {/* 3. Attachment Links */}
      <Card className="p-6 space-y-4">
        <h2 className="text-base font-semibold text-text-primary border-b border-border pb-3">
          3. Resource Materials & Attachments
        </h2>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1 w-full">
              <Input
                label="Resource Name"
                placeholder="e.g. Reference Formula Sheet"
                value={newAttachment.name}
                onChange={(e) => setNewAttachment((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="flex-1 w-full">
              <Input
                label="Resource URL"
                placeholder="https://example.com/sheet.pdf"
                value={newAttachment.url}
                onChange={(e) => setNewAttachment((prev) => ({ ...prev, url: e.target.value }))}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={Plus}
              onClick={handleAddAttachment}
              className="h-10"
            >
              Add Link
            </Button>
          </div>

          {attachments.length > 0 && (
            <div className="space-y-2 pt-2">
              {attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-surface-muted rounded-md text-xs border border-border"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                    <span className="font-medium text-text-primary">{att.name}</span>
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline truncate max-w-xs"
                    >
                      ({att.url})
                    </a>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-danger-600 hover:bg-danger-50"
                    onClick={() => handleRemoveAttachment(idx)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Form Submission */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
        >
          {isEditing ? 'Save Changes' : 'Create Assignment'}
        </Button>
      </div>
    </form>
  );
}

export default AssignmentForm;

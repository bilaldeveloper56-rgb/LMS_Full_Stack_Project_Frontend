import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Breadcrumb, Button, Card, Input, Select, Textarea } from '@/components/ui';
import { ErrorState } from '@/components/feedback';
import { updateExamSchema, EXAM_TYPES } from '../schemas/exam.schema';
import { useExam, useUpdateExam } from '../hooks/useExams';

export function EditExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: exam, isLoading, isError, error } = useExam(id);
  const updateExamMutation = useUpdateExam();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateExamSchema),
    defaultValues: {
      name: '',
      examType: 'MID_TERM',
      startDate: '',
      endDate: '',
      description: '',
    },
  });

  useEffect(() => {
    if (exam) {
      const formatDateInput = (d) => {
        if (!d) return '';
        const dt = new Date(d);
        return isNaN(dt.getTime()) ? '' : dt.toISOString().split('T')[0];
      };

      reset({
        name: exam.name || '',
        examType: exam.examType || 'MID_TERM',
        startDate: formatDateInput(exam.startDate),
        endDate: formatDateInput(exam.endDate),
        description: exam.description || '',
      });
    }
  }, [exam, reset]);

  const onSubmit = async (data) => {
    await updateExamMutation.mutateAsync({ id, payload: data });
    navigate(`/exams/${id}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl animate-pulse" aria-busy="true">
        <div className="h-6 w-48 bg-surface-muted rounded-md" />
        <div className="h-64 bg-surface-muted rounded-xl" />
      </div>
    );
  }

  if (isError || !exam) {
    return (
      <ErrorState
        title="Failed to load examination"
        message={error?.message || 'Could not fetch exam details for editing.'}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Examinations', href: '/exams' },
          { label: exam.name, href: `/exams/${id}` },
          { label: 'Edit' },
        ]}
      />

      {/* Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Edit Examination
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Update examination term details, schedules, and instructions
        </p>
      </div>

      {/* Form Card */}
      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Exam Name */}
          <Input
            label="Exam Term Name *"
            placeholder="e.g. Mid-Term Examination 2026"
            error={errors.name?.message}
            {...register('name')}
          />

          {/* Exam Type */}
          <Select
            label="Exam Type *"
            options={EXAM_TYPES}
            error={errors.examType?.message}
            {...register('examType')}
          />

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* Description */}
          <Textarea
            label="Description & Instructions"
            placeholder="Provide details about exam protocols, schedules, or instructions..."
            rows={3}
            error={errors.description?.message}
            {...register('description')}
          />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/exams/${id}`)}
              disabled={updateExamMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={updateExamMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default EditExamPage;

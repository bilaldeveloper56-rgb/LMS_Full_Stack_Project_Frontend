import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Breadcrumb, Button, Card, Input, Select, Textarea } from '@/components/ui';
import { createExamSchema, EXAM_TYPES } from '../schemas/exam.schema';
import { useCreateExam } from '../hooks/useExams';
import { useAcademicSessions } from '@/features/academics';

export function CreateExamPage() {
  const navigate = useNavigate();
  const createExamMutation = useCreateExam();
  const { data: sessionsData, isLoading: isLoadingSessions } = useAcademicSessions();

  const sessions = sessionsData?.academicSessions || sessionsData?.sessions || sessionsData || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createExamSchema),
    defaultValues: {
      academicSessionId: '',
      name: '',
      examType: 'MID_TERM',
      startDate: '',
      endDate: '',
      description: '',
    },
  });

  const onSubmit = async (data) => {
    const res = await createExamMutation.mutateAsync(data);
    const id = res?._id || res?.id;
    if (id) {
      navigate(`/exams/${id}`);
    } else {
      navigate('/exams');
    }
  };

  const sessionOptions = [
    { value: '', label: isLoadingSessions ? 'Loading sessions...' : 'Select Academic Session *' },
    ...sessions.map((s) => ({ value: s._id || s.id, label: s.name })),
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Examinations', href: '/exams' },
          { label: 'New Examination' },
        ]}
      />

      {/* Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Create Examination Term
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Set up a new formal exam period to schedule papers and record student marks
        </p>
      </div>

      {/* Form Card */}
      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Academic Session */}
          <Select
            label="Academic Session *"
            options={sessionOptions}
            error={errors.academicSessionId?.message}
            {...register('academicSessionId')}
          />

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
              onClick={() => navigate('/exams')}
              disabled={createExamMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createExamMutation.isPending}
            >
              Create Examination
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default CreateExamPage;

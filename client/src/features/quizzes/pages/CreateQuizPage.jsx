import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Breadcrumb, Button, Card, Input, Textarea, Select, Checkbox } from '@/components/ui';
import { QuestionBuilder } from '../components/QuestionBuilder';
import { createQuizSchema } from '../schemas/quiz.schema';
import { useCreateQuiz } from '../hooks/useQuizzes';
import { useAcademicSessions, useClasses, useSections, useSubjects } from '@/features/academics';
import { useTeachers } from '@/features/teachers';
import { useAuthorization } from '@/hooks/useAuthorization';
import { ROLES } from '@/constants';

export function CreateQuizPage() {
  const navigate = useNavigate();
  const { user } = useAuthorization();
  const isTeacher = user?.role === ROLES.TEACHER;
  const createMutation = useCreateQuiz();

  const [questions, setQuestions] = useState([
    {
      id: 'q1',
      questionText: '',
      questionType: 'MCQ',
      marks: 1,
      options: [
        { optionText: 'Option 1', isCorrect: true },
        { optionText: 'Option 2', isCorrect: false },
      ],
      explanation: '',
    },
  ]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createQuizSchema),
    defaultValues: {
      academicSessionId: '',
      classId: '',
      sectionId: '',
      subjectId: '',
      teacherId: '',
      title: '',
      instructions: '',
      durationMinutes: 30,
      totalMarks: 1,
      passingMarks: 1,
      dueDate: '',
      maxAttempts: 1,
      shuffleQuestions: false,
      questions: [],
    },
  });

  const selectedClassId = watch('classId');

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

  // Default to active session
  useEffect(() => {
    if (sessions.length > 0) {
      const active = sessions.find((s) => s.isCurrent) || sessions[0];
      if (active) {
        setValue('academicSessionId', active._id || active.id);
      }
    }
  }, [sessions, setValue]);

  // Synchronize total marks from questions
  useEffect(() => {
    const computedTotal = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
    if (computedTotal > 0) {
      setValue('totalMarks', computedTotal);
      setValue('passingMarks', Math.ceil(computedTotal * 0.4)); // Default 40% pass
    }
    setValue('questions', questions);
  }, [questions, setValue]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      teacherId: data.teacherId || undefined,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      questions: questions.map((q) => ({
        questionText: q.questionText,
        questionType: q.questionType,
        marks: Number(q.marks),
        options: q.questionType !== 'SHORT_ANSWER' ? q.options : [],
        explanation: q.explanation || undefined,
      })),
    };
    await createMutation.mutateAsync(payload);
    navigate('/quizzes');
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Quizzes', href: '/quizzes' },
          { label: 'Create Quiz' },
        ]}
      />

      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Create New Quiz
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Configure quiz metadata, scoring rules, time limits, and questions
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 1. Academic Target Scope */}
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-text-primary border-b border-border pb-3">
            1. Academic Targeting
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select
              label="Academic Session *"
              options={[
                { value: '', label: 'Select Session' },
                ...sessions.map((s) => ({
                  value: s._id || s.id,
                  label: `${s.name}${s.isCurrent ? ' (Current Session)' : ''}`,
                })),
              ]}
              error={errors.academicSessionId?.message}
              {...register('academicSessionId')}
            />

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

            {!isTeacher && (
              <Select
                label="Assigned Teacher"
                options={[
                  { value: '', label: 'Select Teacher (Optional)' },
                  ...teachers.map((t) => ({
                    value: t._id || t.id,
                    label: `${t.firstName || ''} ${t.lastName || ''}`,
                  })),
                ]}
                error={errors.teacherId?.message}
                {...register('teacherId')}
              />
            )}
          </div>
        </Card>

        {/* 2. Configuration & Timing */}
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-text-primary border-b border-border pb-3">
            2. Assessment Parameters & Timing
          </h2>

          <Input
            label="Quiz Title *"
            placeholder="e.g. Chapter 3 Chemical Reactions Test"
            error={errors.title?.message}
            {...register('title')}
          />

          <Textarea
            label="Instructions (Optional)"
            placeholder="Instructions for students before starting the test..."
            rows={3}
            error={errors.instructions?.message}
            {...register('instructions')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Duration (Minutes) *"
              type="number"
              min={1}
              max={300}
              error={errors.durationMinutes?.message}
              {...register('durationMinutes')}
            />

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
              label="Max Attempts *"
              type="number"
              min={1}
              max={10}
              error={errors.maxAttempts?.message}
              {...register('maxAttempts')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              label="Due Date / Expiration (Optional)"
              type="datetime-local"
              error={errors.dueDate?.message}
              {...register('dueDate')}
            />

            <div className="pt-7">
              <Checkbox
                label="Shuffle questions order for each student"
                {...register('shuffleQuestions')}
              />
            </div>
          </div>
        </Card>

        {/* 3. Question Builder */}
        <Card className="p-6">
          <QuestionBuilder
            questions={questions}
            onChange={setQuestions}
            errors={errors.questions}
          />
          {errors.questions?.message && (
            <p className="text-xs text-danger-600 mt-2 font-medium">
              {errors.questions.message}
            </p>
          )}
        </Card>

        {/* Action Controls */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/quizzes')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={createMutation.isPending}
          >
            Create Quiz
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateQuizPage;

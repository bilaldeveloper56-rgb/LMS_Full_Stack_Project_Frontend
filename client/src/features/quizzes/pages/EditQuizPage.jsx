import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Breadcrumb, Button, Card, Input, Textarea, Checkbox, Select } from '@/components/ui';
import { ErrorState } from '@/components/feedback';
import { QuestionBuilder } from '../components/QuestionBuilder';
import { updateQuizSchema } from '../schemas/quiz.schema';
import { useQuiz, useUpdateQuiz } from '../hooks/useQuizzes';

export function EditQuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: quiz, isLoading, isError, error, refetch } = useQuiz(id);
  const updateMutation = useUpdateQuiz(id);

  const [questions, setQuestions] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateQuizSchema),
    defaultValues: {
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

  useEffect(() => {
    if (quiz) {
      reset({
        title: quiz.title || '',
        instructions: quiz.instructions || '',
        durationMinutes: quiz.durationMinutes || 30,
        totalMarks: quiz.totalMarks || 10,
        passingMarks: quiz.passingMarks || 5,
        dueDate: quiz.dueDate ? new Date(quiz.dueDate).toISOString().slice(0, 16) : '',
        maxAttempts: quiz.maxAttempts || 1,
        shuffleQuestions: quiz.shuffleQuestions || false,
      });
      setQuestions(
        (quiz.questions || []).map((q) => ({
          ...q,
          id: q._id || q.id,
        }))
      );
    }
  }, [quiz, reset]);

  // Synchronize total marks from questions
  useEffect(() => {
    const computedTotal = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
    if (computedTotal > 0) {
      setValue('totalMarks', computedTotal);
    }
    setValue('questions', questions);
  }, [questions, setValue]);

  const onSubmit = async (formData) => {
    const payload = {
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      questions: questions.map((q) => ({
        questionText: q.questionText,
        questionType: q.questionType,
        marks: Number(q.marks),
        options: q.questionType !== 'SHORT_ANSWER' ? q.options : [],
        explanation: q.explanation || undefined,
      })),
    };
    await updateMutation.mutateAsync(payload);
    navigate(`/quizzes/${id}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Quizzes', href: '/quizzes' }, { label: 'Loading...' }]} />
        <Card className="p-8 text-center text-sm text-text-muted">
          Loading quiz for editing...
        </Card>
      </div>
    );
  }

  if (isError || !quiz) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Quizzes', href: '/quizzes' }, { label: 'Error' }]} />
        <ErrorState
          title="Failed to load quiz"
          message={error?.message || 'Quiz could not be found.'}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Quizzes', href: '/quizzes' },
          { label: quiz.title, href: `/quizzes/${id}` },
          { label: 'Edit' },
        ]}
      />

      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Edit Quiz: {quiz.title}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Update assessment instructions, time limits, and question bank
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Parameters */}
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-text-primary border-b border-border pb-3">
            Assessment Parameters & Timing
          </h2>

          <Input
            label="Quiz Title *"
            placeholder="Quiz Title"
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
              label="Due Date (Optional)"
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

        {/* Question Builder */}
        <Card className="p-6">
          <QuestionBuilder
            questions={questions}
            onChange={setQuestions}
            errors={errors.questions}
          />
        </Card>

        {/* Action Controls */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/quizzes/${id}`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={updateMutation.isPending}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EditQuizPage;

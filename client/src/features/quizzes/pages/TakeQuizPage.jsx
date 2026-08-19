import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Play, Award, CheckCircle2, ArrowRight, BookOpen, AlertCircle, AlertTriangle } from 'lucide-react';
import { Breadcrumb, Button, Card, Badge } from '@/components/ui';
import { ErrorState } from '@/components/feedback';
import { TakeQuizRunner } from '../components/TakeQuizRunner';
import { AttemptStatusBadge } from '../components/AttemptStatusBadge';
import { useQuiz, useStartQuizAttempt, useSubmitQuizAttempt } from '../hooks/useQuizzes';

export function TakeQuizPage() {
  const { id } = useParams();

  const { data: quiz, isLoading, isError, error, refetch } = useQuiz(id);
  const startAttemptMutation = useStartQuizAttempt(id);
  const submitAttemptMutation = useSubmitQuizAttempt(id);

  const [activeAttempt, setActiveAttempt] = useState(null);
  const [completedAttempt, setCompletedAttempt] = useState(null);

  const handleStartAttempt = async () => {
    const attempt = await startAttemptMutation.mutateAsync();
    setActiveAttempt(attempt);
  };

  const handleSubmitAttempt = async (payload) => {
    if (activeAttempt) {
      const attemptId = activeAttempt._id || activeAttempt.id;
      const result = await submitAttemptMutation.mutateAsync({
        attemptId,
        ...payload,
      });
      setCompletedAttempt(result);
      setActiveAttempt(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Quizzes', href: '/quizzes' }, { label: 'Loading...' }]} />
        <Card className="p-8 text-center text-sm text-text-muted">
          Loading quiz runner...
        </Card>
      </div>
    );
  }

  if (isError || !quiz) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Quizzes', href: '/quizzes' }, { label: 'Error' }]} />
        <ErrorState
          title="Unable to load quiz"
          message={error?.message || 'Quiz could not be loaded.'}
          onRetry={refetch}
        />
      </div>
    );
  }

  // 1. Completed State
  if (completedAttempt) {
    const isEvaluated = completedAttempt.status === 'EVALUATED';

    return (
      <div className="max-w-xl mx-auto space-y-6 pt-6">
        <Card className="p-8 text-center space-y-5 border-success-200">
          <div className="w-14 h-14 bg-success-100 text-success-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Quiz Completed!
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Your responses have been securely recorded by the system.
            </p>
          </div>

          <div className="bg-surface-muted/60 p-4 rounded-xl border border-border space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Assessment Status</span>
              <AttemptStatusBadge status={completedAttempt.status} />
            </div>

            {isEvaluated && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Total Score</span>
                  <span className="font-bold text-primary-700 text-base">
                    {completedAttempt.totalScore} / {quiz.totalMarks}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Result</span>
                  <Badge variant={completedAttempt.isPassed ? 'success' : 'danger'} size="sm">
                    {completedAttempt.isPassed ? 'Passed' : 'Failed'}
                  </Badge>
                </div>
              </>
            )}

            {!isEvaluated && (
              <div className="p-2.5 bg-info-50 text-info-800 rounded text-xs text-left">
                Your submission contains short-answer responses that will be reviewed and graded by your instructor.
              </div>
            )}
          </div>

          <div className="pt-2">
            <Link to={`/quizzes/${id}`}>
              <Button variant="primary" size="sm" rightIcon={ArrowRight}>
                Back to Quiz Overview
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // 2. Active Test-Taking State
  if (activeAttempt) {
    return (
      <TakeQuizRunner
        quiz={quiz}
        attempt={activeAttempt}
        onSubmit={handleSubmitAttempt}
        isSubmitting={submitAttemptMutation.isPending}
      />
    );
  }

  // 3. Pre-Test Instructions & Start Prompt
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Quizzes', href: '/quizzes' },
          { label: quiz.title, href: `/quizzes/${id}` },
          { label: 'Take Quiz' },
        ]}
      />

      <Card className="p-8 space-y-6 border-primary-200">
        <div className="text-center space-y-2 border-b border-border pb-5">
          <span className="px-3 py-1 bg-primary-50 text-primary-700 font-bold rounded-full text-xs">
            {quiz.subjectId?.name || 'Subject'}
          </span>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            {quiz.title}
          </h1>
          <p className="text-xs text-text-muted">
            Online Assessment • Max Marks: {quiz.totalMarks}
          </p>
        </div>

        {/* Rules & Guidelines */}
        <div className="space-y-3 bg-surface-muted/40 p-4 rounded-lg border border-border text-xs text-text-secondary">
          <h2 className="font-semibold text-text-primary text-sm flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-primary-600" />
            Important Assessment Rules
          </h2>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>
              <span className="font-medium text-text-primary">Time Limit:</span> You have exactly{' '}
              <span className="font-bold text-text-primary">{quiz.durationMinutes} minutes</span> once you click start.
            </li>
            <li>
              <span className="font-medium text-text-primary">Questions:</span> This quiz consists of{' '}
              <span className="font-bold text-text-primary">{quiz.questions?.length || 0} questions</span>.
            </li>
            <li>
              <span className="font-medium text-text-primary">Auto-Submission:</span> The assessment will automatically submit when the timer expires.
            </li>
            <li>
              <span className="font-medium text-text-primary">Passing Requirement:</span> Minimum{' '}
              <span className="font-bold text-text-primary">{quiz.passingMarks} marks</span> to pass.
            </li>
          </ul>
        </div>

        {quiz.instructions && (
          <div className="space-y-1.5 text-xs text-text-secondary">
            <span className="font-semibold text-text-primary">Instructor Instructions:</span>
            <p className="p-3 bg-surface-muted rounded border border-border leading-relaxed whitespace-pre-wrap">
              {quiz.instructions}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
          <Link to={`/quizzes/${id}`}>
            <Button variant="outline" size="sm">
              Return to Overview
            </Button>
          </Link>
          <Button
            variant="primary"
            size="md"
            leftIcon={Play}
            onClick={handleStartAttempt}
            isLoading={startAttemptMutation.isPending}
          >
            Start Quiz Attempt
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default TakeQuizPage;

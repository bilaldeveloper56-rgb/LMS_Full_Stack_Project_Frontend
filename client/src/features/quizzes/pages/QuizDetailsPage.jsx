import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  BookOpen,
  User,
  Award,
  Edit,
  Send,
  Trash2,
  Play,
  RefreshCw,
  HelpCircle,
  CheckCircle2,
  Circle,
  FileCheck,
} from 'lucide-react';
import {
  Breadcrumb,
  Button,
  Card,
  Modal,
} from '@/components/ui';
import { ErrorState } from '@/components/feedback';
import { QuizStatusBadge } from '../components/QuizStatusBadge';
import { AttemptHistoryTable } from '../components/AttemptHistoryTable';
import { GradeAttemptModal } from '../components/GradeAttemptModal';
import {
  useQuiz,
  usePublishQuiz,
  useDeleteQuiz,
  useGradeQuizAttempt,
} from '../hooks/useQuizzes';
import { useAuthorization } from '@/hooks/useAuthorization';
import { ROLES, PERMISSIONS } from '@/constants';
import { formatDate } from '@/lib/utils';

export function QuizDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuthorization();

  const isStudent = user?.role === ROLES.STUDENT;
  const canUpdate = hasPermission(PERMISSIONS.QUIZZES_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.QUIZZES_DELETE);
  const canGrade = hasPermission(PERMISSIONS.QUIZZES_GRADE);

  const [attemptToGrade, setAttemptToGrade] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: quiz, isLoading, isError, error, refetch, isFetching } = useQuiz(id);
  const publishMutation = usePublishQuiz(id);
  const deleteMutation = useDeleteQuiz();
  const gradeMutation = useGradeQuizAttempt(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Quizzes', href: '/quizzes' }, { label: 'Loading...' }]} />
        <Card className="p-8 text-center text-sm text-text-muted">
          Loading quiz details...
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
          message={error?.message || 'Quiz could not be found or you do not have permission to view it.'}
          onRetry={refetch}
        />
      </div>
    );
  }

  const subjectName = quiz.subjectId?.name || 'Subject';
  const className = quiz.classId?.name || '';
  const sectionName = quiz.sectionId?.name || '';
  const teacherName = quiz.teacherId
    ? `${quiz.teacherId.firstName || ''} ${quiz.teacherId.lastName || ''}`.trim()
    : 'Faculty';
  const isDraft = quiz.status === 'DRAFT';
  const isPublished = quiz.status === 'PUBLISHED';
  const questions = quiz.questions || [];

  const handlePublish = async () => {
    await publishMutation.mutateAsync();
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(id);
    navigate('/quizzes');
  };

  const handleGradeConfirm = async (payload) => {
    await gradeMutation.mutateAsync(payload);
    setAttemptToGrade(null);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Quizzes', href: '/quizzes' },
          { label: quiz.title },
        ]}
      />

      {/* Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              {quiz.title}
            </h1>
            <QuizStatusBadge status={quiz.status} size="md" />
          </div>
          <p className="text-sm text-text-secondary">
            {subjectName} • {className} {sectionName ? `(${sectionName})` : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            leftIcon={RefreshCw}
            aria-label="Refresh quiz details"
          >
            Refresh
          </Button>

          {/* Student Take Quiz Button */}
          {isStudent && isPublished && (
            <Link to={`/quizzes/${id}/take`}>
              <Button variant="primary" size="sm" leftIcon={Play}>
                Start Quiz Attempt
              </Button>
            </Link>
          )}

          {/* Teacher/Admin Actions */}
          {!isStudent && isDraft && canUpdate && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={Send}
              onClick={handlePublish}
              isLoading={publishMutation.isPending}
              className="text-success-700 hover:bg-success-50"
            >
              Publish to Students
            </Button>
          )}

          {!isStudent && canUpdate && (
            <Link to={`/quizzes/${id}/edit`}>
              <Button variant="outline" size="sm" leftIcon={Edit}>
                Edit
              </Button>
            </Link>
          )}

          {!isStudent && canDelete && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={Trash2}
              onClick={() => setIsDeleteModalOpen(true)}
              className="text-danger-600 hover:bg-danger-50"
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Instructions & Questions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Instructions Card */}
          {quiz.instructions && (
            <Card className="p-6 space-y-2">
              <h2 className="text-base font-semibold text-text-primary border-b border-border pb-2">
                Assessment Instructions
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                {quiz.instructions}
              </p>
            </Card>
          )}

          {/* Questions Preview / Question Bank */}
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-semibold text-text-primary border-b border-border pb-2">
              Question Bank ({questions.length} Questions)
            </h2>

            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={q._id || q.id || idx} className="p-4 bg-surface-muted/40 rounded-lg border border-border space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-primary-800 bg-primary-100 px-2 py-0.5 rounded-full">
                      Question {idx + 1} ({q.marks} {q.marks === 1 ? 'mark' : 'marks'})
                    </span>
                    <span className="text-text-muted capitalize">
                      {q.questionType?.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-text-primary">
                    {q.questionText}
                  </p>

                  {/* Options (Students receive masked options without correct flags) */}
                  {q.options && q.options.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-2 p-2 rounded text-xs border ${
                            opt.isCorrect && !isStudent
                              ? 'bg-success-50/80 border-success-300 font-semibold text-success-800'
                              : 'bg-surface border-border text-text-primary'
                          }`}
                        >
                          {opt.isCorrect && !isStudent ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-success-600 shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-text-muted shrink-0" />
                          )}
                          <span>{opt.optionText}</span>
                          {opt.isCorrect && !isStudent && (
                            <span className="text-[10px] text-success-700 ml-auto">(Correct Answer)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Explanation for Instructor View */}
                  {!isStudent && q.explanation && (
                    <div className="p-2 bg-primary-50/60 rounded text-[11px] text-primary-900 border border-primary-100 mt-2">
                      <span className="font-semibold">Explanation:</span> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Parameters & Student Action */}
        <div className="space-y-6">
          <Card className="p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-primary border-b border-border pb-2">
              Quiz Parameters
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Duration
                </span>
                <span className="font-bold text-text-primary">{quiz.durationMinutes} Minutes</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Total Marks
                </span>
                <span className="font-bold text-primary-700 text-sm">{quiz.totalMarks} pts</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-muted">Passing Marks</span>
                <span className="font-semibold text-text-primary">{quiz.passingMarks} pts</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-muted">Max Attempts</span>
                <span className="font-semibold text-text-primary">{quiz.maxAttempts || 1}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-muted flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> Subject
                </span>
                <span className="font-medium text-text-primary">{subjectName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-muted flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Instructor
                </span>
                <span className="font-medium text-text-primary">{teacherName}</span>
              </div>

              {quiz.dueDate && (
                <div className="pt-2 border-t border-border flex items-center justify-between text-warning-700">
                  <span>Due Date</span>
                  <span className="font-semibold">{formatDate(quiz.dueDate)}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Student Action Prompt */}
          {isStudent && isPublished && (
            <Card className="p-5 space-y-3 bg-primary-50/40 border-primary-200">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-primary-600" />
                <h2 className="text-sm font-bold text-primary-900">Take Assessment</h2>
              </div>
              <p className="text-xs text-text-secondary">
                You will have {quiz.durationMinutes} minutes once you initiate the attempt.
              </p>
              <Link to={`/quizzes/${id}/take`}>
                <Button variant="primary" size="sm" leftIcon={Play} className="w-full mt-2">
                  Begin Attempt Now
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>

      {/* Teacher Grading Modal */}
      <GradeAttemptModal
        isOpen={Boolean(attemptToGrade)}
        onClose={() => setAttemptToGrade(null)}
        onSubmit={handleGradeConfirm}
        attempt={attemptToGrade}
        quiz={quiz}
        isLoading={gradeMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Quiz Deletion"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-primary">
            Are you sure you want to permanently delete <span className="font-bold">{quiz.title}</span>?
          </p>
          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
            >
              Confirm Deletion
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default QuizDetailsPage;

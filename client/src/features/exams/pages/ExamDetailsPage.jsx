import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Plus, Globe, Edit3, ArrowLeft, BarChart3, Clock, MapPin, Award } from 'lucide-react';
import { Breadcrumb, Button, Card } from '@/components/ui';
import { ErrorState, EmptyState } from '@/components/feedback';
import { ExamStatusBadge } from '../components/ExamStatusBadge';
import { ExamTypeBadge } from '../components/ExamTypeBadge';
import { ExamPapersTable } from '../components/ExamPapersTable';
import { SchedulePaperModal } from '../components/SchedulePaperModal';
import { useExam, usePublishExam, useScheduleExamPaper } from '../hooks/useExams';
import { formatDate } from '@/lib/utils';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

export function ExamDetailsPage() {
  const { id } = useParams();
  const { hasPermission } = useAuthorization();
  const canUpdate = hasPermission(PERMISSIONS.EXAMS_UPDATE);
  const canCreate = hasPermission(PERMISSIONS.EXAMS_CREATE);
  const canPublish = hasPermission(PERMISSIONS.EXAMS_PUBLISH);
  const canReadResults = hasPermission(PERMISSIONS.RESULTS_READ);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const { data: exam, isLoading, isError, error, refetch } = useExam(id);
  const publishExamMutation = usePublishExam();
  const schedulePaperMutation = useScheduleExamPaper(id);

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-5xl animate-pulse" aria-busy="true">
        <div className="h-6 w-48 bg-surface-muted rounded-md" />
        <div className="h-36 bg-surface-muted rounded-xl" />
        <div className="h-64 bg-surface-muted rounded-xl" />
      </div>
    );
  }

  if (isError || !exam) {
    return (
      <ErrorState
        title="Failed to load examination"
        message={error?.message || 'The requested examination could not be found.'}
        onRetry={refetch}
      />
    );
  }

  const session = exam.academicSessionId || {};
  const papers = exam.papers || [];

  const handleSchedulePaper = async (payload) => {
    await schedulePaperMutation.mutateAsync(payload);
  };

  const handlePublish = () => {
    publishExamMutation.mutate(id);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Examinations', href: '/exams' },
          { label: exam.name },
        ]}
      />

      {/* Header Overview Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                {exam.name}
              </h1>
              <ExamTypeBadge type={exam.examType} />
              <ExamStatusBadge status={exam.status} isPublished={exam.isPublished} />
            </div>
            {session.name && (
              <p className="text-xs font-semibold text-text-muted mt-1">
                Academic Session: <span className="text-text-primary">{session.name}</span>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {!exam.isPublished && canPublish && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={Globe}
                onClick={handlePublish}
                isLoading={publishExamMutation.isPending}
              >
                Publish Schedule
              </Button>
            )}

            {canCreate && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={Plus}
                onClick={() => setIsScheduleModalOpen(true)}
              >
                Schedule Paper
              </Button>
            )}

            {canReadResults && (
              <Link to={`/results?examId=${id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={BarChart3}
                >
                  Marks & Results
                </Button>
              </Link>
            )}

            {canUpdate && (
              <Link to={`/exams/${id}/edit`}>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={Edit3}
                >
                  Edit
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Date & Description Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 text-xs">
          <div className="flex items-center gap-2.5 text-text-secondary">
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-text-muted block text-[11px]">Exam Period</span>
              <span className="font-semibold text-text-primary">
                {formatDate(exam.startDate)} - {formatDate(exam.endDate)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-text-secondary">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-text-muted block text-[11px]">Scheduled Papers</span>
              <span className="font-semibold text-text-primary">
                {papers.length} Papers Configured
              </span>
            </div>
          </div>
        </div>

        {exam.description && (
          <div className="mt-4 pt-3 border-t border-border/60 text-xs text-text-secondary">
            <p className="font-medium text-text-primary mb-0.5">Instructions & Notes:</p>
            <p>{exam.description}</p>
          </div>
        )}
      </Card>

      {/* Scheduled Papers Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text-primary">
            Scheduled Exam Papers ({papers.length})
          </h2>
          {canCreate && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={Plus}
              onClick={() => setIsScheduleModalOpen(true)}
              className="text-xs"
            >
              Add Paper
            </Button>
          )}
        </div>

        <ExamPapersTable papers={papers} />
      </div>

      {/* Schedule Paper Modal */}
      <SchedulePaperModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSubmit={handleSchedulePaper}
        isLoading={schedulePaperMutation.isPending}
      />
    </div>
  );
}

export default ExamDetailsPage;

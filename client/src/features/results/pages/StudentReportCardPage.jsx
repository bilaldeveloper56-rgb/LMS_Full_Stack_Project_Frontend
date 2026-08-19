import React from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Breadcrumb, Button } from '@/components/ui';
import { ErrorState, EmptyState } from '@/components/feedback';
import { ReportCardView } from '../components/ReportCardView';
import { useStudentReportCard } from '../hooks/useResults';

export function StudentReportCardPage() {
  const { studentId } = useParams();
  const [searchParams] = useSearchParams();
  const examId = searchParams.get('examId') || undefined;

  const {
    data: reportCard,
    isLoading,
    isError,
    error,
    refetch,
  } = useStudentReportCard(studentId, { examId });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl animate-pulse" aria-busy="true">
        <div className="h-6 w-48 bg-surface-muted rounded-md" />
        <div className="h-96 bg-surface-muted rounded-xl" />
      </div>
    );
  }

  if (isError || !reportCard) {
    return (
      <ErrorState
        title="Failed to load report card"
        message={error?.message || 'The requested student report card could not be retrieved.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Results', href: '/results' },
          { label: 'Student Report Card' },
        ]}
      />

      {/* Back button */}
      <div className="no-print">
        <Link to="/results">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={ArrowLeft}
            className="text-xs"
          >
            Back to Results
          </Button>
        </Link>
      </div>

      {/* Transcript View */}
      <ReportCardView reportCard={reportCard} />
    </div>
  );
}

export default StudentReportCardPage;

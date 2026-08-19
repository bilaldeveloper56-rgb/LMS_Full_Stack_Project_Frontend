import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, HelpCircle, RefreshCw, LayoutGrid, List } from 'lucide-react';
import {
  Breadcrumb,
  Button,
  Card,
  Pagination,
} from '@/components/ui';
import { EmptyState, ErrorState } from '@/components/feedback';
import { QuizFilters } from '../components/QuizFilters';
import { QuizTable } from '../components/QuizTable';
import { QuizCard } from '../components/QuizCard';
import {
  useQuizzes,
  usePublishQuiz,
  useDeleteQuiz,
} from '../hooks/useQuizzes';
import { useAuthorization } from '@/hooks/useAuthorization';
import { ROLES, PERMISSIONS } from '@/constants';

export function QuizzesPage() {
  const { user, hasPermission } = useAuthorization();
  const isStudent = user?.role === ROLES.STUDENT;
  const canCreate = hasPermission(PERMISSIONS.QUIZZES_CREATE);

  const [viewMode, setViewMode] = useState('table');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    academicSessionId: '',
    classId: '',
    sectionId: '',
    subjectId: '',
    status: '',
  });

  const { data, isLoading, isError, error, refetch, isFetching } = useQuizzes(filters);
  const publishMutation = usePublishQuiz();
  const deleteMutation = useDeleteQuiz();

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 20,
      academicSessionId: '',
      classId: '',
      sectionId: '',
      subjectId: '',
      status: '',
    });
  }, []);

  const handlePublish = async (id) => {
    await publishMutation.mutateAsync(id);
  };

  const handleDelete = async (id) => {
    await deleteMutation.mutateAsync(id);
  };

  const quizzes = data?.quizzes || [];
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Quizzes' },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Quizzes & Assessments
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {isStudent
              ? 'Attempt and review your online quizzes, timed tests, and assessment scores'
              : 'Create, publish, and evaluate student online quizzes, tests, and question banks'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex items-center border border-border rounded-md p-0.5 bg-surface-muted">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-surface shadow-2xs text-primary-600' : 'text-text-muted hover:text-text-primary'}`}
              aria-label="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded ${viewMode === 'cards' ? 'bg-surface shadow-2xs text-primary-600' : 'text-text-muted hover:text-text-primary'}`}
              aria-label="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            leftIcon={RefreshCw}
            aria-label="Refresh quizzes"
          >
            Refresh
          </Button>

          {canCreate && (
            <Link to="/quizzes/new">
              <Button variant="primary" size="sm" leftIcon={Plus}>
                New Quiz
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <QuizFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        isStudentView={isStudent}
      />

      {/* Content Section */}
      {isLoading ? (
        <Card className="p-6 space-y-4">
          <div className="space-y-3 animate-pulse" aria-busy="true">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-12 bg-surface-muted rounded" />
            ))}
          </div>
        </Card>
      ) : isError ? (
        <ErrorState
          title="Failed to load quizzes"
          message={error?.message || 'Could not retrieve assessment entries from the server.'}
          onRetry={refetch}
        />
      ) : quizzes.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={HelpCircle}
            title="No Quizzes Found"
            description={
              filters.classId || filters.subjectId || filters.status
                ? 'Try adjusting your search criteria or filters.'
                : isStudent
                ? 'No published quizzes currently active for your enrolled classes.'
                : 'No quizzes created yet. Start by authoring your first quiz.'
            }
            action={
              canCreate ? (
                <Link to="/quizzes/new">
                  <Button variant="primary" size="sm" leftIcon={Plus}>
                    Create First Quiz
                  </Button>
                </Link>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {viewMode === 'table' ? (
            <Card className="overflow-hidden">
              <QuizTable
                quizzes={quizzes}
                onPublish={handlePublish}
                onDelete={handleDelete}
                isActionLoading={publishMutation.isPending || deleteMutation.isPending}
                isStudentView={isStudent}
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzes.map((quiz) => (
                <QuizCard key={quiz._id || quiz.id} quiz={quiz} />
              ))}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex justify-center sm:justify-end pt-2">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                pageSize={pagination.limit}
                onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default QuizzesPage;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, LayoutGrid, List, RefreshCw, ClipboardList } from 'lucide-react';
import { Breadcrumb, Button, Pagination } from '@/components/ui';
import { EmptyState, ErrorState } from '@/components/feedback';
import { ExamFilters } from '../components/ExamFilters';
import { ExamCard } from '../components/ExamCard';
import { ExamTable } from '../components/ExamTable';
import { useExams, usePublishExam, useDeleteExam } from '../hooks/useExams';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

export function ExamsPage() {
  const { hasPermission } = useAuthorization();
  const canCreate = hasPermission(PERMISSIONS.EXAMS_CREATE);

  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [filters, setFilters] = useState({
    academicSessionId: '',
    examType: '',
    status: '',
    search: '',
    page: 1,
    limit: 15,
  });

  const { data, isLoading, isError, error, refetch, isFetching } = useExams(filters);
  const publishExamMutation = usePublishExam();
  const deleteExamMutation = useDeleteExam();

  const exams = data?.exams || [];
  const pagination = data?.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 };

  const handleFilterChange = (updated) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handlePublish = (id) => {
    publishExamMutation.mutate(id);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this examination term?')) {
      deleteExamMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Examinations' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Examinations Management
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Organize academic examination terms, schedule subject papers, and publish timetables
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-surface-muted p-1 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-text-secondary transition-colors ${
                viewMode === 'table' ? 'bg-surface text-primary-700 shadow-2xs' : 'hover:text-text-primary'
              }`}
              title="Table View"
              aria-label="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-text-secondary transition-colors ${
                viewMode === 'grid' ? 'bg-surface text-primary-700 shadow-2xs' : 'hover:text-text-primary'
              }`}
              title="Grid View"
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
            aria-label="Refresh exams"
          >
            Refresh
          </Button>

          {canCreate && (
            <Link to="/exams/new">
              <Button
                variant="primary"
                size="sm"
                leftIcon={Plus}
              >
                New Exam
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <ExamFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Content */}
      {isError ? (
        <ErrorState
          title="Failed to load examinations"
          message={error?.message || 'Could not fetch exam list.'}
          onRetry={refetch}
        />
      ) : isLoading ? (
        <div className="p-8 space-y-3 animate-pulse" aria-busy="true">
          <div className="h-12 bg-surface-muted rounded-lg" />
          <div className="h-12 bg-surface-muted rounded-lg" />
          <div className="h-12 bg-surface-muted rounded-lg" />
        </div>
      ) : exams.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No Examinations Found"
          description="No exam terms match your criteria. Create a new examination to get started."
          action={
            canCreate && (
              <Link to="/exams/new">
                <Button variant="primary" size="sm" leftIcon={Plus}>
                  Create Exam
                </Button>
              </Link>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {viewMode === 'table' ? (
            <ExamTable
              exams={exams}
              onPublish={handlePublish}
              onDelete={handleDelete}
              isPublishing={publishExamMutation.isPending}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {exams.map((exam) => (
                <ExamCard key={exam._id || exam.id} exam={exam} />
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
                onPageChange={(p) => handleFilterChange({ page: p })}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ExamsPage;

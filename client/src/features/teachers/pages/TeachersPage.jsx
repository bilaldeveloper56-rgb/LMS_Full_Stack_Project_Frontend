import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, RefreshCw } from 'lucide-react';
import { Button, Breadcrumb, Pagination, Card, Skeleton } from '@/components/ui';
import { EmptyState, ErrorState } from '@/components/feedback';
import { TeacherTable } from '../components/TeacherTable';
import { TeacherFilters } from '../components/TeacherFilters';
import { useTeachers, useDeleteTeacher } from '../hooks/useTeachers';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

export function TeachersPage() {
  const { hasPermission } = useAuthorization();
  const canCreate = hasPermission(PERMISSIONS.TEACHERS_CREATE);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    employmentStatus: '',
    gender: '',
  });

  const { data, isLoading, isError, error, refetch, isFetching } = useTeachers(filters);
  const deleteMutation = useDeleteTeacher();

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      employmentStatus: '',
      gender: '',
    });
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleDelete = async (id) => {
    await deleteMutation.mutateAsync(id);
  };

  const teachers = data?.teachers || [];
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.employmentStatus ||
    filters.gender
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Teachers' },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Faculty & Teacher Directory
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage instructional staff, teaching credentials, subject assignments, and employment status
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            leftIcon={RefreshCw}
            aria-label="Refresh teachers list"
          >
            Refresh
          </Button>

          {canCreate && (
            <Link to="/teachers/new">
              <Button variant="primary" size="sm" leftIcon={Plus}>
                Register Teacher
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <TeacherFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Teacher Content */}
      {isLoading ? (
        <Card className="p-6 space-y-4">
          <div className="space-y-3 animate-pulse" aria-busy="true" aria-label="Loading teachers list">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <Skeleton variant="circular" className="h-9 w-9" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </Card>
      ) : isError ? (
        <ErrorState
          title="Failed to load teachers"
          message={error?.message || 'Could not retrieve teacher records from the server.'}
          onRetry={refetch}
        />
      ) : teachers.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={Users}
            title={hasActiveFilters ? 'No Matching Teachers Found' : 'No Teachers Registered'}
            description={
              hasActiveFilters
                ? 'Try adjusting your search query or filter criteria to find faculty members.'
                : 'Get started by registering teaching staff into the school directory.'
            }
            action={
              hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Clear Filters
                </Button>
              ) : canCreate ? (
                <Link to="/teachers/new">
                  <Button variant="primary" size="sm" leftIcon={Plus}>
                    Register First Teacher
                  </Button>
                </Link>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <TeacherTable
              teachers={teachers}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending}
            />
          </Card>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center sm:justify-end pt-2">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                pageSize={pagination.limit}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TeachersPage;

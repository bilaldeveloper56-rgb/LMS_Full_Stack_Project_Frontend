import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, RefreshCw } from 'lucide-react';
import { Button, Breadcrumb, Pagination, Card, Skeleton } from '@/components/ui';
import { EmptyState, ErrorState } from '@/components/feedback';
import { StudentTable } from '../components/StudentTable';
import { StudentFilters } from '../components/StudentFilters';
import { useStudents, useDeleteStudent } from '../hooks/useStudents';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

export function StudentsPage() {
  const { hasPermission } = useAuthorization();
  const canCreate = hasPermission(PERMISSIONS.STUDENTS_CREATE);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    classId: '',
    sectionId: '',
    academicSessionId: '',
    enrollmentStatus: '',
  });

  const { data, isLoading, isError, error, refetch, isFetching } = useStudents(filters);
  const deleteMutation = useDeleteStudent();

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      classId: '',
      sectionId: '',
      academicSessionId: '',
      enrollmentStatus: '',
    });
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleDelete = async (id) => {
    await deleteMutation.mutateAsync(id);
  };

  const students = data?.students || [];
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.classId ||
    filters.sectionId ||
    filters.academicSessionId ||
    filters.enrollmentStatus
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Students' },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Student Directory
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage student enrollment, profiles, academic records, and class rosters
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            leftIcon={RefreshCw}
            aria-label="Refresh students list"
          >
            Refresh
          </Button>

          {canCreate && (
            <Link to="/students/new">
              <Button variant="primary" size="sm" leftIcon={Plus}>
                Register Student
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <StudentFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Student List Content */}
      {isLoading ? (
        <Card className="p-6 space-y-4">
          <div className="space-y-3 animate-pulse" aria-busy="true" aria-label="Loading students list">
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
          title="Failed to load students"
          message={error?.message || 'Could not retrieve student records from the server.'}
          onRetry={refetch}
        />
      ) : students.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={Users}
            title={hasActiveFilters ? 'No Matching Students Found' : 'No Students Registered'}
            description={
              hasActiveFilters
                ? 'Try adjusting your search query or filter criteria to find student records.'
                : 'Get started by enrolling new students into your academic sessions and classes.'
            }
            action={
              hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Clear Filters
                </Button>
              ) : canCreate ? (
                <Link to="/students/new">
                  <Button variant="primary" size="sm" leftIcon={Plus}>
                    Register First Student
                  </Button>
                </Link>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <StudentTable
              students={students}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending}
            />
          </Card>

          {/* Pagination Controls */}
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

export default StudentsPage;

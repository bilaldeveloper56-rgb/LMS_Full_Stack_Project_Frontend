import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, UserCheck, RefreshCw } from 'lucide-react';
import { Button, Breadcrumb, Pagination, Card, Skeleton } from '@/components/ui';
import { EmptyState, ErrorState } from '@/components/feedback';
import { ParentTable } from '../components/ParentTable';
import { ParentFilters } from '../components/ParentFilters';
import { useParents, useDeleteParent } from '../hooks/useParents';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

export function ParentsPage() {
  const { hasPermission } = useAuthorization();
  const canCreate = hasPermission(PERMISSIONS.PARENTS_CREATE);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
  });

  const { data, isLoading, isError, error, refetch, isFetching } = useParents(filters);
  const deleteMutation = useDeleteParent();

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
    });
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleDelete = async (id) => {
    await deleteMutation.mutateAsync(id);
  };

  const parents = data?.parents || [];
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Parents' },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Parents & Guardians Directory
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage parent contact records, student relationships, and family communications
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            leftIcon={RefreshCw}
            aria-label="Refresh parents list"
          >
            Refresh
          </Button>

          {canCreate && (
            <Link to="/parents/new">
              <Button variant="primary" size="sm" leftIcon={Plus}>
                Register Parent
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <ParentFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Content */}
      {isLoading ? (
        <Card className="p-6 space-y-4">
          <div className="space-y-3 animate-pulse" aria-busy="true" aria-label="Loading parents list">
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
          title="Failed to load parents"
          message={error?.message || 'Could not retrieve parent records from the server.'}
          onRetry={refetch}
        />
      ) : parents.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={UserCheck}
            title={filters.search ? 'No Matching Parents Found' : 'No Parents Registered'}
            description={
              filters.search
                ? 'Try adjusting your search query to find parent or guardian records.'
                : 'Get started by creating parent profiles to link with enrolled students.'
            }
            action={
              filters.search ? (
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Clear Search
                </Button>
              ) : canCreate ? (
                <Link to="/parents/new">
                  <Button variant="primary" size="sm" leftIcon={Plus}>
                    Register First Parent
                  </Button>
                </Link>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <ParentTable
              parents={parents}
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

export default ParentsPage;

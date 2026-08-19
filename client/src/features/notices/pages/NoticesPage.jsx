import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Megaphone, LayoutGrid, List } from 'lucide-react';
import { Breadcrumb, Button, Pagination } from '@/components/ui';
import { ErrorState, EmptyState } from '@/components/feedback';
import { NoticeFilters } from '../components/NoticeFilters';
import { NoticeCard } from '../components/NoticeCard';
import { NoticeTable } from '../components/NoticeTable';
import { useNotices, usePublishNotice, useDeleteNotice } from '../hooks/useNotices';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

export function NoticesPage() {
  const { hasPermission } = useAuthorization();
  const canCreate = hasPermission(PERMISSIONS.NOTICES_CREATE);
  const canPublish = hasPermission(PERMISSIONS.NOTICES_PUBLISH);

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [filters, setFilters] = useState({
    targetAudience: '',
    priority: '',
    page: 1,
    limit: 12,
  });

  const { data, isLoading, isError, error, refetch } = useNotices(filters);
  const publishMutation = usePublishNotice();
  const deleteMutation = useDeleteNotice();

  const notices = data?.notices || [];
  const pagination = data?.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handlePublish = async (id) => {
    await publishMutation.mutateAsync(id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Notice Board' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Notice Board & Bulletins
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            School-wide announcements, circulars, urgent alerts, and institutional notices
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-surface-muted p-1 rounded-lg border border-border">
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
          </div>

          {canCreate && (
            <Link to="/notices/new">
              <Button variant="primary" size="sm" leftIcon={Plus}>
                Create Notice
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <NoticeFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Main Content */}
      {isError ? (
        <ErrorState
          title="Failed to load notices"
          message={error?.message || 'Could not retrieve notice board announcements.'}
          onRetry={refetch}
        />
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse" aria-busy="true">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-44 bg-surface-muted rounded-xl border border-border" />
          ))}
        </div>
      ) : notices.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No Notices Found"
          description="There are currently no active announcements matching your filters."
          action={
            canCreate && (
              <Link to="/notices/new">
                <Button variant="primary" size="sm" leftIcon={Plus}>
                  Post New Notice
                </Button>
              </Link>
            )
          }
        />
      ) : viewMode === 'table' ? (
        <div className="space-y-4">
          <NoticeTable
            notices={notices}
            onPublish={handlePublish}
            onDelete={handleDelete}
            isPublishing={publishMutation.isPending}
          />
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
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notices.map((notice) => (
              <NoticeCard
                key={notice._id || notice.id}
                notice={notice}
                onPublish={handlePublish}
                canPublish={canPublish}
              />
            ))}
          </div>

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

export default NoticesPage;

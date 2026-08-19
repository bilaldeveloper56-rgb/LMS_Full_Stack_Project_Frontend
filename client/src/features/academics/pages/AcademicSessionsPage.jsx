import React, { useState } from 'react';
import { Plus, Calendar, RefreshCw, Search, X } from 'lucide-react';
import {
  Button,
  Breadcrumb,
  Card,
  Pagination,
  Input,
  Select,
  Skeleton,
} from '@/components/ui';
import { EmptyState, ErrorState } from '@/components/feedback';
import { SessionTable } from '../components/SessionTable';
import { SessionFormModal } from '../components/SessionFormModal';
import {
  useAcademicSessions,
  useCreateAcademicSession,
  useUpdateAcademicSession,
  useSetCurrentSession,
  useDeleteAcademicSession,
} from '../hooks/useAcademics';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';
import { SESSION_STATUS_OPTIONS } from '../schemas/academics.schema';

export function AcademicSessionsPage() {
  const { hasPermission } = useAuthorization();
  const canCreate = hasPermission(PERMISSIONS.ACADEMIC_SESSIONS_CREATE);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useAcademicSessions(filters);
  const createMutation = useCreateAcademicSession();
  const updateMutation = useUpdateAcademicSession(sessionToEdit?._id || sessionToEdit?.id);
  const setCurrentMutation = useSetCurrentSession();
  const deleteMutation = useDeleteAcademicSession();

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleStatusChange = (e) => {
    setFilters((prev) => ({ ...prev, status: e.target.value || undefined, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, limit: 10, search: '', status: '' });
  };

  const handleOpenCreate = () => {
    setSessionToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (session) => {
    setSessionToEdit(session);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (sessionToEdit) {
      await updateMutation.mutateAsync(formData);
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsModalOpen(false);
    setSessionToEdit(null);
  };

  const handleSetCurrent = async (id) => {
    await setCurrentMutation.mutateAsync(id);
  };

  const handleDelete = async (id) => {
    await deleteMutation.mutateAsync(id);
  };

  const sessions = data?.sessions || [];
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Academic Sessions' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Academic Sessions
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Configure school academic years, active terms, and enrollment cycles
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            leftIcon={RefreshCw}
            aria-label="Refresh sessions"
          >
            Refresh
          </Button>

          {canCreate && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={Plus}
              onClick={handleOpenCreate}
            >
              New Academic Session
            </Button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-surface border border-border rounded-lg p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search sessions..."
              value={filters.search}
              onChange={handleSearchChange}
              leftIcon={Search}
              aria-label="Search sessions"
            />
          </div>

          <div className="w-full sm:w-48">
            <Select
              value={filters.status || ''}
              onChange={handleStatusChange}
              aria-label="Filter by status"
              options={[
                { value: '', label: 'All Statuses' },
                ...SESSION_STATUS_OPTIONS,
              ]}
            />
          </div>
        </div>

        {(filters.search || filters.status) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            leftIcon={X}
            className="text-text-muted hover:text-text-primary"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <Card className="p-6 space-y-4">
          <div className="space-y-3 animate-pulse" aria-busy="true" aria-label="Loading sessions">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-10 bg-surface-muted rounded" />
            ))}
          </div>
        </Card>
      ) : isError ? (
        <ErrorState
          title="Failed to load academic sessions"
          message={error?.message || 'Could not retrieve session records from the server.'}
          onRetry={refetch}
        />
      ) : sessions.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={Calendar}
            title={filters.search || filters.status ? 'No Matching Sessions' : 'No Academic Sessions Configured'}
            description={
              filters.search || filters.status
                ? 'Try adjusting your search criteria.'
                : 'Get started by creating the school’s first academic year.'
            }
            action={
              filters.search || filters.status ? (
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Clear Filters
                </Button>
              ) : canCreate ? (
                <Button variant="primary" size="sm" leftIcon={Plus} onClick={handleOpenCreate}>
                  Create Academic Session
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <SessionTable
              sessions={sessions}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onSetCurrent={handleSetCurrent}
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
                onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
              />
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      <SessionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialValues={sessionToEdit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}

export default AcademicSessionsPage;

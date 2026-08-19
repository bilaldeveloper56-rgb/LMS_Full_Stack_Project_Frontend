import React, { useState } from 'react';
import { Plus, CalendarOff, RefreshCw } from 'lucide-react';
import {
  Breadcrumb,
  Button,
  Card,
  Pagination,
  Skeleton,
} from '@/components/ui';
import { EmptyState, ErrorState } from '@/components/feedback';
import { LeaveFilters } from '../components/LeaveFilters';
import { LeaveTable } from '../components/LeaveTable';
import { LeaveApplicationModal } from '../components/LeaveApplicationModal';
import { LeaveDecisionModal } from '../components/LeaveDecisionModal';
import {
  useLeaves,
  useCreateLeave,
  useApproveLeave,
  useRejectLeave,
  useDeleteLeave,
} from '../hooks/useLeaves';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

export function LeavesDirectoryPage() {
  const { hasPermission } = useAuthorization();
  const canCreate = hasPermission(PERMISSIONS.LEAVES_CREATE);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    leaveType: '',
    startDate: '',
    endDate: '',
  });

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [decisionConfig, setDecisionConfig] = useState({ isOpen: false, actionType: 'approve', leave: null });

  const { data, isLoading, isError, error, refetch, isFetching } = useLeaves(filters);
  const createMutation = useCreateLeave();
  const approveMutation = useApproveLeave();
  const rejectMutation = useRejectLeave();
  const deleteMutation = useDeleteLeave();

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      status: '',
      leaveType: '',
      startDate: '',
      endDate: '',
    });
  };

  const handleApplySubmit = async (formData) => {
    await createMutation.mutateAsync(formData);
    setIsApplyModalOpen(false);
  };

  const handleDecisionConfirm = async (payload) => {
    if (decisionConfig.actionType === 'reject') {
      await rejectMutation.mutateAsync(payload);
    } else {
      await approveMutation.mutateAsync(payload);
    }
    setDecisionConfig({ isOpen: false, actionType: 'approve', leave: null });
  };

  const handleDelete = async (id) => {
    await deleteMutation.mutateAsync(id);
  };

  const leaves = data?.leaves || [];
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Leave Management' },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Leave Requests Directory
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Review school-wide faculty and student leave applications and manage approval workflows
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            leftIcon={RefreshCw}
            aria-label="Refresh leaves"
          >
            Refresh
          </Button>

          {canCreate && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={Plus}
              onClick={() => setIsApplyModalOpen(true)}
            >
              Apply for Leave
            </Button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <LeaveFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Content Table */}
      {isLoading ? (
        <Card className="p-6 space-y-4">
          <div className="space-y-3 animate-pulse" aria-busy="true">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-10 bg-surface-muted rounded" />
            ))}
          </div>
        </Card>
      ) : isError ? (
        <ErrorState
          title="Failed to load leave requests"
          message={error?.message || 'Could not retrieve leave records from the server.'}
          onRetry={refetch}
        />
      ) : leaves.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={CalendarOff}
            title={filters.status || filters.leaveType ? 'No Matching Leave Requests' : 'No Leave Requests Found'}
            description={
              filters.status || filters.leaveType
                ? 'Try adjusting your search criteria.'
                : 'No pending or historical leave applications currently recorded in the registry.'
            }
            action={
              canCreate ? (
                <Button variant="primary" size="sm" leftIcon={Plus} onClick={() => setIsApplyModalOpen(true)}>
                  Submit First Leave Request
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <LeaveTable
              leaves={leaves}
              onApprove={(leave) => setDecisionConfig({ isOpen: true, actionType: 'approve', leave })}
              onReject={(leave) => setDecisionConfig({ isOpen: true, actionType: 'reject', leave })}
              onDelete={handleDelete}
              isActionLoading={
                approveMutation.isPending || rejectMutation.isPending || deleteMutation.isPending
              }
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

      {/* Leave Application Modal */}
      <LeaveApplicationModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSubmit={handleApplySubmit}
        isLoading={createMutation.isPending}
      />

      {/* Decision Modal */}
      <LeaveDecisionModal
        isOpen={decisionConfig.isOpen}
        onClose={() => setDecisionConfig({ isOpen: false, actionType: 'approve', leave: null })}
        actionType={decisionConfig.actionType}
        leave={decisionConfig.leave}
        onConfirm={handleDecisionConfirm}
        isLoading={approveMutation.isPending || rejectMutation.isPending}
      />
    </div>
  );
}

export default LeavesDirectoryPage;

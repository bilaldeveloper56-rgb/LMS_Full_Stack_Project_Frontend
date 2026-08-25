import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Building2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Breadcrumb, Button, Pagination, Card, Modal } from '@/components/ui';
import { ErrorState } from '@/components/feedback';
import { SchoolFilters } from '../components/SchoolFilters';
import { SchoolTable } from '../components/SchoolTable';
import { ChangeStatusModal } from '../components/ChangeStatusModal';
import {
  useSchools,
  useSchoolStats,
  useChangeSchoolStatus,
  useResendAdminInvitation,
  useDeleteSchool,
} from '../hooks/useSchools';

export function SchoolsPage() {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [selectedSchoolForStatus, setSelectedSchoolForStatus] = useState(null);
  const [schoolToDelete, setSchoolToDelete] = useState(null);

  const { data, isLoading, isError, error, refetch } = useSchools(filters);
  const { data: statsData } = useSchoolStats();
  const changeStatusMutation = useChangeSchoolStatus();
  const resendInviteMutation = useResendAdminInvitation();
  const deleteSchoolMutation = useDeleteSchool();

  const schools = data?.schools || [];
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
  const stats = statsData || { total: 0, active: 0, pending: 0, suspended: 0, inactive: 0 };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const handleConfirmStatusChange = async ({ status, reason }) => {
    if (!selectedSchoolForStatus) return;
    const id = selectedSchoolForStatus._id || selectedSchoolForStatus.id;
    await changeStatusMutation.mutateAsync({
      id,
      payload: { status, reason },
    });
    setSelectedSchoolForStatus(null);
  };

  const handleResendInvite = async (id) => {
    await resendInviteMutation.mutateAsync(id);
  };

  const handleConfirmDelete = async () => {
    if (!schoolToDelete) return;
    const id = schoolToDelete._id || schoolToDelete.id;
    await deleteSchoolMutation.mutateAsync(id);
    setSchoolToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Tenant Schools' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              SaaS Tenant Schools Management
            </h1>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-200">
              <Building2 className="w-3 h-3" /> Multi-Tenant
            </span>
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            Provision, monitor, and manage educational institutions across the LMS platform
          </p>
        </div>

        <Link to="/schools/new">
          <Button variant="primary" size="sm" leftIcon={Plus}>
            Provision New School
          </Button>
        </Link>
      </div>

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border border-border bg-surface shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold">Total Institutions</span>
            <Building2 className="w-4 h-4 text-primary-600" />
          </div>
          <div className="text-2xl font-black text-text-primary">{stats.total ?? pagination.total ?? 0}</div>
        </Card>

        <Card className="p-4 border border-border bg-surface shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold">Active Tenants</span>
            <CheckCircle2 className="w-4 h-4 text-success-600" />
          </div>
          <div className="text-2xl font-black text-success-700">{stats.active ?? stats.byStatus?.active ?? 0}</div>
        </Card>

        <Card className="p-4 border border-border bg-surface shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold">Pending Setup</span>
            <Clock className="w-4 h-4 text-warning-600" />
          </div>
          <div className="text-2xl font-black text-warning-700">{stats.pending ?? stats.byStatus?.gracePeriod ?? 0}</div>
        </Card>

        <Card className="p-4 border border-border bg-surface shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold">Suspended</span>
            <AlertTriangle className="w-4 h-4 text-danger-600" />
          </div>
          <div className="text-2xl font-black text-danger-700">{stats.suspended ?? stats.byStatus?.suspended ?? 0}</div>
        </Card>
      </div>

      {/* Filters */}
      <SchoolFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Main Table Content */}
      {isError ? (
        <ErrorState
          title="Failed to load tenant schools"
          message={error?.message || 'Could not retrieve schools directory.'}
          onRetry={refetch}
        />
      ) : (
        <div className="space-y-4">
          <SchoolTable
            schools={schools}
            onChangeStatus={(school) => setSelectedSchoolForStatus(school)}
            onResendInvite={handleResendInvite}
            onDelete={(school) => setSchoolToDelete(school)}
            isLoading={isLoading}
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
      )}

      {/* Status Modal */}
      <ChangeStatusModal
        school={selectedSchoolForStatus}
        isOpen={Boolean(selectedSchoolForStatus)}
        onClose={() => setSelectedSchoolForStatus(null)}
        onConfirm={handleConfirmStatusChange}
        isLoading={changeStatusMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(schoolToDelete)}
        onClose={() => setSchoolToDelete(null)}
        title="Confirm School Deletion"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-danger-50 text-danger-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-text-primary font-medium">
                Are you sure you want to delete school{' '}
                <span className="font-bold text-danger-700">
                  "{schoolToDelete?.name}"
                </span>{' '}
                ({schoolToDelete?.schoolCode})?
              </p>
              <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
                This will soft-delete the school record and deactivate all associated user accounts. This action is restricted to Super Administrators.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSchoolToDelete(null)}
              disabled={deleteSchoolMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              isLoading={deleteSchoolMutation.isPending}
            >
              Delete School
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default SchoolsPage;

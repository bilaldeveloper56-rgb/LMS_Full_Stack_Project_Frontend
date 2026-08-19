import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, RefreshCw, BarChart2 } from 'lucide-react';
import {
  Breadcrumb,
  Button,
  Card,
  Pagination,
} from '@/components/ui';
import { EmptyState, ErrorState } from '@/components/feedback';
import { AttendanceFilters } from '../components/AttendanceFilters';
import { AttendanceStatsCard } from '../components/AttendanceStatsCard';
import { AttendanceRecordTable } from '../components/AttendanceRecordTable';
import { AttendanceCorrectionModal } from '../components/AttendanceCorrectionModal';
import {
  useAttendanceList,
  useAttendanceSummaryReport,
  useCorrectAttendance,
  useDeleteAttendance,
} from '../hooks/useAttendance';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

export function AttendanceReportPage() {
  const { hasPermission } = useAuthorization();
  const canRead = hasPermission(PERMISSIONS.ATTENDANCE_READ);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    academicSessionId: '',
    classId: '',
    sectionId: '',
    status: '',
    date: '',
  });

  const [recordToCorrect, setRecordToCorrect] = useState(null);

  const {
    data: listData,
    isLoading: isLoadingList,
    isError: isErrorList,
    error: listError,
    refetch: refetchList,
    isFetching: isFetchingList,
  } = useAttendanceList(filters);

  const {
    data: summaryData,
    isLoading: isLoadingSummary,
    refetch: refetchSummary,
  } = useAttendanceSummaryReport(
    filters.academicSessionId
      ? {
          academicSessionId: filters.academicSessionId,
          classId: filters.classId,
          sectionId: filters.sectionId,
          date: filters.date,
        }
      : {}
  );

  const correctMutation = useCorrectAttendance();
  const deleteMutation = useDeleteAttendance();

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 10,
      academicSessionId: '',
      classId: '',
      sectionId: '',
      status: '',
      date: '',
    });
  }, []);

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleCorrectionSubmit = async (payload) => {
    await correctMutation.mutateAsync(payload);
    setRecordToCorrect(null);
  };

  const handleDelete = async (id) => {
    await deleteMutation.mutateAsync(id);
  };

  const records = listData?.records || [];
  const pagination = listData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'Reports & Logs' },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Attendance Analytics & Historical Logs
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Review student attendance percentages, audit logs, and submit official corrections
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchList();
              refetchSummary();
            }}
            isLoading={isFetchingList}
            leftIcon={RefreshCw}
            aria-label="Refresh records"
          >
            Refresh
          </Button>

          <Link to="/attendance">
            <Button variant="primary" size="sm" leftIcon={CheckSquare}>
              Take Roll Call
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <AttendanceFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        showStatus={true}
      />

      {/* Attendance Stats Cards */}
      {summaryData && (
        <AttendanceStatsCard stats={summaryData} />
      )}

      {/* Records Table */}
      {isLoadingList ? (
        <Card className="p-6 space-y-4">
          <div className="space-y-3 animate-pulse" aria-busy="true">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="h-10 bg-surface-muted rounded" />
            ))}
          </div>
        </Card>
      ) : isErrorList ? (
        <ErrorState
          title="Failed to load attendance logs"
          message={listError?.message || 'Could not retrieve attendance records.'}
          onRetry={refetchList}
        />
      ) : records.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={BarChart2}
            title="No Attendance Logs Found"
            description="No attendance entries recorded matching the selected filter criteria."
            action={
              <Link to="/attendance">
                <Button variant="primary" size="sm" leftIcon={CheckSquare}>
                  Record Attendance
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <AttendanceRecordTable
              records={records}
              onCorrect={(rec) => setRecordToCorrect(rec)}
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

      {/* Correction Modal */}
      <AttendanceCorrectionModal
        isOpen={Boolean(recordToCorrect)}
        onClose={() => setRecordToCorrect(null)}
        record={recordToCorrect}
        onSubmit={handleCorrectionSubmit}
        isLoading={correctMutation.isPending}
      />
    </div>
  );
}

export default AttendanceReportPage;

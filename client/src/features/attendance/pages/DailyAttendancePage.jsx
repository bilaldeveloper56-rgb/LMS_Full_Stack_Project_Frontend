import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, BarChart3, RefreshCw } from 'lucide-react';
import { Breadcrumb, Button, Card } from '@/components/ui';
import { BulkAttendanceSheet } from '../components/BulkAttendanceSheet';
import { AttendanceFilters } from '../components/AttendanceFilters';
import { useBulkMarkAttendance, useAttendanceList } from '../hooks/useAttendance';
import { useAcademicSessions } from '@/features/academics';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

export function DailyAttendancePage() {
  const { hasPermission } = useAuthorization();
  const canReport = hasPermission(PERMISSIONS.ATTENDANCE_REPORT);

  const todayStr = new Date().toISOString().split('T')[0];

  const { data: sessionsData } = useAcademicSessions({ limit: 100 });
  const activeSession = sessionsData?.sessions?.find((s) => s.isCurrent) || sessionsData?.sessions?.[0];
  const defaultSessionId = activeSession ? (activeSession._id || activeSession.id) : '';

  const [filters, setFilters] = useState({
    academicSessionId: '',
    classId: '',
    sectionId: '',
    date: todayStr,
  });

  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      academicSessionId: '',
      classId: '',
      sectionId: '',
      date: todayStr,
    });
  }, [todayStr]);

  const effectiveSessionId = filters.academicSessionId || defaultSessionId;

  // Check if attendance is already taken for this date/section
  const {
    data: existingData,
    isLoading: isLoadingExisting,
    refetch,
    isFetching,
  } = useAttendanceList(
    filters.sectionId && filters.date
      ? { sectionId: filters.sectionId, date: filters.date, limit: 100 }
      : { limit: 0 },
    { enabled: Boolean(filters.sectionId && filters.date) }
  );

  const bulkMutation = useBulkMarkAttendance();

  const handleBulkSubmit = async (payload) => {
    await bulkMutation.mutateAsync(payload);
  };

  const isSectionSelected = Boolean(filters.classId && filters.sectionId && effectiveSessionId);

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Daily Attendance' },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Daily Attendance Roll Call
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Mark daily classroom attendance sheets, check-ins, and excused absences
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isSectionSelected && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              isLoading={isFetching}
              leftIcon={RefreshCw}
              aria-label="Refresh attendance"
            >
              Refresh
            </Button>
          )}

          {canReport && (
            <Link to="/attendance/reports">
              <Button variant="outline" size="sm" leftIcon={BarChart3}>
                Attendance Analytics & Logs
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <AttendanceFilters
        filters={{ ...filters, academicSessionId: effectiveSessionId }}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        showStatus={false}
      />

      {/* Content Area */}
      {!isSectionSelected ? (
        <Card className="p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mx-auto">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-text-primary">
            Select Class & Section to Begin Roll Call
          </h2>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            Choose an active academic session, class, and classroom section from the filter bar above to load the student roster.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <BulkAttendanceSheet
            academicSessionId={effectiveSessionId}
            classId={filters.classId}
            sectionId={filters.sectionId}
            date={filters.date || todayStr}
            existingRecords={existingData?.records || []}
            onSubmit={handleBulkSubmit}
            isLoading={bulkMutation.isPending || isLoadingExisting}
          />
        </div>
      )}
    </div>
  );
}

export default DailyAttendancePage;

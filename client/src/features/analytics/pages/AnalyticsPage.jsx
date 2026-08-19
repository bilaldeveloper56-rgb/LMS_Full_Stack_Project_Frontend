import React, { useState } from 'react';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { Breadcrumb, Button } from '@/components/ui';
import { ErrorState } from '@/components/feedback';
import { AnalyticsFilters } from '../components/AnalyticsFilters';
import { DemographicsSection } from '../components/DemographicsSection';
import { AttendanceAnalyticsSection } from '../components/AttendanceAnalyticsSection';
import { FinancialAnalyticsSection } from '../components/FinancialAnalyticsSection';
import { AcademicAnalyticsSection } from '../components/AcademicAnalyticsSection';
import { PlatformAnalyticsSection } from '../components/PlatformAnalyticsSection';
import { useSchoolAnalytics, usePlatformAnalytics } from '../hooks/useAnalytics';
import { useAuth } from '@/features/auth/auth.context';
import { ROLES } from '@/constants';

export function AnalyticsPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN;

  const [filters, setFilters] = useState({
    academicSessionId: '',
    classId: '',
    startDate: '',
    endDate: '',
  });

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      academicSessionId: '',
      classId: '',
      startDate: '',
      endDate: '',
    });
  };

  const {
    data: schoolData,
    isLoading: isSchoolLoading,
    isError: isSchoolError,
    error: schoolError,
    refetch: refetchSchool,
  } = useSchoolAnalytics(filters);

  const {
    data: platformData,
    isLoading: isPlatformLoading,
  } = usePlatformAnalytics({}, { enabled: isSuperAdmin });

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Executive Analytics & BI' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Executive Analytics & Institutional BI
            </h1>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-200">
              <TrendingUp className="w-3 h-3" /> Live Metrics
            </span>
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            Aggregated institutional indicators covering student enrollment, attendance rates, finance collections, and academic outcomes
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={RefreshCw}
          onClick={() => refetchSchool()}
          className="text-xs"
        >
          Refresh Data
        </Button>
      </div>

      {/* Filters */}
      <AnalyticsFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Analytics Sections */}
      {isSchoolError ? (
        <ErrorState
          title="Failed to load analytics"
          message={schoolError?.message || 'Could not retrieve institutional analytics metrics.'}
          onRetry={refetchSchool}
        />
      ) : isSchoolLoading ? (
        <div className="space-y-6 animate-pulse" aria-busy="true">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-28 bg-surface-muted rounded-xl border border-border" />
            ))}
          </div>
          <div className="h-44 bg-surface-muted rounded-xl border border-border" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* 1. Demographics & Staff */}
          <DemographicsSection
            demographics={schoolData?.demographics}
            academicStructure={schoolData?.academicStructure}
          />

          {/* 2. Attendance */}
          <AttendanceAnalyticsSection
            attendance={schoolData?.attendance}
          />

          {/* 3. Financials */}
          <FinancialAnalyticsSection
            financials={schoolData?.financials}
          />

          {/* 4. Academics */}
          <AcademicAnalyticsSection
            academic={schoolData?.academic}
          />

          {/* 5. Super Admin Multi-Tenant Metrics */}
          {isSuperAdmin && !isPlatformLoading && platformData && (
            <PlatformAnalyticsSection
              platformData={platformData}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default AnalyticsPage;

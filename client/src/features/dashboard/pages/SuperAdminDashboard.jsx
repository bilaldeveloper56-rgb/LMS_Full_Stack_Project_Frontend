import React from 'react';
import {
  Building2,
  Users,
  Shield,
  CheckCircle2,
  Clock,
  AlertTriangle,
  GraduationCap,
  Briefcase,
} from 'lucide-react';
import { usePlatformAnalytics } from '../hooks/useDashboardData';
import { DashboardShell } from '../components/DashboardShell';
import { DashboardSection } from '../components/DashboardSection';
import { StatCard } from '../components/StatCard';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { ErrorState, EmptyState } from '@/components/feedback';
import { formatNumber } from '@/lib/utils';

export function SuperAdminDashboard() {
  const { data, isLoading, isError, error, refetch, isFetching } = usePlatformAnalytics();

  if (isLoading) {
    return (
      <DashboardShell
        title="Platform Administration"
        subtitle="Global multi-tenant system overview and analytics"
        roleLabel="Super Admin"
      >
        <DashboardSkeleton cardsCount={4} sectionsCount={2} />
      </DashboardShell>
    );
  }

  if (isError) {
    return (
      <DashboardShell
        title="Platform Administration"
        subtitle="Global multi-tenant system overview and analytics"
        roleLabel="Super Admin"
      >
        <ErrorState
          title="Failed to load platform analytics"
          message={error?.message || 'Could not retrieve platform metrics from the server.'}
          onRetry={refetch}
        />
      </DashboardShell>
    );
  }

  if (!data || !data.schools || !data.users) {
    return (
      <DashboardShell
        title="Platform Administration"
        subtitle="Global multi-tenant system overview and analytics"
        roleLabel="Super Admin"
        onRefresh={refetch}
        isRefreshing={isFetching}
      >
        <EmptyState
          icon={Building2}
          title="No Platform Data Available"
          description="There are currently no multi-tenant analytics records registered in the system."
        />
      </DashboardShell>
    );
  }

  const { schools, users, systemActivity } = data;

  return (
    <DashboardShell
      title="Platform Administration"
      subtitle="Global multi-tenant system overview and live analytics"
      roleLabel="Super Admin"
      onRefresh={refetch}
      isRefreshing={isFetching}
    >
      {/* 1. Multi-Tenant Schools Overview */}
      <DashboardSection
        title="Institutional Network"
        subtitle="Live status of all registered school tenants on the platform"
        columns={4}
      >
        <StatCard
          title="Total Schools"
          value={formatNumber(schools.totalSchools)}
          icon={Building2}
          description="Registered institutional tenants"
          variant="primary"
        />
        <StatCard
          title="Active Schools"
          value={formatNumber(schools.ACTIVE)}
          icon={CheckCircle2}
          description="Fully operational institutions"
          variant="success"
        />
        <StatCard
          title="Pending Onboarding"
          value={formatNumber(schools.PENDING)}
          icon={Clock}
          description="Awaiting admin activation"
          variant="warning"
        />
        <StatCard
          title="Suspended / Inactive"
          value={formatNumber((schools.SUSPENDED || 0) + (schools.INACTIVE || 0))}
          icon={AlertTriangle}
          description="Restricted institutions"
          variant="danger"
        />
      </DashboardSection>

      {/* 2. Global Users Breakdown */}
      <DashboardSection
        title="Platform User Ecosystem"
        subtitle="Global accounts across all school tenants and platform administrators"
        columns={4}
      >
        <StatCard
          title="Total Platform Users"
          value={formatNumber(users.totalUsers)}
          icon={Users}
          description="All active and pending accounts"
          variant="primary"
        />
        <StatCard
          title="School Administrators"
          value={formatNumber(users.SCHOOL_ADMIN)}
          icon={Briefcase}
          description="Institutional admin accounts"
          variant="info"
        />
        <StatCard
          title="Faculty & Teachers"
          value={formatNumber(users.TEACHER)}
          icon={Users}
          description="Active teaching faculty"
          variant="info"
        />
        <StatCard
          title="Students & Parents"
          value={formatNumber((users.STUDENT || 0) + (users.PARENT || 0))}
          icon={GraduationCap}
          description={`${formatNumber(users.STUDENT || 0)} students, ${formatNumber(users.PARENT || 0)} parents`}
          variant="success"
        />
      </DashboardSection>

      {/* 3. System Activity & Security */}
      <DashboardSection
        title="System Security & Auditing"
        subtitle="Platform audit volume and security event tracking"
        columns={4}
      >
        <StatCard
          title="Audit Log Events"
          value={formatNumber(systemActivity?.totalAuditEvents || 0)}
          icon={Shield}
          description="Immutable system activity records"
          variant="neutral"
        />
      </DashboardSection>
    </DashboardShell>
  );
}

export default SuperAdminDashboard;

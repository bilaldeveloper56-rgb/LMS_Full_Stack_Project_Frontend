import React from 'react';
import {
  GraduationCap,
  Users,
  School,
  CheckSquare,
  CreditCard,
  FileText,
  TrendingUp,
  Percent,
  BookOpen,
} from 'lucide-react';
import { useSchoolAnalytics } from '../hooks/useDashboardData';
import { DashboardShell } from '../components/DashboardShell';
import { DashboardSection } from '../components/DashboardSection';
import { StatCard } from '../components/StatCard';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { ErrorState, EmptyState } from '@/components/feedback';
import { formatNumber, formatCurrency } from '@/lib/utils';

export function SchoolAdminDashboard() {
  const { data, isLoading, isError, error, refetch, isFetching } = useSchoolAnalytics();

  if (isLoading) {
    return (
      <DashboardShell
        title="Institutional Dashboard"
        subtitle="Live academic and administrative performance metrics"
        roleLabel="School Admin"
      >
        <DashboardSkeleton cardsCount={4} sectionsCount={3} />
      </DashboardShell>
    );
  }

  if (isError) {
    return (
      <DashboardShell
        title="Institutional Dashboard"
        subtitle="Live academic and administrative performance metrics"
        roleLabel="School Admin"
      >
        <ErrorState
          title="Failed to load school analytics"
          message={error?.message || 'Could not retrieve institutional metrics from the server.'}
          onRetry={refetch}
        />
      </DashboardShell>
    );
  }

  if (!data) {
    return (
      <DashboardShell
        title="Institutional Dashboard"
        subtitle="Live academic and administrative performance metrics"
        roleLabel="School Admin"
        onRefresh={refetch}
        isRefreshing={isFetching}
      >
        <EmptyState
          icon={School}
          title="No School Data Available"
          description="Analytics will appear here once academic records, enrollment, and attendance are recorded."
        />
      </DashboardShell>
    );
  }

  const { demographics, academicStructure, attendance, financials, academic } = data;

  return (
    <DashboardShell
      title="Institutional Dashboard"
      subtitle="Live institutional KPIs and real-time operational analytics"
      roleLabel="School Admin"
      onRefresh={refetch}
      isRefreshing={isFetching}
    >
      {/* 1. Student Enrollment & Demographics */}
      <DashboardSection
        title="Student Enrollment & Staff"
        subtitle="Active enrollment and faculty composition"
        columns={4}
      >
        <StatCard
          title="Active Students"
          value={formatNumber(demographics?.activeStudents || 0)}
          icon={GraduationCap}
          description={`Total enrolled: ${formatNumber(demographics?.totalStudents || 0)}`}
          variant="primary"
        />
        <StatCard
          title="Active Faculty"
          value={formatNumber(academicStructure?.totalTeachers || 0)}
          icon={Users}
          description={`Ratio: ${academicStructure?.studentTeacherRatio || 0} students/teacher`}
          variant="info"
        />
        <StatCard
          title="Classes & Sections"
          value={`${formatNumber(academicStructure?.totalClasses || 0)} / ${formatNumber(academicStructure?.totalSections || 0)}`}
          icon={School}
          description="Academic grade levels / cohorts"
          variant="neutral"
        />
        <StatCard
          title="Gender Breakdown"
          value={`${formatNumber(demographics?.maleStudents || 0)}M / ${formatNumber(demographics?.femaleStudents || 0)}F`}
          icon={BookOpen}
          description={demographics?.otherStudents ? `Other: ${demographics.otherStudents}` : 'Student diversity'}
          variant="neutral"
        />
      </DashboardSection>

      {/* 2. Attendance & Financial Performance */}
      <DashboardSection
        title="Attendance & Financials"
        subtitle="Daily attendance compliance and fee recovery status"
        columns={4}
      >
        <StatCard
          title="Attendance Rate"
          value={`${attendance?.attendanceRatePercentage || 0}%`}
          icon={CheckSquare}
          description={`Present: ${formatNumber(attendance?.PRESENT || 0)} of ${formatNumber(attendance?.totalRecords || 0)}`}
          variant={attendance?.attendanceRatePercentage >= 90 ? 'success' : attendance?.attendanceRatePercentage >= 75 ? 'warning' : 'danger'}
        />
        <StatCard
          title="Fee Collection Rate"
          value={`${financials?.collectionRatePercentage || 0}%`}
          icon={Percent}
          description={`Collected: ${formatCurrency(financials?.totalPaid || 0)}`}
          variant={financials?.collectionRatePercentage >= 80 ? 'success' : financials?.collectionRatePercentage >= 50 ? 'warning' : 'danger'}
        />
        <StatCard
          title="Total Billed"
          value={formatCurrency(financials?.totalInvoiced || 0)}
          icon={CreditCard}
          description={`Total Invoices: ${formatNumber(financials?.totalInvoices || 0)}`}
          variant="primary"
        />
        <StatCard
          title="Outstanding Balance"
          value={formatCurrency(financials?.totalBalance || 0)}
          icon={CreditCard}
          description={`Unpaid invoices: ${formatNumber(financials?.unpaidInvoices || 0)}`}
          variant={financials?.totalBalance > 0 ? 'warning' : 'success'}
        />
      </DashboardSection>

      {/* 3. Academic & LMS Performance */}
      <DashboardSection
        title="Academic & Learning Metrics"
        subtitle="Assignment submissions and examination outcomes"
        columns={4}
      >
        <StatCard
          title="Assignments Created"
          value={formatNumber(academic?.totalAssignments || 0)}
          icon={FileText}
          description={`Submissions: ${formatNumber(academic?.totalSubmissions || 0)}`}
          variant="primary"
        />
        <StatCard
          title="Pass Rate"
          value={`${academic?.passRatePercentage || 0}%`}
          icon={TrendingUp}
          description={`Published results: ${formatNumber(academic?.totalResultsPublished || 0)}`}
          variant={academic?.passRatePercentage >= 75 ? 'success' : 'warning'}
        />
        <StatCard
          title="Average Grade"
          value={`${academic?.averageGradePercentage || 0}%`}
          icon={TrendingUp}
          description={`Average GPA: ${academic?.averageGpa || 0}`}
          variant="info"
        />
      </DashboardSection>
    </DashboardShell>
  );
}

export default SchoolAdminDashboard;

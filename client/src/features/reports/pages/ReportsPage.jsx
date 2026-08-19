import React, { useState } from 'react';
import { Breadcrumb, Pagination } from '@/components/ui';
import { ErrorState } from '@/components/feedback';
import { ReportTypeSelector } from '../components/ReportTypeSelector';
import { ReportFilters } from '../components/ReportFilters';
import { ReportExportButtons } from '../components/ReportExportButtons';
import { StudentRosterTable } from '../components/StudentRosterTable';
import { AttendanceReportTable } from '../components/AttendanceReportTable';
import { FeeDefaultersReportTable } from '../components/FeeDefaultersReportTable';
import { AcademicReportCardView } from '../components/AcademicReportCardView';
import {
  useStudentRosterReport,
  useAttendanceReport,
  useFeeDefaultersReport,
  useAcademicReportCard,
} from '../hooks/useReports';

export function ReportsPage() {
  const [reportType, setReportType] = useState('students');
  const [filters, setFilters] = useState({
    academicSessionId: '',
    classId: '',
    sectionId: '',
    studentId: '',
    enrollmentStatus: '',
    startDate: '',
    endDate: '',
    minBalance: 0,
    examId: '',
    page: 1,
    limit: 50,
  });

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      academicSessionId: '',
      classId: '',
      sectionId: '',
      studentId: '',
      enrollmentStatus: '',
      startDate: '',
      endDate: '',
      minBalance: 0,
      examId: '',
      page: 1,
      limit: 50,
    });
  };

  // Queries for each report type
  const rosterQuery = useStudentRosterReport(filters, { enabled: reportType === 'students' });
  const attendanceQuery = useAttendanceReport(filters, { enabled: reportType === 'attendance' });
  const financialQuery = useFeeDefaultersReport(filters, { enabled: reportType === 'financial' });
  const academicQuery = useAcademicReportCard(filters, { enabled: reportType === 'academic' });

  // Get active query state
  const activeQuery =
    reportType === 'students'
      ? rosterQuery
      : reportType === 'attendance'
      ? attendanceQuery
      : reportType === 'financial'
      ? financialQuery
      : academicQuery;

  // Extract tabular export data
  let exportData = [];
  let exportFilename = 'report.csv';

  if (reportType === 'students') {
    exportData = (rosterQuery.data?.roster || []).map((s) => ({
      AdmissionNumber: s.admissionNumber,
      RollNumber: s.rollNumber || '',
      FullName: `${s.firstName} ${s.lastName}`.trim(),
      Class: s.class?.name || '',
      Section: s.section?.name || '',
      Gender: s.gender || '',
      BloodGroup: s.bloodGroup || '',
      Status: s.enrollmentStatus || '',
      Email: s.email || '',
      Phone: s.phone || '',
    }));
    exportFilename = 'student_roster_report.csv';
  } else if (reportType === 'attendance') {
    exportData = (attendanceQuery.data?.reports || []).map((a) => ({
      AdmissionNumber: a.admissionNumber,
      FullName: `${a.firstName} ${a.lastName}`.trim(),
      TotalDays: a.totalDays,
      PresentDays: a.presentDays,
      AbsentDays: a.absentDays,
      LateDays: a.lateDays,
      HalfDays: a.halfDays,
      ExcusedDays: a.excusedDays,
      AttendancePercentage: `${a.attendancePercentage}%`,
    }));
    exportFilename = 'attendance_register_report.csv';
  } else if (reportType === 'financial') {
    exportData = (financialQuery.data?.defaulters || []).map((f) => ({
      InvoiceNumber: f.invoiceNumber,
      StudentName: f.studentName,
      AdmissionNumber: f.admissionNumber,
      Class: f.class,
      Section: f.section,
      ParentPhone: f.parentPhone || '',
      TotalAmount: f.totalAmount,
      PaidAmount: f.paidAmount,
      BalanceDue: f.balanceAmount,
      DueDate: f.dueDate,
      DaysOverdue: f.daysOverdue,
      Status: f.status,
    }));
    exportFilename = 'fee_defaulters_report.csv';
  }

  const pagination =
    reportType === 'students'
      ? rosterQuery.data?.pagination
      : reportType === 'attendance'
      ? attendanceQuery.data?.pagination
      : reportType === 'financial'
      ? financialQuery.data?.pagination
      : null;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Reports & Export Center' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Institutional Reports & Exports
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Generate and export official student rosters, attendance registers, fee dues, and transcripts
          </p>
        </div>

        <ReportExportButtons
          data={exportData}
          filename={exportFilename}
          disableCsv={reportType === 'academic'}
        />
      </div>

      {/* Report Category Type Selector */}
      <ReportTypeSelector
        selectedType={reportType}
        onSelectType={(t) => {
          setReportType(t);
          handleFilterChange({ page: 1 });
        }}
      />

      {/* Dynamic Filters */}
      <ReportFilters
        reportType={reportType}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Main Report Body */}
      {activeQuery.isError ? (
        <ErrorState
          title="Failed to generate report"
          message={activeQuery.error?.message || 'Could not retrieve report data.'}
          onRetry={activeQuery.refetch}
        />
      ) : (
        <div className="space-y-4">
          {reportType === 'students' && (
            <StudentRosterTable
              roster={rosterQuery.data?.roster}
              isLoading={rosterQuery.isLoading}
            />
          )}

          {reportType === 'attendance' && (
            <AttendanceReportTable
              reports={attendanceQuery.data?.reports}
              isLoading={attendanceQuery.isLoading}
            />
          )}

          {reportType === 'financial' && (
            <FeeDefaultersReportTable
              defaulters={financialQuery.data?.defaulters}
              isLoading={financialQuery.isLoading}
            />
          )}

          {reportType === 'academic' && (
            <AcademicReportCardView
              reportData={academicQuery.data}
              isLoading={academicQuery.isLoading}
            />
          )}

          {/* Pagination for Paginated Reports */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center sm:justify-end pt-2 no-print">
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

export default ReportsPage;

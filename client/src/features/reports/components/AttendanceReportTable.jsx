import React from 'react';
import { Badge } from '@/components/ui';

/**
 * AttendanceReportTable component.
 * @param {object} props
 * @param {Array} props.reports
 * @param {boolean} [props.isLoading=false]
 */
export function AttendanceReportTable({ reports = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="p-8 space-y-3 animate-pulse" aria-busy="true">
        <div className="h-12 bg-surface-muted rounded-lg" />
        <div className="h-12 bg-surface-muted rounded-lg" />
        <div className="h-12 bg-surface-muted rounded-lg" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-text-muted bg-surface rounded-xl border border-border">
        No attendance records found for the selected session or date range.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-2xs">
      <table className="w-full text-left text-xs">
        <thead className="bg-surface-muted/70 text-text-secondary border-b border-border font-semibold uppercase tracking-wider">
          <tr>
            <th className="p-3.5">Admission #</th>
            <th className="p-3.5">Student Full Name</th>
            <th className="p-3.5 text-center">Total Recorded</th>
            <th className="p-3.5 text-center">Present</th>
            <th className="p-3.5 text-center">Absent</th>
            <th className="p-3.5 text-center">Late / Half</th>
            <th className="p-3.5 text-center">Excused</th>
            <th className="p-3.5 text-right">Attendance Rate</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {reports.map((item, idx) => {
            const fullName = `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Student';
            const rate = item.attendancePercentage ?? 0;
            const badgeVariant =
              rate >= 85 ? 'success' : rate >= 75 ? 'warning' : 'danger';

            return (
              <tr key={item.studentId || idx} className="hover:bg-surface-muted/40 transition-colors">
                <td className="p-3.5 font-mono font-bold text-primary-700">
                  {item.admissionNumber || '—'}
                </td>
                <td className="p-3.5 font-bold text-text-primary">
                  {fullName}
                </td>
                <td className="p-3.5 text-center font-semibold text-text-secondary">
                  {item.totalDays} days
                </td>
                <td className="p-3.5 text-center font-bold text-success-700">
                  {item.presentDays}
                </td>
                <td className="p-3.5 text-center font-bold text-danger-700">
                  {item.absentDays}
                </td>
                <td className="p-3.5 text-center text-text-muted">
                  {item.lateDays || 0} / {item.halfDays || 0}
                </td>
                <td className="p-3.5 text-center text-text-muted">
                  {item.excusedDays || 0}
                </td>
                <td className="p-3.5 text-right">
                  <Badge variant={badgeVariant} size="sm" className="font-bold">
                    {rate}%
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default AttendanceReportTable;

import React from 'react';
import { CalendarCheck, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui';
import { KpiMetricCard } from './KpiMetricCard';

/**
 * AttendanceAnalyticsSection component.
 * @param {object} props
 * @param {object} props.attendance
 */
export function AttendanceAnalyticsSection({ attendance = {} }) {
  const rate = attendance.attendanceRatePercentage ?? 0;
  const total = attendance.totalRecords || 0;
  const present = attendance.PRESENT || 0;
  const absent = attendance.ABSENT || 0;
  const late = attendance.LATE || 0;
  const halfDay = attendance.HALF_DAY || 0;
  const excused = attendance.EXCUSED || 0;

  const presentPct = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
  const absentPct = total > 0 ? ((absent / total) * 100).toFixed(1) : 0;
  const latePct = total > 0 ? ((late / total) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CalendarCheck className="w-4 h-4 text-success-600" />
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
          Attendance Analytics & Daily Register Metrics
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiMetricCard
          title="Attendance Rate"
          value={`${rate}%`}
          subtitle={`Across ${total} total attendance records`}
          icon={CheckCircle2}
          accent={rate >= 85 ? 'success' : rate >= 75 ? 'warning' : 'danger'}
          percentage={rate}
        />

        <KpiMetricCard
          title="Present Records"
          value={present}
          subtitle={`${presentPct}% of total records`}
          icon={CheckCircle2}
          accent="success"
        />

        <KpiMetricCard
          title="Absent Records"
          value={absent}
          subtitle={`${absentPct}% unexcused absences`}
          icon={XCircle}
          accent="danger"
        />

        <KpiMetricCard
          title="Late / Excused"
          value={`${late} / ${excused}`}
          subtitle={`${latePct}% tardy arrivals`}
          icon={Clock}
          accent="warning"
        />
      </div>

      {/* Attendance Status Distribution Card */}
      <Card className="p-5 border border-border bg-surface shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-text-primary">Status Breakdown & Proportions</span>
          <span className="text-text-muted">{total} Recorded Entries</span>
        </div>

        <div className="space-y-2">
          {/* Present */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-[11px]">
              <span className="text-text-secondary">Present ({present})</span>
              <span className="font-bold text-success-700">{presentPct}%</span>
            </div>
            <div className="w-full h-2 bg-surface-muted rounded-full overflow-hidden">
              <div className="h-full bg-success-600 rounded-full" style={{ width: `${presentPct}%` }} />
            </div>
          </div>

          {/* Absent */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-[11px]">
              <span className="text-text-secondary">Absent ({absent})</span>
              <span className="font-bold text-danger-700">{absentPct}%</span>
            </div>
            <div className="w-full h-2 bg-surface-muted rounded-full overflow-hidden">
              <div className="h-full bg-danger-600 rounded-full" style={{ width: `${absentPct}%` }} />
            </div>
          </div>

          {/* Late */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-[11px]">
              <span className="text-text-secondary">Late ({late})</span>
              <span className="font-bold text-warning-700">{latePct}%</span>
            </div>
            <div className="w-full h-2 bg-surface-muted rounded-full overflow-hidden">
              <div className="h-full bg-warning-600 rounded-full" style={{ width: `${latePct}%` }} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default AttendanceAnalyticsSection;

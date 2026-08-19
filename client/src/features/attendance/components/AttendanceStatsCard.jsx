import React from 'react';
import { CheckCircle2, XCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui';

/**
 * AttendanceStatsCard for rendering summary metrics and attendance percentages.
 *
 * @param {object} props
 * @param {object} props.stats
 */
export function AttendanceStatsCard({ stats }) {
  if (!stats) return null;

  const total = stats.total || (stats.present || 0) + (stats.absent || 0) + (stats.late || 0) + (stats.halfDay || 0) + (stats.excused || 0) + (stats.leave || 0) || 0;
  const presentRate = stats.presentPercentage ?? (total > 0 ? (((stats.present || 0) / total) * 100).toFixed(1) : 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* Attendance Rate */}
      <Card className="p-4 bg-primary-50/50 border-primary-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-primary-900 uppercase tracking-wider">
            Present Rate
          </span>
          <TrendingUp className="w-4 h-4 text-primary-600" />
        </div>
        <div className="text-2xl font-bold text-primary-700 mt-2">
          {presentRate}%
        </div>
        <div className="text-xs text-primary-600/80 mt-0.5">
          {stats.present || 0} of {total} records
        </div>
      </Card>

      {/* Present Count */}
      <Card className="p-4 bg-success-50/50 border-success-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-success-900 uppercase tracking-wider">
            Present
          </span>
          <CheckCircle2 className="w-4 h-4 text-success-600" />
        </div>
        <div className="text-2xl font-bold text-success-700 mt-2">
          {stats.present || 0}
        </div>
        <div className="text-xs text-success-600/80 mt-0.5">
          On-time attendees
        </div>
      </Card>

      {/* Absent Count */}
      <Card className="p-4 bg-danger-50/50 border-danger-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-danger-900 uppercase tracking-wider">
            Absent
          </span>
          <XCircle className="w-4 h-4 text-danger-600" />
        </div>
        <div className="text-2xl font-bold text-danger-700 mt-2">
          {stats.absent || 0}
        </div>
        <div className="text-xs text-danger-600/80 mt-0.5">
          Unexcused absences
        </div>
      </Card>

      {/* Late Count */}
      <Card className="p-4 bg-warning-50/50 border-warning-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-warning-900 uppercase tracking-wider">
            Late
          </span>
          <Clock className="w-4 h-4 text-warning-600" />
        </div>
        <div className="text-2xl font-bold text-warning-700 mt-2">
          {stats.late || 0}
        </div>
        <div className="text-xs text-warning-600/80 mt-0.5">
          Tardy arrivals
        </div>
      </Card>

      {/* Leave / Excused */}
      <Card className="p-4 bg-surface-muted/60 border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Excused / Leave
          </span>
          <AlertCircle className="w-4 h-4 text-text-muted" />
        </div>
        <div className="text-2xl font-bold text-text-primary mt-2">
          {(stats.excused || 0) + (stats.leave || 0) + (stats.halfDay || 0)}
        </div>
        <div className="text-xs text-text-muted mt-0.5">
          Authorized leaves
        </div>
      </Card>
    </div>
  );
}

export default AttendanceStatsCard;

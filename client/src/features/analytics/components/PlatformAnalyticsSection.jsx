import React from 'react';
import { Building2, Shield, Users, Activity } from 'lucide-react';
import { Card } from '@/components/ui';
import { KpiMetricCard } from './KpiMetricCard';

/**
 * PlatformAnalyticsSection component (Super Admin).
 * @param {object} props
 * @param {object} props.platformData
 */
export function PlatformAnalyticsSection({ platformData = {} }) {
  const schools = platformData.schools || {};
  const users = platformData.users || {};
  const activity = platformData.systemActivity || {};

  return (
    <div className="space-y-4 pt-6 border-t border-border">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-purple-600" />
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
          Multi-Tenant Platform Metrics (Super Admin Exclusive)
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiMetricCard
          title="Active Tenant Schools"
          value={schools.ACTIVE || 0}
          subtitle={`Out of ${schools.totalSchools || 0} registered institutions`}
          icon={Building2}
          accent="success"
        />

        <KpiMetricCard
          title="Total Platform Users"
          value={users.totalUsers || 0}
          subtitle="Across all tenant schools"
          icon={Users}
          accent="primary"
        />

        <KpiMetricCard
          title="Total Students Enrolled"
          value={users.STUDENT || 0}
          subtitle={`${users.TEACHER || 0} faculty members`}
          icon={Users}
          accent="neutral"
        />

        <KpiMetricCard
          title="Total Audit Events Logged"
          value={activity.totalAuditEvents || 0}
          subtitle="Global system transactions recorded"
          icon={Activity}
          accent="warning"
        />
      </div>

      {/* Global User Role Breakdown */}
      <Card className="p-5 border border-border bg-surface shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-text-primary">Global User Population by Role</span>
          <span className="text-text-muted">{users.totalUsers || 0} Total Platform Users</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div className="p-3 bg-surface-muted/60 rounded-xl border border-border">
            <span className="text-text-muted text-[11px] block">Students</span>
            <span className="text-base font-bold text-text-primary">{users.STUDENT || 0}</span>
          </div>
          <div className="p-3 bg-surface-muted/60 rounded-xl border border-border">
            <span className="text-text-muted text-[11px] block">Teachers</span>
            <span className="text-base font-bold text-text-primary">{users.TEACHER || 0}</span>
          </div>
          <div className="p-3 bg-surface-muted/60 rounded-xl border border-border">
            <span className="text-text-muted text-[11px] block">School Admins</span>
            <span className="text-base font-bold text-text-primary">{users.SCHOOL_ADMIN || 0}</span>
          </div>
          <div className="p-3 bg-surface-muted/60 rounded-xl border border-border">
            <span className="text-text-muted text-[11px] block">Parents & Staff</span>
            <span className="text-base font-bold text-text-primary">
              {(users.PARENT || 0) + (users.ACCOUNTANT || 0) + (users.STAFF || 0)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default PlatformAnalyticsSection;

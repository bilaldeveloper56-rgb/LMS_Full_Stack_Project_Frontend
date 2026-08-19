import React from 'react';
import { Users, UserCheck, GraduationCap, School } from 'lucide-react';
import { Card } from '@/components/ui';
import { KpiMetricCard } from './KpiMetricCard';

/**
 * DemographicsSection component.
 * @param {object} props
 * @param {object} props.demographics
 * @param {object} props.academicStructure
 */
export function DemographicsSection({ demographics = {}, academicStructure = {} }) {
  const total = demographics.totalStudents || 0;
  const active = demographics.activeStudents || 0;
  const male = demographics.maleStudents || 0;
  const female = demographics.femaleStudents || 0;
  const other = demographics.otherStudents || 0;

  const malePct = total > 0 ? Math.round((male / total) * 100) : 0;
  const femalePct = total > 0 ? Math.round((female / total) * 100) : 0;
  const otherPct = total > 0 ? Math.round((other / total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-primary-600" />
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
          Student Enrollment & Staff Demographics
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiMetricCard
          title="Active Students"
          value={active}
          subtitle={`Out of ${total} total enrolled`}
          icon={GraduationCap}
          accent="primary"
          percentage={total > 0 ? Math.round((active / total) * 100) : 100}
        />

        <KpiMetricCard
          title="Active Teachers"
          value={academicStructure.totalTeachers || 0}
          subtitle="Teaching faculty members"
          icon={UserCheck}
          accent="success"
        />

        <KpiMetricCard
          title="Student-Teacher Ratio"
          value={`${academicStructure.studentTeacherRatio || 0}:1`}
          subtitle="Average students per teacher"
          icon={Users}
          accent="warning"
        />

        <KpiMetricCard
          title="Classes & Sections"
          value={`${academicStructure.totalClasses || 0} / ${academicStructure.totalSections || 0}`}
          subtitle="Total classes and sections"
          icon={School}
          accent="neutral"
        />
      </div>

      {/* Gender Distribution Bar */}
      <Card className="p-5 border border-border bg-surface shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-text-primary">Student Gender Distribution</span>
          <span className="text-text-muted">{total} Total Students</span>
        </div>

        {/* Multi-segment Bar */}
        <div className="w-full h-3 bg-surface-muted rounded-full overflow-hidden flex">
          <div
            className="bg-primary-600 h-full transition-all"
            style={{ width: `${malePct}%` }}
            title={`Male: ${male} (${malePct}%)`}
          />
          <div
            className="bg-amber-500 h-full transition-all"
            style={{ width: `${femalePct}%` }}
            title={`Female: ${female} (${femalePct}%)`}
          />
          {otherPct > 0 && (
            <div
              className="bg-emerald-500 h-full transition-all"
              style={{ width: `${otherPct}%` }}
              title={`Other: ${other} (${otherPct}%)`}
            />
          )}
        </div>

        <div className="flex items-center gap-6 text-xs pt-1 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-600" />
            <span className="text-text-secondary">Male: <strong>{male}</strong> ({malePct}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-text-secondary">Female: <strong>{female}</strong> ({femalePct}%)</span>
          </div>
          {other > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-text-secondary">Other: <strong>{other}</strong> ({otherPct}%)</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default DemographicsSection;

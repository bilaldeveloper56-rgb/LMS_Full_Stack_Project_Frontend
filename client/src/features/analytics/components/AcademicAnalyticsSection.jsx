import React from 'react';
import { Award, BookOpen, FileCheck, CheckCircle } from 'lucide-react';
import { KpiMetricCard } from './KpiMetricCard';

/**
 * AcademicAnalyticsSection component.
 * @param {object} props
 * @param {object} props.academic
 */
export function AcademicAnalyticsSection({ academic = {} }) {
  const passRate = academic.passRatePercentage ?? 0;
  const avgScore = academic.averageGradePercentage ?? 0;
  const avgGpa = academic.averageGpa ?? 0;
  const resultsPublished = academic.totalResultsPublished || 0;
  const assignments = academic.totalAssignments || 0;
  const submissions = academic.totalSubmissions || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Award className="w-4 h-4 text-primary-600" />
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
          Academic Performance & LMS Engagement
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiMetricCard
          title="Examination Pass Rate"
          value={`${passRate}%`}
          subtitle={`Across ${resultsPublished} published results`}
          icon={CheckCircle}
          accent={passRate >= 80 ? 'success' : passRate >= 60 ? 'warning' : 'danger'}
          percentage={passRate}
        />

        <KpiMetricCard
          title="Average Score"
          value={`${avgScore}%`}
          subtitle="Mean academic exam score"
          icon={Award}
          accent="primary"
          percentage={avgScore}
        />

        <KpiMetricCard
          title="Average Institutional GPA"
          value={avgGpa}
          subtitle="Calculated grade point average"
          icon={BookOpen}
          accent="warning"
        />

        <KpiMetricCard
          title="LMS Assignments & Submissions"
          value={`${assignments} / ${submissions}`}
          subtitle="Active coursework and student turn-ins"
          icon={FileCheck}
          accent="neutral"
        />
      </div>
    </div>
  );
}

export default AcademicAnalyticsSection;

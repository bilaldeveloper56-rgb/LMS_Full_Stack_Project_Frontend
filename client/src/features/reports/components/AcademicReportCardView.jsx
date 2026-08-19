import React from 'react';
import { Award, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { Card, Badge } from '@/components/ui';

/**
 * AcademicReportCardView component.
 * @param {object} props
 * @param {object} props.reportData
 * @param {boolean} [props.isLoading=false]
 */
export function AcademicReportCardView({ reportData, isLoading = false }) {
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse" aria-busy="true">
        <div className="h-24 bg-surface-muted rounded-xl border border-border" />
        <div className="h-64 bg-surface-muted rounded-xl border border-border" />
      </div>
    );
  }

  if (!reportData || !reportData.student) {
    return (
      <div className="p-8 text-center text-xs text-text-muted bg-surface rounded-xl border border-border">
        Please select a student in the filters above to generate their academic report card.
      </div>
    );
  }

  const { student, performance, results = [] } = reportData;
  const isPassed = performance.overallStatus === 'PASSED';

  return (
    <div className="space-y-6">
      {/* Official Student Banner */}
      <Card className="p-6 border-2 border-primary-600 bg-surface shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary-700">
              Official Academic Transcript
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-text-primary mt-0.5">
              {student.name}
            </h2>
            <div className="flex items-center gap-3 text-xs text-text-muted mt-1 flex-wrap">
              <span>Admission #: <strong className="text-text-secondary font-mono">{student.admissionNumber}</strong></span>
              <span>Email: <strong className="text-text-secondary">{student.email || '—'}</strong></span>
              <span>Gender: <strong className="text-text-secondary">{student.gender || '—'}</strong></span>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1">
            <Badge
              variant={isPassed ? 'success' : performance.overallStatus === 'NO_RESULTS' ? 'neutral' : 'danger'}
              size="lg"
              className="text-sm px-3 py-1 font-black"
            >
              {performance.overallStatus}
            </Badge>
            <span className="text-xs font-bold text-text-primary">
              Overall: <span className="text-primary-700">{performance.cumulativePercentage}%</span>
            </span>
          </div>
        </div>

        {/* Aggregates Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div className="p-3 bg-surface-muted/60 rounded-xl border border-border">
            <span className="text-text-muted block text-[11px]">Total Exam Terms</span>
            <span className="text-lg font-black text-text-primary">{performance.totalExams}</span>
          </div>

          <div className="p-3 bg-surface-muted/60 rounded-xl border border-border">
            <span className="text-text-muted block text-[11px]">Marks Obtained</span>
            <span className="text-lg font-black text-success-700">
              {performance.totalMarksObtained} / {performance.totalMarksPossible}
            </span>
          </div>

          <div className="p-3 bg-surface-muted/60 rounded-xl border border-border">
            <span className="text-text-muted block text-[11px]">Cumulative Percentage</span>
            <span className="text-lg font-black text-primary-700">{performance.cumulativePercentage}%</span>
          </div>

          <div className="p-3 bg-surface-muted/60 rounded-xl border border-border">
            <span className="text-text-muted block text-[11px]">Academic Standing</span>
            <span className={`text-lg font-black ${isPassed ? 'text-success-700' : 'text-danger-700'}`}>
              {performance.overallStatus}
            </span>
          </div>
        </div>
      </Card>

      {/* Results Breakdown Table */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
          Examination Results Roster ({results.length})
        </h3>

        <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-muted/70 text-text-secondary border-b border-border font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Examination Term</th>
                <th className="p-3.5 text-center">Marks Obtained</th>
                <th className="p-3.5 text-center">Percentage</th>
                <th className="p-3.5 text-center">Grade</th>
                <th className="p-3.5 text-center">GPA</th>
                <th className="p-3.5 text-right">Result Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-text-muted">
                    No examination records found for this student.
                  </td>
                </tr>
              ) : (
                results.map((res, idx) => (
                  <tr key={res.resultId || idx} className="hover:bg-surface-muted/40 transition-colors">
                    <td className="p-3.5 font-bold text-text-primary">
                      {res.examName}
                    </td>
                    <td className="p-3.5 text-center font-bold text-text-primary">
                      {res.marksObtained} / {res.totalMarks}
                    </td>
                    <td className="p-3.5 text-center font-bold text-primary-700">
                      {res.percentage}%
                    </td>
                    <td className="p-3.5 text-center font-black text-sm">
                      {res.grade || '—'}
                    </td>
                    <td className="p-3.5 text-center font-semibold text-text-secondary">
                      {res.gpa ?? '—'}
                    </td>
                    <td className="p-3.5 text-right">
                      <Badge variant={res.isPassed ? 'success' : 'danger'} size="sm">
                        {res.isPassed ? 'Passed' : 'Failed'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AcademicReportCardView;

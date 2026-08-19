import React from 'react';
import { Award, Printer, CheckCircle, XCircle, BookOpen, Percent, TrendingUp } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';

/**
 * ReportCardView component.
 * @param {object} props
 * @param {object} props.reportCard
 */
export function ReportCardView({ reportCard }) {
  if (!reportCard) return null;

  const student = reportCard.student || {};
  const studentUser = student.userId || {};
  const studentName =
    student.firstName && student.lastName
      ? `${student.firstName} ${student.lastName}`
      : studentUser.name || 'Student';

  const cls = student.classId || {};
  const section = student.sectionId || {};
  const exam = reportCard.exam || {};
  const subjects = reportCard.subjects || reportCard.results || [];
  const summary = reportCard.summary || {};

  const isPassed = summary.overallResult === 'PASS' || summary.gpa >= 1.0;

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between no-print">
        <h2 className="text-base font-bold text-text-primary">Official Academic Report Card</h2>
        <Button
          variant="outline"
          size="sm"
          leftIcon={Printer}
          onClick={() => window.print()}
          className="text-xs"
        >
          Print Report Card
        </Button>
      </div>

      {/* Printable Sheet */}
      <Card className="p-8 space-y-6 border border-border bg-surface print:border-none print:shadow-none print:p-0">
        {/* Institution Header */}
        <div className="border-b-2 border-primary-600 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary-700">
              Student Assessment Performance
            </span>
            <h1 className="text-2xl font-black text-text-primary mt-0.5">
              Academic Report Card
            </h1>
            <p className="text-xs font-semibold text-text-secondary mt-0.5">
              {exam.name || 'Examination Term'}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <Badge variant={isPassed ? 'success' : 'danger'} size="lg" className="text-sm px-3 py-1">
              Result: {summary.overallResult || (isPassed ? 'PASSED' : 'NEEDS IMPROVEMENT')}
            </Badge>
          </div>
        </div>

        {/* Student Demographics Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-surface-muted/50 rounded-xl border border-border text-xs">
          <div>
            <span className="text-text-muted block text-[11px]">Student Name</span>
            <span className="font-bold text-text-primary text-sm">{studentName}</span>
          </div>

          <div>
            <span className="text-text-muted block text-[11px]">Roll / Admission No</span>
            <span className="font-semibold text-text-primary">
              {student.rollNumber || student.admissionNumber || '—'}
            </span>
          </div>

          <div>
            <span className="text-text-muted block text-[11px]">Class & Section</span>
            <span className="font-semibold text-text-primary">
              {cls.name || 'Class'} {section.name ? `(${section.name})` : ''}
            </span>
          </div>

          <div>
            <span className="text-text-muted block text-[11px]">Date Issued</span>
            <span className="font-semibold text-text-primary">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Subject Score Breakdown */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-muted/70 text-text-secondary border-b border-border font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Subject</th>
                <th className="p-3.5">Max Marks</th>
                <th className="p-3.5">Marks Obtained</th>
                <th className="p-3.5">Percentage (%)</th>
                <th className="p-3.5">Grade</th>
                <th className="p-3.5">Grade Points</th>
                <th className="p-3.5">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subjects.map((sub, idx) => {
                const subName = sub.subjectName || sub.subjectId?.name || `Subject ${idx + 1}`;
                const max = sub.maxMarks ?? sub.totalMarks ?? 100;
                const obt = sub.marksObtained ?? 0;
                const pct = sub.percentage ?? Math.round((obt / max) * 100 * 10) / 10;
                const grade = sub.grade || '—';
                const gp = sub.gradePoint ?? '—';

                return (
                  <tr key={idx} className="hover:bg-surface-muted/40">
                    <td className="p-3.5 font-bold text-text-primary">{subName}</td>
                    <td className="p-3.5 text-text-secondary">{max}</td>
                    <td className="p-3.5 font-bold text-text-primary">{obt}</td>
                    <td className="p-3.5 font-semibold text-text-primary">{pct}%</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded font-bold text-xs bg-primary-50 text-primary-800">
                        {grade}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-text-secondary">{gp}</td>
                    <td className="p-3.5 text-text-muted">{sub.remarks || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Overall Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-surface-muted/40 rounded-xl border border-border text-center">
            <span className="text-[11px] font-semibold text-text-muted block">Total Marks</span>
            <span className="text-lg font-black text-text-primary mt-0.5 block">
              {summary.totalMarksObtained ?? 0} / {summary.totalMaxMarks ?? 0}
            </span>
          </div>

          <div className="p-3.5 bg-surface-muted/40 rounded-xl border border-border text-center">
            <span className="text-[11px] font-semibold text-text-muted block">Percentage</span>
            <span className="text-lg font-black text-primary-700 mt-0.5 block">
              {summary.overallPercentage ?? 0}%
            </span>
          </div>

          <div className="p-3.5 bg-surface-muted/40 rounded-xl border border-border text-center">
            <span className="text-[11px] font-semibold text-text-muted block">GPA Equivalent</span>
            <span className="text-lg font-black text-text-primary mt-0.5 block">
              {summary.gpa !== undefined ? summary.gpa.toFixed(2) : '—'}
            </span>
          </div>

          <div className="p-3.5 bg-surface-muted/40 rounded-xl border border-border text-center">
            <span className="text-[11px] font-semibold text-text-muted block">Overall Grade</span>
            <span className="text-lg font-black text-amber-600 mt-0.5 block">
              {summary.overallGrade || '—'}
            </span>
          </div>
        </div>

        {/* Principal / Teacher Signatures */}
        <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="border-t border-text-muted/40 pt-2">
            <span className="font-semibold text-text-secondary">Class Teacher's Signature</span>
          </div>
          <div className="border-t border-text-muted/40 pt-2">
            <span className="font-semibold text-text-secondary">Principal / Head of Academics</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ReportCardView;

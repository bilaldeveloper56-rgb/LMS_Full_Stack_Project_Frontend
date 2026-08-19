import React, { useState, useEffect } from 'react';
import { Save, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button, Input, Badge } from '@/components/ui';
import { useBulkRecordMarks } from '../hooks/useResults';
import { useStudents } from '@/features/students';

/**
 * MarksEntryTable component.
 * @param {object} props
 * @param {string} props.examId
 * @param {object} props.examPaper
 * @param {string} props.classId
 * @param {string} props.sectionId
 * @param {Array} [props.existingResults=[]]
 * @param {boolean} [props.isLocked=false]
 */
export function MarksEntryTable({
  examId,
  examPaper,
  classId,
  sectionId,
  existingResults = [],
  isLocked = false,
}) {
  const { data: studentsData, isLoading: isLoadingStudents } = useStudents({
    classId,
    sectionId,
    limit: 100,
  });

  const students = studentsData?.students || studentsData || [];
  const bulkRecordMutation = useBulkRecordMarks();

  const totalMarks = examPaper?.totalMarks || 100;
  const passingMarks = examPaper?.passingMarks || 40;

  // Local state mapping: studentId -> { marksObtained, remarks }
  const [marksMap, setMarksMap] = useState({});

  useEffect(() => {
    const initial = {};
    existingResults.forEach((r) => {
      const sId = r.studentId?._id || r.studentId?.id || r.studentId;
      if (sId) {
        initial[sId] = {
          marksObtained: r.marksObtained ?? '',
          remarks: r.remarks || '',
        };
      }
    });
    setMarksMap(initial);
  }, [existingResults]);

  const handleMarkChange = (studentId, value) => {
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marksObtained: value,
      },
    }));
  };

  const handleRemarksChange = (studentId, value) => {
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks: value,
      },
    }));
  };

  const handleSaveAll = async () => {
    const records = Object.entries(marksMap)
      .filter(([_, data]) => data?.marksObtained !== '' && data?.marksObtained !== undefined)
      .map(([studentId, data]) => ({
        studentId,
        marksObtained: Number(data.marksObtained),
        remarks: data.remarks || '',
      }));

    if (records.length === 0) return;

    await bulkRecordMutation.mutateAsync({
      examId,
      examPaperId: examPaper?._id || examPaper?.id,
      records,
    });
  };

  if (isLoadingStudents) {
    return (
      <div className="p-8 space-y-3 animate-pulse" aria-busy="true">
        <div className="h-10 bg-surface-muted rounded-md" />
        <div className="h-10 bg-surface-muted rounded-md" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-text-muted bg-surface rounded-xl border border-border">
        No enrolled students found in this section.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Locked Alert Notice */}
      {isLocked && (
        <div className="p-3 bg-warning-50 border border-warning-200 text-warning-800 rounded-xl flex items-center gap-2.5 text-xs">
          <Lock className="w-4 h-4 text-warning-600 shrink-0" />
          <span>
            <strong>Marks Entry Locked:</strong> Results for this section have been locked by an administrator. Unlock the section to edit marks.
          </span>
        </div>
      )}

      {/* Roster Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-muted/60 text-text-secondary border-b border-border font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-3.5">Roll / ID</th>
              <th className="p-3.5">Student Name</th>
              <th className="p-3.5">Marks Obtained (Max: {totalMarks})</th>
              <th className="p-3.5">Percentage (%)</th>
              <th className="p-3.5">Status Preview</th>
              <th className="p-3.5">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((student) => {
              const sId = student._id || student.id;
              const name = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student';
              const roll = student.rollNumber || student.admissionNumber || '—';
              const entry = marksMap[sId] || { marksObtained: '', remarks: '' };

              const val = entry.marksObtained;
              const hasVal = val !== '' && val !== undefined;
              const numericVal = Number(val);
              const percentage = hasVal ? Math.round((numericVal / totalMarks) * 100 * 10) / 10 : null;
              const isPass = hasVal ? numericVal >= passingMarks : null;

              return (
                <tr key={sId} className="hover:bg-surface-muted/40 transition-colors">
                  {/* Roll Number */}
                  <td className="p-3.5 font-medium text-text-secondary">
                    {roll}
                  </td>

                  {/* Student Name */}
                  <td className="p-3.5 font-bold text-text-primary">
                    {name}
                  </td>

                  {/* Marks Input */}
                  <td className="p-3.5 w-44">
                    <Input
                      type="number"
                      min={0}
                      max={totalMarks}
                      step="any"
                      placeholder={`0 - ${totalMarks}`}
                      value={entry.marksObtained}
                      onChange={(e) => handleMarkChange(sId, e.target.value)}
                      disabled={isLocked || bulkRecordMutation.isPending}
                      className="text-xs py-1"
                    />
                  </td>

                  {/* Percentage */}
                  <td className="p-3.5 font-semibold text-text-primary">
                    {percentage !== null ? `${percentage}%` : '—'}
                  </td>

                  {/* Pass / Fail Preview */}
                  <td className="p-3.5">
                    {isPass !== null ? (
                      <Badge variant={isPass ? 'success' : 'danger'} size="sm">
                        {isPass ? 'Pass' : 'Fail'}
                      </Badge>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>

                  {/* Remarks */}
                  <td className="p-3.5 w-60">
                    <Input
                      placeholder="Optional remark..."
                      value={entry.remarks}
                      onChange={(e) => handleRemarksChange(sId, e.target.value)}
                      disabled={isLocked || bulkRecordMutation.isPending}
                      className="text-xs py-1"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Save Action */}
      {!isLocked && (
        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="primary"
            size="sm"
            leftIcon={Save}
            onClick={handleSaveAll}
            isLoading={bulkRecordMutation.isPending}
          >
            Save All Marks
          </Button>
        </div>
      )}
    </div>
  );
}

export default MarksEntryTable;

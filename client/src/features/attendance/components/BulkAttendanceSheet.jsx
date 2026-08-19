import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, AlertCircle, Save, CheckCheck } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Card,
  Input,
} from '@/components/ui';
import { useStudents } from '@/features/students';

const STATUS_BUTTONS = [
  { value: 'PRESENT', label: 'P', fullLabel: 'Present', activeClass: 'bg-success-600 text-white border-success-600' },
  { value: 'ABSENT', label: 'A', fullLabel: 'Absent', activeClass: 'bg-danger-600 text-white border-danger-600' },
  { value: 'LATE', label: 'L', fullLabel: 'Late', activeClass: 'bg-warning-500 text-white border-warning-500' },
  { value: 'EXCUSED', label: 'E', fullLabel: 'Excused', activeClass: 'bg-primary-600 text-white border-primary-600' },
  { value: 'HALF_DAY', label: 'HD', fullLabel: 'Half Day', activeClass: 'bg-blue-600 text-white border-blue-600' },
  { value: 'LEAVE', label: 'LV', fullLabel: 'Leave', activeClass: 'bg-neutral-600 text-white border-neutral-600' },
];

/**
 * BulkAttendanceSheet component for taking section roll call.
 *
 * @param {object} props
 * @param {string} props.academicSessionId
 * @param {string} props.classId
 * @param {string} props.sectionId
 * @param {string} props.date
 * @param {Array} [props.existingRecords]
 * @param {Function} props.onSubmit
 * @param {boolean} [props.isLoading=false]
 */
export function BulkAttendanceSheet({
  academicSessionId,
  classId,
  sectionId,
  date,
  existingRecords = [],
  onSubmit,
  isLoading = false,
}) {
  const { data: studentsData, isLoading: isLoadingStudents } = useStudents(
    sectionId ? { sectionId, limit: 100 } : { classId, limit: 100 }
  );

  const students = studentsData?.students || [];

  const [recordsMap, setRecordsMap] = useState({});

  // Initialize status map for students
  useEffect(() => {
    if (students.length > 0) {
      const initialMap = {};
      students.forEach((s) => {
        const studentId = s._id || s.id;
        const existing = existingRecords.find(
          (r) => (r.studentId?._id || r.studentId) === studentId
        );
        initialMap[studentId] = {
          status: existing ? existing.status : 'PRESENT',
          remarks: existing ? existing.remarks || '' : '',
        };
      });
      setRecordsMap(initialMap);
    }
  }, [students, existingRecords]);

  const handleStatusChange = (studentId, status) => {
    setRecordsMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setRecordsMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleMarkAll = (status) => {
    setRecordsMap((prev) => {
      const updated = { ...prev };
      students.forEach((s) => {
        const id = s._id || s.id;
        updated[id] = {
          ...updated[id],
          status,
        };
      });
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      academicSessionId,
      classId,
      sectionId,
      date,
      records: students.map((s) => {
        const id = s._id || s.id;
        return {
          studentId: id,
          status: recordsMap[id]?.status || 'PRESENT',
          remarks: recordsMap[id]?.remarks || undefined,
        };
      }),
    };
    await onSubmit(payload);
  };

  // Metrics summary for the current sheet
  const summary = students.reduce(
    (acc, s) => {
      const id = s._id || s.id;
      const status = recordsMap[id]?.status || 'PRESENT';
      if (status === 'PRESENT') acc.present += 1;
      else if (status === 'ABSENT') acc.absent += 1;
      else if (status === 'LATE') acc.late += 1;
      else acc.other += 1;
      return acc;
    },
    { present: 0, absent: 0, late: 0, other: 0 }
  );

  if (isLoadingStudents) {
    return (
      <Card className="p-8 text-center text-sm text-text-muted">
        Loading enrolled student roster for attendance sheet...
      </Card>
    );
  }

  if (students.length === 0) {
    return (
      <Card className="p-8 text-center text-sm text-text-muted">
        No students currently enrolled in the selected class and section.
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Control Bar & Bulk Shortcuts */}
      <div className="bg-surface border border-border rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-text-secondary mr-1">
            Quick Actions:
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleMarkAll('PRESENT')}
            className="text-success-700 hover:bg-success-50 text-xs"
          >
            Mark All Present ({students.length})
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleMarkAll('ABSENT')}
            className="text-danger-700 hover:bg-danger-50 text-xs"
          >
            Mark All Absent
          </Button>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="text-success-700">Present: {summary.present}</span>
          <span className="text-danger-700">Absent: {summary.absent}</span>
          <span className="text-warning-700">Late: {summary.late}</span>
          <span className="text-text-muted">Other: {summary.other}</span>
        </div>
      </div>

      {/* Roster Sheet Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Student Name & Admission</TableHead>
              <TableHead className="min-w-[280px]">Attendance Status</TableHead>
              <TableHead>Remarks / Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student, idx) => {
              const studentId = student._id || student.id;
              const currentStatus = recordsMap[studentId]?.status || 'PRESENT';
              const currentRemarks = recordsMap[studentId]?.remarks || '';

              return (
                <TableRow key={studentId} className="hover:bg-surface-muted/40">
                  {/* Row # */}
                  <TableCell className="text-xs text-text-muted font-mono">
                    {idx + 1}
                  </TableCell>

                  {/* Student */}
                  <TableCell>
                    <div className="font-medium text-text-primary text-sm">
                      {student.firstName} {student.lastName}
                    </div>
                    <div className="text-xs text-text-muted">
                      Adm #: {student.admissionNumber || '—'}
                    </div>
                  </TableCell>

                  {/* Status Toggle Buttons */}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {STATUS_BUTTONS.map((btn) => {
                        const isSelected = currentStatus === btn.value;
                        return (
                          <button
                            key={btn.value}
                            type="button"
                            onClick={() => handleStatusChange(studentId, btn.value)}
                            title={btn.fullLabel}
                            className={`h-8 px-2.5 rounded text-xs font-semibold transition-colors border ${
                              isSelected
                                ? btn.activeClass
                                : 'bg-surface hover:bg-surface-muted text-text-secondary border-border'
                            }`}
                          >
                            {btn.label}
                          </button>
                        );
                      })}
                    </div>
                  </TableCell>

                  {/* Remarks Input */}
                  <TableCell>
                    <Input
                      placeholder="Optional note..."
                      value={currentRemarks}
                      onChange={(e) => handleRemarksChange(studentId, e.target.value)}
                      className="h-8 text-xs max-w-xs"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          leftIcon={Save}
          isLoading={isLoading}
        >
          Save Daily Attendance Sheet
        </Button>
      </div>
    </form>
  );
}

export default BulkAttendanceSheet;

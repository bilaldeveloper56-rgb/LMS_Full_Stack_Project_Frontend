import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Card,
  Badge,
} from '@/components/ui';
import { StudentStatusBadge } from './StudentStatusBadge';
import { formatDate } from '@/lib/utils';

/**
 * Historical Session Enrollment Table Card.
 *
 * @param {object} props
 * @param {Array} props.enrollments - Array of historical enrollment records
 */
export function StudentEnrollmentCard({ enrollments = [] }) {
  if (enrollments.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-text-muted">
          No historical enrollment records found.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-base font-semibold text-text-primary">
          Enrollment History
        </h2>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Academic Session</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Roll #</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Enrolled Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((enr) => {
            const enrId = enr._id || enr.id;
            return (
              <TableRow key={enrId}>
                <TableCell className="font-medium text-text-primary">
                  {enr.academicSessionId?.name || '—'}{' '}
                  {enr.academicSessionId?.isCurrent && (
                    <Badge variant="primary" size="sm" className="ml-1.5">
                      Current
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-text-secondary">
                  {enr.classId?.name || enr.classId?.code || '—'}
                </TableCell>
                <TableCell className="text-text-secondary">
                  {enr.sectionId?.name || enr.sectionId?.code || '—'}
                </TableCell>
                <TableCell className="text-text-secondary">
                  {enr.rollNumber || '—'}
                </TableCell>
                <TableCell>
                  <StudentStatusBadge status={enr.enrollmentStatus} />
                </TableCell>
                <TableCell className="text-text-muted text-xs">
                  {enr.enrolledAt ? formatDate(enr.enrolledAt) : '—'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}

export default StudentEnrollmentCard;

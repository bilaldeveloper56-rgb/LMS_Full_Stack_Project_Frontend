import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, BookOpen, User, Award, ArrowRight } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { AssignmentStatusBadge } from './AssignmentStatusBadge';
import { formatDate } from '@/lib/utils';

/**
 * AssignmentCard component for grid/card layouts.
 *
 * @param {object} props
 * @param {object} props.assignment
 */
export function AssignmentCard({ assignment }) {
  const id = assignment._id || assignment.id;
  const subjectName = assignment.subjectId?.name || 'Subject';
  const className = assignment.classId?.name || '';
  const sectionName = assignment.sectionId?.name || '';
  const teacherName = assignment.teacherId
    ? `${assignment.teacherId.firstName || ''} ${assignment.teacherId.lastName || ''}`.trim()
    : 'Teacher';

  const isPastDue = new Date(assignment.dueDate) < new Date();

  return (
    <Card className="p-5 flex flex-col justify-between hover:border-primary-300 hover:shadow-xs transition-all space-y-4">
      <div className="space-y-3">
        {/* Header: Subject & Status */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full flex items-center gap-1 truncate">
            <BookOpen className="w-3 h-3 shrink-0" />
            <span className="truncate">{subjectName}</span>
          </span>
          <AssignmentStatusBadge status={assignment.status} />
        </div>

        {/* Title */}
        <div>
          <Link
            to={`/assignments/${id}`}
            className="font-bold text-text-primary text-base hover:text-primary-600 transition-colors line-clamp-1"
          >
            {assignment.title}
          </Link>
          <p className="text-xs text-text-muted mt-1 line-clamp-2">
            {assignment.description}
          </p>
        </div>

        {/* Class & Teacher Details */}
        <div className="text-xs text-text-secondary space-y-1 pt-1 border-t border-border/60">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-text-primary">Class:</span> {className} {sectionName ? `(${sectionName})` : ''}
          </div>
          <div className="flex items-center gap-1.5 text-text-muted">
            <User className="w-3 h-3" /> {teacherName}
          </div>
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
        <div className="space-y-0.5 text-xs">
          <div className={`flex items-center gap-1 font-medium ${isPastDue ? 'text-danger-600' : 'text-text-secondary'}`}>
            <Clock className="w-3.5 h-3.5" />
            <span>Due {formatDate(assignment.dueDate)}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-text-muted">
            <Award className="w-3 h-3" /> {assignment.maxScore} Max Points
          </div>
        </div>

        <Link to={`/assignments/${id}`}>
          <Button variant="outline" size="sm" rightIcon={ArrowRight} className="text-xs">
            Details
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export default AssignmentCard;

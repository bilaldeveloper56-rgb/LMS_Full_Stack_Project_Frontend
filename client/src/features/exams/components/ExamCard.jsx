import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, ArrowRight, Globe } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { ExamStatusBadge } from './ExamStatusBadge';
import { ExamTypeBadge } from './ExamTypeBadge';
import { formatDate } from '@/lib/utils';

/**
 * ExamCard component.
 * @param {object} props
 * @param {object} props.exam
 */
export function ExamCard({ exam }) {
  const id = exam._id || exam.id;
  const session = exam.academicSessionId || {};
  const papersCount = exam.papers?.length ?? (exam.totalPapers || 0);

  return (
    <Card className="p-4 flex flex-col justify-between hover:shadow-md transition-shadow border border-border">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <ExamTypeBadge type={exam.examType} />
            <ExamStatusBadge status={exam.status} isPublished={exam.isPublished} />
          </div>
          {session.name && (
            <span className="text-[11px] font-semibold text-text-muted bg-surface-muted px-2 py-0.5 rounded-md">
              {session.name}
            </span>
          )}
        </div>

        <Link
          to={`/exams/${id}`}
          className="text-sm font-bold text-text-primary hover:text-primary-600 transition-colors mt-2.5 block"
        >
          {exam.name}
        </Link>

        {exam.description && (
          <p className="text-xs text-text-secondary line-clamp-2 mt-1">
            {exam.description}
          </p>
        )}

        <div className="mt-3.5 space-y-1.5 text-xs text-text-muted border-t border-border/60 pt-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-primary-600 shrink-0" />
            <span>
              {formatDate(exam.startDate)} - {formatDate(exam.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{papersCount} Scheduled Papers</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-[11px] text-text-muted">
          {exam.isPublished ? 'Published Schedule' : 'Draft Schedule'}
        </span>
        <Link to={`/exams/${id}`}>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7 px-2.5"
            rightIcon={ArrowRight}
          >
            Details
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export default ExamCard;

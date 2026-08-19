import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, User, Award, ArrowRight, Play, CheckCircle } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { QuizStatusBadge } from './QuizStatusBadge';
import { formatDate } from '@/lib/utils';
import { useAuthorization } from '@/hooks/useAuthorization';
import { ROLES } from '@/constants';

/**
 * QuizCard component for rendering quiz overviews in responsive grids.
 *
 * @param {object} props
 * @param {object} props.quiz
 */
export function QuizCard({ quiz }) {
  const { user } = useAuthorization();
  const isStudent = user?.role === ROLES.STUDENT;

  const id = quiz._id || quiz.id;
  const subjectName = quiz.subjectId?.name || 'Subject';
  const className = quiz.classId?.name || '';
  const sectionName = quiz.sectionId?.name || '';
  const teacherName = quiz.teacherId
    ? `${quiz.teacherId.firstName || ''} ${quiz.teacherId.lastName || ''}`.trim()
    : 'Faculty';

  const questionsCount = quiz.questions?.length || 0;
  const isPublished = quiz.status === 'PUBLISHED';

  return (
    <Card className="p-5 flex flex-col justify-between hover:border-primary-300 hover:shadow-xs transition-all space-y-4">
      <div className="space-y-3">
        {/* Header: Subject & Status */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full flex items-center gap-1 truncate">
            <BookOpen className="w-3 h-3 shrink-0" />
            <span className="truncate">{subjectName}</span>
          </span>
          <QuizStatusBadge status={quiz.status} />
        </div>

        {/* Title */}
        <div>
          <Link
            to={`/quizzes/${id}`}
            className="font-bold text-text-primary text-base hover:text-primary-600 transition-colors line-clamp-1"
          >
            {quiz.title}
          </Link>
          {quiz.instructions && (
            <p className="text-xs text-text-muted mt-1 line-clamp-2">
              {quiz.instructions}
            </p>
          )}
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
          <div className="flex items-center gap-1 font-medium text-text-secondary">
            <Clock className="w-3.5 h-3.5 text-primary-600" />
            <span>{quiz.durationMinutes} mins • {questionsCount} Qs</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-text-muted">
            <Award className="w-3 h-3" /> {quiz.totalMarks} Marks (Pass: {quiz.passingMarks})
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isStudent && isPublished ? (
            <Link to={`/quizzes/${id}/take`}>
              <Button variant="primary" size="sm" leftIcon={Play} className="text-xs">
                Take Quiz
              </Button>
            </Link>
          ) : (
            <Link to={`/quizzes/${id}`}>
              <Button variant="outline" size="sm" rightIcon={ArrowRight} className="text-xs">
                Details
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}

export default QuizCard;

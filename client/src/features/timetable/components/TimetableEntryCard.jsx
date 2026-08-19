import React from 'react';
import { Edit2, Trash2, MapPin, Clock, User, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

/**
 * TimetableEntryCard for displaying a single slot entry in the schedule matrix.
 *
 * @param {object} props
 * @param {object} props.slot
 * @param {Function} [props.onEdit]
 * @param {Function} [props.onDelete]
 * @param {'section'|'teacher'} [props.viewMode='section']
 */
export function TimetableEntryCard({
  slot,
  onEdit,
  onDelete,
  viewMode = 'section',
}) {
  const { hasPermission } = useAuthorization();
  const canUpdate = hasPermission(PERMISSIONS.TIMETABLE_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.TIMETABLE_DELETE);

  const subjectName = slot.subjectId?.name || slot.subjectId?.code || 'Subject';
  const teacherName = slot.teacherId?.user
    ? `${slot.teacherId.user.firstName || ''} ${slot.teacherId.user.lastName || ''}`.trim()
    : slot.teacherId
    ? `${slot.teacherId.firstName || ''} ${slot.teacherId.lastName || ''}`.trim()
    : 'Teacher';
  const sectionName = slot.sectionId?.name || slot.sectionId?.code || '';
  const className = slot.classId?.name || '';

  return (
    <div className="group relative bg-surface border border-primary-100/80 rounded-md p-2.5 shadow-2xs hover:shadow-xs hover:border-primary-300 transition-all text-xs flex flex-col justify-between min-h-[96px]">
      {/* Subject */}
      <div>
        <div className="flex items-start justify-between gap-1">
          <div className="font-semibold text-primary-900 text-xs flex items-center gap-1 truncate">
            <BookOpen className="w-3.5 h-3.5 text-primary-600 shrink-0" />
            <span className="truncate">{subjectName}</span>
          </div>

          {/* Action buttons on hover */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {canUpdate && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-text-muted hover:text-primary-600"
                onClick={() => onEdit(slot)}
                aria-label={`Edit ${subjectName} period`}
              >
                <Edit2 className="w-3 h-3" />
              </Button>
            )}
            {canDelete && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-text-muted hover:text-danger-600"
                onClick={() => onDelete(slot._id || slot.id)}
                aria-label={`Delete ${subjectName} period`}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Secondary Info: Teacher or Section */}
        <div className="mt-1 text-[11px] text-text-secondary flex items-center gap-1 truncate">
          {viewMode === 'section' ? (
            <>
              <User className="w-3 h-3 text-text-muted shrink-0" />
              <span className="truncate">{teacherName}</span>
            </>
          ) : (
            <>
              <span className="font-medium text-text-primary">
                {className} {sectionName ? `(${sectionName})` : ''}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Footer: Time & Room */}
      <div className="mt-2 pt-1.5 border-t border-border/50 flex items-center justify-between text-[10px] text-text-muted">
        <span className="flex items-center gap-0.5 font-mono">
          <Clock className="w-2.5 h-2.5 text-text-muted" />
          {slot.startTime} - {slot.endTime}
        </span>
        {slot.room && (
          <span className="flex items-center gap-0.5 bg-surface-muted px-1 rounded text-text-secondary">
            <MapPin className="w-2.5 h-2.5" />
            {slot.room}
          </span>
        )}
      </div>
    </div>
  );
}

export default TimetableEntryCard;

import React from 'react';
import {
  Mail,
  Phone,
  Calendar,
  Award,
  BookOpen,
  Briefcase,
  UserCheck,
} from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { TeacherAvatar } from './TeacherAvatar';
import { TeacherStatusBadge } from './TeacherStatusBadge';
import { formatDate } from '@/lib/utils';

/**
 * TeacherProfileCard component for rendering comprehensive teacher profile details.
 *
 * @param {object} props
 * @param {object} props.teacher - Teacher record
 */
export function TeacherProfileCard({ teacher }) {
  if (!teacher) return null;

  const fullName = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || 'Teacher';

  return (
    <div className="space-y-6">
      {/* Header Profile Summary */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <TeacherAvatar
            src={teacher.profileImage}
            firstName={teacher.firstName}
            lastName={teacher.lastName}
            size="xl"
          />

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold text-text-primary">
                {fullName}
              </h1>
              <TeacherStatusBadge status={teacher.employmentStatus} size="md" />
              {teacher.gender && (
                <Badge variant="neutral" size="sm" className="capitalize">
                  {teacher.gender.toLowerCase()}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
              <div>
                <span className="font-semibold text-text-primary">Employee ID:</span>{' '}
                {teacher.employeeId}
              </div>
              <div>
                <span className="font-semibold text-text-primary">Designation:</span>{' '}
                {teacher.designation || 'Teacher'}
              </div>
              {teacher.specialization && (
                <div>
                  <span className="font-semibold text-text-primary">Department:</span>{' '}
                  {teacher.specialization}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card className="p-5 space-y-3">
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider border-b border-border pb-2">
            Contact Details
          </h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-muted flex items-center gap-2">
                <Mail className="w-4 h-4 text-text-muted" /> Email
              </span>
              <span className="font-medium text-text-primary truncate max-w-[200px]">
                {teacher.email}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted flex items-center gap-2">
                <Phone className="w-4 h-4 text-text-muted" /> Phone
              </span>
              <span className="font-medium text-text-primary">
                {teacher.phone || '—'}
              </span>
            </div>
          </div>
        </Card>

        {/* Academic & Professional Credentials */}
        <Card className="p-5 space-y-3">
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider border-b border-border pb-2">
            Professional Profile
          </h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-muted flex items-center gap-2">
                <Award className="w-4 h-4 text-text-muted" /> Qualification
              </span>
              <span className="font-medium text-text-primary">
                {teacher.qualification || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-text-muted" /> Specialization
              </span>
              <span className="font-medium text-text-primary">
                {teacher.specialization || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted flex items-center gap-2">
                <Calendar className="w-4 h-4 text-text-muted" /> Joining Date
              </span>
              <span className="font-medium text-text-primary">
                {teacher.joiningDate ? formatDate(teacher.joiningDate) : '—'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default TeacherProfileCard;

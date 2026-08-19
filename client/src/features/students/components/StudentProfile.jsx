import React from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  AlertCircle,
  Users,
  Shield,
} from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { StudentAvatar } from './StudentAvatar';
import { StudentStatusBadge } from './StudentStatusBadge';
import { formatDate } from '@/lib/utils';

/**
 * StudentProfile details card component.
 *
 * @param {object} props
 * @param {object} props.student - Comprehensive student profile data
 */
export function StudentProfile({ student }) {
  if (!student) return null;

  const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student';
  const className = student.classId?.name || student.classId?.code || '—';
  const sectionName = student.sectionId?.name || student.sectionId?.code || '';
  const sessionName = student.academicSessionId?.name || '—';
  const parents = student.parents || [];

  return (
    <div className="space-y-6">
      {/* 1. Header Summary Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <StudentAvatar
            src={student.profileImage}
            firstName={student.firstName}
            lastName={student.lastName}
            size="xl"
          />

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold text-text-primary">
                {fullName}
              </h1>
              <StudentStatusBadge status={student.enrollmentStatus} size="md" />
              {student.gender && (
                <Badge variant="neutral" size="sm" className="capitalize">
                  {student.gender.toLowerCase()}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
              <div>
                <span className="font-semibold text-text-primary">Admission #:</span>{' '}
                {student.admissionNumber}
              </div>
              <div>
                <span className="font-semibold text-text-primary">Class:</span>{' '}
                {className} {sectionName ? `(${sectionName})` : ''}
              </div>
              {student.rollNumber && (
                <div>
                  <span className="font-semibold text-text-primary">Roll #:</span>{' '}
                  {student.rollNumber}
                </div>
              )}
              <div>
                <span className="font-semibold text-text-primary">Session:</span>{' '}
                {sessionName}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Personal & Contact Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details Card */}
        <Card className="p-5 space-y-3">
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider border-b border-border pb-2">
            Personal Details
          </h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-muted flex items-center gap-2">
                <Calendar className="w-4 h-4 text-text-muted" /> Date of Birth
              </span>
              <span className="font-medium text-text-primary">
                {student.dateOfBirth ? formatDate(student.dateOfBirth) : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted flex items-center gap-2">
                <Heart className="w-4 h-4 text-text-muted" /> Blood Group
              </span>
              <span className="font-medium text-text-primary">
                {student.bloodGroup || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted flex items-center gap-2">
                <Calendar className="w-4 h-4 text-text-muted" /> Admission Date
              </span>
              <span className="font-medium text-text-primary">
                {student.admissionDate ? formatDate(student.admissionDate) : '—'}
              </span>
            </div>
          </div>
        </Card>

        {/* Contact Details Card */}
        <Card className="p-5 space-y-3">
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider border-b border-border pb-2">
            Contact & Address
          </h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-muted flex items-center gap-2">
                <Mail className="w-4 h-4 text-text-muted" /> Email
              </span>
              <span className="font-medium text-text-primary truncate max-w-[200px]">
                {student.email || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted flex items-center gap-2">
                <Phone className="w-4 h-4 text-text-muted" /> Phone
              </span>
              <span className="font-medium text-text-primary">
                {student.phone || '—'}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-text-muted flex items-center gap-2">
                <MapPin className="w-4 h-4 text-text-muted mt-0.5" /> Address
              </span>
              <span className="font-medium text-text-primary text-right max-w-[220px]">
                {[student.address, student.city].filter(Boolean).join(', ') || '—'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Emergency Contact Details */}
      {(student.emergencyContactName || student.emergencyContactPhone) && (
        <Card className="p-5 space-y-3">
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-danger-500" /> Emergency Contact
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-text-muted text-xs block">Contact Person</span>
              <span className="font-medium text-text-primary">
                {student.emergencyContactName || '—'}
              </span>
            </div>
            <div>
              <span className="text-text-muted text-xs block">Phone Number</span>
              <span className="font-medium text-text-primary">
                {student.emergencyContactPhone || '—'}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* 4. Linked Parents / Guardians */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary-600" /> Linked Parents / Guardians ({parents.length})
        </h2>

        {parents.length === 0 ? (
          <p className="text-xs text-text-muted">
            No parent or guardian records have been linked to this student yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {parents.map((pLink, idx) => {
              const parent = pLink.parent;
              if (!parent) return null;
              const parentName = `${parent.firstName || ''} ${parent.lastName || ''}`.trim() || 'Parent';

              return (
                <div
                  key={idx}
                  className="bg-surface-muted/50 border border-border rounded-lg p-4 space-y-2 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-text-primary">
                      {parentName}
                    </span>
                    <Badge variant={pLink.isPrimary ? 'primary' : 'neutral'} size="sm">
                      {pLink.relationshipType || parent.relationship || 'Guardian'}
                    </Badge>
                  </div>
                  {parent.email && (
                    <div className="text-xs text-text-muted flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> {parent.email}
                    </div>
                  )}
                  {parent.phone && (
                    <div className="text-xs text-text-muted flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> {parent.phone}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

export default StudentProfile;

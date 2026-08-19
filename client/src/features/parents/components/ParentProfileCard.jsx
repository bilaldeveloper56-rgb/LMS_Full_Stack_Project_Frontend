import React from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  UserCheck,
  Shield,
} from 'lucide-react';
import { Card, Badge } from '@/components/ui';

/**
 * ParentProfileCard component for displaying parent contact and occupation details.
 *
 * @param {object} props
 * @param {object} props.parent - Parent record
 */
export function ParentProfileCard({ parent }) {
  if (!parent) return null;

  const fullName = `${parent.firstName || ''} ${parent.lastName || ''}`.trim() || 'Parent';

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-primary-50 text-primary-600 font-bold text-2xl flex items-center justify-center border border-primary-200 shrink-0">
            <UserCheck className="w-10 h-10" />
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold text-text-primary">
                {fullName}
              </h1>
              {parent.relationship && (
                <Badge variant="primary" size="md">
                  {parent.relationship}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
              <div>
                <span className="font-semibold text-text-primary">Email:</span>{' '}
                {parent.email}
              </div>
              <div>
                <span className="font-semibold text-text-primary">Phone:</span>{' '}
                {parent.phone}
              </div>
              {parent.occupation && (
                <div>
                  <span className="font-semibold text-text-primary">Occupation:</span>{' '}
                  {parent.occupation}
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
            Contact & Phones
          </h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-muted flex items-center gap-2">
                <Mail className="w-4 h-4 text-text-muted" /> Email Address
              </span>
              <span className="font-medium text-text-primary truncate max-w-[200px]">
                {parent.email}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted flex items-center gap-2">
                <Phone className="w-4 h-4 text-text-muted" /> Primary Phone
              </span>
              <span className="font-medium text-text-primary">
                {parent.phone}
              </span>
            </div>
            {parent.alternatePhone && (
              <div className="flex items-center justify-between">
                <span className="text-text-muted flex items-center gap-2">
                  <Phone className="w-4 h-4 text-text-muted" /> Alternate Phone
                </span>
                <span className="font-medium text-text-primary">
                  {parent.alternatePhone}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Address & Occupation */}
        <Card className="p-5 space-y-3">
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider border-b border-border pb-2">
            Address & Employment
          </h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-muted flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-text-muted" /> Occupation
              </span>
              <span className="font-medium text-text-primary">
                {parent.occupation || '—'}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-text-muted flex items-center gap-2">
                <MapPin className="w-4 h-4 text-text-muted mt-0.5" /> Address
              </span>
              <span className="font-medium text-text-primary text-right max-w-[220px]">
                {parent.address || '—'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ParentProfileCard;

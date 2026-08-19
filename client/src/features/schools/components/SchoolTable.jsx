import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit3, ShieldAlert, Mail, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui';
import { SchoolStatusBadge } from './SchoolStatusBadge';
import { formatDate } from '@/lib/utils';

/**
 * SchoolTable component.
 * @param {object} props
 * @param {Array} props.schools
 * @param {Function} props.onChangeStatus
 * @param {Function} props.onResendInvite
 * @param {boolean} [props.isLoading=false]
 */
export function SchoolTable({
  schools = [],
  onChangeStatus,
  onResendInvite,
  isLoading = false,
}) {
  if (isLoading) {
    return (
      <div className="p-8 space-y-3 animate-pulse" aria-busy="true">
        <div className="h-12 bg-surface-muted rounded-lg" />
        <div className="h-12 bg-surface-muted rounded-lg" />
        <div className="h-12 bg-surface-muted rounded-lg" />
      </div>
    );
  }

  if (schools.length === 0) {
    return (
      <div className="p-12 text-center text-xs text-text-muted bg-surface rounded-xl border border-border">
        No schools found matching your search and filter criteria.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-2xs">
      <table className="w-full text-left text-xs">
        <thead className="bg-surface-muted/70 text-text-secondary border-b border-border font-semibold uppercase tracking-wider">
          <tr>
            <th className="p-3.5">Code</th>
            <th className="p-3.5">School Name</th>
            <th className="p-3.5">Contact Details</th>
            <th className="p-3.5">Location</th>
            <th className="p-3.5">Status</th>
            <th className="p-3.5">Provisioned</th>
            <th className="p-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {schools.map((school) => {
            const id = school._id || school.id;
            const location = [school.city, school.province, school.country].filter(Boolean).join(', ') || '—';

            return (
              <tr key={id} className="hover:bg-surface-muted/40 transition-colors">
                {/* Code */}
                <td className="p-3.5 font-mono font-bold text-primary-700">
                  {school.schoolCode}
                </td>

                {/* Name & Website */}
                <td className="p-3.5 font-bold text-text-primary">
                  <Link to={`/schools/${id}`} className="hover:text-primary-600 transition-colors">
                    {school.name}
                  </Link>
                  {school.website && (
                    <a
                      href={school.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] text-text-muted font-normal hover:text-primary-600 mt-0.5"
                    >
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </td>

                {/* Contact */}
                <td className="p-3.5 text-text-secondary">
                  <div>{school.email}</div>
                  {school.phone && <div className="text-[11px] text-text-muted">{school.phone}</div>}
                </td>

                {/* Location */}
                <td className="p-3.5 text-text-secondary">
                  {location}
                </td>

                {/* Status */}
                <td className="p-3.5">
                  <SchoolStatusBadge status={school.status} />
                </td>

                {/* Created */}
                <td className="p-3.5 text-text-secondary">
                  {formatDate(school.createdAt)}
                </td>

                {/* Actions */}
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link to={`/schools/${id}`} title="View School Details" aria-label="View School Details">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="w-4 h-4 text-text-secondary hover:text-primary-600" />
                      </Button>
                    </Link>

                    <Link to={`/schools/${id}/edit`} title="Edit School Profile" aria-label="Edit School Profile">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit3 className="w-4 h-4 text-text-secondary hover:text-primary-600" />
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700"
                      title="Change School Status"
                      aria-label="Change School Status"
                      onClick={() => onChangeStatus(school)}
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-primary-600 hover:text-primary-700"
                      title="Resend Admin Invitation"
                      aria-label="Resend Admin Invitation"
                      onClick={() => onResendInvite(id)}
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default SchoolTable;

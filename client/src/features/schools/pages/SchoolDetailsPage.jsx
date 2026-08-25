import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Clock,
  DollarSign,
  Edit3,
  ShieldAlert,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Breadcrumb, Button, Card, Modal } from '@/components/ui';
import { ErrorState } from '@/components/feedback';
import { SchoolStatusBadge } from '../components/SchoolStatusBadge';
import { ChangeStatusModal } from '../components/ChangeStatusModal';
import {
  useSchool,
  useChangeSchoolStatus,
  useResendAdminInvitation,
  useDeleteSchool,
} from '../hooks/useSchools';
import { formatDate, formatDateTime } from '@/lib/utils';

export function SchoolDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: school, isLoading, isError, error, refetch } = useSchool(id);
  const changeStatusMutation = useChangeSchoolStatus();
  const resendInviteMutation = useResendAdminInvitation();
  const deleteMutation = useDeleteSchool();

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl animate-pulse" aria-busy="true">
        <div className="h-6 w-48 bg-surface-muted rounded-md" />
        <div className="h-44 bg-surface-muted rounded-xl border border-border" />
        <div className="h-64 bg-surface-muted rounded-xl border border-border" />
      </div>
    );
  }

  if (isError || !school) {
    return (
      <ErrorState
        title="Failed to load school"
        message={error?.message || 'The requested school profile could not be found.'}
        onRetry={refetch}
      />
    );
  }

  const handleConfirmStatusChange = async ({ status, reason }) => {
    await changeStatusMutation.mutateAsync({
      id,
      payload: { status, reason },
    });
    setIsStatusModalOpen(false);
  };

  const handleResendInvite = async () => {
    await resendInviteMutation.mutateAsync(id);
  };

  const handleConfirmDelete = async () => {
    await deleteMutation.mutateAsync(id);
    navigate('/schools');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Tenant Schools', href: '/schools' },
          { label: school.name || 'School Details' },
        ]}
      />

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <Link to="/schools">
          <Button variant="ghost" size="sm" leftIcon={ArrowLeft}>
            Back to Schools Directory
          </Button>
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            leftIcon={Mail}
            onClick={handleResendInvite}
            isLoading={resendInviteMutation.isPending}
            className="text-xs"
          >
            Resend Admin Invitation
          </Button>

          <Button
            variant="outline"
            size="sm"
            leftIcon={ShieldAlert}
            onClick={() => setIsStatusModalOpen(true)}
            className="text-xs text-amber-700 hover:text-amber-800"
          >
            Change Status
          </Button>

          <Link to={`/schools/${id}/edit`}>
            <Button variant="primary" size="sm" leftIcon={Edit3} className="text-xs">
              Edit Profile
            </Button>
          </Link>

          <Button
            variant="danger"
            size="sm"
            leftIcon={Trash2}
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-xs"
          >
            Delete School
          </Button>
        </div>
      </div>

      {/* Main School Overview Banner */}
      <Card className="p-6 border border-border bg-surface shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                {school.name}
              </h1>
              <SchoolStatusBadge status={school.status} />
            </div>
            <p className="font-mono text-xs text-primary-700 font-bold">
              Tenant ID / Code: {school.schoolCode}
            </p>
          </div>

          <div className="text-xs text-text-muted">
            <span>Onboarded: <strong>{formatDate(school.createdAt)}</strong></span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Contact Details */}
          <div className="p-4 rounded-xl bg-surface-muted/50 border border-border space-y-2.5">
            <span className="font-bold text-text-primary uppercase tracking-wider text-[11px] block">
              Contact & Location
            </span>
            <div className="flex items-center gap-2 text-text-secondary">
              <Mail className="w-3.5 h-3.5 text-primary-600 shrink-0" />
              <span>{school.email}</span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <Phone className="w-3.5 h-3.5 text-primary-600 shrink-0" />
              <span>{school.phone || 'No phone provided'}</span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <MapPin className="w-3.5 h-3.5 text-primary-600 shrink-0" />
              <span>
                {[school.address, school.city, school.province, school.country].filter(Boolean).join(', ') || 'No address provided'}
              </span>
            </div>
            {school.website && (
              <div className="flex items-center gap-2 text-text-secondary">
                <Globe className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                <a href={school.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 underline">
                  {school.website}
                </a>
              </div>
            )}
          </div>

          {/* Localization & Settings */}
          <div className="p-4 rounded-xl bg-surface-muted/50 border border-border space-y-2.5">
            <span className="font-bold text-text-primary uppercase tracking-wider text-[11px] block">
              Localization & System Config
            </span>
            <div className="flex items-center gap-2 text-text-secondary">
              <Clock className="w-3.5 h-3.5 text-primary-600 shrink-0" />
              <span>Timezone: <strong>{school.timezone || 'UTC'}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <DollarSign className="w-3.5 h-3.5 text-primary-600 shrink-0" />
              <span>Default Currency: <strong>{school.currency || 'USD'}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <Globe className="w-3.5 h-3.5 text-primary-600 shrink-0" />
              <span>System Language: <strong>{school.language || 'en'}</strong></span>
            </div>
            {school.registrationNumber && (
              <div className="flex items-center gap-2 text-text-secondary">
                <Building2 className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                <span>Reg #: <strong>{school.registrationNumber}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Timestamps */}
        <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-text-muted flex-wrap gap-2">
          <span>Created: {formatDateTime(school.createdAt)}</span>
          <span>Last Updated: {formatDateTime(school.updatedAt)}</span>
        </div>
      </Card>

      {/* Change Status Modal */}
      <ChangeStatusModal
        school={school}
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={handleConfirmStatusChange}
        isLoading={changeStatusMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm School Deletion"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-danger-50 text-danger-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-text-primary font-medium">
                Are you sure you want to delete school{' '}
                <span className="font-bold text-danger-700">
                  "{school?.name}"
                </span>{' '}
                ({school?.schoolCode})?
              </p>
              <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
                This will soft-delete the school and deactivate all associated school user accounts. This action is restricted to Super Administrators.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              isLoading={deleteMutation.isPending}
            >
              Delete School
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default SchoolDetailsPage;

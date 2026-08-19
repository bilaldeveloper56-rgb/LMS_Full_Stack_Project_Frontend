import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit, Trash2, ArrowLeft, AlertTriangle } from 'lucide-react';
import {
  Breadcrumb,
  Button,
  Modal,
  Card,
  Skeleton,
} from '@/components/ui';
import { ErrorState } from '@/components/feedback';
import { ParentProfileCard } from '../components/ParentProfileCard';
import { ParentChildrenList } from '../components/ParentChildrenList';
import { LinkChildModal } from '../components/LinkChildModal';
import {
  useParent,
  useParentChildren,
  useDeleteParent,
  useLinkChild,
  useUnlinkChild,
} from '../hooks/useParents';
import { useAuthorization } from '@/hooks/useAuthorization';
import { PERMISSIONS } from '@/constants';

export function ParentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuthorization();

  const canUpdate = hasPermission(PERMISSIONS.PARENTS_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.PARENTS_DELETE);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  const {
    data: parent,
    isLoading: isLoadingParent,
    isError: isErrorParent,
    error: parentError,
    refetch: refetchParent,
  } = useParent(id);

  const {
    data: children,
    isLoading: isLoadingChildren,
  } = useParentChildren(id);

  const deleteMutation = useDeleteParent();
  const linkChildMutation = useLinkChild(id);
  const unlinkChildMutation = useUnlinkChild(id);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      navigate('/parents');
    } catch (err) {
      // Toast handled by hook
    }
  };

  const handleLinkChild = async (formData) => {
    await linkChildMutation.mutateAsync(formData);
  };

  const handleUnlinkChild = async (linkId) => {
    await unlinkChildMutation.mutateAsync(linkId);
  };

  const fullName = parent
    ? `${parent.firstName || ''} ${parent.lastName || ''}`.trim() || 'Parent'
    : 'Parent Profile';

  if (isLoadingParent) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto animate-pulse" aria-busy="true" aria-label="Loading parent details">
        <Skeleton className="h-4 w-48" />
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton variant="circular" className="h-20 w-20" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (isErrorParent) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Parents', href: '/parents' },
            { label: 'Parent Details' },
          ]}
        />
        <ErrorState
          title="Parent Record Not Found"
          message={parentError?.message || 'Could not retrieve parent details from the server.'}
          onRetry={refetchParent}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Parents', href: '/parents' },
          { label: fullName },
        ]}
      />

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/parents')}
            leftIcon={ArrowLeft}
            className="cursor-pointer"
          >
            Back to Directory
          </Button>
        </div>

        <div className="flex items-center gap-2.5">
          {canUpdate && (
            <Link to={`/parents/${id}/edit`}>
              <Button variant="outline" size="sm" leftIcon={Edit}>
                Edit Details
              </Button>
            </Link>
          )}

          {canDelete && (
            <Button
              variant="danger"
              size="sm"
              leftIcon={Trash2}
              onClick={() => setShowDeleteModal(true)}
            >
              Deactivate
            </Button>
          )}
        </div>
      </div>

      {/* Parent Profile Card */}
      <ParentProfileCard parent={parent} />

      {/* Linked Children List */}
      <ParentChildrenList
        childrenList={children || []}
        onLinkClick={() => setShowLinkModal(true)}
        onUnlink={handleUnlinkChild}
        isUnlinking={unlinkChildMutation.isPending}
      />

      {/* Link Child Modal */}
      <LinkChildModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onLink={handleLinkChild}
        isLoading={linkChildMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Parent Record Removal"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-danger-50 text-danger-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-text-primary font-medium">
                Are you sure you want to deactivate <span className="font-bold">{fullName}</span>?
              </p>
              <p className="text-xs text-text-muted mt-1">
                The parent profile will be archived and unlinked from active student communications.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
            >
              Confirm Removal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ParentDetailsPage;

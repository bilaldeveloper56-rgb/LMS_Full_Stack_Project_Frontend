import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, Card, Skeleton } from '@/components/ui';
import { ErrorState } from '@/components/feedback';
import { ParentForm } from '../components/ParentForm';
import { useParent, useUpdateParent } from '../hooks/useParents';

export function EditParentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: parent, isLoading, isError, error, refetch } = useParent(id);
  const updateMutation = useUpdateParent(id);

  const handleSubmit = async (formData) => {
    try {
      await updateMutation.mutateAsync(formData);
      navigate(`/parents/${id}`);
    } catch (err) {
      // Toast handled by hook
    }
  };

  const fullName = parent
    ? `${parent.firstName || ''} ${parent.lastName || ''}`.trim() || 'Parent'
    : 'Edit Parent';

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-pulse" aria-busy="true" aria-label="Loading parent for editing">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-64" />
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Parents', href: '/parents' },
            { label: 'Edit Parent' },
          ]}
        />
        <ErrorState
          title="Parent Record Not Found"
          message={error?.message || 'Could not retrieve parent details for editing.'}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Parents', href: '/parents' },
          { label: fullName, href: `/parents/${id}` },
          { label: 'Edit' },
        ]}
      />

      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Edit Parent / Guardian — {fullName}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Update contact phone, address, and occupation information
        </p>
      </div>

      {/* Form */}
      <ParentForm
        initialValues={parent}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
        submitLabel="Update Parent"
        onCancel={() => navigate(`/parents/${id}`)}
      />
    </div>
  );
}

export default EditParentPage;

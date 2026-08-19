import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, Card } from '@/components/ui';
import { ErrorState } from '@/components/feedback';
import { AssignmentForm } from '../components/AssignmentForm';
import { useAssignment, useUpdateAssignment } from '../hooks/useAssignments';

export function EditAssignmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: assignment, isLoading, isError, error, refetch } = useAssignment(id);
  const updateMutation = useUpdateAssignment(id);

  const handleSubmit = async (payload) => {
    await updateMutation.mutateAsync(payload);
    navigate(`/assignments/${id}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Assignments', href: '/assignments' }, { label: 'Loading...' }]} />
        <Card className="p-8 text-center text-sm text-text-muted">
          Loading assignment details for editing...
        </Card>
      </div>
    );
  }

  if (isError || !assignment) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Assignments', href: '/assignments' }, { label: 'Error' }]} />
        <ErrorState
          title="Failed to load assignment"
          message={error?.message || 'Assignment could not be found.'}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Assignments', href: '/assignments' },
          { label: assignment.title, href: `/assignments/${id}` },
          { label: 'Edit' },
        ]}
      />

      {/* Page Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Edit Assignment: {assignment.title}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Update assignment details, due date, instructions, or resource materials
        </p>
      </div>

      {/* Form */}
      <AssignmentForm
        defaultValues={assignment}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
        isEditing={true}
      />
    </div>
  );
}

export default EditAssignmentPage;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '@/components/ui';
import { AssignmentForm } from '../components/AssignmentForm';
import { useCreateAssignment } from '../hooks/useAssignments';

export function CreateAssignmentPage() {
  const navigate = useNavigate();
  const createMutation = useCreateAssignment();

  const handleSubmit = async (payload) => {
    await createMutation.mutateAsync(payload);
    navigate('/assignments');
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Assignments', href: '/assignments' },
          { label: 'Create Assignment' },
        ]}
      />

      {/* Page Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Create New Assignment
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Configure assignment details, instructions, due date, attachments, and target class
        </p>
      </div>

      {/* Form */}
      <AssignmentForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
        isEditing={false}
      />
    </div>
  );
}

export default CreateAssignmentPage;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '@/components/ui';
import { ParentForm } from '../components/ParentForm';
import { useCreateParent } from '../hooks/useParents';

export function CreateParentPage() {
  const navigate = useNavigate();
  const createMutation = useCreateParent();

  const handleSubmit = async (formData) => {
    try {
      const parent = await createMutation.mutateAsync(formData);
      navigate(`/parents/${parent._id || parent.id}`);
    } catch (err) {
      // Toast handled by hook
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Parents', href: '/parents' },
          { label: 'Register Parent' },
        ]}
      />

      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Register Parent / Guardian
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Create a parent or guardian record in the school database
        </p>
      </div>

      {/* Form */}
      <ParentForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
        submitLabel="Register Parent"
        onCancel={() => navigate('/parents')}
      />
    </div>
  );
}

export default CreateParentPage;

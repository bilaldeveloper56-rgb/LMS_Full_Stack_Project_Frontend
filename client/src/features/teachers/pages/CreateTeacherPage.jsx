import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '@/components/ui';
import { TeacherForm } from '../components/TeacherForm';
import { useCreateTeacher } from '../hooks/useTeachers';

export function CreateTeacherPage() {
  const navigate = useNavigate();
  const createMutation = useCreateTeacher();

  const handleSubmit = async (formData) => {
    try {
      const teacher = await createMutation.mutateAsync(formData);
      navigate(`/teachers/${teacher._id || teacher.id}`);
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
          { label: 'Teachers', href: '/teachers' },
          { label: 'Register Teacher' },
        ]}
      />

      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Register New Teacher
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Enroll a faculty member into the school institutional directory
        </p>
      </div>

      {/* Form */}
      <TeacherForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
        submitLabel="Register Teacher"
        onCancel={() => navigate('/teachers')}
      />
    </div>
  );
}

export default CreateTeacherPage;

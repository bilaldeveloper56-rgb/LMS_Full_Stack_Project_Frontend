import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, Card, Skeleton } from '@/components/ui';
import { ErrorState } from '@/components/feedback';
import { TeacherForm } from '../components/TeacherForm';
import { useTeacher, useUpdateTeacher } from '../hooks/useTeachers';

export function EditTeacherPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: teacher, isLoading, isError, error, refetch } = useTeacher(id);
  const updateMutation = useUpdateTeacher(id);

  const handleSubmit = async (formData) => {
    try {
      await updateMutation.mutateAsync(formData);
      navigate(`/teachers/${id}`);
    } catch (err) {
      // Toast handled by hook
    }
  };

  const fullName = teacher
    ? `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || 'Teacher'
    : 'Edit Teacher';

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-pulse" aria-busy="true" aria-label="Loading teacher for editing">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-64" />
        <Card className="p-6 space-y-4">
          <Skeleton className="h-20 w-20 rounded-full" />
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
            { label: 'Teachers', href: '/teachers' },
            { label: 'Edit Teacher' },
          ]}
        />
        <ErrorState
          title="Teacher Record Not Found"
          message={error?.message || 'Could not retrieve teacher details for editing.'}
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
          { label: 'Teachers', href: '/teachers' },
          { label: fullName, href: `/teachers/${id}` },
          { label: 'Edit' },
        ]}
      />

      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Edit Teacher — {fullName}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Update personal details, employment information, and qualifications
        </p>
      </div>

      {/* Form */}
      <TeacherForm
        initialValues={teacher}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
        submitLabel="Update Teacher"
        onCancel={() => navigate(`/teachers/${id}`)}
      />
    </div>
  );
}

export default EditTeacherPage;

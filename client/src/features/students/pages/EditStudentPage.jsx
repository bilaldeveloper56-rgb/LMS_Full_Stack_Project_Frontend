import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, Card, Skeleton } from '@/components/ui';
import { ErrorState } from '@/components/feedback';
import { StudentForm } from '../components/StudentForm';
import { useStudent, useUpdateStudent } from '../hooks/useStudents';

export function EditStudentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: student, isLoading, isError, error, refetch } = useStudent(id);
  const updateMutation = useUpdateStudent(id);

  const handleSubmit = async (formData) => {
    try {
      await updateMutation.mutateAsync(formData);
      navigate(`/students/${id}`);
    } catch (err) {
      // Handled by hook toast
    }
  };

  const fullName = student
    ? `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student'
    : 'Edit Student';

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-pulse" aria-busy="true" aria-label="Loading student for editing">
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
            { label: 'Students', href: '/students' },
            { label: 'Edit Student' },
          ]}
        />
        <ErrorState
          title="Student Record Not Found"
          message={error?.message || 'Could not retrieve student details for editing.'}
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
          { label: 'Students', href: '/students' },
          { label: fullName, href: `/students/${id}` },
          { label: 'Edit' },
        ]}
      />

      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Edit Student — {fullName}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Update personal information, contact details, and enrollment status
        </p>
      </div>

      {/* Form */}
      <StudentForm
        initialValues={student}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
        submitLabel="Update Student"
        onCancel={() => navigate(`/students/${id}`)}
      />
    </div>
  );
}

export default EditStudentPage;

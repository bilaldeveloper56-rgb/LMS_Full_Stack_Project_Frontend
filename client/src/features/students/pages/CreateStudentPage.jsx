import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '@/components/ui';
import { StudentForm } from '../components/StudentForm';
import { useCreateStudent } from '../hooks/useStudents';

export function CreateStudentPage() {
  const navigate = useNavigate();
  const createMutation = useCreateStudent();

  const handleSubmit = async (formData) => {
    try {
      const student = await createMutation.mutateAsync(formData);
      navigate(`/students/${student._id || student.id}`);
    } catch (err) {
      // Handled by hook toast
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Students', href: '/students' },
          { label: 'Register Student' },
        ]}
      />

      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Register New Student
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Enroll a new student into the institutional directory and assign them to an academic cohort
        </p>
      </div>

      {/* Form */}
      <StudentForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
        submitLabel="Register Student"
        onCancel={() => navigate('/students')}
      />
    </div>
  );
}

export default CreateStudentPage;

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X } from 'lucide-react';
import {
  Input,
  Select,
  Button,
  Card,
} from '@/components/ui';
import {
  teacherFormSchema,
  EMPLOYMENT_STATUS_OPTIONS,
  GENDER_OPTIONS,
} from '../schemas/teacher.schema';
import { useUploadTeacherAvatar } from '../hooks/useTeachers';
import { TeacherAvatar } from './TeacherAvatar';

/**
 * TeacherForm component for registration and editing.
 *
 * @param {object} props
 * @param {object} [props.initialValues] - Existing values for edit mode
 * @param {Function} props.onSubmit - Submission callback
 * @param {boolean} [props.isLoading=false] - Submission in-flight flag
 * @param {string} [props.submitLabel='Save Teacher']
 * @param {Function} [props.onCancel] - Cancel callback
 */
export function TeacherForm({
  initialValues = {},
  onSubmit,
  isLoading = false,
  submitLabel = 'Save Teacher',
  onCancel,
}) {
  const [avatarPreview, setAvatarPreview] = useState(initialValues.profileImage || '');
  const uploadAvatarMutation = useUploadTeacherAvatar();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      employeeId: initialValues.employeeId || '',
      firstName: initialValues.firstName || '',
      lastName: initialValues.lastName || '',
      email: initialValues.email || '',
      phone: initialValues.phone || '',
      dateOfBirth: initialValues.dateOfBirth
        ? new Date(initialValues.dateOfBirth).toISOString().split('T')[0]
        : '',
      gender: initialValues.gender || 'OTHER',
      qualification: initialValues.qualification || '',
      specialization: initialValues.specialization || '',
      joiningDate: initialValues.joiningDate
        ? new Date(initialValues.joiningDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      designation: initialValues.designation || 'Teacher',
      profileImage: initialValues.profileImage || '',
      employmentStatus: initialValues.employmentStatus || 'ACTIVE',
      userId: initialValues.userId?._id || initialValues.userId || '',
    },
  });

  const firstNameWatch = watch('firstName');
  const lastNameWatch = watch('lastName');

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Avatar image must be smaller than 2 MB');
      return;
    }

    try {
      const result = await uploadAvatarMutation.mutateAsync(file);
      const url = result.secureUrl || result.url;
      setAvatarPreview(url);
      setValue('profileImage', url, { shouldValidate: true });
    } catch (err) {
      // Toast handled by hook
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview('');
    setValue('profileImage', '', { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 1. Personal & Identity Details */}
      <Card className="p-6">
        <h2 className="text-base font-semibold text-text-primary mb-4 pb-2 border-b border-border">
          Personal Information
        </h2>

        <div className="flex flex-col sm:flex-row gap-6 mb-6 items-start sm:items-center">
          <div className="relative">
            <TeacherAvatar
              src={avatarPreview}
              firstName={firstNameWatch}
              lastName={lastNameWatch}
              size="xl"
            />
            {avatarPreview && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="absolute -top-1 -right-1 bg-danger-600 text-white rounded-full p-1 shadow-sm hover:bg-danger-700 cursor-pointer"
                aria-label="Remove avatar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="teacher-avatar-upload"
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-border rounded-md text-xs font-medium text-text-primary bg-surface hover:bg-surface-muted cursor-pointer transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-text-muted" />
              {uploadAvatarMutation.isPending ? 'Uploading...' : 'Upload Teacher Photo'}
            </label>
            <input
              id="teacher-avatar-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarFileChange}
              disabled={uploadAvatarMutation.isPending}
              className="hidden"
            />
            <p className="text-xs text-text-muted">
              JPG, PNG, or WEBP. Max 2 MB.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Employee ID *"
            placeholder="e.g. EMP-2026-001"
            error={errors.employeeId?.message}
            {...register('employeeId')}
          />

          <Input
            label="First Name *"
            placeholder="e.g. Robert"
            error={errors.firstName?.message}
            {...register('firstName')}
          />

          <Input
            label="Last Name *"
            placeholder="e.g. Oppenheimer"
            error={errors.lastName?.message}
            {...register('lastName')}
          />

          <Input
            label="Email Address *"
            type="email"
            placeholder="teacher@school.edu"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Phone Number"
            placeholder="+1 (555) 000-0000"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Select
            label="Gender *"
            options={GENDER_OPTIONS}
            error={errors.gender?.message}
            {...register('gender')}
          />

          <Input
            label="Date of Birth"
            type="date"
            error={errors.dateOfBirth?.message}
            {...register('dateOfBirth')}
          />
        </div>
      </Card>

      {/* 2. Employment & Academic Qualifications */}
      <Card className="p-6">
        <h2 className="text-base font-semibold text-text-primary mb-4 pb-2 border-b border-border">
          Employment & Qualifications
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Designation"
            placeholder="e.g. Senior Lecturer / Head of Science"
            error={errors.designation?.message}
            {...register('designation')}
          />

          <Input
            label="Qualification"
            placeholder="e.g. M.Sc. Physics, B.Ed."
            error={errors.qualification?.message}
            {...register('qualification')}
          />

          <Input
            label="Specialization / Subject Area"
            placeholder="e.g. Theoretical Physics, Calculus"
            error={errors.specialization?.message}
            {...register('specialization')}
          />

          <Input
            label="Joining Date"
            type="date"
            error={errors.joiningDate?.message}
            {...register('joiningDate')}
          />

          <Select
            label="Employment Status *"
            options={EMPLOYMENT_STATUS_OPTIONS}
            error={errors.employmentStatus?.message}
            {...register('employmentStatus')}
          />
        </div>
      </Card>

      {/* Action Controls */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export default TeacherForm;

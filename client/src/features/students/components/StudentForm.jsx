import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Input,
  Select,
  Button,
  Card,
  Alert,
} from '@/components/ui';
import {
  studentFormSchema,
  GENDER_OPTIONS,
  ENROLLMENT_STATUS_OPTIONS,
  BLOOD_GROUP_OPTIONS,
} from '../schemas/student.schema';
import { useAcademicOptions, useUploadAvatar } from '../hooks/useStudents';
import { StudentAvatar } from './StudentAvatar';

/**
 * StudentForm component for registration and editing.
 *
 * @param {object} props
 * @param {object} [props.initialValues] - Existing values for edit mode
 * @param {Function} props.onSubmit - Submission callback
 * @param {boolean} [props.isLoading=false] - Form submission in-flight flag
 * @param {string} [props.submitLabel='Save Student']
 * @param {Function} [props.onCancel] - Cancel button callback
 */
export function StudentForm({
  initialValues = {},
  onSubmit,
  isLoading = false,
  submitLabel = 'Save Student',
  onCancel,
}) {
  const [selectedClassId, setSelectedClassId] = useState(
    initialValues.classId?._id || initialValues.classId || ''
  );
  const [avatarPreview, setAvatarPreview] = useState(
    initialValues.profileImage || ''
  );

  const {
    sessions,
    classes,
    sections,
    isLoading: isLoadingOptions,
    isLoadingSections,
    isSectionsError,
  } = useAcademicOptions(selectedClassId);
  const uploadAvatarMutation = useUploadAvatar();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      admissionNumber: initialValues.admissionNumber || '',
      firstName: initialValues.firstName || '',
      lastName: initialValues.lastName || '',
      dateOfBirth: initialValues.dateOfBirth
        ? new Date(initialValues.dateOfBirth).toISOString().split('T')[0]
        : '',
      gender: initialValues.gender || 'MALE',
      academicSessionId: initialValues.academicSessionId?._id || initialValues.academicSessionId || '',
      classId: initialValues.classId?._id || initialValues.classId || '',
      sectionId: initialValues.sectionId?._id || initialValues.sectionId || '',
      rollNumber: initialValues.rollNumber || '',
      admissionDate: initialValues.admissionDate
        ? new Date(initialValues.admissionDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      enrollmentStatus: initialValues.enrollmentStatus || 'ACTIVE',
      bloodGroup: initialValues.bloodGroup || '',
      email: initialValues.email || '',
      phone: initialValues.phone || '',
      address: initialValues.address || '',
      city: initialValues.city || '',
      profileImage: initialValues.profileImage || '',
      emergencyContactName: initialValues.emergencyContactName || '',
      emergencyContactPhone: initialValues.emergencyContactPhone || '',
    },
  });

  const firstNameWatch = watch('firstName');
  const lastNameWatch = watch('lastName');
  const classRegistration = register('classId');

  const handleClassChange = (e) => {
    classRegistration.onChange(e);
    const classId = e.target.value;
    setSelectedClassId(classId);
    setValue('sectionId', '', { shouldValidate: true });
  };

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
      // Error handled by hook toast
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview('');
    setValue('profileImage', '', { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 1. Profile Picture & Basic Info */}
      <Card className="p-6">
        <h2 className="text-base font-semibold text-text-primary mb-4 pb-2 border-b border-border">
          Personal Details
        </h2>

        <div className="flex flex-col sm:flex-row gap-6 mb-6 items-start sm:items-center">
          <div className="relative">
            <StudentAvatar
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
              htmlFor="avatar-upload"
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-border rounded-md text-xs font-medium text-text-primary bg-surface hover:bg-surface-muted cursor-pointer transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-text-muted" />
              {uploadAvatarMutation.isPending ? 'Uploading...' : 'Upload Student Photo'}
            </label>
            <input
              id="avatar-upload"
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
            label="First Name *"
            placeholder="e.g. John"
            error={errors.firstName?.message}
            {...register('firstName')}
          />

          <Input
            label="Last Name *"
            placeholder="e.g. Doe"
            error={errors.lastName?.message}
            {...register('lastName')}
          />

          <Input
            label="Admission Number *"
            placeholder="e.g. ADM-2026-001"
            error={errors.admissionNumber?.message}
            {...register('admissionNumber')}
          />

          <Input
            label="Date of Birth *"
            type="date"
            error={errors.dateOfBirth?.message}
            {...register('dateOfBirth')}
          />

          <Select
            label="Gender *"
            options={GENDER_OPTIONS}
            error={errors.gender?.message}
            {...register('gender')}
          />

          <Select
            label="Blood Group"
            options={BLOOD_GROUP_OPTIONS}
            error={errors.bloodGroup?.message}
            {...register('bloodGroup')}
          />
        </div>
      </Card>

      {/* 2. Academic & Enrollment Details */}
      <Card className="p-6">
        <h2 className="text-base font-semibold text-text-primary mb-4 pb-2 border-b border-border">
          Academic Enrollment
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label="Academic Session *"
            disabled={isLoadingOptions}
            error={errors.academicSessionId?.message}
            options={[
              { value: '', label: 'Select Session' },
              ...sessions.map((s) => ({ value: s._id || s.id, label: s.name })),
            ]}
            {...register('academicSessionId')}
          />

          <Select
            label="Class *"
            disabled={isLoadingOptions}
            error={errors.classId?.message}
            options={[
              { value: '', label: 'Select Class' },
              ...classes.map((c) => ({ value: c._id || c.id, label: c.name })),
            ]}
            {...classRegistration}
            onChange={handleClassChange}
          />

          <div>
            <Select
              label="Section *"
              disabled={isLoadingOptions || !selectedClassId || isLoadingSections || (Boolean(selectedClassId) && sections.length === 0)}
              error={errors.sectionId?.message}
              options={[
                {
                  value: '',
                  label: !selectedClassId
                    ? 'Select Class First'
                    : isLoadingSections
                    ? 'Loading sections...'
                    : isSectionsError
                    ? 'Unable to load sections'
                    : sections.length === 0
                    ? 'No sections available for this class'
                    : 'Select Section',
                },
                ...sections.map((sec) => ({
                  value: sec._id || sec.id,
                  label: sec.code ? `${sec.name} (${sec.code})` : sec.name,
                })),
              ]}
              {...register('sectionId')}
            />
            {Boolean(selectedClassId) && !isLoadingSections && !isSectionsError && sections.length === 0 && (
              <p className="mt-1.5 text-xs text-warning-700 bg-warning-50 border border-warning-200 p-2 rounded">
                No sections available for this class.{' '}
                <Link to="/academics/classes" className="font-semibold underline hover:text-warning-900">
                  Please create a section first
                </Link>{' '}
                in Class Management.
              </p>
            )}
            {Boolean(selectedClassId) && isSectionsError && (
              <p className="mt-1.5 text-xs text-danger-700">
                Unable to load sections. Please try selecting the class again.
              </p>
            )}
          </div>

          <Input
            label="Roll Number"
            placeholder="e.g. 15"
            error={errors.rollNumber?.message}
            {...register('rollNumber')}
          />

          <Input
            label="Admission Date"
            type="date"
            error={errors.admissionDate?.message}
            {...register('admissionDate')}
          />

          <Select
            label="Enrollment Status *"
            options={ENROLLMENT_STATUS_OPTIONS}
            error={errors.enrollmentStatus?.message}
            {...register('enrollmentStatus')}
          />
        </div>
      </Card>

      {/* 3. Contact & Address */}
      <Card className="p-6">
        <h2 className="text-base font-semibold text-text-primary mb-4 pb-2 border-b border-border">
          Contact & Address
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Student Email"
            type="email"
            placeholder="student@school.edu"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Phone Number"
            placeholder="+1 (555) 000-0000"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="City"
            placeholder="City"
            error={errors.city?.message}
            {...register('city')}
          />

          <Input
            label="Residential Address"
            placeholder="Street address..."
            error={errors.address?.message}
            {...register('address')}
          />
        </div>
      </Card>

      {/* 4. Emergency Contacts */}
      <Card className="p-6">
        <h2 className="text-base font-semibold text-text-primary mb-4 pb-2 border-b border-border">
          Emergency Contact
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Emergency Contact Name"
            placeholder="e.g. Guardian / Parent Name"
            error={errors.emergencyContactName?.message}
            {...register('emergencyContactName')}
          />

          <Input
            label="Emergency Contact Phone"
            placeholder="+1 (555) 000-0000"
            error={errors.emergencyContactPhone?.message}
            {...register('emergencyContactPhone')}
          />
        </div>
      </Card>

      {/* Form Action Controls */}
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

export default StudentForm;

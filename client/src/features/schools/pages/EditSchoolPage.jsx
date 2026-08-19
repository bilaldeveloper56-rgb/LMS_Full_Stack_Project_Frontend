import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Building2 } from 'lucide-react';
import { Breadcrumb, Button, Card, Input } from '@/components/ui';
import { ErrorState } from '@/components/feedback';
import { updateSchoolFormSchema } from '../schemas/school.schema';
import { useSchool, useUpdateSchool } from '../hooks/useSchools';

export function EditSchoolPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: school, isLoading, isError, error, refetch } = useSchool(id);
  const updateSchoolMutation = useUpdateSchool();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateSchoolFormSchema),
  });

  useEffect(() => {
    if (school) {
      reset({
        name: school.name || '',
        email: school.email || '',
        phone: school.phone || '',
        address: school.address || '',
        city: school.city || '',
        province: school.province || '',
        country: school.country || 'US',
        timezone: school.timezone || 'UTC',
        currency: school.currency || 'USD',
        language: school.language || 'en',
        website: school.website || '',
        registrationNumber: school.registrationNumber || '',
      });
    }
  }, [school, reset]);

  const handleFormSubmit = async (formData) => {
    const payload = {
      ...formData,
      phone: formData.phone || null,
      address: formData.address || null,
      city: formData.city || null,
      province: formData.province || null,
      website: formData.website || null,
      registrationNumber: formData.registrationNumber || null,
    };

    await updateSchoolMutation.mutateAsync({ id, payload });
    navigate(`/schools/${id}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl animate-pulse" aria-busy="true">
        <div className="h-6 w-48 bg-surface-muted rounded-md" />
        <div className="h-64 bg-surface-muted rounded-xl border border-border" />
      </div>
    );
  }

  if (isError || !school) {
    return (
      <ErrorState
        title="Failed to load school"
        message={error?.message || 'The requested school profile could not be found.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Tenant Schools', href: '/schools' },
          { label: school.name, href: `/schools/${id}` },
          { label: 'Edit Profile' },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Edit School Profile
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Update institutional metadata and localized configuration for {school.name}
          </p>
        </div>

        <Link to={`/schools/${id}`}>
          <Button variant="ghost" size="sm" leftIcon={ArrowLeft}>
            Cancel
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <Card className="p-6 border border-border bg-surface shadow-2xs space-y-5">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Building2 className="w-5 h-5 text-primary-600" />
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Institutional Profile Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="School Name *"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="School Code (Read Only)"
              value={school.schoolCode}
              disabled
            />

            <Input
              label="Official School Email *"
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Contact Phone"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="Street Address"
              error={errors.address?.message}
              {...register('address')}
            />

            <Input
              label="City"
              error={errors.city?.message}
              {...register('city')}
            />

            <Input
              label="Province / State"
              error={errors.province?.message}
              {...register('province')}
            />

            <Input
              label="Country Code"
              error={errors.country?.message}
              {...register('country')}
            />

            <Input
              label="Timezone"
              error={errors.timezone?.message}
              {...register('timezone')}
            />

            <Input
              label="Currency Code"
              error={errors.currency?.message}
              {...register('currency')}
            />

            <Input
              label="System Language"
              error={errors.language?.message}
              {...register('language')}
            />

            <Input
              label="Registration Number"
              error={errors.registrationNumber?.message}
              {...register('registrationNumber')}
            />

            <div className="sm:col-span-2">
              <Input
                label="Official Website URL"
                error={errors.website?.message}
                {...register('website')}
              />
            </div>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link to={`/schools/${id}`}>
            <Button type="button" variant="outline" size="sm">
              Cancel
            </Button>
          </Link>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={updateSchoolMutation.isPending}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EditSchoolPage;

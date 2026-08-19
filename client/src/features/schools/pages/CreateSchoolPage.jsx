import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Building2, UserPlus } from 'lucide-react';
import { Breadcrumb, Button, Card, Input } from '@/components/ui';
import { createSchoolFormSchema } from '../schemas/school.schema';
import { useCreateSchool } from '../hooks/useSchools';

export function CreateSchoolPage() {
  const navigate = useNavigate();
  const createSchoolMutation = useCreateSchool();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createSchoolFormSchema),
    defaultValues: {
      name: '',
      schoolCode: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      province: '',
      country: 'US',
      timezone: 'UTC',
      currency: 'USD',
      language: 'en',
      website: '',
      adminFirstName: '',
      adminLastName: '',
      adminEmail: '',
      adminPhone: '',
    },
  });

  const handleFormSubmit = async (formData) => {
    const payload = {
      school: {
        name: formData.name,
        schoolCode: formData.schoolCode,
        email: formData.email,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        province: formData.province || undefined,
        country: formData.country || 'US',
        timezone: formData.timezone || 'UTC',
        currency: formData.currency || 'USD',
        language: formData.language || 'en',
        website: formData.website || undefined,
      },
      admin: {
        firstName: formData.adminFirstName,
        lastName: formData.adminLastName,
        email: formData.adminEmail,
        phone: formData.adminPhone || undefined,
      },
    };

    await createSchoolMutation.mutateAsync(payload);
    navigate('/schools');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Tenant Schools', href: '/schools' },
          { label: 'Provision School' },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Provision New School Tenant
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Onboard a new educational institution and invite its initial administrator
          </p>
        </div>

        <Link to="/schools">
          <Button variant="ghost" size="sm" leftIcon={ArrowLeft}>
            Cancel
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Section 1: School Profile */}
        <Card className="p-6 border border-border bg-surface shadow-2xs space-y-5">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Building2 className="w-5 h-5 text-primary-600" />
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              1. Institutional Profile & Identity
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="School Name *"
              placeholder="e.g. Springfield High Academy"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="School Code (Tenant ID) *"
              placeholder="e.g. SPH-01"
              error={errors.schoolCode?.message}
              {...register('schoolCode')}
            />

            <Input
              label="Official School Email *"
              type="email"
              placeholder="e.g. contact@springfield.edu"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Contact Phone"
              placeholder="e.g. +1 555 123 4567"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="Street Address"
              placeholder="e.g. 742 Evergreen Terrace"
              error={errors.address?.message}
              {...register('address')}
            />

            <Input
              label="City"
              placeholder="e.g. Springfield"
              error={errors.city?.message}
              {...register('city')}
            />

            <Input
              label="Province / State"
              placeholder="e.g. Oregon"
              error={errors.province?.message}
              {...register('province')}
            />

            <Input
              label="Country Code"
              placeholder="e.g. US"
              error={errors.country?.message}
              {...register('country')}
            />

            <Input
              label="Timezone"
              placeholder="e.g. America/New_York"
              error={errors.timezone?.message}
              {...register('timezone')}
            />

            <Input
              label="Currency Code"
              placeholder="e.g. USD"
              error={errors.currency?.message}
              {...register('currency')}
            />

            <div className="sm:col-span-2">
              <Input
                label="Official Website URL"
                placeholder="https://www.springfield.edu"
                error={errors.website?.message}
                {...register('website')}
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Initial Administrator */}
        <Card className="p-6 border border-border bg-surface shadow-2xs space-y-5">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <UserPlus className="w-5 h-5 text-success-600" />
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              2. Initial School Administrator Setup
            </h2>
          </div>

          <p className="text-xs text-text-secondary">
            An automated activation link with a secure onboarding token will be dispatched to this email address.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Administrator First Name *"
              placeholder="e.g. Sarah"
              error={errors.adminFirstName?.message}
              {...register('adminFirstName')}
            />

            <Input
              label="Administrator Last Name *"
              placeholder="e.g. Connor"
              error={errors.adminLastName?.message}
              {...register('adminLastName')}
            />

            <Input
              label="Administrator Email *"
              type="email"
              placeholder="e.g. sarah.connor@springfield.edu"
              error={errors.adminEmail?.message}
              {...register('adminEmail')}
            />

            <Input
              label="Administrator Phone"
              placeholder="e.g. +1 555 987 6543"
              error={errors.adminPhone?.message}
              {...register('adminPhone')}
            />
          </div>
        </Card>

        {/* Form Action Controls */}
        <div className="flex justify-end gap-3">
          <Link to="/schools">
            <Button type="button" variant="outline" size="sm">
              Cancel
            </Button>
          </Link>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={createSchoolMutation.isPending}
          >
            Provision & Onboard School
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateSchoolPage;

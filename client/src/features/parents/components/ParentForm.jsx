import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Input,
  Select,
  Button,
  Card,
} from '@/components/ui';
import {
  parentFormSchema,
  RELATIONSHIP_TYPE_OPTIONS,
} from '../schemas/parent.schema';

/**
 * ParentForm component for parent registration and editing.
 *
 * @param {object} props
 * @param {object} [props.initialValues]
 * @param {Function} props.onSubmit
 * @param {boolean} [props.isLoading=false]
 * @param {string} [props.submitLabel='Save Parent']
 * @param {Function} [props.onCancel]
 */
export function ParentForm({
  initialValues = {},
  onSubmit,
  isLoading = false,
  submitLabel = 'Save Parent',
  onCancel,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(parentFormSchema),
    defaultValues: {
      firstName: initialValues.firstName || '',
      lastName: initialValues.lastName || '',
      email: initialValues.email || '',
      phone: initialValues.phone || '',
      alternatePhone: initialValues.alternatePhone || '',
      address: initialValues.address || '',
      occupation: initialValues.occupation || '',
      relationship: initialValues.relationship || 'GUARDIAN',
      userId: initialValues.userId?._id || initialValues.userId || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-6">
        <h2 className="text-base font-semibold text-text-primary mb-4 pb-2 border-b border-border">
          Parent / Guardian Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name *"
            placeholder="e.g. Eleanor"
            error={errors.firstName?.message}
            {...register('firstName')}
          />

          <Input
            label="Last Name *"
            placeholder="e.g. Vance"
            error={errors.lastName?.message}
            {...register('lastName')}
          />

          <Input
            label="Email Address *"
            type="email"
            placeholder="parent@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Primary Phone Number *"
            placeholder="+1 (555) 000-0000"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="Alternate Phone Number"
            placeholder="+1 (555) 000-0001"
            error={errors.alternatePhone?.message}
            {...register('alternatePhone')}
          />

          <Select
            label="Default Relationship"
            options={RELATIONSHIP_TYPE_OPTIONS}
            error={errors.relationship?.message}
            {...register('relationship')}
          />

          <Input
            label="Occupation / Profession"
            placeholder="e.g. Software Engineer / Physician"
            error={errors.occupation?.message}
            {...register('occupation')}
          />

          <Input
            label="Residential Address"
            placeholder="Street address..."
            error={errors.address?.message}
            {...register('address')}
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

export default ParentForm;

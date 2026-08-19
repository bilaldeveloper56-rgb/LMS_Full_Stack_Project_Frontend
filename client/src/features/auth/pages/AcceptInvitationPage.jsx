import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { acceptInvitation } from '@/features/schools/api/schools.api';
import { extractApiError } from '@/config/api';
import { Button, Input, Alert } from '@/components/ui';

const acceptInvitationSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must not exceed 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one digit'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [serverError, setServerError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password', '');
  const hasMinLength = passwordValue.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordValue);
  const hasLowercase = /[a-z]/.test(passwordValue);
  const hasDigit = /\d/.test(passwordValue);

  const onSubmit = async (data) => {
    if (!token) {
      setServerError('Missing invitation token. Please check your invitation email.');
      return;
    }

    setServerError(null);
    try {
      await acceptInvitation({
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      setIsSuccess(true);
    } catch (error) {
      const extracted = extractApiError(error);
      setServerError(
        extracted.message ||
          'Failed to activate account. The invitation link may be expired or invalid.'
      );
    }
  };

  // ── Missing Token State ──
  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger-100">
          <AlertCircle className="h-8 w-8 text-danger-600" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">
            Invalid Invitation Link
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            No invitation token was found in the URL. Please verify you clicked the complete link in your invitation email.
          </p>
        </div>
        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            className="w-full justify-center"
            onClick={() => navigate('/login')}
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  // ── Successful Activation State ──
  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-100">
          <CheckCircle2 className="h-8 w-8 text-success-600" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">
            Account Activated!
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Your School Administrator password has been set. You can now sign in to your school management portal.
          </p>
        </div>
        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            className="w-full justify-center"
            rightIcon={ArrowRight}
            onClick={() => navigate('/login')}
          >
            Proceed to Sign In
          </Button>
        </div>
      </div>
    );
  }

  // ── Form State ──
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
          <ShieldCheck className="h-6 w-6 text-primary-600" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-text-primary tracking-tight">
          Activate Your Account
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Create a secure password to complete your School Administrator setup.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <Alert
            variant="error"
            title="Activation Failed"
            onDismiss={() => setServerError(null)}
          >
            {serverError}
          </Alert>
        )}

        {/* New Password */}
        <div className="relative">
          <Input
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.password?.message}
            className="pr-10"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-8 text-text-muted hover:text-text-primary p-1 focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Password Strength Requirements Indicator */}
        <div className="rounded-md bg-surface-muted p-3 text-xs space-y-1.5 border border-border">
          <p className="font-medium text-text-secondary">Password Requirements:</p>
          <div className="grid grid-cols-2 gap-1 text-text-muted">
            <span className={hasMinLength ? 'text-success-600 font-medium' : ''}>
              {hasMinLength ? '✓' : '•'} At least 8 characters
            </span>
            <span className={hasUppercase ? 'text-success-600 font-medium' : ''}>
              {hasUppercase ? '✓' : '•'} Uppercase letter (A-Z)
            </span>
            <span className={hasLowercase ? 'text-success-600 font-medium' : ''}>
              {hasLowercase ? '✓' : '•'} Lowercase letter (a-z)
            </span>
            <span className={hasDigit ? 'text-success-600 font-medium' : ''}>
              {hasDigit ? '✓' : '•'} At least one number (0-9)
            </span>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            className="pr-10"
            {...register('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-8 text-text-muted hover:text-text-primary p-1 focus:outline-none"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full justify-center"
            isLoading={isSubmitting}
            leftIcon={Lock}
          >
            {isSubmitting ? 'Activating Account...' : 'Complete Activation'}
          </Button>
        </div>

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="text-xs text-primary-600 hover:text-primary-700 font-medium hover:underline"
          >
            Already have an active account? Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}

export default AcceptInvitationPage;

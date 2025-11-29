'use client';

/**
 * Forgot Password Page
 * Request password reset email
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForgotPassword } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const t = useTranslations('auth.login');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    setError(null);
    forgotPassword(data, {
      onSuccess: () => {
        setSuccess(true);
      },
      onError: (err) => {
        setError(err.message || 'Failed to send reset email.');
      },
    });
  };

  if (success) {
    return (
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">Check Your Email</h2>
        <p className="text-gray-600">
          If an account exists with that email, we&apos;ve sent password reset instructions.
        </p>
        <div className="mt-6">
          <Link href="/login" className="text-primary hover:text-primary/80">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">Reset Password</h2>
      <p className="mb-6 text-center text-sm text-gray-600">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>

      {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className="mt-1"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? '...' : 'Send Reset Link'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Remember your password?{' '}
        <Link href="/login" className="font-medium text-primary hover:text-primary/80">
          Back to Login
        </Link>
      </div>
    </div>
  );
}

'use client';

/**
 * Verify Email Page
 * Email verification status and resend option
 */

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useResendVerification } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutate: resendVerification, isPending } = useResendVerification();

  // Successful verification
  if (status === 'success') {
    return (
      <div className="text-center">
        <div className="mb-4 text-4xl">&#10003;</div>
        <h2 className="mb-4 text-2xl font-bold text-gray-900">Email Verified</h2>
        <p className="text-gray-600">Your email has been verified successfully.</p>
        <div className="mt-6">
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Verification failed or expired
  if (status === 'error' || status === 'expired') {
    return (
      <div className="text-center">
        <div className="mb-4 text-4xl">&#10007;</div>
        <h2 className="mb-4 text-2xl font-bold text-gray-900">Verification Failed</h2>
        <p className="text-gray-600">
          {status === 'expired'
            ? 'This verification link has expired.'
            : 'This verification link is invalid.'}
        </p>
        <div className="mt-6">
          <Link href="/forgot-password" className="text-primary hover:text-primary/80">
            Request a New Link
          </Link>
        </div>
      </div>
    );
  }

  const handleResend = () => {
    if (!email) return;
    setError(null);
    resendVerification(
      { email },
      {
        onSuccess: () => {
          setSuccess(true);
        },
        onError: (err) => {
          setError(err.message || 'Failed to resend verification email.');
        },
      }
    );
  };

  if (success) {
    return (
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">Email Sent</h2>
        <p className="text-gray-600">
          If an account exists with that email, we&apos;ve sent a new verification link.
        </p>
        <div className="mt-6">
          <Link href="/login" className="text-primary hover:text-primary/80">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // Default: resend verification form
  return (
    <div>
      <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">Verify Your Email</h2>
      <p className="mb-6 text-center text-sm text-gray-600">
        Enter your email to receive a new verification link.
      </p>

      {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
          />
        </div>

        <Button onClick={handleResend} className="w-full" disabled={isPending || !email}>
          {isPending ? '...' : 'Resend Verification Email'}
        </Button>
      </div>

      <div className="mt-6 text-center text-sm text-gray-600">
        <Link href="/login" className="font-medium text-primary hover:text-primary/80">
          Back to Login
        </Link>
      </div>
    </div>
  );
}

'use client';

/**
 * Protected Route Component
 * Client-side route protection wrapper
 */

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      // Extract locale from pathname
      const locale = pathname.split('/')[1] || 'en';
      router.push(`/${locale}/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isInitialized, router, pathname]);

  // Show fallback while checking auth
  if (!isInitialized) {
    return fallback || <LoadingSpinner />;
  }

  // Not authenticated - will redirect
  if (!isAuthenticated) {
    return fallback || <LoadingSpinner />;
  }

  return <>{children}</>;
}

function LoadingSpinner() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div>
    </div>
  );
}

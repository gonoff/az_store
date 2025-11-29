'use client';

/**
 * Auth Provider
 * Fetches current user on mount and initializes auth state
 */

import { useEffect } from 'react';
import { useCurrentUser } from '@/hooks';
import { useAuthStore } from '@/lib/stores/auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isLoading } = useCurrentUser();
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  // Mark as initialized even if the query hasn't run yet
  // (e.g., when there's no stored auth state)
  useEffect(() => {
    if (!isLoading && !isInitialized) {
      setInitialized(true);
    }
  }, [isLoading, isInitialized, setInitialized]);

  return <>{children}</>;
}

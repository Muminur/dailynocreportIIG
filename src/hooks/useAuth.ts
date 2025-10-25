/**
 * useAuth Hook
 * 
 * Custom hook for accessing authentication state and methods
 */

'use client';

import { useSession } from 'next-auth/react';

export interface UseAuthReturn {
  user: {
    id: string;
    email: string;
    name: string;
    microsoftId: string;
  } | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | undefined;
}

/**
 * Hook to access authentication state
 */
export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();

  return {
    user: session?.user ?? null,
    accessToken: session?.accessToken ?? null,
    isAuthenticated: !!session?.user,
    isLoading: status === 'loading',
    error: session?.error,
  };
}


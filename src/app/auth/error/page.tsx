/**
 * Authentication Error Page
 * 
 * Displays authentication errors with retry option
 */

import { Suspense } from 'react';
import { AuthErrorContent } from '@/components/auth/AuthErrorContent';

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="text-muted-foreground">Loading...</div></div>}>
      <AuthErrorContent />
    </Suspense>
  );
}


/**
 * Sign In Page
 * 
 * Displays Microsoft OAuth login button
 */

import { Metadata } from 'next';
import { SignInForm } from '@/components/auth/SignInForm';

export const metadata: Metadata = {
  title: 'Sign In - NOC Email Report Generator',
  description: 'Sign in with your Microsoft account',
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md px-4">
        <SignInForm />
      </div>
    </div>
  );
}


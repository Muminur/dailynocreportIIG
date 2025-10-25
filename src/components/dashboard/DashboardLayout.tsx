/**
 * Dashboard Layout Wrapper
 */

'use client';

import { ReactNode } from 'react';
import { DashboardHeader } from './DashboardHeader';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container py-6">{children}</main>
    </div>
  );
}


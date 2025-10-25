/**
 * Dashboard Content Component
 * 
 * Main dashboard interface
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from './DashboardLayout';
import { StatsCards } from './StatsCards';
import { ReportList } from './ReportList';
import { EmailFetcher } from './EmailFetcher';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your NOC reports and email processing
          </p>
        </div>
        <StatsCards />
        <EmailFetcher />
        <ReportList />
      </div>
    </DashboardLayout>
  );
}


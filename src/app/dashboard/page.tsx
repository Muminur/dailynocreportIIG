/**
 * Dashboard Page
 * 
 * Main dashboard for authenticated users
 */

import { Metadata } from 'next';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

export const metadata: Metadata = {
  title: 'Dashboard - NOC Email Report Generator',
  description: 'Generate and manage your NOC reports',
};

export default function DashboardPage() {
  return <DashboardContent />;
}


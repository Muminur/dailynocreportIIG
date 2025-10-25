'use client';

/**
 * Statistics Panel Component
 * Displays report statistics with real-time updates
 */

import type { ReportStatistics } from '@/types';

interface StatisticsPanelProps {
  statistics: ReportStatistics;
}

export default function StatisticsPanel({ statistics }: StatisticsPanelProps) {
  const stats = [
    {
      label: 'Total Services',
      value: statistics.totalServices,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'New Complaints',
      value: statistics.totalNewComplaints,
      color: 'bg-yellow-100 text-yellow-700',
    },
    {
      label: 'Recurring',
      value: statistics.recurringComplaints,
      color: 'bg-orange-100 text-orange-700',
    },
    {
      label: 'Unresolved',
      value: statistics.complaintsUnresolved,
      color: 'bg-red-100 text-red-700',
    },
    {
      label: 'Resolved',
      value: statistics.complaintsResolved,
      color: 'bg-green-100 text-green-700',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Report Statistics</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.color} rounded-lg p-4 text-center`}
          >
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm font-medium">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


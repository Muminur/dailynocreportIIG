'use client';

/**
 * Reports List Component
 * Display all reports for the user
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import type { ReportEntry } from '@/types';

interface Report {
  _id: string;
  date: Date;
  entries: ReportEntry[];
  statistics: {
    totalServices: number;
    totalNewComplaints: number;
  };
}

export default function ReportsList() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch('/api/reports/list');
        if (!res.ok) throw new Error('Failed to fetch reports');
        
        const data = await res.json();
        setReports(data.reports);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading reports...</div>;
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reports yet. Generate one to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Your Reports</h3>
      
      <div className="grid gap-4">
        {reports.map(report => (
          <div
            key={report._id}
            onClick={() => router.push(`/reports/${report._id}`)}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md cursor-pointer transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold">
                  {new Date(report.date).toLocaleDateString()}
                </h4>
                <p className="text-sm text-gray-600">
                  {report.entries.length} entries
                </p>
              </div>
              <div className="text-right text-sm">
                <div className="text-blue-600">
                  {report.statistics.totalServices} Services
                </div>
                <div className="text-yellow-600">
                  {report.statistics.totalNewComplaints} Complaints
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


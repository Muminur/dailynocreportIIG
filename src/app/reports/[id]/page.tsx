'use client';

/**
 * Report Editor Page
 * Edit and manage individual reports
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EditableTable from '@/components/report/EditableTable';
import StatisticsPanel from '@/components/report/StatisticsPanel';
import ExportButtons from '@/components/report/ExportButtons';
import { useAutoSave } from '@/hooks/useAutoSave';
import { recalculateStatistics } from '@/lib/report/statistics';
import type { ReportEntry, ReportStatistics } from '@/types';

interface Report {
  _id: string;
  userId: string;
  date: Date;
  entries: ReportEntry[];
  statistics: ReportStatistics;
}

export default function ReportEditorPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [entries, setEntries] = useState<ReportEntry[]>([]);
  const [statistics, setStatistics] = useState<ReportStatistics>({
    totalServices: 0,
    totalNewComplaints: 0,
    recurringComplaints: 0,
    complaintsUnresolved: 0,
    complaintsResolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch report on mount
  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/reports/${reportId}`);
        if (!res.ok) throw new Error('Failed to fetch report');
        
        const data = await res.json();
        setReport(data.report);
        setEntries(data.report.entries);
        setStatistics(data.report.statistics);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [reportId]);

  // Update statistics when entries change
  useEffect(() => {
    const newStats = recalculateStatistics(entries);
    setStatistics(newStats);
  }, [entries]);

  // Auto-save function
  const saveReport = useCallback(async () => {
    const res = await fetch(`/api/reports/${reportId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries, statistics }),
    });

    if (!res.ok) throw new Error('Failed to save report');
  }, [reportId, entries, statistics]);

  // Auto-save with debouncing
  const { isSaving, lastSaved, error: saveError } = useAutoSave({
    data: { entries, statistics },
    onSave: saveReport,
    delay: 2000,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Report Editor
            </h1>
            <p className="text-gray-600">
              {report?.date ? new Date(report.date).toLocaleDateString() : ''}
            </p>
          </div>
          
          {/* Save Status & Export */}
          <div className="flex items-center gap-4">
            {isSaving && (
              <span className="text-sm text-gray-500">Saving...</span>
            )}
            {!isSaving && lastSaved && (
              <span className="text-sm text-green-600">
                Saved {new Date(lastSaved).toLocaleTimeString()}
              </span>
            )}
            {saveError && (
              <span className="text-sm text-red-600">Error: {saveError}</span>
            )}
            <ExportButtons reportId={reportId} />
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Statistics Panel */}
        <div className="mb-6">
          <StatisticsPanel statistics={statistics} />
        </div>

        {/* Editable Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <EditableTable data={entries} onChange={setEntries} />
        </div>
      </div>
    </div>
  );
}


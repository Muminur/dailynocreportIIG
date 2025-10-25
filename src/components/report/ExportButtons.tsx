'use client';

/**
 * Export Buttons Component
 */

import { useState } from 'react';

interface ExportButtonsProps {
  reportId: string;
}

export default function ExportButtons({ reportId }: ExportButtonsProps) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async (format: 'xlsx' | 'pdf') => {
    try {
      setExporting(true);
      setError(null);

      const res = await fetch(`/api/reports/${reportId}/export?format=${format}`);
      
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={() => handleExport('xlsx')}
        disabled={exporting}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        {exporting ? 'Exporting...' : 'Export XLSX'}
      </button>
      <button
        onClick={() => handleExport('pdf')}
        disabled={exporting}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
      >
        {exporting ? 'Exporting...' : 'Export PDF'}
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}


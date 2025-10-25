/**
 * PDF Export Service
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ReportEntry, ReportStatistics } from '@/types';

interface ExportData {
  date: Date;
  entries: ReportEntry[];
  statistics: ReportStatistics;
}

export function generatePDF(data: ExportData): Blob {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('NOC Daily Report', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(data.date.toLocaleDateString(), pageWidth / 2, 28, { align: 'center' });

  // Statistics
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary Statistics', 14, 40);

  const statsData = [
    ['Total Entries', data.entries.length.toString()],
    ['Total Services', data.statistics.totalServices.toString()],
    ['New Complaints', data.statistics.totalNewComplaints.toString()],
    ['Recurring Complaints', data.statistics.recurringComplaints.toString()],
    ['Unresolved Complaints', data.statistics.complaintsUnresolved.toString()],
    ['Resolved Complaints', data.statistics.complaintsResolved.toString()],
  ];

  autoTable(doc, {
    startY: 45,
    head: [['Metric', 'Value']],
    body: statsData,
    theme: 'grid',
    headStyles: { fillColor: [68, 114, 196] },
  });

  // Entries Table
  const finalY = (doc as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || 45;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Report Entries', 14, finalY + 15);

  const entriesData = data.entries.map((entry) => [
    entry.category,
    new Date(entry.dateTime).toLocaleString(),
    entry.clientVendor,
    entry.cause,
    entry.downtime,
    entry.type,
  ]);

  autoTable(doc, {
    startY: finalY + 20,
    head: [['Category', 'Date/Time', 'Client/Vendor', 'Cause', 'Downtime', 'Type']],
    body: entriesData,
    theme: 'striped',
    headStyles: { fillColor: [112, 173, 71] },
    styles: { fontSize: 8 },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc.output('blob');
}


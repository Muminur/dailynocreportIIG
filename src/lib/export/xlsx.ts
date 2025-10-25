/**
 * XLSX Export Service
 */

import ExcelJS from 'exceljs';
import type { ReportEntry, ReportStatistics } from '@/types';

interface ExportData {
  date: Date;
  entries: ReportEntry[];
  statistics: ReportStatistics;
}

export async function generateXLSX(data: ExportData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'NOC Report Generator';
  workbook.created = new Date();

  // Summary Sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 30 },
    { header: 'Value', key: 'value', width: 15 },
  ];

  summarySheet.addRows([
    { metric: 'Report Date', value: data.date.toLocaleDateString() },
    { metric: 'Total Entries', value: data.entries.length },
    { metric: 'Total Services', value: data.statistics.totalServices },
    { metric: 'New Complaints', value: data.statistics.totalNewComplaints },
    { metric: 'Recurring Complaints', value: data.statistics.recurringComplaints },
    { metric: 'Unresolved Complaints', value: data.statistics.complaintsUnresolved },
    { metric: 'Resolved Complaints', value: data.statistics.complaintsResolved },
  ]);

  summarySheet.getRow(1).font = { bold: true };
  summarySheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };

  // Data Sheet
  const dataSheet = workbook.addWorksheet('All Entries');
  dataSheet.columns = [
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Date/Time', key: 'dateTime', width: 20 },
    { header: 'Client/Vendor', key: 'clientVendor', width: 25 },
    { header: 'Cause', key: 'cause', width: 30 },
    { header: 'Downtime', key: 'downtime', width: 15 },
    { header: 'Type', key: 'type', width: 12 },
    { header: 'Remarks', key: 'remarks', width: 35 },
  ];

  data.entries.forEach((entry) => {
    dataSheet.addRow({
      category: entry.category,
      dateTime: new Date(entry.dateTime).toLocaleString(),
      clientVendor: entry.clientVendor,
      cause: entry.cause,
      downtime: entry.downtime,
      type: entry.type,
      remarks: entry.remarks,
    });
  });

  dataSheet.getRow(1).font = { bold: true };
  dataSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF70AD47' },
  };

  // Category Sheets
  const categories = ['Backhaul', 'Upstreams', 'IPT Client', 'ISP Client'];
  categories.forEach((category) => {
    const entries = data.entries.filter((e) => e.category === category);
    if (entries.length === 0) return;

    const sheet = workbook.addWorksheet(category);
    sheet.columns = dataSheet.columns;
    
    entries.forEach((entry) => {
      sheet.addRow({
        category: entry.category,
        dateTime: new Date(entry.dateTime).toLocaleString(),
        clientVendor: entry.clientVendor,
        cause: entry.cause,
        downtime: entry.downtime,
        type: entry.type,
        remarks: entry.remarks,
      });
    });

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFC000' },
    };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}


/**
 * PDF Export Tests
 */

import { generatePDF } from '@/lib/export/pdf';
import type { ReportEntry, ReportStatistics } from '@/types';

describe('PDF Export', () => {
  const mockDate = new Date('2025-10-28');
  const mockEntries: ReportEntry[] = [
    {
      id: '1',
      category: 'Backhaul',
      dateTime: new Date('2025-10-28T10:00:00'),
      clientVendor: 'Vendor A',
      cause: 'Fiber cut',
      downtime: '2 hours',
      type: 'Service',
      remarks: 'Resolved',
      emailId: 'email-1',
      isManuallyAdded: false,
      isEdited: false,
    },
    {
      id: '2',
      category: 'ISP Client',
      dateTime: new Date('2025-10-28T14:00:00'),
      clientVendor: 'Client B',
      cause: 'Slow internet',
      downtime: '1 hour',
      type: 'Complain',
      remarks: 'Pending',
      emailId: 'email-2',
      isManuallyAdded: false,
      isEdited: false,
    },
  ];

  const mockStatistics: ReportStatistics = {
    totalServices: 1,
    totalNewComplaints: 1,
    recurringComplaints: 0,
    complaintsUnresolved: 1,
    complaintsResolved: 0,
  };

  it('should generate PDF blob successfully', () => {
    const exportData = {
      date: mockDate,
      entries: mockEntries,
      statistics: mockStatistics,
    };

    const blob = generatePDF(exportData);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
    expect(blob.type).toBe('application/pdf');
  });

  it('should handle empty entries gracefully', () => {
    const exportData = {
      date: mockDate,
      entries: [],
      statistics: {
        totalServices: 0,
        totalNewComplaints: 0,
        recurringComplaints: 0,
        complaintsUnresolved: 0,
        complaintsResolved: 0,
      },
    };

    const blob = generatePDF(exportData);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });

  it('should generate PDF with large dataset', () => {
    const largeEntries: ReportEntry[] = Array.from({ length: 50 }, (_, i) => ({
      id: `${i + 1}`,
      category: 'Backhaul' as const,
      dateTime: new Date('2025-10-28T10:00:00'),
      clientVendor: `Vendor ${i + 1}`,
      cause: `Issue ${i + 1}`,
      downtime: '1 hour',
      type: 'Service' as const,
      remarks: 'Resolved',
      emailId: `email-${i + 1}`,
      isManuallyAdded: false,
      isEdited: false,
    }));

    const exportData = {
      date: mockDate,
      entries: largeEntries,
      statistics: {
        totalServices: 50,
        totalNewComplaints: 0,
        recurringComplaints: 0,
        complaintsUnresolved: 0,
        complaintsResolved: 0,
      },
    };

    const blob = generatePDF(exportData);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });

  it('should handle special characters in data', () => {
    const specialEntries: ReportEntry[] = [
      {
        id: '1',
        category: 'Backhaul',
        dateTime: new Date('2025-10-28T10:00:00'),
        clientVendor: 'Vendor & Co.',
        cause: 'Issue with "quotes" and <tags>',
        downtime: '2 hours',
        type: 'Service',
        remarks: 'Special chars: © ® ™',
        emailId: 'email-1',
        isManuallyAdded: false,
        isEdited: false,
      },
    ];

    const exportData = {
      date: mockDate,
      entries: specialEntries,
      statistics: mockStatistics,
    };

    const blob = generatePDF(exportData);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });
});


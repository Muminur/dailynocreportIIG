/**
 * XLSX Export Tests
 */

import { generateXLSX } from '@/lib/export/xlsx';
import type { ReportEntry, ReportStatistics } from '@/types';

// Mock ExcelJS
const mockWriteBuffer = jest.fn().mockResolvedValue(Buffer.from('mock-excel-data'));
const mockAddWorksheet = jest.fn().mockReturnValue({
  columns: [],
  addRows: jest.fn(),
  addRow: jest.fn(),
  getRow: jest.fn().mockReturnValue({
    font: {},
    fill: {},
  }),
});

jest.mock('exceljs', () => {
  return {
    __esModule: true,
    default: {
      Workbook: jest.fn().mockImplementation(() => ({
        creator: '',
        created: new Date(),
        addWorksheet: mockAddWorksheet,
        getWorksheet: jest.fn(),
        xlsx: {
          writeBuffer: mockWriteBuffer,
        },
      })),
    },
  };
});

describe('XLSX Export', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate XLSX buffer successfully', async () => {
    const exportData = {
      date: mockDate,
      entries: mockEntries,
      statistics: mockStatistics,
    };

    const buffer = await generateXLSX(exportData);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
    expect(mockWriteBuffer).toHaveBeenCalled();
  });

  it('should create Summary sheet', async () => {
    const exportData = {
      date: mockDate,
      entries: mockEntries,
      statistics: mockStatistics,
    };

    await generateXLSX(exportData);

    expect(mockAddWorksheet).toHaveBeenCalledWith('Summary');
  });

  it('should create All Entries sheet', async () => {
    const exportData = {
      date: mockDate,
      entries: mockEntries,
      statistics: mockStatistics,
    };

    await generateXLSX(exportData);

    expect(mockAddWorksheet).toHaveBeenCalledWith('All Entries');
  });

  it('should create category-specific sheets', async () => {
    const exportData = {
      date: mockDate,
      entries: mockEntries,
      statistics: mockStatistics,
    };

    await generateXLSX(exportData);

    expect(mockAddWorksheet).toHaveBeenCalledWith('Backhaul');
    expect(mockAddWorksheet).toHaveBeenCalledWith('ISP Client');
  });

  it('should handle empty entries gracefully', async () => {
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

    const buffer = await generateXLSX(exportData);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('should call workbook methods correctly', async () => {
    const exportData = {
      date: mockDate,
      entries: mockEntries,
      statistics: mockStatistics,
    };

    await generateXLSX(exportData);

    // Should create multiple worksheets
    expect(mockAddWorksheet).toHaveBeenCalledTimes(4); // Summary, All Entries, Backhaul, ISP Client
    expect(mockWriteBuffer).toHaveBeenCalledTimes(1);
  });
});


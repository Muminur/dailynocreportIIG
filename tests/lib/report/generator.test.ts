/**
 * Report Generator Tests
 */

// Mock dependencies
jest.mock('@/lib/db/models', () => ({
  ReportModel: {
    findByUserAndDate: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

import { generateReport, saveReport } from '@/lib/report/generator';
import { ReportModel } from '@/lib/db/models';

describe('Report Generator', () => {
  const testDate = new Date('2025-10-24');
  const userId = 'user@example.com';

  const mockEmails = [
    {
      id: 'email-1',
      subject: 'Backhaul Issue',
      body: 'Network problem',
      receivedDateTime: new Date('2025-10-24T10:00:00Z'),
    },
    {
      id: 'email-2',
      subject: 'Service Maintenance',
      body: 'Scheduled upgrade',
      receivedDateTime: new Date('2025-10-24T11:00:00Z'),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateReport', () => {
    it('should generate report from emails', async () => {
      const result = await generateReport(userId, testDate, mockEmails);

      expect(result).toBeDefined();
      expect(result.entries).toHaveLength(2);
      expect(result.statistics).toBeDefined();
    });

    it('should sort entries chronologically', async () => {
      const result = await generateReport(userId, testDate, mockEmails);

      expect(result.entries[0].dateTime.getTime()).toBeLessThanOrEqual(
        result.entries[1].dateTime.getTime()
      );
    });

    it('should calculate statistics', async () => {
      const result = await generateReport(userId, testDate, mockEmails);

      expect(result.statistics.totalServices).toBeGreaterThanOrEqual(0);
      expect(result.statistics.totalNewComplaints).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty email list', async () => {
      const result = await generateReport(userId, testDate, []);

      expect(result.entries).toHaveLength(0);
      expect(result.statistics.totalServices).toBe(0);
      expect(result.statistics.totalNewComplaints).toBe(0);
    });

    it('should mark entries as not manually added', async () => {
      const result = await generateReport(userId, testDate, mockEmails);

      result.entries.forEach(entry => {
        expect(entry.isManuallyAdded).toBe(false);
        expect(entry.isEdited).toBe(false);
      });
    });
  });

  describe('saveReport', () => {
    it('should create new report if none exists', async () => {
      (ReportModel.findByUserAndDate as jest.Mock).mockResolvedValue(null);
      (ReportModel.create as jest.Mock).mockResolvedValue({ _id: 'report-1' });

      const entries = [];
      const statistics = {
        totalServices: 0,
        totalNewComplaints: 0,
        recurringComplaints: 0,
        complaintsUnresolved: 0,
        complaintsResolved: 0,
      };

      await saveReport(userId, testDate, entries, statistics);

      expect(ReportModel.create).toHaveBeenCalled();
      expect(ReportModel.update).not.toHaveBeenCalled();
    });

    it('should update existing report', async () => {
      (ReportModel.findByUserAndDate as jest.Mock).mockResolvedValue({
        _id: 'existing-report',
      });
      (ReportModel.update as jest.Mock).mockResolvedValue({ _id: 'existing-report' });

      const entries = [];
      const statistics = {
        totalServices: 0,
        totalNewComplaints: 0,
        recurringComplaints: 0,
        complaintsUnresolved: 0,
        complaintsResolved: 0,
      };

      await saveReport(userId, testDate, entries, statistics);

      expect(ReportModel.update).toHaveBeenCalled();
      expect(ReportModel.create).not.toHaveBeenCalled();
    });
  });
});


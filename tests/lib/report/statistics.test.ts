/**
 * Statistics Calculation Tests
 */

import { calculateStatistics, recalculateStatistics } from '@/lib/report/statistics';
import type { ReportEntry } from '@/types';

describe('Statistics Calculation', () => {
  const mockEntries: ReportEntry[] = [
    {
      id: '1',
      category: 'Backhaul',
      dateTime: new Date('2025-10-24T10:00:00Z'),
      clientVendor: 'Client A',
      cause: 'Issue 1',
      downtime: '1 hour',
      type: 'Service',
      remarks: 'Service work',
      isManuallyAdded: false,
      isEdited: false,
    },
    {
      id: '2',
      category: 'Upstreams',
      dateTime: new Date('2025-10-24T11:00:00Z'),
      clientVendor: 'Client B',
      cause: 'Issue 2',
      downtime: '2 hours',
      type: 'Complain',
      remarks: 'Complaint',
      isManuallyAdded: false,
      isEdited: false,
    },
    {
      id: '3',
      category: 'IPT Client',
      dateTime: new Date('2025-10-24T12:00:00Z'),
      clientVendor: 'Client B',
      cause: 'Issue 3',
      downtime: '30 min',
      type: 'Complain',
      remarks: 'Another complaint',
      isManuallyAdded: false,
      isEdited: false,
    },
  ];

  describe('calculateStatistics', () => {
    it('should count services correctly', () => {
      const stats = calculateStatistics(mockEntries);
      expect(stats.totalServices).toBe(1);
    });

    it('should count complaints correctly', () => {
      const stats = calculateStatistics(mockEntries);
      expect(stats.totalNewComplaints).toBe(2);
    });

    it('should detect recurring complaints', () => {
      const stats = calculateStatistics(mockEntries);
      expect(stats.recurringComplaints).toBe(1); // Client B appears twice
    });

    it('should default unresolved to complaint count', () => {
      const stats = calculateStatistics(mockEntries);
      expect(stats.complaintsUnresolved).toBe(2);
    });

    it('should handle empty entries', () => {
      const stats = calculateStatistics([]);
      expect(stats.totalServices).toBe(0);
      expect(stats.totalNewComplaints).toBe(0);
      expect(stats.recurringComplaints).toBe(0);
    });

    it('should handle only services', () => {
      const serviceEntries: ReportEntry[] = [
        {
          ...mockEntries[0],
          id: 's1',
          type: 'Service',
        },
        {
          ...mockEntries[0],
          id: 's2',
          type: 'Service',
        },
      ];
      const stats = calculateStatistics(serviceEntries);
      expect(stats.totalServices).toBe(2);
      expect(stats.totalNewComplaints).toBe(0);
    });

    it('should handle only complaints', () => {
      const complaintEntries: ReportEntry[] = [
        {
          ...mockEntries[0],
          id: 'c1',
          type: 'Complain',
        },
        {
          ...mockEntries[0],
          id: 'c2',
          type: 'Complain',
        },
      ];
      const stats = calculateStatistics(complaintEntries);
      expect(stats.totalServices).toBe(0);
      expect(stats.totalNewComplaints).toBe(2);
    });
  });

  describe('recalculateStatistics', () => {
    it('should recalculate when entries change', () => {
      const stats1 = recalculateStatistics(mockEntries);
      expect(stats1.totalServices).toBe(1);

      const newEntries = [
        ...mockEntries,
        {
          ...mockEntries[0],
          id: '4',
          type: 'Service' as const,
        },
      ];
      
      const stats2 = recalculateStatistics(newEntries);
      expect(stats2.totalServices).toBe(2);
    });
  });
});


/**
 * Statistics Calculation Service
 * Minimal implementation for report statistics
 */

import type { ReportEntry, ReportStatistics } from '@/types';

/**
 * Calculate statistics from report entries
 */
export function calculateStatistics(entries: ReportEntry[]): ReportStatistics {
  const services = entries.filter(e => e.type === 'Service');
  const complaints = entries.filter(e => e.type === 'Complain');

  // Group complaints by client/vendor for recurring detection
  const complaintsByClient = new Map<string, number>();
  complaints.forEach(c => {
    const key = c.clientVendor.toLowerCase();
    complaintsByClient.set(key, (complaintsByClient.get(key) || 0) + 1);
  });

  const recurringComplaints = Array.from(complaintsByClient.values())
    .filter(count => count > 1).length;

  return {
    totalServices: services.length,
    totalNewComplaints: complaints.length,
    recurringComplaints,
    complaintsUnresolved: complaints.length, // Default: all unresolved
    complaintsResolved: 0, // TODO: Implement resolved tracking
  };
}

/**
 * Recalculate statistics when entries change
 */
export function recalculateStatistics(entries: ReportEntry[]): ReportStatistics {
  return calculateStatistics(entries);
}


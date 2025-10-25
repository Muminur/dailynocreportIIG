/**
 * Report Generator Service
 * Minimal implementation for generating NOC reports from parsed emails
 */

import { ReportModel } from '@/lib/db/models';
import { parseEmail } from '@/lib/email/parser';
import type { ReportEntry, ReportStatistics } from '@/types';
import { randomUUID } from 'crypto';

interface EmailData {
  id: string;
  subject: string;
  body: string;
  receivedDateTime: Date;
}

/**
 * Generate report from emails
 */
export async function generateReport(
  _userId: string,
  _date: Date,
  emails: EmailData[]
): Promise<{ entries: ReportEntry[]; statistics: ReportStatistics }> {
  // Parse all emails
  const entries = emails.map(email => parseEmailToEntry(email));
  
  // Sort chronologically
  entries.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
  
  // Calculate statistics
  const statistics = calculateStatistics(entries);
  
  return { entries, statistics };
}

/**
 * Parse email to report entry
 */
function parseEmailToEntry(email: EmailData): ReportEntry {
  const parsed = parseEmail(email.subject, email.body, email.receivedDateTime);
  
  return {
    id: randomUUID(),
    category: parsed.category || 'Uncategorized',
    dateTime: parsed.dateTime || email.receivedDateTime,
    clientVendor: parsed.clientVendor || 'Unknown',
    cause: parsed.cause || 'Not specified',
    downtime: parsed.downtime || 'N/A',
    type: parsed.type || 'Complain',
    remarks: parsed.remarks || email.subject,
    emailId: email.id,
    isManuallyAdded: false,
    isEdited: false,
  };
}

/**
 * Calculate report statistics
 */
function calculateStatistics(entries: ReportEntry[]): ReportStatistics {
  const services = entries.filter(e => e.type === 'Service');
  const complaints = entries.filter(e => e.type === 'Complain');
  
  return {
    totalServices: services.length,
    totalNewComplaints: complaints.length,
    recurringComplaints: 0, // TODO: Implement recurring detection
    complaintsUnresolved: complaints.length, // Default: all unresolved
    complaintsResolved: 0,
  };
}

/**
 * Save report to database
 */
export async function saveReport(
  userId: string,
  date: Date,
  entries: ReportEntry[],
  statistics: ReportStatistics
) {
  // Check if report exists for this date
  const existing = await ReportModel.findByUserAndDate(userId, date);
  
  if (existing) {
    // Update existing report
    return await ReportModel.update(existing._id!.toString(), {
      entries,
      statistics,
      updatedAt: new Date(),
    });
  }
  
  // Create new report
  return await ReportModel.create({
    userId,
    date,
    timezone: 'Asia/Dhaka',
    entries,
    statistics,
    lastModifiedBy: userId,
  });
}


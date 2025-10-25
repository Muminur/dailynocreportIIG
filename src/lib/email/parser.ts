/**
 * Email Parser Service
 * Minimal, clean implementation for extracting NOC report data from emails
 */

import type { Category, EntryType } from '@/types';

export interface ParsedEmail {
  dateTime?: Date;
  clientVendor?: string;
  cause?: string;
  downtime?: string;
  remarks?: string;
  category?: Category;
  type?: EntryType;
}

/**
 * Parse email subject and body to extract report data
 */
export function parseEmail(subject: string, body: string, receivedDateTime: Date): ParsedEmail {
  const text = `${subject}\n${body}`.toLowerCase();
  
  return {
    dateTime: extractDateTime(text, receivedDateTime),
    clientVendor: extractClientVendor(text),
    cause: extractCause(text),
    downtime: extractDowntime(text),
    remarks: extractRemarks(subject, body),
    category: categorizeEmail(text),
    type: classifyType(text),
  };
}

/**
 * Extract date/time from email text
 */
function extractDateTime(_text: string, fallback: Date): Date {
  // For now, use received time as fallback
  // TODO: Implement pattern matching if needed
  return fallback;
}

/**
 * Extract client/vendor name
 */
function extractClientVendor(text: string): string {
  // Common patterns: "client:", "vendor:", company names
  const patterns = [
    /(?:client|vendor)[\s:]+([^\n,.]+)/i,
    /(?:company|customer)[\s:]+([^\n,.]+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1].trim();
  }
  
  return 'Unknown';
}

/**
 * Extract cause/issue description
 */
function extractCause(text: string): string {
  // Look for: "issue:", "problem:", "cause:", "reason:"
  const patterns = [
    /(?:issue|problem|cause|reason)[\s:]+([^\n.]{10,100})/i,
    /(?:down|outage|failure)[\s:]+([^\n.]{10,100})/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1].trim();
  }
  
  return 'Not specified';
}

/**
 * Extract downtime information
 */
function extractDowntime(text: string): string {
  // Look for duration patterns: "2 hours", "30 minutes", "1h 30m"
  const patterns = [
    /(\d+\s*(?:hour|hr|h)(?:s)?(?:\s*\d+\s*(?:minute|min|m)(?:s)?)?)/i,
    /(\d+\s*(?:minute|min|m)(?:s)?)/i,
    /downtime[\s:]+([^\n,]{5,30})/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1].trim();
  }
  
  return 'N/A';
}

/**
 * Extract remarks (use subject as default)
 */
function extractRemarks(subject: string, body: string): string {
  // Use first line of subject or body as remarks
  return subject || (body?.split('\n')[0] || '').substring(0, 100);
}

/**
 * Categorize email based on keywords
 */
function categorizeEmail(text: string): Category {
  // Check more specific patterns first
  if (text.includes('isp client') || text.includes('broadband')) {
    return 'ISP Client';
  }
  
  if (text.includes('ipt') || text.includes('voip') || text.includes('sip')) {
    return 'IPT Client';
  }
  
  if (text.includes('backhaul') || text.includes('backbone') || text.includes('transmission')) {
    return 'Backhaul';
  }
  
  if (text.includes('upstream') || text.includes('isp') || text.includes('provider') || text.includes('transit')) {
    return 'Upstreams';
  }
  
  return 'Uncategorized';
}

/**
 * Classify as Service or Complaint
 */
function classifyType(text: string): EntryType {
  const complaintKeywords = ['complaint', 'complain', 'issue', 'problem', 'down', 'outage'];
  const serviceKeywords = ['service', 'maintenance', 'scheduled', 'upgrade'];
  
  const hasComplaint = complaintKeywords.some(kw => text.includes(kw));
  const hasService = serviceKeywords.some(kw => text.includes(kw));
  
  // Service takes precedence over complaint
  return hasService ? 'Service' : hasComplaint ? 'Complain' : 'Complain';
}


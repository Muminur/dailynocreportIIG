/**
 * Core type definitions for the NOC Email Report Generator
 */

/**
 * User authentication types
 */
export interface User {
  id: string;
  email: string;
  name: string;
  microsoftId: string;
  lastLogin: Date;
}

/**
 * Email entry categories
 */
export type Category = 'Backhaul' | 'Upstreams' | 'IPT Client' | 'ISP Client' | 'Uncategorized';

/**
 * Entry type classification
 */
export type EntryType = 'Service' | 'Complain';

/**
 * Report entry structure
 */
export interface ReportEntry {
  id: string;
  category: Category;
  dateTime: Date;
  clientVendor: string;
  cause: string;
  downtime: string;
  type: EntryType;
  remarks: string;
  emailId?: string;
  isManuallyAdded: boolean;
  isEdited: boolean;
}

/**
 * Report statistics summary
 */
export interface ReportStatistics {
  totalServices: number;
  totalNewComplaints: number;
  recurringComplaints: number;
  complaintsUnresolved: number;
  complaintsResolved: number;
}

/**
 * Complete report structure
 */
export interface Report {
  id: string;
  userId: string;
  date: Date;
  timezone: string;
  entries: ReportEntry[];
  statistics: ReportStatistics;
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: string;
}

/**
 * Microsoft Graph API email structure
 */
export interface GraphEmail {
  id: string;
  subject: string;
  from: {
    emailAddress: {
      name: string;
      address: string;
    };
  };
  receivedDateTime: string;
  body: {
    contentType: string;
    content: string;
  };
  toRecipients: Array<{
    emailAddress: {
      name: string;
      address: string;
    };
  }>;
}

/**
 * Parsed email data
 */
export interface ParsedEmailData {
  category: Category;
  dateTime: Date;
  clientVendor: string;
  cause: string;
  downtime: string;
  type: EntryType;
  remarks: string;
  confidence: number;
}

/**
 * Export options
 */
export interface ExportOptions {
  format: 'xlsx' | 'pdf';
  includeStatistics: boolean;
  filename?: string;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}


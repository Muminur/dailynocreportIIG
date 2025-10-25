/**
 * Validation Schemas (Zod)
 */

import { z } from 'zod';

export const ReportEntrySchema = z.object({
  id: z.string(),
  category: z.enum(['Backhaul', 'Upstreams', 'IPT Client', 'ISP Client', 'Uncategorized']),
  dateTime: z.date(),
  clientVendor: z.string().min(1, 'Client/Vendor required'),
  cause: z.string().min(1, 'Cause required'),
  downtime: z.string(),
  type: z.enum(['Service', 'Complain']),
  remarks: z.string(),
  emailId: z.string().optional(),
  isManuallyAdded: z.boolean(),
  isEdited: z.boolean(),
});

export const ReportSchema = z.object({
  date: z.date(),
  entries: z.array(ReportEntrySchema),
  statistics: z.object({
    totalServices: z.number().min(0),
    totalNewComplaints: z.number().min(0),
    recurringComplaints: z.number().min(0),
    complaintsUnresolved: z.number().min(0),
    complaintsResolved: z.number().min(0),
  }),
});

export const EmailFetchSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
});

export const ReportUpdateSchema = z.object({
  entries: z.array(ReportEntrySchema),
  statistics: z.object({
    totalServices: z.number().min(0),
    totalNewComplaints: z.number().min(0),
    recurringComplaints: z.number().min(0),
    complaintsUnresolved: z.number().min(0),
    complaintsResolved: z.number().min(0),
  }),
});


/**
 * Validation Schema Tests
 */

import { ReportEntrySchema, ReportSchema, EmailFetchSchema } from '@/lib/validation/schemas';

describe('Validation Schemas', () => {
  describe('ReportEntrySchema', () => {
    it('should validate correct entry', () => {
      const entry = {
        id: '1',
        category: 'Backhaul',
        dateTime: new Date(),
        clientVendor: 'Client A',
        cause: 'Issue',
        downtime: '1 hour',
        type: 'Service',
        remarks: 'Test',
        isManuallyAdded: false,
        isEdited: false,
      };
      expect(() => ReportEntrySchema.parse(entry)).not.toThrow();
    });

    it('should reject invalid category', () => {
      const entry = {
        id: '1',
        category: 'Invalid',
        dateTime: new Date(),
        clientVendor: 'Client A',
        cause: 'Issue',
        downtime: '1 hour',
        type: 'Service',
        remarks: 'Test',
        isManuallyAdded: false,
        isEdited: false,
      };
      expect(() => ReportEntrySchema.parse(entry)).toThrow();
    });
  });

  describe('EmailFetchSchema', () => {
    it('should validate correct date format', () => {
      expect(() => EmailFetchSchema.parse({ date: '2025-10-24' })).not.toThrow();
    });

    it('should reject invalid date format', () => {
      expect(() => EmailFetchSchema.parse({ date: '24-10-2025' })).toThrow();
    });
  });
});


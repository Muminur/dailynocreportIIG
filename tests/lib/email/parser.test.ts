/**
 * Email Parser Tests
 */

import { parseEmail } from '@/lib/email/parser';

describe('Email Parser', () => {
  const testDate = new Date('2025-10-24T10:00:00Z');

  describe('parseEmail', () => {
    it('should parse email with all fields', () => {
      const subject = 'Backhaul Issue - Client: Acme Corp';
      const body = 'Issue: Fiber cut\nDowntime: 2 hours\nService complaint received';

      const result = parseEmail(subject, body, testDate);

      expect(result).toBeDefined();
      expect(result.category).toBe('Backhaul');
      expect(result.type).toBeDefined();
    });

    it('should categorize Backhaul emails', () => {
      const result = parseEmail('Backhaul network issue', 'Core network problem', testDate);
      expect(result.category).toBe('Backhaul');
    });

    it('should categorize Upstreams emails', () => {
      const result = parseEmail('Upstream provider down', 'ISP transit issue', testDate);
      expect(result.category).toBe('Upstreams');
    });

    it('should categorize IPT Client emails', () => {
      const result = parseEmail('IPT service issue', 'VOIP problem reported', testDate);
      expect(result.category).toBe('IPT Client');
    });

    it('should categorize ISP Client emails', () => {
      const result = parseEmail('ISP Client complaint', 'Broadband service down', testDate);
      expect(result.category).toBe('ISP Client');
    });

    it('should default to Uncategorized', () => {
      const result = parseEmail('Random email', 'No specific keywords', testDate);
      expect(result.category).toBe('Uncategorized');
    });

    it('should classify as Service', () => {
      const result = parseEmail('Scheduled maintenance', 'Service upgrade planned', testDate);
      expect(result.type).toBe('Service');
    });

    it('should classify as Complain', () => {
      const result = parseEmail('Network down', 'Outage reported by client', testDate);
      expect(result.type).toBe('Complain');
    });

    it('should extract client vendor', () => {
      const result = parseEmail('Issue', 'Client: Acme Corporation reported problem', testDate);
      expect(result.clientVendor).toBeDefined();
    });

    it('should extract cause', () => {
      const result = parseEmail('Outage', 'Cause: Fiber cut on main link', testDate);
      expect(result.cause).toBeDefined();
    });

    it('should extract downtime', () => {
      const result = parseEmail('Issue', 'Downtime: 2 hours 30 minutes', testDate);
      expect(result.downtime).toBeDefined();
    });

    it('should use received date as fallback', () => {
      const result = parseEmail('Test', 'No date info', testDate);
      expect(result.dateTime).toEqual(testDate);
    });

    it('should handle empty subject', () => {
      const result = parseEmail('', 'Body text', testDate);
      expect(result).toBeDefined();
      expect(result.remarks).toBeDefined();
    });

    it('should handle empty body', () => {
      const result = parseEmail('Subject text', '', testDate);
      expect(result).toBeDefined();
      expect(result.remarks).toBe('Subject text');
    });
  });
});


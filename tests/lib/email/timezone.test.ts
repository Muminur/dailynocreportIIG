/**
 * Timezone Utilities Tests
 */

import {
  toGMT6,
  fromGMT6,
  formatDateForFilter,
  formatDateTimeGMT6,
  getTodayGMT6,
} from '@/lib/email/timezone';

describe('Timezone Utilities', () => {
  describe('toGMT6', () => {
    it('should convert UTC date to GMT+6', () => {
      const utcDate = new Date('2025-10-24T00:00:00.000Z');
      const gmt6Date = toGMT6(utcDate);
      
      // GMT+6 is 6 hours ahead
      expect(gmt6Date.getHours()).toBe(6);
    });

    it('should handle dates across day boundaries', () => {
      const utcDate = new Date('2025-10-24T20:00:00.000Z');
      const gmt6Date = toGMT6(utcDate);
      
      // 20:00 UTC + 6 hours = 02:00 next day
      expect(gmt6Date.getHours()).toBe(2);
      expect(gmt6Date.getDate()).toBe(25);
    });
  });

  describe('fromGMT6', () => {
    it('should convert GMT+6 date to UTC', () => {
      const gmt6Date = new Date('2025-10-24T06:00:00.000+06:00');
      const utcDate = fromGMT6(gmt6Date);
      
      // Should be 6 hours earlier in UTC
      expect(utcDate.toISOString()).toContain('T00:00:00');
    });
  });

  describe('formatDateForFilter', () => {
    it('should format date as ISO 8601 string', () => {
      const date = new Date('2025-10-24T12:30:45.123Z');
      const formatted = formatDateForFilter(date);
      
      expect(formatted).toBe('2025-10-24T12:30:45.123Z');
    });

    it('should handle different dates correctly', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const formatted = formatDateForFilter(date);
      
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('formatDateTimeGMT6', () => {
    it('should format date in GMT+6 timezone', () => {
      const date = new Date('2025-10-24T00:00:00.000Z');
      const formatted = formatDateTimeGMT6(date);
      
      // Should show 06:00:00 in GMT+6
      expect(formatted).toContain('06:00:00');
      expect(formatted).toContain('2025-10-24');
    });

    it('should use correct format pattern', () => {
      const date = new Date('2025-10-24T12:30:45.000Z');
      const formatted = formatDateTimeGMT6(date);
      
      // Format: yyyy-MM-dd HH:mm:ss
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('getTodayGMT6', () => {
    it('should return today at midnight in GMT+6', () => {
      const today = getTodayGMT6();
      
      expect(today.getHours()).toBe(0);
      expect(today.getMinutes()).toBe(0);
      expect(today.getSeconds()).toBe(0);
      expect(today.getMilliseconds()).toBe(0);
    });

    it('should return a valid Date object', () => {
      const today = getTodayGMT6();
      
      expect(today).toBeInstanceOf(Date);
      expect(isNaN(today.getTime())).toBe(false);
    });
  });
});


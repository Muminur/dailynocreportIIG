/**
 * Timezone Utilities
 * Handles GMT+6 (Asia/Dhaka) timezone conversions using date-fns-tz
 */

import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';

const DHAKA_TZ = 'Asia/Dhaka'; // GMT+6

/**
 * Convert a date to GMT+6 timezone
 */
export function toGMT6(date: Date): Date {
  return toZonedTime(date, DHAKA_TZ);
}

/**
 * Convert a GMT+6 date to UTC
 */
export function fromGMT6(date: Date): Date {
  return fromZonedTime(date, DHAKA_TZ);
}

/**
 * Format date for Microsoft Graph API filters (ISO 8601)
 */
export function formatDateForFilter(date: Date): string {
  return date.toISOString();
}

/**
 * Format date/time in GMT+6 timezone for display
 */
export function formatDateTimeGMT6(date: Date): string {
  return formatInTimeZone(date, DHAKA_TZ, 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Get today's date at midnight in GMT+6
 */
export function getTodayGMT6(): Date {
  const now = new Date();
  const zonedNow = toZonedTime(now, DHAKA_TZ);
  zonedNow.setHours(0, 0, 0, 0);
  return zonedNow;
}


/**
 * Database Module
 * 
 * Clean exports for database operations
 */

export { getClient, getDb } from './mongodb';
export { initializeDatabase } from './init';
export { UserModel, ReportModel, EmailCacheModel } from './models';
export type { UserDocument, ReportDocument, EmailCacheDocument } from './models';


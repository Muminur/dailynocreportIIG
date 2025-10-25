/**
 * Database Initialization
 * 
 * Creates indexes for all collections
 */

import { getDb } from './mongodb';

export async function initializeDatabase(): Promise<void> {
  const db = await getDb();

  // Users collection indexes
  await db.collection('users').createIndexes([
    { key: { email: 1 }, unique: true, name: 'email_unique' },
    { key: { microsoftId: 1 }, unique: true, name: 'microsoftId_unique' },
    { key: { lastLogin: -1 }, name: 'lastLogin_desc' },
  ]);

  // Reports collection indexes
  await db.collection('reports').createIndexes([
    { key: { userId: 1, date: -1 }, name: 'userId_date' },
    { key: { 'entries.emailId': 1 }, name: 'entries_emailId' },
    { key: { createdAt: -1 }, name: 'createdAt_desc' },
  ]);

  // Email cache collection indexes
  await db.collection('email_cache').createIndexes([
    { key: { userId: 1, emailId: 1 }, unique: true, name: 'userId_emailId_unique' },
    { key: { userId: 1, receivedDateTime: -1 }, name: 'userId_receivedDateTime' },
    { key: { createdAt: 1 }, expireAfterSeconds: 2592000, name: 'ttl_30days' }, // 30 days TTL
  ]);

  console.log('✅ Database indexes created successfully');
}


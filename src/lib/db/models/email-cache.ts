/**
 * Email Cache Model
 * 
 * Type-safe MongoDB operations for email_cache collection
 */

import { Collection, ObjectId } from 'mongodb';
import { getDb } from '../mongodb';

export interface EmailCacheDocument {
  _id?: ObjectId;
  userId: string;
  emailId: string;
  subject: string;
  body: string;
  from: string;
  fromEmail: string;
  receivedDateTime: Date;
  hasAttachments: boolean;
  parsedData?: Record<string, unknown>;
  category?: string;
  createdAt: Date;
}

async function getCollection(): Promise<Collection<EmailCacheDocument>> {
  const db = await getDb();
  return db.collection<EmailCacheDocument>('email_cache');
}

export const EmailCacheModel = {
  /**
   * Find cached email
   */
  async findByEmailId(userId: string, emailId: string): Promise<EmailCacheDocument | null> {
    const collection = await getCollection();
    return collection.findOne({ userId, emailId });
  },

  /**
   * Cache email
   */
  async create(
    email: Omit<EmailCacheDocument, '_id' | 'createdAt'>
  ): Promise<EmailCacheDocument> {
    const collection = await getCollection();
    const now = new Date();
    
    const result = await collection.insertOne({
      ...email,
      createdAt: now,
    } as EmailCacheDocument);

    return { ...email, _id: result.insertedId, createdAt: now };
  },

  /**
   * Get recent emails for user (after a specific date)
   */
  async findRecent(userId: string, afterDate: Date): Promise<EmailCacheDocument[]> {
    const collection = await getCollection();
    return collection
      .find({ 
        userId,
        receivedDateTime: { $gte: afterDate }
      })
      .sort({ receivedDateTime: -1 })
      .toArray();
  },

  /**
   * Get emails for user within a specific date range
   */
  async findByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<EmailCacheDocument[]> {
    const collection = await getCollection();
    return collection
      .find({
        userId,
        receivedDateTime: { $gte: startDate, $lt: endDate }
      })
      .sort({ receivedDateTime: -1 })
      .toArray();
  },
};


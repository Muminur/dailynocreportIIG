/**
 * Report Model
 * 
 * Type-safe MongoDB operations for reports collection
 */

import { Collection, ObjectId } from 'mongodb';
import { getDb } from '../mongodb';
import { ReportEntry, ReportStatistics } from '@/types';

export interface ReportDocument {
  _id?: ObjectId;
  userId: string;
  date: Date;
  timezone: string;
  entries: ReportEntry[];
  statistics: ReportStatistics;
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: string;
}

async function getCollection(): Promise<Collection<ReportDocument>> {
  const db = await getDb();
  return db.collection<ReportDocument>('reports');
}

export const ReportModel = {
  /**
   * Find report by ID
   */
  async findById(id: string): Promise<ReportDocument | null> {
    const collection = await getCollection();
    return collection.findOne({ _id: new ObjectId(id) });
  },

  /**
   * Find report by user and date
   */
  async findByUserAndDate(userId: string, date: Date): Promise<ReportDocument | null> {
    const collection = await getCollection();
    return collection.findOne({ userId, date });
  },

  /**
   * Get user reports (paginated)
   */
  async findByUser(
    userId: string,
    limit: number = 10,
    skip: number = 0
  ): Promise<ReportDocument[]> {
    const collection = await getCollection();
    return collection
      .find({ userId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  },

  /**
   * Create report
   */
  async create(
    report: Omit<ReportDocument, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<ReportDocument> {
    const collection = await getCollection();
    const now = new Date();
    
    const result = await collection.insertOne({
      ...report,
      createdAt: now,
      updatedAt: now,
    } as ReportDocument);

    return { ...report, _id: result.insertedId, createdAt: now, updatedAt: now };
  },

  /**
   * Update report
   */
  async update(
    id: string,
    updates: Partial<ReportDocument>
  ): Promise<ReportDocument | null> {
    const collection = await getCollection();
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    return result;
  },

  /**
   * Delete report
   */
  async delete(id: string): Promise<boolean> {
    const collection = await getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  },
};


/**
 * User Model
 * 
 * Type-safe MongoDB operations for users collection
 */

import { Collection, ObjectId } from 'mongodb';
import { getDb } from '../mongodb';

export interface UserDocument {
  _id?: ObjectId;
  email: string;
  name: string;
  microsoftId: string;
  accessToken?: string; // Encrypted
  refreshToken?: string; // Encrypted
  tokenExpiry?: Date;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

async function getCollection(): Promise<Collection<UserDocument>> {
  const db = await getDb();
  return db.collection<UserDocument>('users');
}

export const UserModel = {
  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    const collection = await getCollection();
    return collection.findOne({ email });
  },

  /**
   * Find user by Microsoft ID
   */
  async findByMicrosoftId(microsoftId: string): Promise<UserDocument | null> {
    const collection = await getCollection();
    return collection.findOne({ microsoftId });
  },

  /**
   * Create or update user
   */
  async upsert(user: Omit<UserDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<UserDocument> {
    const collection = await getCollection();
    const now = new Date();
    
    const result = await collection.findOneAndUpdate(
      { microsoftId: user.microsoftId },
      {
        $set: { ...user, updatedAt: now },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true, returnDocument: 'after' }
    );

    return result!;
  },

  /**
   * Update user tokens
   */
  async updateTokens(
    microsoftId: string,
    tokens: { accessToken?: string; refreshToken?: string; tokenExpiry?: Date }
  ): Promise<void> {
    const collection = await getCollection();
    await collection.updateOne(
      { microsoftId },
      { $set: { ...tokens, updatedAt: new Date() } }
    );
  },

  /**
   * Update last login
   */
  async updateLastLogin(microsoftId: string): Promise<void> {
    const collection = await getCollection();
    await collection.updateOne(
      { microsoftId },
      { $set: { lastLogin: new Date(), updatedAt: new Date() } }
    );
  },
};


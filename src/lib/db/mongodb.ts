/**
 * MongoDB Connection
 * 
 * Singleton pattern with connection pooling
 */

import { MongoClient, Db } from 'mongodb';

const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
};

let clientPromise: Promise<MongoClient> | undefined;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

/**
 * Get MongoDB client (lazy initialization)
 */
export async function getClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('Please add MONGODB_URI to environment variables');
  }

  // Return existing connection if available
  if (clientPromise) {
    return clientPromise;
  }

  if (process.env.NODE_ENV === 'development') {
    // In development, use global variable to preserve connection across hot reloads
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // In production, create a new connection
    const client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }

  return clientPromise;
}

/**
 * Get database instance
 */
export async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db();
}

// For backward compatibility
export default getClient();


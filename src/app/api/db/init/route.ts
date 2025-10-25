/**
 * Database Initialization API Route
 * 
 * Initializes database with indexes
 * Protected route - only accessible in development or with auth
 */

import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db/init';
import { getDb } from '@/lib/db/mongodb';

export async function GET() {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }

    // Test connection
    const db = await getDb();
    await db.command({ ping: 1 });

    // Initialize indexes
    await initializeDatabase();

    // Get collection stats
    const collections = await db.listCollections().toArray();
    const stats = await Promise.all(
      collections.map(async (col) => ({
        name: col.name,
        count: await db.collection(col.name).countDocuments(),
      }))
    );

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      collections: stats,
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database', details: String(error) },
      { status: 500 }
    );
  }
}


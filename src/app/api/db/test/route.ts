/**
 * Database Test API Route
 * 
 * Tests database connection and operations
 */

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';

export async function GET() {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }

    const db = await getDb();
    
    // Ping database
    const pingResult = await db.command({ ping: 1 });
    
    // Get server info
    const admin = db.admin();
    const serverInfo = await admin.serverInfo();
    
    // List collections
    const collections = await db.listCollections().toArray();

    return NextResponse.json({
      success: true,
      database: db.databaseName,
      serverVersion: serverInfo.version,
      collections: collections.map((c) => c.name),
      ping: pingResult.ok === 1,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Database connection failed', details: String(error) },
      { status: 500 }
    );
  }
}


import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Health Check Endpoint
 * 
 * Returns the health status of the application and its dependencies.
 * Used by monitoring tools and load balancers.
 * 
 * @returns JSON response with health status
 */
export async function GET() {
  try {
    // Check database connection
    const startTime = Date.now();
    const db = await getDb();
    await db.admin().ping(); // Ping database to verify connection
    const dbResponseTime = Date.now() - startTime;
    
    // Determine health status
    const isHealthy = dbResponseTime < 1000; // DB should respond within 1 second
    
    return NextResponse.json(
      {
        status: isHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        services: {
          database: {
            status: 'connected',
            responseTime: `${dbResponseTime}ms`,
          },
          application: {
            status: 'running',
            uptime: process.uptime(),
          },
        },
        environment: process.env.NODE_ENV || 'unknown',
      },
      { status: isHealthy ? 200 : 503 }
    );
  } catch (error) {
    // Health check failed
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        error: error instanceof Error ? error.message : 'Service unavailable',
        services: {
          database: {
            status: 'disconnected',
          },
          application: {
            status: 'running',
            uptime: process.uptime(),
          },
        },
      },
      { status: 503 }
    );
  }
}


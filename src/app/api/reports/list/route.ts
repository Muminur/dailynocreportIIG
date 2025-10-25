/**
 * List Reports API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { ReportModel } from '@/lib/db/models';

/**
 * GET /api/reports/list - List all reports for user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const reports = await ReportModel.findByUser(session.user.email, limit, offset);

    return NextResponse.json({ success: true, reports });
  } catch (error) {
    console.error('Reports list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}


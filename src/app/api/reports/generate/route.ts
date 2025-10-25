/**
 * Report Generation API Route
 * Generate NOC report from emails for a specific date
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { EmailFetcher } from '@/lib/email/email-fetcher';
import { generateReport, saveReport } from '@/lib/report';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email || !session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const targetDate = new Date(date);
    
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    // Fetch emails for the date
    const fetcher = new EmailFetcher({
      accessToken: session.accessToken,
      userId: session.user.email,
      date: targetDate,
    });

    const emails = await fetcher.fetchForDate(targetDate);

    // Generate report from emails
    const { entries, statistics } = await generateReport(
      session.user.email,
      targetDate,
      emails
    );

    // Save report to database
    const report = await saveReport(
      session.user.email,
      targetDate,
      entries,
      statistics
    );

    return NextResponse.json({
      success: true,
      report: {
        id: report?._id || 'unknown',
        date: report?.date || targetDate,
        entriesCount: entries.length,
        statistics,
      },
    });
  } catch (error) {
    console.error('Report generation error:', error);
    
    const message = (error as Error)?.message || 'Failed to generate report';
    
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}


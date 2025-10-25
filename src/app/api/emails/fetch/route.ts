/**
 * Email Fetch API Route
 * Fetches emails for a specific date
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { EmailFetcher } from '@/lib/email/email-fetcher';

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

    const fetcher = new EmailFetcher({
      accessToken: session.accessToken,
      userId: session.user.email,
      date: targetDate,
    });

    const emails = await fetcher.fetchForDate(targetDate);

    return NextResponse.json({
      success: true,
      count: emails.length,
      emails,
    });
  } catch (error) {
    console.error('Email fetch error:', error);
    
    const statusCode = (error as { statusCode?: number })?.statusCode || 500;
    const message = (error as Error)?.message || 'Failed to fetch emails';
    
    return NextResponse.json(
      { error: message, details: (error as { body?: unknown })?.body },
      { status: statusCode }
    );
  }
}


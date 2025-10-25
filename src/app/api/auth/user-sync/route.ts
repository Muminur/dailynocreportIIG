/**
 * User Sync API Route
 * Syncs user data to MongoDB after authentication
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { UserModel } from '@/lib/db/models';

export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Save/update user in database
    await UserModel.upsert({
      email: session.user.email,
      name: session.user.name || '',
      microsoftId: (session.user as { microsoftId?: string }).microsoftId || '',
      lastLogin: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    );
  }
}


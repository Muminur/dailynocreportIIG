/**
 * Email Fetcher Component
 * Allows users to fetch emails for a specific date
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getTodayGMT6, formatDateTimeGMT6 } from '@/lib/email/timezone';

interface Email {
  id: string;
  subject: string;
  from: string;
  receivedDateTime: Date;
}

export function EmailFetcher() {
  const [date, setDate] = useState(getTodayGMT6().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState<Email[]>([]);
  const [error, setError] = useState('');

  const fetchEmails = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/emails/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch emails');
      }

      setEmails(data.emails);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fetch Emails</CardTitle>
        <CardDescription>
          Retrieve emails from your inbox and sent items for a specific date (GMT+6)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button onClick={fetchEmails} disabled={loading}>
            {loading ? (
              <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Fetching...
              </>
            ) : (
              'Fetch Emails'
            )}
          </Button>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {emails.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Found {emails.length} email{emails.length !== 1 ? 's' : ''}
            </p>
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {emails.map((email) => (
                <div key={email.id} className="rounded-lg border p-3 text-sm">
                  <p className="font-medium">{email.subject}</p>
                  <p className="text-muted-foreground">From: {email.from}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTimeGMT6(new Date(email.receivedDateTime))}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


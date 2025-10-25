/**
 * Email Fetching Service
 * Handles email retrieval from Microsoft Graph API
 */

import { createGraphClient, GraphEmail, GraphEmailsResponse } from './graph-client';
import { toGMT6, formatDateForFilter } from './timezone';
import { EmailCacheModel } from '@/lib/db/models';

// Configuration constants
const CONFIG = {
  RETRY_COUNT: 3,
  RETRY_DELAY_MS: 1000,
  MAX_PAGES: 100, // ~5000 emails with 50 per page
  PAGE_SIZE: 50,
  RATE_LIMIT_DELAY_MS: 250, // Delay between paginated requests
} as const;

interface FetchEmailsOptions {
  accessToken: string;
  userId: string;
  date: Date;
  onProgress?: (progress: number) => void;
}

interface FetchedEmail {
  id: string;
  subject: string;
  body: string;
  from: string;
  fromEmail: string;
  receivedDateTime: Date;
  hasAttachments: boolean;
}

export class EmailFetcher {
  private client: ReturnType<typeof createGraphClient>;
  private userId: string;
  private onProgress?: (progress: number) => void;

  constructor(options: FetchEmailsOptions) {
    this.client = createGraphClient(options.accessToken);
    this.userId = options.userId;
    this.onProgress = options.onProgress;
  }

  async fetchForDate(date: Date): Promise<FetchedEmail[]> {
    const { startDate, endDate } = this.getDateRange(date);
    
    // Check cache first - use date range to get only emails for the specific date
    const cached = await EmailCacheModel.findByDateRange(this.userId, startDate, endDate);
    if (cached.length > 0) {
      this.onProgress?.(100);
      return this.mapCachedEmails(cached);
    }

    // Fetch from both inbox and sent items
    const [inboxEmails, sentEmails] = await Promise.all([
      this.fetchFromFolder('inbox', startDate, endDate),
      this.fetchFromFolder('sentitems', startDate, endDate),
    ]);

    const allEmails = [...inboxEmails, ...sentEmails];
    
    // Remove duplicates by ID
    const uniqueEmails = this.deduplicateEmails(allEmails);
    
    // Cache the results
    await this.cacheEmails(uniqueEmails);
    
    this.onProgress?.(100);
    return uniqueEmails;
  }

  private async fetchFromFolder(
    folder: string,
    startDate: Date,
    endDate: Date
  ): Promise<FetchedEmail[]> {
    const emails: FetchedEmail[] = [];
    let nextLink: string | undefined;
    let pageCount = 0;

    const filter = `receivedDateTime ge ${formatDateForFilter(startDate)} and receivedDateTime lt ${formatDateForFilter(endDate)}`;
    
    try {
      do {
        const response = await this.retryRequest<GraphEmailsResponse>(async () => {
          if (nextLink) {
            return await this.client.api(nextLink).get();
          }
          return await this.client
            .api(`/me/mailFolders/${folder}/messages`)
            .filter(filter)
            .select('id,subject,body,bodyPreview,from,receivedDateTime,sentDateTime,hasAttachments')
            .top(CONFIG.PAGE_SIZE)
            .orderby('receivedDateTime desc')
            .get();
        });

        emails.push(...response.value.map(this.mapGraphEmail));
        nextLink = response['@odata.nextLink'];
        pageCount++;
        
        // Update progress (estimate: ~50% per folder)
        const folderProgress = folder === 'inbox' ? 0 : 50;
        this.onProgress?.(folderProgress + Math.min(40, pageCount * 5));
        
        // Safety: max pages limit
        if (pageCount >= CONFIG.MAX_PAGES) {
          console.warn(`Reached max page limit (${CONFIG.MAX_PAGES}) for ${folder}`);
          break;
        }
        
        // Rate limiting: delay between requests to avoid throttling
        if (nextLink) {
          await this.delay(CONFIG.RATE_LIMIT_DELAY_MS);
        }
      } while (nextLink);
    } catch (error) {
      console.error(`Error fetching from ${folder}:`, error);
      // Continue with what we have
    }

    return emails;
  }

  private async retryRequest<T>(request: () => Promise<T>): Promise<T> {
    for (let i = 0; i < CONFIG.RETRY_COUNT; i++) {
      try {
        return await request();
      } catch (error) {
        const statusCode = (error as { statusCode?: number })?.statusCode;
        const isRateLimit = statusCode === 429;
        const isServerError = statusCode ? statusCode >= 500 : false;
        const shouldRetry = i < CONFIG.RETRY_COUNT - 1 && (isRateLimit || isServerError);
        
        if (!shouldRetry) throw error;
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = CONFIG.RETRY_DELAY_MS * Math.pow(2, i);
        console.warn(`Request failed (status: ${statusCode}), retrying in ${delay}ms... (attempt ${i + 1}/${CONFIG.RETRY_COUNT})`);
        await this.delay(delay);
      }
    }
    throw new Error('Max retries exceeded');
  }

  private mapGraphEmail = (email: GraphEmail): FetchedEmail => ({
    id: email.id,
    subject: email.subject || '(No Subject)',
    body: email.body?.content || email.bodyPreview || '',
    from: email.from?.emailAddress?.name || email.from?.emailAddress?.address || 'Unknown',
    fromEmail: email.from?.emailAddress?.address || '',
    receivedDateTime: toGMT6(new Date(email.receivedDateTime)),
    hasAttachments: email.hasAttachments || false,
  });

  private getDateRange(date: Date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    return { startDate: toGMT6(startDate), endDate: toGMT6(endDate) };
  }

  private deduplicateEmails(emails: FetchedEmail[]): FetchedEmail[] {
    const seen = new Set<string>();
    return emails.filter((email) => {
      if (seen.has(email.id)) return false;
      seen.add(email.id);
      return true;
    });
  }

  private async cacheEmails(emails: FetchedEmail[]): Promise<void> {
    // Insert emails one by one to handle duplicates gracefully
    for (const email of emails) {
      try {
        await EmailCacheModel.create({
          userId: this.userId,
          emailId: email.id,
          subject: email.subject,
          body: email.body,
          from: email.from,
          fromEmail: email.fromEmail,
          receivedDateTime: email.receivedDateTime,
          hasAttachments: email.hasAttachments,
        });
      } catch (error) {
        // Ignore duplicate key errors (code 11000)
        const mongoError = error as { code?: number };
        if (mongoError.code !== 11000) {
          // Log non-duplicate errors
          console.error(`Failed to cache email ${email.id}:`, error);
        }
        // Continue with next email
      }
    }
  }

  private mapCachedEmails(cached: {
    emailId: string;
    subject: string;
    body: string;
    from: string;
    fromEmail: string;
    receivedDateTime: Date;
    hasAttachments: boolean;
  }[]): FetchedEmail[] {
    return cached.map((email) => ({
      id: email.emailId,
      subject: email.subject,
      body: email.body,
      from: email.from,
      fromEmail: email.fromEmail,
      receivedDateTime: email.receivedDateTime,
      hasAttachments: email.hasAttachments,
    }));
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}


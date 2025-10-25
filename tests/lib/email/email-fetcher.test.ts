/**
 * Email Fetcher Tests
 */

// Mock dependencies BEFORE imports
jest.mock('@/lib/email/graph-client');
jest.mock('@/lib/db/models', () => ({
  EmailCacheModel: {
    findByDateRange: jest.fn(),
    findRecent: jest.fn(),
    create: jest.fn(),
  },
}));

import { EmailFetcher } from '@/lib/email/email-fetcher';
import { EmailCacheModel } from '@/lib/db/models';
import * as graphClient from '@/lib/email/graph-client';

describe('EmailFetcher', () => {
  const mockAccessToken = 'mock-access-token';
  const mockUserId = 'user@example.com';
  const mockDate = new Date('2025-10-24');

  const mockEmail = {
    id: 'email-1',
    subject: 'Test Email',
    body: { content: 'Test body', contentType: 'html' },
    bodyPreview: 'Test preview',
    from: {
      emailAddress: {
        name: 'John Doe',
        address: 'john@example.com',
      },
    },
    receivedDateTime: '2025-10-24T10:00:00Z',
    sentDateTime: '2025-10-24T09:00:00Z',
    hasAttachments: false,
  };

  const mockGraphResponse = {
    value: [mockEmail],
    '@odata.nextLink': undefined,
  };

  let mockClientApi: jest.Mock;
  let fetcher: EmailFetcher;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Graph client
    mockClientApi = jest.fn().mockReturnValue({
      filter: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      top: jest.fn().mockReturnThis(),
      orderby: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue(mockGraphResponse),
    });

    (graphClient.createGraphClient as jest.Mock).mockReturnValue({
      api: mockClientApi,
    });

    // Mock cache model
    (EmailCacheModel.findByDateRange as jest.Mock).mockResolvedValue([]);
    (EmailCacheModel.create as jest.Mock).mockResolvedValue({});

    fetcher = new EmailFetcher({
      accessToken: mockAccessToken,
      userId: mockUserId,
      date: mockDate,
    });
  });

  describe('constructor', () => {
    it('should initialize with provided options', () => {
      expect(fetcher).toBeDefined();
      expect(graphClient.createGraphClient).toHaveBeenCalledWith(mockAccessToken);
    });

    it('should accept progress callback', () => {
      const onProgress = jest.fn();
      const fetcherWithProgress = new EmailFetcher({
        accessToken: mockAccessToken,
        userId: mockUserId,
        date: mockDate,
        onProgress,
      });

      expect(fetcherWithProgress).toBeDefined();
    });
  });

  describe('fetchForDate', () => {
    it('should return cached emails if available', async () => {
      const cachedEmails = [
        {
          emailId: 'cached-1',
          subject: 'Cached Email',
          body: 'Cached body',
          from: 'Cache User',
          fromEmail: 'cache@example.com',
          receivedDateTime: new Date('2025-10-24T10:00:00Z'),
          hasAttachments: false,
        },
      ];

      (EmailCacheModel.findByDateRange as jest.Mock).mockResolvedValue(cachedEmails);

      const result = await fetcher.fetchForDate(mockDate);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('cached-1');
      expect(EmailCacheModel.findByDateRange).toHaveBeenCalled();
      expect(mockClientApi).not.toHaveBeenCalled();
    });

    it('should fetch from Graph API when cache is empty', async () => {
      const result = await fetcher.fetchForDate(mockDate);

      // Should have emails from both folders (but may be deduplicated)
      expect(result.length).toBeGreaterThan(0);
      expect(mockClientApi).toHaveBeenCalledTimes(2);
      expect(EmailCacheModel.create).toHaveBeenCalled();
    });

    it('should deduplicate emails by ID', async () => {
      const duplicateResponse = {
        value: [mockEmail, mockEmail], // Same email twice
        '@odata.nextLink': undefined,
      };

      mockClientApi.mockReturnValue({
        filter: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        top: jest.fn().mockReturnThis(),
        orderby: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(duplicateResponse),
      });

      const result = await fetcher.fetchForDate(mockDate);

      // Should have only unique emails (2 folders, but duplicates removed)
      const uniqueIds = new Set(result.map((e) => e.id));
      expect(uniqueIds.size).toBe(result.length);
    });

    it('should call progress callback', async () => {
      const onProgress = jest.fn();
      const fetcherWithProgress = new EmailFetcher({
        accessToken: mockAccessToken,
        userId: mockUserId,
        date: mockDate,
        onProgress,
      });

      await fetcherWithProgress.fetchForDate(mockDate);

      expect(onProgress).toHaveBeenCalled();
      expect(onProgress).toHaveBeenCalledWith(100);
    });

    it('should cache fetched emails', async () => {
      await fetcher.fetchForDate(mockDate);

      expect(EmailCacheModel.create).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should continue after cache errors', async () => {
      (EmailCacheModel.create as jest.Mock).mockRejectedValue(
        new Error('Cache error')
      );

      // Should not throw
      await expect(fetcher.fetchForDate(mockDate)).resolves.toBeDefined();
    });

    it('should handle Graph API errors gracefully', async () => {
      mockClientApi.mockReturnValue({
        filter: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        top: jest.fn().mockReturnThis(),
        orderby: jest.fn().mockReturnThis(),
        get: jest.fn().mockRejectedValue(new Error('API Error')),
      });

      // Should not throw - returns what it can get
      const result = await fetcher.fetchForDate(mockDate);
      expect(result).toBeDefined();
    });

    it('should ignore duplicate key errors (code 11000) when caching', async () => {
      const duplicateError = { code: 11000, message: 'Duplicate key' };
      (EmailCacheModel.create as jest.Mock).mockRejectedValueOnce(duplicateError);

      // Should not throw
      await expect(fetcher.fetchForDate(mockDate)).resolves.toBeDefined();
    });
  });

  describe('pagination', () => {
    it('should handle paginated results', async () => {
      const page1 = {
        value: [{ ...mockEmail, id: 'email-1' }],
        '@odata.nextLink': 'next-page-url',
      };

      const page2 = {
        value: [{ ...mockEmail, id: 'email-2' }],
        '@odata.nextLink': undefined,
      };

      let callCount = 0;
      mockClientApi.mockReturnValue({
        filter: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        top: jest.fn().mockReturnThis(),
        orderby: jest.fn().mockReturnThis(),
        get: jest.fn().mockImplementation(() => {
          callCount++;
          return Promise.resolve(callCount === 1 ? page1 : page2);
        }),
      });

      const result = await fetcher.fetchForDate(mockDate);

      // Should have emails from both pages
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('retry logic', () => {
    it('should retry on 429 rate limit', async () => {
      let attempts = 0;
      mockClientApi.mockReturnValue({
        filter: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        top: jest.fn().mockReturnThis(),
        orderby: jest.fn().mockReturnThis(),
        get: jest.fn().mockImplementation(() => {
          attempts++;
          if (attempts === 1) {
            const error: any = new Error('Rate limited');
            error.statusCode = 429;
            return Promise.reject(error);
          }
          return Promise.resolve(mockGraphResponse);
        }),
      });

      const result = await fetcher.fetchForDate(mockDate);

      expect(result).toBeDefined();
      // First attempt fails, second succeeds, but this happens for inbox AND sentitems
      expect(attempts).toBeGreaterThan(2);
    });

    it('should retry on 500 server errors', async () => {
      let attempts = 0;
      mockClientApi.mockReturnValue({
        filter: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        top: jest.fn().mockReturnThis(),
        orderby: jest.fn().mockReturnThis(),
        get: jest.fn().mockImplementation(() => {
          attempts++;
          if (attempts === 1) {
            const error: any = new Error('Server error');
            error.statusCode = 500;
            return Promise.reject(error);
          }
          return Promise.resolve(mockGraphResponse);
        }),
      });

      const result = await fetcher.fetchForDate(mockDate);

      expect(result).toBeDefined();
      // Retry happens for both inbox and sentitems
      expect(attempts).toBeGreaterThan(2);
    });
  });

  describe('email mapping', () => {
    it('should handle emails without subjects', async () => {
      const emailWithoutSubject = {
        ...mockEmail,
        subject: null,
      };

      mockClientApi.mockReturnValue({
        filter: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        top: jest.fn().mockReturnThis(),
        orderby: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          value: [emailWithoutSubject],
          '@odata.nextLink': undefined,
        }),
      });

      const result = await fetcher.fetchForDate(mockDate);

      expect(result[0].subject).toBe('(No Subject)');
    });

    it('should handle emails without body', async () => {
      const emailWithoutBody = {
        ...mockEmail,
        body: null,
        bodyPreview: null,
      };

      mockClientApi.mockReturnValue({
        filter: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        top: jest.fn().mockReturnThis(),
        orderby: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          value: [emailWithoutBody],
          '@odata.nextLink': undefined,
        }),
      });

      const result = await fetcher.fetchForDate(mockDate);

      expect(result[0].body).toBe('');
    });
  });
});


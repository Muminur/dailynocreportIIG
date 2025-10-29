/**
 * Error Handler Middleware Tests
 */

import { handleApiError } from '@/middleware/errorHandler';
import { z } from 'zod';
import { NextResponse } from 'next/server';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body: unknown, init?: { status?: number }) => ({
      status: init?.status || 200,
      json: () => body,
    })),
  },
}));

// Mock logger
jest.mock('@/lib/utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('Error Handler Middleware', () => {
  it('should handle Zod validation errors', () => {
    const schema = z.object({
      email: z.string().email(),
      age: z.number().min(18),
    });

    try {
      schema.parse({ email: 'invalid', age: 15 });
    } catch (error) {
      const response = handleApiError(error);
      const json = response.json();

      expect(response.status).toBe(400);
      expect(json).toHaveProperty('error', 'Validation failed');
      expect(json).toHaveProperty('details');
    }
  });

  it('should handle generic Error instances', () => {
    const error = new Error('Something went wrong');
    const response = handleApiError(error);
    const json = response.json();

    expect(response.status).toBe(500);
    expect(json).toHaveProperty('error', 'Something went wrong');
  });

  it('should handle unknown errors', () => {
    const error = 'String error';
    const response = handleApiError(error);
    const json = response.json();

    expect(response.status).toBe(500);
    expect(json).toHaveProperty('error', 'An unexpected error occurred');
  });

  it('should handle null errors', () => {
    const response = handleApiError(null);
    const json = response.json();

    expect(response.status).toBe(500);
    expect(json).toHaveProperty('error', 'An unexpected error occurred');
  });

  it('should handle undefined errors', () => {
    const response = handleApiError(undefined);
    const json = response.json();

    expect(response.status).toBe(500);
    expect(json).toHaveProperty('error', 'An unexpected error occurred');
  });

  it('should log all errors', () => {
    const { logger } = require('@/lib/utils/logger');
    const error = new Error('Test error');
    
    handleApiError(error);

    expect(logger.error).toHaveBeenCalledWith('API Error', error);
  });
});


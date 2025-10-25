/**
 * Graph Client Tests
 */

import { Client } from '@microsoft/microsoft-graph-client';
import { createGraphClient } from '@/lib/email/graph-client';

// Mock the Microsoft Graph Client
jest.mock('@microsoft/microsoft-graph-client', () => ({
  Client: {
    init: jest.fn(() => ({
      api: jest.fn().mockReturnThis(),
    })),
  },
}));

describe('Graph Client', () => {
  const mockAccessToken = 'mock-access-token-12345';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGraphClient', () => {
    it('should create a Graph client instance', () => {
      const client = createGraphClient(mockAccessToken);
      
      expect(client).toBeDefined();
      expect(Client.init).toHaveBeenCalled();
    });

    it('should pass auth provider configuration', () => {
      createGraphClient(mockAccessToken);
      
      expect(Client.init).toHaveBeenCalledWith(
        expect.objectContaining({
          authProvider: expect.any(Function),
        })
      );
    });

    it('should work with different access tokens', () => {
      const token1 = 'token-1';
      const token2 = 'token-2';
      
      createGraphClient(token1);
      createGraphClient(token2);
      
      expect(Client.init).toHaveBeenCalledTimes(2);
    });
  });
});


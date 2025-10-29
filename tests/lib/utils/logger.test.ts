/**
 * Logger Utility Tests
 */

import { logger } from '@/lib/utils/logger';

describe('Logger Utility', () => {
  beforeEach(() => {
    logger.clearLogs();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('info', () => {
    it('should log info messages', () => {
      logger.info('Test info message');

      expect(console.log).toHaveBeenCalledWith(
        '[INFO] Test info message',
        ''
      );

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('info');
      expect(logs[0].message).toBe('Test info message');
    });

    it('should log info with data', () => {
      const data = { key: 'value' };
      logger.info('Test info', data);

      expect(console.log).toHaveBeenCalledWith(
        '[INFO] Test info',
        data
      );

      const logs = logger.getLogs();
      expect(logs[0].data).toEqual(data);
    });
  });

  describe('warn', () => {
    it('should log warning messages', () => {
      logger.warn('Test warning');

      expect(console.warn).toHaveBeenCalledWith(
        '[WARN] Test warning',
        ''
      );

      const logs = logger.getLogs();
      expect(logs[0].level).toBe('warn');
    });
  });

  describe('error', () => {
    it('should log error messages', () => {
      logger.error('Test error');

      expect(console.error).toHaveBeenCalledWith(
        '[ERROR] Test error',
        ''
      );

      const logs = logger.getLogs();
      expect(logs[0].level).toBe('error');
    });

    it('should log error with data', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);

      const logs = logger.getLogs();
      expect(logs[0].data).toBe(error);
    });
  });

  describe('debug', () => {
    it('should log debug messages in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      logger.debug('Debug message');

      expect(console.debug).toHaveBeenCalledWith(
        '[DEBUG] Debug message',
        ''
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should not log debug messages in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      logger.debug('Debug message');

      expect(console.debug).not.toHaveBeenCalled();

      const logs = logger.getLogs();
      expect(logs).toHaveLength(0);

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('log management', () => {
    it('should store logs in memory', () => {
      logger.info('Message 1');
      logger.warn('Message 2');
      logger.error('Message 3');

      const logs = logger.getLogs();
      expect(logs).toHaveLength(3);
    });

    it('should include timestamp in logs', () => {
      const before = new Date();
      logger.info('Test message');
      const after = new Date();

      const logs = logger.getLogs();
      const timestamp = logs[0].timestamp;

      expect(timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should clear logs', () => {
      logger.info('Message 1');
      logger.info('Message 2');

      expect(logger.getLogs()).toHaveLength(2);

      logger.clearLogs();

      expect(logger.getLogs()).toHaveLength(0);
    });

    it('should limit stored logs to maxLogs', () => {
      // Logger has maxLogs = 1000
      // Add 1010 logs
      for (let i = 0; i < 1010; i++) {
        logger.info(`Message ${i}`);
      }

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1000);
      
      // Should keep the latest logs
      expect(logs[0].message).toBe('Message 10');
      expect(logs[999].message).toBe('Message 1009');
    });
  });

  describe('log levels', () => {
    it('should log at different levels', () => {
      logger.info('Info message');
      logger.warn('Warn message');
      logger.error('Error message');

      const logs = logger.getLogs();
      expect(logs[0].level).toBe('info');
      expect(logs[1].level).toBe('warn');
      expect(logs[2].level).toBe('error');
    });

    it('should use correct console methods for each level', () => {
      logger.info('Info');
      logger.warn('Warn');
      logger.error('Error');

      expect(console.log).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });
  });
});


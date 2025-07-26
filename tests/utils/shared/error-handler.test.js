/**
 * @file tests/utils/shared/error-handler.test.js
 * @description 错误处理器的单元测试
 */

import { describe, it, expect } from 'vitest';
import { 
  ErrorHandler, 
  AppError, 
  ERROR_TYPES,
  handleError,
  safeExecute,
  retryExecute 
} from '../../../src/utils/shared/error-handler.js';

describe('ErrorHandler', () => {
  describe('AppError', () => {
    it('should create an AppError with default values', () => {
      const error = new AppError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('AppError');
      expect(error.type).toBe(ERROR_TYPES.GENERIC);
      expect(error.originalError).toBeNull();
      expect(error.timestamp).toBeDefined();
      expect(typeof error.timestamp).toBe('string');
    });

    it('should create an AppError with custom type and original error', () => {
      const originalError = new Error('Original error');
      const error = new AppError('Wrapped error', ERROR_TYPES.NETWORK, originalError);
      
      expect(error.message).toBe('Wrapped error');
      expect(error.type).toBe(ERROR_TYPES.NETWORK);
      expect(error.originalError).toBe(originalError);
    });
  });

  describe('wrap', () => {
    it('should wrap a string error message', () => {
      const error = ErrorHandler.wrap('Test error', ERROR_TYPES.VALIDATION, 'Test context');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Test context: Test error');
      expect(error.type).toBe(ERROR_TYPES.VALIDATION);
    });

    it('should wrap an Error object', () => {
      const originalError = new Error('Original error');
      const error = ErrorHandler.wrap(originalError, ERROR_TYPES.NETWORK, 'API call');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('API call: Original error');
      expect(error.type).toBe(ERROR_TYPES.NETWORK);
      expect(error.originalError).toBe(originalError);
    });

    it('should handle empty context', () => {
      const error = ErrorHandler.wrap('Test error', ERROR_TYPES.GENERIC);
      
      expect(error.message).toBe('Test error');
    });
  });

  describe('handleClipboardError', () => {
    it('should handle timeout errors', () => {
      const timeoutError = new Error('Operation timeout');
      const error = ErrorHandler.handleClipboardError(timeoutError, 100);
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(ERROR_TYPES.CLIPBOARD);
      expect(error.message).toContain('超时');
      expect(error.message).toContain('100KB');
    });

    it('should handle NotAllowedError', () => {
      const notAllowedError = new Error('Permission denied');
      notAllowedError.name = 'NotAllowedError';
      const error = ErrorHandler.handleClipboardError(notAllowedError);
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(ERROR_TYPES.CLIPBOARD);
      expect(error.message).toContain('剪贴板访问请求');
    });

    it('should handle generic clipboard errors', () => {
      const genericError = new Error('Generic clipboard error');
      const error = ErrorHandler.handleClipboardError(genericError);
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(ERROR_TYPES.CLIPBOARD);
      expect(error.message).toContain('复制失败');
    });
  });

  describe('handleNetworkError', () => {
    it('should handle timeout errors', () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      const error = ErrorHandler.handleNetworkError(timeoutError, '/api/test');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(ERROR_TYPES.NETWORK);
      expect(error.message).toContain('请求 /api/test 时');
      expect(error.message).toContain('超时');
    });

    it('should handle HTTP status errors', () => {
      const httpError = new Error('Not found');
      httpError.status = 404;
      const error = ErrorHandler.handleNetworkError(httpError);
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(ERROR_TYPES.NETWORK);
      expect(error.message).toContain('资源未找到');
    });

    it('should handle generic network errors', () => {
      const networkError = new Error('Connection failed');
      const error = ErrorHandler.handleNetworkError(networkError);
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(ERROR_TYPES.NETWORK);
      expect(error.message).toContain('连接失败');
    });
  });

  describe('safeExecute', () => {
    it('should execute function successfully', async () => {
      const result = await ErrorHandler.safeExecute(() => 'success');
      expect(result).toBe('success');
    });

    it('should wrap thrown errors', async () => {
      const testError = new Error('Test error');
      
      await expect(
        ErrorHandler.safeExecute(() => {
          throw testError;
        }, 'Test context', ERROR_TYPES.VALIDATION)
      ).rejects.toThrow(AppError);
    });

    it('should handle async functions', async () => {
      const result = await ErrorHandler.safeExecute(async () => {
        return Promise.resolve('async success');
      });
      
      expect(result).toBe('async success');
    });
  });

  describe('retry', () => {
    it('should succeed on first attempt', async () => {
      let attempts = 0;
      const result = await ErrorHandler.retry(() => {
        attempts++;
        return 'success';
      });
      
      expect(result).toBe('success');
      expect(attempts).toBe(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      let attempts = 0;
      const result = await ErrorHandler.retry(() => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary failure');
        }
        return 'success';
      }, { maxAttempts: 3, delay: 10 });
      
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('should fail after max attempts', async () => {
      let attempts = 0;
      
      await expect(
        ErrorHandler.retry(() => {
          attempts++;
          throw new Error('Persistent failure');
        }, { maxAttempts: 2, delay: 10 })
      ).rejects.toThrow(AppError);
      
      expect(attempts).toBe(2);
    });
  });

  describe('getUserMessage', () => {
    it('should return AppError message', () => {
      const appError = new AppError('Custom error message');
      const message = ErrorHandler.getUserMessage(appError);
      
      expect(message).toBe('Custom error message');
    });

    it('should return generic message for unknown errors', () => {
      const unknownError = new Error('Unknown error');
      const message = ErrorHandler.getUserMessage(unknownError);
      
      expect(message).toBe('发生未知错误');
    });
  });

  describe('convenience functions', () => {
    it('should export convenience functions', () => {
      expect(typeof handleError).toBe('function');
      expect(typeof safeExecute).toBe('function');
      expect(typeof retryExecute).toBe('function');
    });

    it('should work as aliases', () => {
      const error = handleError('Test error');
      expect(error).toBeInstanceOf(AppError);
    });
  });
});

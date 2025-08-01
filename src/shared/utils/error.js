/**
 * @file src/shared/utils/error.js
 * @description 简化的统一错误处理工具
 *
 * 回归简单实用的设计，移除过度复杂的抽象层
 */

import {
  GENERIC_ERRORS,
  CLIPBOARD_ERRORS,
  NETWORK_ERRORS
} from '../../config/constants/index.js';

/**
 * 错误类型枚举
 */
export const ERROR_TYPES = {
  VALIDATION: 'validation',
  NETWORK: 'network',
  CLIPBOARD: 'clipboard',
  FILE: 'file',
  THEME: 'theme',
  GENERIC: 'generic'
};

/**
 * 简化的应用程序错误类
 */
export class AppError extends Error {
  constructor(message, type = ERROR_TYPES.GENERIC, originalError = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * 简化的错误处理器
 */
export class ErrorHandler {
  /**
   * 包装错误为统一格式
   */
  static wrap(error, type = ERROR_TYPES.GENERIC, context = '') {
    const message = error instanceof Error ? error.message : String(error);
    const contextMessage = context ? `${context}: ${message}` : message;
    const originalError = error instanceof Error ? error : null;

    return new AppError(contextMessage, type, originalError);
  }

  /**
   * 处理剪贴板相关错误
   */
  static handleClipboardError(error, contentSize = 0) {
    let message = CLIPBOARD_ERRORS.COPY_FAILED;

    if (error.message.includes('timeout') || error.message.includes('超时')) {
      message = `复制操作超时 (内容大小: ${contentSize}KB)`;
    } else if (error.name === 'NotAllowedError' || error.message.includes('Permission denied')) {
      message = CLIPBOARD_ERRORS.CLIPBOARD_ACCESS_DENIED;
    }

    return new AppError(message, ERROR_TYPES.CLIPBOARD, error);
  }

  /**
   * 处理网络相关错误
   */
  static handleNetworkError(error, url = '', statusCode = null) {
    let message = NETWORK_ERRORS.CONNECTION_FAILED;

    if (error.message.includes('timeout') || error.message.includes('超时') || error.name === 'TimeoutError') {
      message = url ? `请求 ${url} 时超时` : NETWORK_ERRORS.REQUEST_TIMEOUT;
    } else if (statusCode || error.status) {
      const code = statusCode || error.status;
      if (code === 404) {
        message = url ? `资源 ${url} 未找到` : NETWORK_ERRORS.NOT_FOUND;
      } else if (code >= 400 && code < 500) {
        message = NETWORK_ERRORS.BAD_REQUEST;
      } else if (code >= 500) {
        message = NETWORK_ERRORS.SERVER_ERROR;
      }
    }

    return new AppError(message, ERROR_TYPES.NETWORK, error);
  }

  /**
   * 重试机制
   */
  static async retry(fn, options = {}) {
    const { maxAttempts = 3, delay = 1000 } = options;
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (attempt === maxAttempts) {
          throw new AppError(`重试失败 (${maxAttempts}次尝试): ${error.message}`, ERROR_TYPES.GENERIC, error);
        }

        // 等待后重试
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // 这行代码理论上不会执行到，但为了类型安全
    throw new AppError(`重试失败 (${maxAttempts}次尝试)`, ERROR_TYPES.GENERIC, lastError);
  }

  /**
   * 安全执行函数
   */
  static async safeExecute(fn, context = '') {
    try {
      return await fn();
    } catch (error) {
      throw this.wrap(error, ERROR_TYPES.GENERIC, context);
    }
  }

  /**
   * 获取用户友好的错误消息
   */
  static getUserMessage(error) {
    if (error instanceof AppError) {
      return error.message;
    }
    return GENERIC_ERRORS.UNKNOWN_ERROR;
  }

  /**
   * 简单的错误日志记录
   */
  static log(error, level = 'error') {
    const logData = {
      message: error.message,
      type: error.type || ERROR_TYPES.GENERIC,
      timestamp: new Date(error.timestamp || Date.now()).toISOString()
    };

    if (level === 'warn') {
      console.warn('应用警告:', logData);
    } else {
      console.error('应用错误:', logData);
    }
  }
}

/**
 * 便捷的错误处理函数 - 只导出实际使用的函数
 */
export const handleClipboardError = ErrorHandler.handleClipboardError;

/**
 * @file src/utils/shared/error-handler.js
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
  constructor(message, type = ERROR_TYPES.GENERIC) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.timestamp = Date.now();
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
    return new AppError(contextMessage, type);
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
 * 便捷的错误处理函数
 */
export const handleError = ErrorHandler.wrap;
export const safeExecute = ErrorHandler.safeExecute;
export const getUserErrorMessage = ErrorHandler.getUserMessage;
export const logError = ErrorHandler.log;

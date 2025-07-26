/**
 * @file src/utils/shared/error-handler.js
 * @description 统一错误处理工具
 * 
 * 提供一致的错误处理模式，消除代码中重复的错误处理逻辑。
 * 包含错误分类、错误包装、重试机制等功能。
 */

import { 
  GENERIC_ERRORS, 
  CLIPBOARD_ERRORS, 
  NETWORK_ERRORS,
  VALIDATION_ERRORS 
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
 * 自定义应用程序错误类
 *
 * 扩展标准 Error 类，提供额外的错误分类和上下文信息。
 *
 * @class AppError
 * @extends {Error}
 *
 * @example
 * // 创建一个验证错误
 * const error = new AppError('邮箱格式无效', ERROR_TYPES.VALIDATION);
 *
 * @example
 * // 包装原始错误
 * try {
 *   // 某些操作
 * } catch (originalError) {
 *   throw new AppError('操作失败', ERROR_TYPES.GENERIC, originalError);
 * }
 */
export class AppError extends Error {
  /**
   * 创建一个新的应用程序错误实例
   *
   * @param {string} message - 错误消息
   * @param {string} [type=ERROR_TYPES.GENERIC] - 错误类型，来自 ERROR_TYPES 枚举
   * @param {Error|null} [originalError=null] - 原始错误对象（如果是包装错误）
   */
  constructor(message, type = ERROR_TYPES.GENERIC, originalError = null) {
    super(message);

    /** @type {string} 错误名称 */
    this.name = 'AppError';

    /** @type {string} 错误类型 */
    this.type = type;

    /** @type {Error|null} 原始错误对象 */
    this.originalError = originalError;

    /** @type {string} 错误发生时间戳 */
    this.timestamp = new Date().toISOString();
  }
}

/**
 * 错误处理器类
 */
export class ErrorHandler {
  /**
   * 包装错误为统一的应用程序错误格式
   *
   * 将原始错误或错误消息包装为 AppError 实例，提供统一的错误处理接口。
   *
   * @param {Error|string} error - 原始错误对象或错误消息字符串
   * @param {string} [type=ERROR_TYPES.GENERIC] - 错误类型，用于错误分类和处理
   * @param {string} [context=''] - 错误发生的上下文信息，用于提供更详细的错误描述
   * @returns {AppError} 包装后的应用程序错误实例
   *
   * @example
   * // 包装字符串错误消息
   * const error = ErrorHandler.wrap('网络连接失败', ERROR_TYPES.NETWORK, '获取用户数据时');
   *
   * @example
   * // 包装原始错误对象
   * try {
   *   await fetch('/api/data');
   * } catch (originalError) {
   *   throw ErrorHandler.wrap(originalError, ERROR_TYPES.NETWORK, 'API 请求');
   * }
   */
  static wrap(error, type = ERROR_TYPES.GENERIC, context = '') {
    const message = error instanceof Error ? error.message : String(error);
    const contextMessage = context ? `${context}: ${message}` : message;
    
    return new AppError(
      contextMessage,
      type,
      error instanceof Error ? error : null
    );
  }

  /**
   * 处理剪贴板错误
   * @param {Error} error - 原始错误
   * @param {number} contentSize - 内容大小（KB）
   * @returns {AppError} 处理后的错误
   */
  static handleClipboardError(error, contentSize = 0) {
    if (error.message.includes('超时') || error.message.includes('timeout')) {
      const message = contentSize > 0 
        ? `${CLIPBOARD_ERRORS.TIMEOUT}：内容可能过大(${contentSize}KB)，请尝试分段复制`
        : CLIPBOARD_ERRORS.TIMEOUT;
      return new AppError(message, ERROR_TYPES.CLIPBOARD, error);
    }
    
    if (error.name === 'NotAllowedError') {
      return new AppError(CLIPBOARD_ERRORS.CLIPBOARD_ACCESS_DENIED, ERROR_TYPES.CLIPBOARD, error);
    }
    
    return new AppError(
      `${CLIPBOARD_ERRORS.COPY_FAILED}: ${error.message}`,
      ERROR_TYPES.CLIPBOARD,
      error
    );
  }

  /**
   * 处理网络错误
   * @param {Error} error - 原始错误
   * @param {string} url - 请求URL
   * @returns {AppError} 处理后的错误
   */
  static handleNetworkError(error, url = '') {
    const context = url ? `请求 ${url} 时` : '网络请求时';
    
    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      return new AppError(
        `${context}发生超时: ${NETWORK_ERRORS.REQUEST_TIMEOUT}`,
        ERROR_TYPES.NETWORK,
        error
      );
    }
    
    if (error.status) {
      const statusMessages = {
        400: NETWORK_ERRORS.BAD_REQUEST,
        401: NETWORK_ERRORS.UNAUTHORIZED,
        403: NETWORK_ERRORS.FORBIDDEN,
        404: NETWORK_ERRORS.NOT_FOUND,
        429: NETWORK_ERRORS.RATE_LIMITED,
        500: NETWORK_ERRORS.SERVER_ERROR
      };
      
      const message = statusMessages[error.status] || NETWORK_ERRORS.SERVER_ERROR;
      return new AppError(`${context}发生错误: ${message}`, ERROR_TYPES.NETWORK, error);
    }
    
    return new AppError(
      `${context}发生错误: ${NETWORK_ERRORS.CONNECTION_FAILED}`,
      ERROR_TYPES.NETWORK,
      error
    );
  }

  /**
   * 处理验证错误
   * @param {string} field - 字段名
   * @param {string} _value - 字段值（保留用于未来扩展）
   * @param {string} rule - 验证规则
   * @returns {AppError} 验证错误
   */
  static handleValidationError(field, _value, rule) {
    const ruleMessages = {
      required: VALIDATION_ERRORS.REQUIRED_FIELD,
      email: VALIDATION_ERRORS.INVALID_EMAIL,
      url: VALIDATION_ERRORS.INVALID_URL,
      format: VALIDATION_ERRORS.INVALID_FORMAT,
      length: VALIDATION_ERRORS.VALUE_TOO_LONG,
      range: VALIDATION_ERRORS.INVALID_RANGE
    };
    
    const message = ruleMessages[rule] || VALIDATION_ERRORS.INVALID_FORMAT;
    return new AppError(
      `字段 "${field}" ${message}`,
      ERROR_TYPES.VALIDATION
    );
  }

  /**
   * 安全执行函数，捕获并处理错误
   * @param {Function} fn - 要执行的函数
   * @param {string} context - 执行上下文
   * @param {string} errorType - 错误类型
   * @returns {Promise<any>} 执行结果或错误
   */
  static async safeExecute(fn, context = '', errorType = ERROR_TYPES.GENERIC) {
    try {
      return await fn();
    } catch (error) {
      throw this.wrap(error, errorType, context);
    }
  }

  /**
   * 重试执行函数
   * @param {Function} fn - 要执行的函数
   * @param {Object} options - 重试选项
   * @returns {Promise<any>} 执行结果
   */
  static async retry(fn, options = {}) {
    const {
      maxAttempts = 3,
      delay = 1000,
      backoffFactor = 2,
      context = '',
      errorType = ERROR_TYPES.GENERIC
    } = options;

    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxAttempts) {
          break;
        }
        
        // 计算延迟时间（指数退避）
        const waitTime = delay * Math.pow(backoffFactor, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        console.warn(`${context} 第 ${attempt} 次尝试失败，${waitTime}ms 后重试:`, error.message);
      }
    }
    
    throw this.wrap(
      lastError,
      errorType,
      `${context} 在 ${maxAttempts} 次尝试后仍然失败`
    );
  }

  /**
   * 记录错误
   * @param {Error} error - 错误对象
   * @param {string} level - 日志级别
   */
  static log(error, level = 'error') {
    const logData = {
      message: error.message,
      type: error.type || ERROR_TYPES.GENERIC,
      timestamp: error.timestamp || new Date().toISOString(),
      stack: error.stack
    };

    if (error.originalError) {
      logData.originalError = {
        message: error.originalError.message,
        stack: error.originalError.stack
      };
    }

    switch (level) {
      case 'warn':
        console.warn('应用警告:', logData);
        break;
      case 'info':
        console.info('应用信息:', logData);
        break;
      default:
        console.error('应用错误:', logData);
    }
  }

  /**
   * 创建用户友好的错误消息
   * @param {Error} error - 错误对象
   * @returns {string} 用户友好的错误消息
   */
  static getUserMessage(error) {
    if (error instanceof AppError) {
      return error.message;
    }
    
    // 对于未知错误，返回通用消息
    return GENERIC_ERRORS.UNKNOWN_ERROR;
  }
}

/**
 * 便捷的错误处理函数
 */
export const handleError = ErrorHandler.wrap;
export const safeExecute = ErrorHandler.safeExecute;
export const retryExecute = ErrorHandler.retry;
export const logError = ErrorHandler.log;
export const getUserErrorMessage = ErrorHandler.getUserMessage;

/**
 * @file src/utils/shared/validation-utils.js
 * @description 共享验证工具
 * 
 * 提供统一的数据验证功能，消除代码中重复的验证逻辑。
 */

import { VALIDATION_ERRORS } from '../../config/constants/index.js';
import { ErrorHandler, ERROR_TYPES } from './error-handler.js';

/**
 * 验证规则类型
 */
export const VALIDATION_RULES = {
  REQUIRED: 'required',
  EMAIL: 'email',
  URL: 'url',
  MIN_LENGTH: 'minLength',
  MAX_LENGTH: 'maxLength',
  PATTERN: 'pattern',
  NUMERIC: 'numeric',
  INTEGER: 'integer',
  POSITIVE: 'positive',
  RANGE: 'range',
  CUSTOM: 'custom'
};

/**
 * 验证器类
 */
export class Validator {
  constructor() {
    this.rules = [];
    this.errors = [];
  }

  /**
   * 添加验证规则
   * @param {string} field - 字段名
   * @param {any} value - 字段值
   * @param {Array} rules - 验证规则数组
   * @returns {Validator} 链式调用
   */
  field(field, value, rules) {
    this.rules.push({ field, value, rules });
    return this;
  }

  /**
   * 执行验证
   * @returns {Object} 验证结果
   */
  validate() {
    this.errors = [];

    for (const { field, value, rules } of this.rules) {
      for (const rule of rules) {
        const error = this.validateRule(field, value, rule);
        if (error) {
          this.errors.push(error);
        }
      }
    }

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      firstError: this.errors[0] || null
    };
  }

  /**
   * 验证单个规则
   * @param {string} field - 字段名
   * @param {any} value - 字段值
   * @param {Object|string} rule - 验证规则
   * @returns {Object|null} 错误对象或null
   */
  validateRule(field, value, rule) {
    const ruleConfig = typeof rule === 'string' ? { type: rule } : rule;
    const { type, message, ...params } = ruleConfig;

    let isValid = true;
    let defaultMessage = '';

    switch (type) {
      case VALIDATION_RULES.REQUIRED:
        isValid = ValidationUtils.isRequired(value);
        defaultMessage = VALIDATION_ERRORS.REQUIRED_FIELD;
        break;

      case VALIDATION_RULES.EMAIL:
        isValid = !value || ValidationUtils.isValidEmail(value);
        defaultMessage = VALIDATION_ERRORS.INVALID_EMAIL;
        break;

      case VALIDATION_RULES.URL:
        isValid = !value || ValidationUtils.isValidUrl(value);
        defaultMessage = VALIDATION_ERRORS.INVALID_URL;
        break;

      case VALIDATION_RULES.MIN_LENGTH:
        isValid = ValidationUtils.hasMinLength(value, params.min);
        defaultMessage = `最少需要 ${params.min} 个字符`;
        break;

      case VALIDATION_RULES.MAX_LENGTH:
        isValid = ValidationUtils.hasMaxLength(value, params.max);
        defaultMessage = `最多允许 ${params.max} 个字符`;
        break;

      case VALIDATION_RULES.PATTERN:
        isValid = ValidationUtils.matchesPattern(value, params.pattern);
        defaultMessage = VALIDATION_ERRORS.INVALID_FORMAT;
        break;

      case VALIDATION_RULES.NUMERIC:
        isValid = ValidationUtils.isNumeric(value);
        defaultMessage = '必须是数字';
        break;

      case VALIDATION_RULES.INTEGER:
        isValid = ValidationUtils.isInteger(value);
        defaultMessage = '必须是整数';
        break;

      case VALIDATION_RULES.POSITIVE:
        isValid = ValidationUtils.isPositive(value);
        defaultMessage = '必须是正数';
        break;

      case VALIDATION_RULES.RANGE:
        isValid = ValidationUtils.inRange(value, params.min, params.max);
        defaultMessage = `值必须在 ${params.min} 到 ${params.max} 之间`;
        break;

      case VALIDATION_RULES.CUSTOM:
        isValid = params.validator(value);
        defaultMessage = '验证失败';
        break;

      default:
        return null;
    }

    if (!isValid) {
      return {
        field,
        rule: type,
        message: message || defaultMessage,
        value
      };
    }

    return null;
  }

  /**
   * 重置验证器
   * @returns {Validator} 链式调用
   */
  reset() {
    this.rules = [];
    this.errors = [];
    return this;
  }
}

/**
 * 验证工具类
 */
export class ValidationUtils {
  /**
   * 检查值是否为必需的（非空）
   * @param {any} value - 值
   * @returns {boolean} 是否有效
   */
  static isRequired(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return true;
  }

  /**
   * 检查是否为有效的邮箱地址
   * @param {string} email - 邮箱地址
   * @returns {boolean} 是否有效
   */
  static isValidEmail(email) {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(email).trim());
  }

  /**
   * 检查是否为有效的URL
   * @param {string} url - URL字符串
   * @returns {boolean} 是否有效
   */
  static isValidUrl(url) {
    if (!url) return false;
    try {
      new URL(String(url));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 检查字符串长度是否满足最小要求
   * @param {string} value - 字符串值
   * @param {number} min - 最小长度
   * @returns {boolean} 是否有效
   */
  static hasMinLength(value, min) {
    if (!value) return min === 0;
    return String(value).length >= min;
  }

  /**
   * 检查字符串长度是否不超过最大限制
   * @param {string} value - 字符串值
   * @param {number} max - 最大长度
   * @returns {boolean} 是否有效
   */
  static hasMaxLength(value, max) {
    if (!value) return true;
    return String(value).length <= max;
  }

  /**
   * 检查值是否匹配指定模式
   * @param {string} value - 字符串值
   * @param {RegExp|string} pattern - 正则表达式或字符串模式
   * @returns {boolean} 是否匹配
   */
  static matchesPattern(value, pattern) {
    if (!value) return true;
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    return regex.test(String(value));
  }

  /**
   * 检查是否为数字
   * @param {any} value - 值
   * @returns {boolean} 是否为数字
   */
  static isNumeric(value) {
    if (value === null || value === undefined || value === '') return false;
    return !isNaN(Number(value)) && isFinite(Number(value));
  }

  /**
   * 检查是否为整数
   * @param {any} value - 值
   * @returns {boolean} 是否为整数
   */
  static isInteger(value) {
    if (!this.isNumeric(value)) return false;
    return Number.isInteger(Number(value));
  }

  /**
   * 检查是否为正数
   * @param {any} value - 值
   * @returns {boolean} 是否为正数
   */
  static isPositive(value) {
    if (!this.isNumeric(value)) return false;
    return Number(value) > 0;
  }

  /**
   * 检查值是否在指定范围内
   * @param {any} value - 值
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @returns {boolean} 是否在范围内
   */
  static inRange(value, min, max) {
    if (!this.isNumeric(value)) return false;
    const num = Number(value);
    return num >= min && num <= max;
  }

  /**
   * 批量验证对象
   * @param {Object} data - 数据对象
   * @param {Object} schema - 验证模式
   * @returns {Object} 验证结果
   */
  static validateObject(data, schema) {
    const validator = new Validator();

    Object.entries(schema).forEach(([field, rules]) => {
      const value = data[field];
      validator.field(field, value, Array.isArray(rules) ? rules : [rules]);
    });

    return validator.validate();
  }

  /**
   * 创建验证错误
   * @param {string} field - 字段名
   * @param {string} rule - 规则类型
   * @param {string} message - 错误消息
   * @returns {Error} 验证错误
   */
  static createValidationError(field, rule, message) {
    return ErrorHandler.handleValidationError(field, '', rule);
  }
}

/**
 * 便捷的验证函数
 */

/**
 * 创建新的验证器实例
 * @returns {Validator} 验证器实例
 */
export function createValidator() {
  return new Validator();
}

/**
 * 快速验证单个值
 * @param {any} value - 值
 * @param {Array} rules - 验证规则
 * @param {string} field - 字段名
 * @returns {Object} 验证结果
 */
export function validateValue(value, rules, field = 'value') {
  return new Validator()
    .field(field, value, rules)
    .validate();
}

/**
 * 验证必需字段
 * @param {any} value - 值
 * @param {string} field - 字段名
 * @returns {boolean} 是否有效
 */
export function isRequired(value, field = 'field') {
  const result = validateValue(value, [VALIDATION_RULES.REQUIRED], field);
  return result.isValid;
}

/**
 * 验证邮箱
 * @param {string} email - 邮箱地址
 * @returns {boolean} 是否有效
 */
export function isValidEmail(email) {
  const result = validateValue(email, [VALIDATION_RULES.EMAIL], 'email');
  return result.isValid;
}

/**
 * 验证URL
 * @param {string} url - URL字符串
 * @returns {boolean} 是否有效
 */
export function isValidUrl(url) {
  const result = validateValue(url, [VALIDATION_RULES.URL], 'url');
  return result.isValid;
}

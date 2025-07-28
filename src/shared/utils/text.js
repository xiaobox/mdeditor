/**
 * @file src/utils/shared/text-utils.js
 * @description 共享文本处理工具
 * 
 * 提供统一的文本处理、验证和格式化功能，消除代码中重复的文本处理逻辑。
 */

/**
 * HTML转义映射表
 */
const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;'
};

/**
 * HTML反转义映射表
 */
const HTML_UNESCAPE_MAP = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&#x2F;': '/'
};

/**
 * 文本工具类
 */
export class TextUtils {
  /**
   * HTML转义
   * @param {string} text - 需要转义的文本
   * @returns {string} 转义后的文本
   */
  static escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"'\/]/g, match => HTML_ESCAPE_MAP[match]);
  }

  /**
   * HTML反转义
   * @param {string} text - 需要反转义的文本
   * @returns {string} 反转义后的文本
   */
  static unescapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/&(amp|lt|gt|quot|#39|#x2F);/g, match => HTML_UNESCAPE_MAP[match]);
  }

  /**
   * 清理和标准化文本
   * @param {string} text - 原始文本
   * @param {Object} options - 清理选项
   * @returns {string} 清理后的文本
   */
  static cleanText(text, options = {}) {
    if (!text) return '';
    
    const {
      normalizeLineEndings = true,
      trimLines = true,
      limitConsecutiveNewlines = true,
      maxConsecutiveNewlines = 2,
      convertTabs = true,
      tabSize = 4
    } = options;

    let result = String(text);

    if (normalizeLineEndings) {
      // 统一换行符
      result = result.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }

    if (convertTabs) {
      // 将制表符转换为空格
      const spaces = ' '.repeat(tabSize);
      result = result.replace(/\t/g, spaces);
    }

    if (trimLines) {
      // 清理行尾空白
      result = result.replace(/[ \t]+$/gm, '');
    }

    if (limitConsecutiveNewlines) {
      // 限制连续空行数量
      const pattern = new RegExp(`\\n{${maxConsecutiveNewlines + 1},}`, 'g');
      const replacement = '\n'.repeat(maxConsecutiveNewlines);
      result = result.replace(pattern, replacement);
    }

    return result;
  }

  /**
   * 验证和清理URL
   * @param {string} url - 原始URL
   * @param {Object} options - 验证选项
   * @returns {string} 清理后的URL
   */
  static cleanUrl(url, options = {}) {
    if (!url) return '';
    
    const {
      addProtocol = true,
      defaultProtocol = 'https://',
      allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:', 'ftp:']
    } = options;

    let result = String(url).trim();

    // 如果没有协议，添加默认协议
    if (addProtocol && !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(result)) {
      result = defaultProtocol + result;
    }

    // 验证协议
    try {
      const urlObj = new URL(result);
      if (!allowedProtocols.includes(urlObj.protocol)) {
        return '';
      }
      return urlObj.href;
    } catch {
      return '';
    }
  }

  /**
   * 截断文本
   * @param {string} text - 原始文本
   * @param {number} maxLength - 最大长度
   * @param {string} suffix - 后缀
   * @returns {string} 截断后的文本
   */
  static truncate(text, maxLength, suffix = '...') {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength - suffix.length) + suffix;
  }

  /**
   * 智能截断（按单词边界）
   * @param {string} text - 原始文本
   * @param {number} maxLength - 最大长度
   * @param {string} suffix - 后缀
   * @returns {string} 截断后的文本
   */
  static truncateWords(text, maxLength, suffix = '...') {
    if (!text || text.length <= maxLength) return text;
    
    const truncated = text.slice(0, maxLength - suffix.length);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > 0) {
      return truncated.slice(0, lastSpace) + suffix;
    }
    
    return truncated + suffix;
  }

  /**
   * 移除HTML标签
   * @param {string} html - HTML字符串
   * @returns {string} 纯文本
   */
  static stripHtml(html) {
    if (!html) return '';
    return String(html).replace(/<[^>]*>/g, '');
  }

  /**
   * 提取纯文本内容
   * @param {string} html - HTML字符串
   * @param {Object} options - 提取选项
   * @returns {string} 纯文本
   */
  static extractText(html, options = {}) {
    if (!html) return '';
    
    const {
      preserveLineBreaks = true,
      preserveSpacing = false,
      maxLength = null
    } = options;

    let result = this.stripHtml(html);
    
    if (preserveLineBreaks) {
      // 保留换行符
      result = result.replace(/\n/g, ' ').replace(/\s+/g, ' ');
    }
    
    if (!preserveSpacing) {
      // 标准化空白字符
      result = result.replace(/\s+/g, ' ').trim();
    }
    
    if (maxLength && result.length > maxLength) {
      result = this.truncateWords(result, maxLength);
    }
    
    return result;
  }

  /**
   * 生成安全的HTML属性值
   * @param {string} value - 属性值
   * @returns {string} 安全的属性值
   */
  static sanitizeAttribute(value) {
    if (!value) return '';
    
    return String(value)
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ');
  }

  /**
   * 检查字符串是否为空或只包含空白字符
   * @param {string} str - 字符串
   * @returns {boolean} 是否为空
   */
  static isEmpty(str) {
    return !str || String(str).trim().length === 0;
  }

  /**
   * 检查字符串是否为有效的邮箱地址
   * @param {string} email - 邮箱地址
   * @returns {boolean} 是否有效
   */
  static isValidEmail(email) {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(email).trim());
  }

  /**
   * 检查字符串是否为有效的URL
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
   * 格式化文件大小
   * @param {number} bytes - 字节数
   * @param {number} decimals - 小数位数
   * @returns {string} 格式化后的大小
   */
  static formatFileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * 生成随机字符串
   * @param {number} length - 长度
   * @param {string} charset - 字符集
   * @returns {string} 随机字符串
   */
  static randomString(length = 8, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }

  /**
   * 将驼峰命名转换为kebab-case
   * @param {string} str - 驼峰命名字符串
   * @returns {string} kebab-case字符串
   */
  static kebabCase(str) {
    if (!str) return '';
    return String(str)
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase();
  }

  /**
   * 将kebab-case转换为驼峰命名
   * @param {string} str - kebab-case字符串
   * @returns {string} 驼峰命名字符串
   */
  static camelCase(str) {
    if (!str) return '';
    return String(str)
      .replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
  }

  /**
   * 将字符串转换为标题格式
   * @param {string} str - 原始字符串
   * @returns {string} 标题格式字符串
   */
  static titleCase(str) {
    if (!str) return '';
    return String(str)
      .toLowerCase()
      .replace(/\b\w/g, letter => letter.toUpperCase());
  }
}

/**
 * 便捷函数导出
 */
export const escapeHtml = TextUtils.escapeHtml;
export const unescapeHtml = TextUtils.unescapeHtml;
export const cleanText = TextUtils.cleanText;
export const cleanUrl = TextUtils.cleanUrl;
export const truncate = TextUtils.truncate;
export const stripHtml = TextUtils.stripHtml;
export const sanitizeAttribute = TextUtils.sanitizeAttribute;
export const isEmpty = TextUtils.isEmpty;
export const isValidEmail = TextUtils.isValidEmail;
export const isValidUrl = TextUtils.isValidUrl;

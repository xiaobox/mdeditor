/**
 * @file src/shared/utils/text.js
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




}

/**
 * 便捷函数导出 - 只导出实际使用的函数
 */
export const escapeHtml = TextUtils.escapeHtml;
export const cleanUrl = TextUtils.cleanUrl;
export const sanitizeAttribute = TextUtils.sanitizeAttribute;

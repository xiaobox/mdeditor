/**
 * @file src/utils/formatters/link-media-processors.js
 * @description 链接和媒体处理工具
 * 
 * 专门处理 Markdown 中的链接和媒体元素（图片）。
 * 从 text-processors.js 中提取出来，提高代码的模块化程度。
 */

import { REGEX_PATTERNS } from '../../../config/constants/index.js';
import { cleanUrl as sharedCleanUrl } from '../../../shared/utils/text.js';

/**
 * 处理链接
 * 将 Markdown 格式的链接转换为 HTML 链接标签
 * 支持微信公众号友好的样式
 * 
 * @param {string} text - 包含链接标记的文本
 * @param {Object} theme - 主题对象
 * @returns {string} - 处理后的文本
 */
export function processLinks(text, theme) {
  return text.replace(REGEX_PATTERNS.LINK, (_, linkText, url) => {
    const cleanUrl = url.trim();
    return `<a href="${cleanUrl}" style="color: ${theme.primary}; text-decoration: none; border-bottom: 1px solid ${theme.primary}4D;" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
  });
}

/**
 * 处理图片
 * 将 Markdown 格式的图片转换为 HTML 图片标签
 * 支持响应式设计和懒加载
 * 
 * @param {string} text - 包含图片标记的文本
 * @param {Object} theme - 主题对象
 * @returns {string} - 处理后的文本
 */
export function processImages(text, theme) {
  return text.replace(REGEX_PATTERNS.IMAGE, (_, altText, url) => {
    const cleanUrl = url.trim();
    const cleanAlt = altText || '图片';

    return `<img src="${cleanUrl}" alt="${cleanAlt}" style="max-width: 100%; height: auto; border-radius: 6px; box-shadow: 0 2px 8px ${theme.shadowColor}; margin: 8px 0; display: block;" loading="lazy">`;
  });
}

/**
 * 清理和验证 URL
 * 使用共享的 URL 清理工具
 * 
 * @param {string} url - 需要清理的 URL
 * @returns {string} - 清理后的 URL
 */
export function cleanUrl(url) {
  return sharedCleanUrl(url);
}

/**
 * 生成安全的 HTML 属性值
 * 转义HTML属性中的特殊字符，防止XSS攻击
 * 
 * @param {string} value - 属性值
 * @returns {string} - 安全的属性值
 */
export function sanitizeAttribute(value) {
  if (!value) return '';
  
  return value
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
} 
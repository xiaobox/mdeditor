/**
 * @file src/core/markdown/formatters/escape.js
 * @description Markdown 转义字符处理工具
 *
 * 专门处理 Markdown 中的转义字符，包括预处理和后处理转义序列。
 * 从 text-processors.js 中提取出来，提高代码的模块化程度。
 */

import { escapeHtml as sharedEscapeHtml } from '../../../shared/utils/text.js';

/**
 * 转义字符到占位符的映射表
 * 用于在文本处理过程中临时保护转义字符
 */
const ESCAPE_PLACEHOLDERS = {
  '\\\\': 'XESCBSX',
  '\\*': 'XESCASX',
  '\\_': 'XESCUSX',
  '\\`': 'XESCBTX',
  '\\~': 'XESCTLX',
  '\\[': 'XESCLBX',
  '\\]': 'XESCRBX',
  '\\(': 'XESCLPX',
  '\\)': 'XESCRPX',
  '\\#': 'XESCHSX',
  '\\+': 'XESCPLX',
  '\\-': 'XESCMNX',
  '\\.': 'XESCDTX',
  '\\!': 'XESCEXX'
};

/**
 * 占位符到实际字符的映射表
 * 用于将占位符还原为原始字符
 */
const PLACEHOLDER_TO_CHAR = {
  'XESCBSX': '\\',
  'XESCASX': '*',
  'XESCUSX': '_',
  'XESCBTX': '`',
  'XESCTLX': '~',
  'XESCLBX': '[',
  'XESCRBX': ']',
  'XESCLPX': '(',
  'XESCRPX': ')',
  'XESCHSX': '#',
  'XESCPLX': '+',
  'XESCMNX': '-',
  'XESCDTX': '.',
  'XESCEXX': '!'
};

/**
 * 转义 HTML 特殊字符
 * @param {string} text - 需要转义的文本
 * @returns {string} - 转义后的文本
 */
export function escapeHtml(text) {
  return sharedEscapeHtml(text);
}

/**
 * 预处理转义字符，将其替换为占位符
 * 这样可以在后续的格式化过程中保护这些转义字符不被误处理
 * 
 * @param {string} text - 包含转义字符的文本
 * @returns {string} - 替换为占位符的文本
 */
export function preprocessEscapes(text) {
  if (!text) return '';

  let result = text;
  for (const [escape, placeholder] of Object.entries(ESCAPE_PLACEHOLDERS)) {
    result = result.replace(new RegExp(escape.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), placeholder);
  }
  return result;
}

/**
 * 后处理占位符，将其替换回实际字符
 * 在所有格式化处理完成后，将占位符还原为原始字符
 * 
 * @param {string} text - 包含占位符的文本
 * @returns {string} - 替换回实际字符的文本
 */
export function postprocessEscapes(text) {
  if (!text) return '';

  let result = text;
  for (const [placeholder, char] of Object.entries(PLACEHOLDER_TO_CHAR)) {
    // 转义占位符中的特殊字符
    const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escapedPlaceholder, 'g'), char);
  }
  return result;
} 
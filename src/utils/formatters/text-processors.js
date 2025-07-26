/**
 * @file src/utils/formatters/text-processors.js
 * @description 文本处理工具函数
 * 
 * 包含各种文本处理和格式化的工具函数，从主格式化器中提取出来
 * 以提高代码的模块化和可维护性。
 */

import { REGEX_PATTERNS } from '../../config/constants/index.js';
import { escapeHtml as sharedEscapeHtml, cleanUrl as sharedCleanUrl } from '../shared/text-utils.js';

/**
 * 清理引用式链接和图片引用（微信不兼容）
 * @param {string} text - 原始 Markdown 文本
 * @returns {string} - 清理后的文本
 */
export function cleanReferenceLinks(text) {
  // 移除引用式链接定义 [id]: url "title"
  text = text.replace(/^\s*\[([^\]]+)\]:\s*([^\s]+)(\s+"[^"]*")?\s*$/gm, '');
  
  // 移除引用式图片定义
  text = text.replace(/^\s*!\[([^\]]*)\]:\s*([^\s]+)(\s+"[^"]*")?\s*$/gm, '');
  
  return text;
}

/**
 * 转义 HTML 特殊字符（使用共享工具）
 * @param {string} text - 需要转义的文本
 * @returns {string} - 转义后的文本
 */
export function escapeHtml(text) {
  return sharedEscapeHtml(text);
}

/**
 * 转义字符映射表
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
 * 预处理转义字符，将其替换为占位符
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

/**
 * 处理内联代码
 * @param {string} text - 包含内联代码的文本
 * @param {Object} theme - 主题对象
 * @returns {string} - 处理后的文本
 */
export function processInlineCode(text, theme) {
  return text.replace(REGEX_PATTERNS.CODE, (_, code) => {
    const escapedCode = escapeHtml(code);
    // 使用主题色的微信兼容样式
    return `<code style="background-color: ${theme.inlineCodeBg}; color: ${theme.inlineCodeText}; padding: 2px 4px; border-radius: 3px; font-family: Consolas, monospace; font-size: 14px; border: 1px solid ${theme.inlineCodeBorder};">${escapedCode}</code>`;
  });
}

/**
 * 处理粗体和斜体文本（智能处理避免冲突）
 * @param {string} text - 包含格式标记的文本
 * @param {Object} theme - 主题对象
 * @returns {string} - 处理后的文本
 */
export function processBoldAndItalic(text, theme) {
  let result = text;

  // 首先处理粗斜体 ***text*** 和 ___text___
  result = result.replace(/\*\*\*(.*?)\*\*\*/g, (_, content) => {
    return `<strong><em style="color: ${theme.textSecondary}; font-style: italic; font-weight: 600;">${content}</em></strong>`;
  });

  result = result.replace(/_{3}(.*?)_{3}/g, (_, content) => {
    return `<strong><em style="color: ${theme.textSecondary}; font-style: italic; font-weight: 600;">${content}</em></strong>`;
  });

  // 然后处理粗体 **text** 和 __text__
  result = result.replace(REGEX_PATTERNS.BOLD, (_, content) => {
    return `<strong style="color: ${theme.textPrimary}; font-weight: 600;">${content}</strong>`;
  });

  result = result.replace(REGEX_PATTERNS.BOLD_UNDERSCORE, (_, content) => {
    return `<strong style="color: ${theme.textPrimary}; font-weight: 600;">${content}</strong>`;
  });

  // 最后处理斜体 *text* 和 _text_（只处理未被粗体包围的）
  result = result.replace(REGEX_PATTERNS.ITALIC, (_, content) => {
    return `<em style="color: ${theme.textSecondary}; font-style: italic;">${content}</em>`;
  });

  result = result.replace(REGEX_PATTERNS.ITALIC_UNDERSCORE, (_, content) => {
    return `<em style="color: ${theme.textSecondary}; font-style: italic;">${content}</em>`;
  });

  return result;
}

/**
 * 处理粗体文本（支持星号和下划线语法）
 * @param {string} text - 包含粗体标记的文本
 * @param {Object} theme - 主题对象
 * @returns {string} - 处理后的文本
 */
export function processBold(text, theme) {
  // 这个函数现在主要用于向后兼容
  return processBoldAndItalic(text, theme);
}

/**
 * 处理斜体文本（支持星号和下划线语法）
 * @param {string} text - 包含斜体标记的文本
 * @param {Object} theme - 主题对象
 * @returns {string} - 处理后的文本
 */
export function processItalic(text, _theme) {
  // 这个函数现在主要用于向后兼容，实际处理在 processBoldAndItalic 中完成
  return text;
}

/**
 * 处理删除线文本
 * @param {string} text - 包含删除线标记的文本
 * @param {Object} theme - 主题对象
 * @returns {string} - 处理后的文本
 */
export function processStrikethrough(text, theme) {
  return text.replace(/~~(.*?)~~/g, (_, content) => {
    return `<del style="color: ${theme.textMuted}; text-decoration: line-through;">${content}</del>`;
  });
}

/**
 * 处理链接
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
 * 处理高亮文本（使用 ==text== 语法）
 * @param {string} text - 包含高亮标记的文本
 * @param {Object} theme - 主题对象
 * @returns {string} - 处理后的文本
 */
export function processHighlight(text, theme) {
  return text.replace(/==(.*?)==/g, (_, content) => {
    return `<mark style="background-color: ${theme.highlight}; color: ${theme.textPrimary}; padding: 1px 2px; border-radius: 2px;">${content}</mark>`;
  });
}

/**
 * 处理下标文本（使用 ~text~ 语法）
 * @param {string} text - 包含下标标记的文本
 * @param {Object} theme - 主题对象
 * @returns {string} - 处理后的文本
 */
export function processSubscript(text, theme) {
  return text.replace(/~([^~\s]+)~/g, (_, content) => {
    return `<sub style="color: ${theme.textSecondary}; font-size: 0.8em;">${content}</sub>`;
  });
}

/**
 * 处理上标文本（使用 ^text^ 语法）
 * @param {string} text - 包含上标标记的文本
 * @param {Object} theme - 主题对象
 * @returns {string} - 处理后的文本
 */
export function processSuperscript(text, theme) {
  return text.replace(/\^([^\^\s]+)\^/g, (_, content) => {
    return `<sup style="color: ${theme.textSecondary}; font-size: 0.8em;">${content}</sup>`;
  });
}

/**
 * 处理键盘按键（使用 <kbd>key</kbd> 语法）
 * @param {string} text - 包含键盘按键标记的文本
 * @param {Object} theme - 主题对象
 * @returns {string} - 处理后的文本
 */
export function processKeyboard(text, theme) {
  return text.replace(/<kbd>(.*?)<\/kbd>/g, (_, content) => {
    return `<kbd style="background-color: ${theme.borderLight}; color: ${theme.textPrimary}; padding: 2px 6px; border-radius: 3px; border: 1px solid ${theme.borderMedium}; font-family: monospace; font-size: 0.9em; box-shadow: 0 1px 2px ${theme.shadowColor};">${content}</kbd>`;
  });
}

/**
 * 处理所有内联文本格式
 * @param {string} text - 原始文本
 * @param {Object} theme - 主题对象
 * @param {boolean} handleEscapes - 是否处理转义字符（默认true）
 * @returns {string} - 处理后的文本
 */
export function processAllInlineFormats(text, theme, handleEscapes = true) {
  // 按照优先级顺序处理，避免冲突
  let result = text;

  // 首先预处理转义字符，将其替换为占位符（只在顶层处理）
  if (handleEscapes) {
    result = preprocessEscapes(result);
  }

  // 然后处理代码，因为代码内部不应该被其他格式化影响
  result = processInlineCode(result, theme);

  // 处理其他格式
  result = processKeyboard(result, theme);
  result = processHighlight(result, theme);

  // 使用智能的粗体斜体处理（一次性处理避免冲突）
  result = processBoldAndItalic(result, theme);

  result = processStrikethrough(result, theme);
  result = processSuperscript(result, theme);
  result = processSubscript(result, theme);
  result = processLinks(result, theme);
  result = processImages(result, theme);

  // 最后后处理占位符，将其替换回实际字符（只在顶层处理）
  if (handleEscapes) {
    result = postprocessEscapes(result);
  }

  return result;
}

/**
 * 处理内联格式但不处理转义字符（用于嵌套调用）
 * @param {string} text - 原始文本
 * @param {Object} theme - 主题对象
 * @returns {string} - 处理后的文本
 */
export function processInlineFormatsWithoutEscapes(text, theme) {
  return processAllInlineFormats(text, theme, false);
}

/**
 * 清理和标准化文本
 * @param {string} text - 原始文本
 * @returns {string} - 清理后的文本
 */
export function cleanText(text) {
  // 移除多余的空白字符
  text = text.replace(/\r\n/g, '\n'); // 统一换行符
  text = text.replace(/\r/g, '\n'); // 处理旧式 Mac 换行符
  text = text.replace(/\t/g, '    '); // 将制表符转换为空格
  
  // 清理行尾空白
  text = text.replace(/[ \t]+$/gm, '');
  
  // 限制连续空行数量
  text = text.replace(/\n{3,}/g, '\n\n');
  
  return text;
}

/**
 * 验证和清理 URL（使用共享工具）
 * @param {string} url - 原始 URL
 * @returns {string} - 清理后的 URL
 */
export function cleanUrl(url) {
  return sharedCleanUrl(url);
}

/**
 * 生成安全的 HTML 属性值
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

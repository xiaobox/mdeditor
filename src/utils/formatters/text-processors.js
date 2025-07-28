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

// 用于保护代码内容的占位符
const CODE_PLACEHOLDERS = [];

/**
 * 处理内联代码
 * @param {string} text - 包含内联代码的文本
 * @param {Object} theme - 主题对象
 * @returns {string} - 处理后的文本
 */
export function processInlineCode(text, theme) {
  // 清空占位符数组
  CODE_PLACEHOLDERS.length = 0;

  return text.replace(REGEX_PATTERNS.CODE, (_, code) => {
    const escapedCode = escapeHtml(code);
    // 使用主题色的微信兼容样式
    const codeHtml = `<code style="background-color: ${theme.inlineCodeBg}; color: ${theme.inlineCodeText}; padding: 2px 4px; border-radius: 3px; font-family: Consolas, monospace; font-size: 14px; border: 1px solid ${theme.inlineCodeBorder};">${escapedCode}</code>`;

    // 创建安全的占位符（使用不会被格式化的字符）
    const placeholder = `〖CODE${CODE_PLACEHOLDERS.length}〗`;
    CODE_PLACEHOLDERS.push(codeHtml);

    return placeholder;
  });
}

/**
 * 恢复代码占位符
 * @param {string} text - 包含占位符的文本
 * @returns {string} - 恢复后的文本
 */
export function restoreCodePlaceholders(text) {
  let result = text;
  CODE_PLACEHOLDERS.forEach((codeHtml, index) => {
    const placeholder = `〖CODE${index}〗`;
    result = result.replace(placeholder, codeHtml);
  });
  return result;
}

/**
 * 处理粗体和斜体文本的组合格式（支持星号和下划线语法）
 * 使用改进的算法处理嵌套格式
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

  // 处理嵌套的粗体包含斜体的情况: **text*italic*text**
  // 使用更精确的正则表达式，确保正确匹配完整的粗体块
  result = result.replace(/\*\*([^*]*(?:\*[^*]+\*[^*]*)*)\*\*/g, (match, content) => {
    // 处理内部的斜体
    const processedContent = content.replace(/\*([^*]+)\*/g, '<em style="color: ' + theme.textSecondary + '; font-style: italic;">$1</em>');
    return `<strong style="color: ${theme.textPrimary}; font-weight: 600;">${processedContent}</strong>`;
  });

  // 处理下划线粗体包含斜体: __text_italic_text__
  result = result.replace(/__([^_]*(?:_[^_]+_[^_]*)*)__/g, (match, content) => {
    // 处理内部的斜体
    const processedContent = content.replace(/_([^_]+)_/g, '<em style="color: ' + theme.textSecondary + '; font-style: italic;">$1</em>');
    return `<strong style="color: ${theme.textPrimary}; font-weight: 600;">${processedContent}</strong>`;
  });

  // 处理剩余的独立粗体 **text**（不包含嵌套格式）
  result = result.replace(/\*\*([^*]+)\*\*/g, (_, content) => {
    return `<strong style="color: ${theme.textPrimary}; font-weight: 600;">${content}</strong>`;
  });

  result = result.replace(/__([^_]+)__/g, (_, content) => {
    return `<strong style="color: ${theme.textPrimary}; font-weight: 600;">${content}</strong>`;
  });

  // 最后处理独立的斜体 *text*（不在粗体内的）
  result = result.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, (_, content) => {
    return `<em style="color: ${theme.textSecondary}; font-style: italic;">${content}</em>`;
  });

  result = result.replace(/(?<!_)_([^_]+)_(?!_)/g, (_, content) => {
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
 * 内联格式处理器配置
 */
const INLINE_FORMAT_PROCESSORS = [
  {
    name: 'escapes',
    process: (text, theme, handleEscapes) => handleEscapes ? preprocessEscapes(text) : text,
    condition: (handleEscapes) => handleEscapes
  },
  {
    name: 'inlineCode',
    process: (text, theme) => processInlineCode(text, theme),
    condition: () => true
  },
  {
    name: 'keyboard',
    process: (text, theme) => processKeyboard(text, theme),
    condition: () => true
  },
  {
    name: 'highlight',
    process: (text, theme) => processHighlight(text, theme),
    condition: () => true
  },
  {
    name: 'boldAndItalic',
    process: (text, theme) => processBoldAndItalic(text, theme),
    condition: () => true
  },
  {
    name: 'strikethrough',
    process: (text, theme) => processStrikethrough(text, theme),
    condition: () => true
  },
  {
    name: 'superscript',
    process: (text, theme) => processSuperscript(text, theme),
    condition: () => true
  },
  {
    name: 'subscript',
    process: (text, theme) => processSubscript(text, theme),
    condition: () => true
  },
  {
    name: 'links',
    process: (text, theme) => processLinks(text, theme),
    condition: () => true
  },
  {
    name: 'images',
    process: (text, theme) => processImages(text, theme),
    condition: () => true
  },
  {
    name: 'restoreCode',
    process: (text) => restoreCodePlaceholders(text),
    condition: () => true
  },
  {
    name: 'postprocessEscapes',
    process: (text, theme, handleEscapes) => handleEscapes ? postprocessEscapes(text) : text,
    condition: (handleEscapes) => handleEscapes
  }
];

/**
 * 格式化处理器管道 - 按顺序执行各个处理器
 * @param {string} text - 原始文本
 * @param {Object} theme - 主题对象
 * @param {boolean} handleEscapes - 是否处理转义字符
 * @returns {string} - 处理后的文本
 */
function executeFormattingPipeline(text, theme, handleEscapes) {
  let result = text;

  for (const processor of INLINE_FORMAT_PROCESSORS) {
    if (processor.condition(handleEscapes)) {
      result = processor.process(result, theme, handleEscapes);
    }
  }

  return result;
}

/**
 * 处理所有内联文本格式
 * @param {string} text - 原始文本
 * @param {Object} theme - 主题对象
 * @param {boolean} handleEscapes - 是否处理转义字符（默认true）
 * @returns {string} - 处理后的文本
 */
export function processAllInlineFormats(text, theme, handleEscapes = true) {
  return executeFormattingPipeline(text, theme, handleEscapes);
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

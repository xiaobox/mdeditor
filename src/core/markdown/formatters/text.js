/**
 * @file src/utils/formatters/text-processors.js
 * @description 文本处理工具函数
 * 
 * 包含各种文本处理和格式化的工具函数，从主格式化器中提取出来
 * 以提高代码的模块化和可维护性。
 */

import { REGEX_PATTERNS } from '../../../config/constants/index.js';
import { 
  escapeHtml, 
  preprocessEscapes, 
  postprocessEscapes 
} from './escape.js';
import {
  processLinks,
  processImages,
  cleanUrl,
  sanitizeAttribute
} from './link.js';
import {
  processHighlight,
  processSubscript,
  processSuperscript,
  processKeyboard
} from './special.js';
import {
  processBoldAndItalic,
  processBold,
  processItalic,
  processStrikethrough
} from './style.js';

/**
 * 清理引用式链接和图片引用（社交平台不兼容）
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

// 转义处理函数现在从 escape-handlers.js 模块导入
// 这里保留导出以维持向后兼容性
export { escapeHtml, preprocessEscapes, postprocessEscapes } from './escape.js';

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
    // 使用主题色的社交平台兼容样式
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
// 基础样式格式处理函数现在从 style-format-processors.js 模块导入
// 这里保留导出以维持向后兼容性
export { 
  processBoldAndItalic,
  processBold,
  processItalic,
  processStrikethrough
} from './style.js';

// 链接和媒体处理函数现在从 link-media-processors.js 模块导入
// 这里保留导出以维持向后兼容性
export { processLinks, processImages } from './link.js';

// 特殊格式处理函数现在从 special-format-processors.js 模块导入
// 这里保留导出以维持向后兼容性
export { 
  processHighlight,
  processSubscript,
  processSuperscript,
  processKeyboard
} from './special.js';

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

// URL处理和属性净化函数现在从 link-media-processors.js 模块导入
// 这里保留导出以维持向后兼容性
export { cleanUrl, sanitizeAttribute } from './link.js';

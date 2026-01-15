/**
 * @file src/core/markdown/formatters/text.js
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

/**
 * 代码占位符上下文 - 通过返回值传递，避免全局状态污染
 * @typedef {Object} CodePlaceholderContext
 * @property {string[]} placeholders - 代码 HTML 片段数组
 * @property {string} id - 当前上下文的唯一标识符
 */

/**
 * 生成唯一的占位符 ID
 * @returns {string} - 唯一 ID
 */
function generatePlaceholderId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * 创建新的代码占位符上下文
 * @returns {CodePlaceholderContext} - 新的上下文对象
 */
function createCodeContext() {
  return {
    placeholders: [],
    id: generatePlaceholderId()
  };
}

/**
 * 处理内联代码
 * @param {string} text - 包含内联代码的文本
 * @param {Object} theme - 主题对象
 * @param {number} baseFontSize - 基础字号
 * @returns {{text: string, context: CodePlaceholderContext}} - 处理后的文本和上下文对象
 */
export function processInlineCode(text, theme, baseFontSize = 16) {
  // 为每次处理创建独立的上下文，避免并发时状态互相覆盖
  const context = createCodeContext();

  const processedText = text.replace(REGEX_PATTERNS.CODE, (_, code) => {
    const escapedCode = escapeHtml(code);
    // 内联代码字号固定为 14px，保持与代码块一致
    const codeFontSize = 14;
    // 使用主题色的社交平台兼容样式
    const codeHtml = `<code style="background-color: ${theme.inlineCodeBg}; color: ${theme.inlineCodeText}; padding: 2px 4px; border-radius: 3px; font-family: Consolas, monospace; font-size: ${codeFontSize}px; border: 1px solid ${theme.inlineCodeBorder};">${escapedCode}</code>`;

    // 创建安全的占位符（使用唯一 ID 避免碰撞）
    const placeholder = `〖CODE_${context.id}_${context.placeholders.length}〗`;
    context.placeholders.push(codeHtml);

    return placeholder;
  });

  return { text: processedText, context };
}

/**
 * 恢复代码占位符
 * @param {string} text - 包含占位符的文本
 * @param {CodePlaceholderContext|null} context - 代码占位符上下文
 * @returns {string} - 恢复后的文本
 */
export function restoreCodePlaceholders(text, context) {
  if (!context) {
    return text;
  }

  let result = text;
  const { placeholders, id } = context;

  placeholders.forEach((codeHtml, index) => {
    const placeholder = `〖CODE_${id}_${index}〗`;
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
 * 管道状态 - 存储处理过程中的上下文信息
 * @typedef {Object} PipelineState
 * @property {CodePlaceholderContext|null} codeContext - 代码占位符上下文
 */

/**
 * 内联格式处理器配置
 * @description 每个处理器接收 (text, theme, handleEscapes, baseFontSize, state) 参数
 *              state 用于在处理器之间传递上下文（如代码占位符）
 */
const INLINE_FORMAT_PROCESSORS = [
  {
    name: 'escapes',
    process: (text, theme, handleEscapes, baseFontSize, state) => handleEscapes ? preprocessEscapes(text) : text,
    condition: (handleEscapes) => handleEscapes
  },
  {
    name: 'inlineCode',
    process: (text, theme, handleEscapes, baseFontSize, state) => {
      const { text: processedText, context } = processInlineCode(text, theme, baseFontSize);
      state.codeContext = context;
      return processedText;
    },
    condition: () => true
  },
  // 提前处理链接与图片，避免后续样式处理影响 URL（如下划线触发斜体）
  {
    name: 'images',
    process: (text, theme, handleEscapes, baseFontSize, state) => processImages(text, theme),
    condition: () => true
  },
  {
    name: 'links',
    process: (text, theme, handleEscapes, baseFontSize, state) => processLinks(text, theme),
    condition: () => true
  },
  {
    name: 'keyboard',
    process: (text, theme, handleEscapes, baseFontSize, state) => processKeyboard(text, theme),
    condition: () => true
  },
  {
    name: 'highlight',
    process: (text, theme, handleEscapes, baseFontSize, state) => processHighlight(text, theme),
    condition: () => true
  },
  {
    name: 'boldAndItalic',
    process: (text, theme, handleEscapes, baseFontSize, state) => processBoldAndItalic(text, theme),
    condition: () => true
  },
  {
    name: 'strikethrough',
    process: (text, theme, handleEscapes, baseFontSize, state) => processStrikethrough(text, theme),
    condition: () => true
  },
  {
    name: 'superscript',
    process: (text, theme, handleEscapes, baseFontSize, state) => processSuperscript(text, theme),
    condition: () => true
  },
  {
    name: 'subscript',
    process: (text, theme, handleEscapes, baseFontSize, state) => processSubscript(text, theme),
    condition: () => true
  },
  {
    name: 'restoreCode',
    process: (text, theme, handleEscapes, baseFontSize, state) => restoreCodePlaceholders(text, state.codeContext),
    condition: () => true
  },
  {
    name: 'postprocessEscapes',
    process: (text, theme, handleEscapes, baseFontSize, state) => handleEscapes ? postprocessEscapes(text) : text,
    condition: (handleEscapes) => handleEscapes
  }
];

/**
 * 格式化处理器管道 - 按顺序执行各个处理器
 * @param {string} text - 原始文本
 * @param {Object} theme - 主题对象
 * @param {boolean} handleEscapes - 是否处理转义字符
 * @param {number} baseFontSize - 基础字号
 * @returns {string} - 处理后的文本
 */
function executeFormattingPipeline(text, theme, handleEscapes, baseFontSize = 16) {
  let result = text;

  // 创建管道状态，用于在处理器之间传递上下文
  const state = {
    codeContext: null
  };

  for (const processor of INLINE_FORMAT_PROCESSORS) {
    if (processor.condition(handleEscapes)) {
      result = processor.process(result, theme, handleEscapes, baseFontSize, state);
    }
  }

  return result;
}

/**
 * 处理所有内联文本格式
 * @param {string} text - 原始文本
 * @param {Object} theme - 主题对象
 * @param {boolean} handleEscapes - 是否处理转义字符（默认true）
 * @param {number} baseFontSize - 基础字号
 * @returns {string} - 处理后的文本
 */
export function processAllInlineFormats(text, theme, handleEscapes = true, baseFontSize = 16) {
  return executeFormattingPipeline(text, theme, handleEscapes, baseFontSize);
}

/**
 * 处理内联格式但不处理转义字符（用于嵌套调用）
 * @param {string} text - 原始文本
 * @param {Object} theme - 主题对象
 * @param {number} baseFontSize - 基础字号
 * @returns {string} - 处理后的文本
 */
export function processInlineFormatsWithoutEscapes(text, theme, baseFontSize = 16) {
  return processAllInlineFormats(text, theme, false, baseFontSize);
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

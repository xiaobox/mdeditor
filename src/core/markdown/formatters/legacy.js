/**
 * @file src/utils/formatters/style-formatters.js
 * @description 可复用的样式格式化函数
 *
 * 本模块包含为特定 Markdown 元素（如代码块、引用块、表格）生成样式化 HTML 的函数。
 * 这些函数设计为可在格式化管道的不同部分重复使用。
 */

import { defaultColorTheme } from '../../theme/presets/color-themes.js';
import { getCodeStyle } from '../../theme/presets/code-styles.js';
import { processAllInlineFormats, processInlineFormatsWithoutEscapes } from './text.js';
import { highlightCode } from './code.js';

/**
 * 格式化内联文本（粗体、斜体、链接等）
 * @param {string} text - 要格式化的文本内容
 * @param {object} [theme=defaultColorTheme] - 颜色主题对象
 * @returns {string} - 格式化后的 HTML 字符串
 */
export function formatInlineText(text, theme = defaultColorTheme) {
  if (!text) return '';
  return processAllInlineFormats(text, theme);
}

/**
 * Formats inline text for internal nested calls, without handling escape characters.
 * @param {string} text - The text content to format.
 * @param {object} [theme=defaultColorTheme] - The color theme object.
 * @returns {string} - The formatted HTML string.
 */
function formatInlineTextInternal(text, theme = defaultColorTheme) {
  if (!text) return '';
  return processInlineFormatsWithoutEscapes(text, theme);
}

/**
 * 格式化代码块，包含语法高亮和主题样式
 * @param {string} content - 代码内容
 * @param {string} language - 编程语言
 * @param {object} [theme=defaultColorTheme] - 颜色主题对象
 * @param {object|null} [codeTheme=null] - 代码样式主题对象
 * @param {boolean} [isPreview=false] - 是否为预览模式
 * @returns {string} - 格式化后的代码块 HTML 字符串
 */
export function formatCodeBlock(content, language, theme = defaultColorTheme, codeTheme = null, isPreview = false) {
  const trimmedContent = content.trim();
  const safeCodeTheme = codeTheme || getCodeStyle('mac');
  const highlightedContent = highlightCode(trimmedContent, language, safeCodeTheme);

  const preStyle = `
    background: ${safeCodeTheme.background};
    border-radius: 12px;
    padding: 24px;
    overflow-x: auto;
    font-size: 14px;
    line-height: 1.7;
    border: none;
    position: relative;
    font-family: Consolas, monospace;
    margin: 32px 0;
    font-weight: 400;
    color: ${safeCodeTheme.color};
    box-sizing: content-box;
  `.replace(/\s+/g, ' ').trim();

  const codeStyle = `
    background: transparent;
    border: none;
    font-family: Consolas, monospace;
    font-size: 14px;
    line-height: 1.7;
    color: ${safeCodeTheme.color} !important;
    ${safeCodeTheme.hasHeader ? 'margin-top: 40px;' : ''}
    ${safeCodeTheme.hasTrafficLights ? 'margin-top: 28px;' : ''}
    display: block;
    white-space: pre-wrap !important;
    word-wrap: break-word;
    word-spacing: normal !important;
    letter-spacing: normal !important;
  `.replace(/\s+/g, ' ').trim();

  let decorations = '';
  if (safeCodeTheme.hasTrafficLights) {
    // 统一使用相同的HTML结构，通过CSS来处理预览模式和社交平台模式的差异
    const trafficLightsStyle = `position: absolute; top: 14px; left: 12px; font-size: 16px; line-height: 1; z-index: 2; letter-spacing: 5px;`;
    decorations += `
      <span class="mac-traffic-lights" style="${trafficLightsStyle}">
        <span style="color: #ff5f56;">●</span><span style="color: #ffbd2e;">●</span><span style="color: #27ca3f;">●</span>
      </span>
    `.replace(/\s+/g, ' ').trim();
  }

  if (safeCodeTheme.hasHeader) {
    const headerContent = safeCodeTheme.headerContent.replace('代码', language || '代码');
    decorations += `
      <div style="${safeCodeTheme.headerStyle}">
        ${headerContent}
      </div>
    `.replace(/\s+/g, ' ').trim();
  }

  return `<pre style="${preStyle}">${decorations}<code style="${codeStyle}">${highlightedContent}</code></pre>`;
}

/**
 * 引用块样式配置
 */
const BLOCKQUOTE_STYLES = {
  level1: {
    margin: '24px 0',
    padding: '18px 24px',
    fontSize: '16px',
    boxShadow: '0 4px 16px'
  },
  level2: {
    margin: '12px 0 12px 0px',
    padding: '12px 18px',
    fontSize: '15px',
    boxShadow: '0 2px 8px'
  },
  level3: {
    margin: '8px 0 8px 0px',
    padding: '8px 12px',
    fontSize: '14px',
    boxShadow: '0 1px 4px'
  },
  default: {
    margin: '6px 0 6px 0px',
    padding: '6px 10px',
    fontSize: '13px',
    boxShadow: '0 1px 2px'
  }
};

/**
 * 生成引用块样式字符串
 * @param {object} theme - 主题对象
 * @param {number} level - 引用层级
 * @returns {string} CSS样式字符串
 */
function generateBlockquoteStyle(theme, level) {
  const styleConfig = BLOCKQUOTE_STYLES[`level${level}`] || BLOCKQUOTE_STYLES.default;
  const shadowOpacity = level <= 3 ? ['1A', '14', '0F'][level - 1] || '0A' : '0A';
  
  return `
    border-left: 4px solid ${theme.primary};
    background: linear-gradient(135deg, ${theme.primary}14 0%, ${theme.primary}0A 50%, ${theme.primary}14 100%);
    margin: ${styleConfig.margin};
    padding: ${styleConfig.padding};
    border-radius: 6px;
    position: relative;
    box-shadow: ${styleConfig.boxShadow} ${theme.primary}${shadowOpacity};
    color: #1f2328;
    font-style: italic;
    line-height: 1.6;
    font-size: ${styleConfig.fontSize};
  `.replace(/\s+/g, ' ').trim();
}

/**
 * 处理引用行，提取引用内容
 * @param {string} line - 原始行内容
 * @returns {object} 处理结果 { isQuote: boolean, content: string, level: number }
 */
function processQuoteLine(line) {
  const trimmedLine = line.trim();
  
  if (!trimmedLine.startsWith('>')) {
    return { isQuote: false, content: line, level: 0 };
  }

  let level = 0;
  let content = trimmedLine;
  
  // 计算引用层级
  while (content.startsWith('>')) {
    level++;
    content = content.substring(1).trim();
  }
  
  return { isQuote: true, content, level };
}

/**
 * 处理段落内容，将内容分割为段落
 * @param {string[]} lines - 内容行数组
 * @param {object} theme - 主题对象
 * @returns {string} 格式化后的段落HTML
 */
function processParagraphs(lines, theme) {
  const content = lines.join('\n').trim();
  if (!content) return '';

  const paragraphs = content.split(/\n{2,}/);
  return paragraphs.map(p => {
    const formattedP = formatInlineTextInternal(p.replace(/\n/g, '<br>'), theme);
    return `<p style="margin: 8px 0; line-height: 1.6;">${formattedP}</p>`;
  }).join('');
}

/**
 * 构建嵌套引用HTML结构
 * @param {string[]} lines - 内容行数组
 * @param {number} level - 引用层级
 * @param {object} theme - 主题对象
 * @returns {string} 引用块HTML
 */
function buildNestedQuotes(lines, level, theme) {
  if (!lines || lines.length === 0) return '';

  let html = '';
  let currentBlockLines = [];
  let childLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const { isQuote, content, level: lineLevel } = processQuoteLine(line);

    if (isQuote && lineLevel > 1) {
      // 处理嵌套引用
      if (currentBlockLines.length > 0) {
        html += processParagraphs(currentBlockLines, theme);
        currentBlockLines = [];
      }
      childLines.push('>' + content);
    } else if (isQuote) {
      // 处理当前层级引用
      if (childLines.length > 0) {
        html += buildNestedQuotes(childLines, level + 1, theme);
        childLines = [];
      }
      currentBlockLines.push(content);
    } else {
      // 处理非引用行
      currentBlockLines.push(line);
    }
  }

  // 处理剩余内容
  if (currentBlockLines.length > 0) {
    html += processParagraphs(currentBlockLines, theme);
  }
  if (childLines.length > 0) {
    html += buildNestedQuotes(childLines, level + 1, theme);
  }

  const style = generateBlockquoteStyle(theme, level);
  return `<blockquote style="${style}">${html}</blockquote>`;
}

/**
 * Formats a blockquote, handling nested quotes and applying theme styles.
 * @param {string[]} contentLines - The lines of content within the blockquote.
 * @param {object} [theme=defaultColorTheme] - The color theme object.
 * @returns {string} - The formatted HTML string for the blockquote.
 */
export function formatBlockquote(contentLines, theme = defaultColorTheme) {
  return buildNestedQuotes(contentLines, 1, theme);
}

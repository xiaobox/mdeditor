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
 * @param {number} [baseFontSize=16] - 基础字号
 * @returns {string} - 格式化后的 HTML 字符串
 */
export function formatInlineText(text, theme = defaultColorTheme, baseFontSize = 16) {
  if (!text) return '';
  return processAllInlineFormats(text, theme, true, baseFontSize);
}

/**
 * Formats inline text for internal nested calls, without handling escape characters.
 * @param {string} text - The text content to format.
 * @param {object} [theme=defaultColorTheme] - The color theme object.
 * @param {number} [baseFontSize=16] - 基础字号
 * @returns {string} - The formatted HTML string.
 */
function formatInlineTextInternal(text, theme = defaultColorTheme, baseFontSize = 16) {
  if (!text) return '';
  return processInlineFormatsWithoutEscapes(text, theme, baseFontSize);
}

/**
 * 格式化代码块，包含语法高亮和主题样式
 * @param {string} content - 代码内容
 * @param {string} language - 编程语言
 * @param {object} [theme=defaultColorTheme] - 颜色主题对象
 * @param {object|null} [codeTheme=null] - 代码样式主题对象
 * @param {boolean} [isPreview=false] - 是否为预览模式
 * @param {number} [baseFontSize=16] - 基础字号
 * @returns {string} - 格式化后的代码块 HTML 字符串
 */
export function formatCodeBlock(content, language, theme = defaultColorTheme, codeTheme = null, isPreview = false, baseFontSize = 16) {
  const trimmedContent = content.trim();
  const safeCodeTheme = codeTheme || getCodeStyle('mac');
  const highlightedContent = highlightCode(trimmedContent, language, safeCodeTheme);

  // 代码块字号通常比正文小一些
  const codeFontSize = Math.max(12, Math.round(baseFontSize * 0.875)); // 约87.5%的正文字号

  const preStyle = `
    background: ${safeCodeTheme.background};
    border-radius: 12px;
    padding: 24px;
    overflow-x: auto;
    font-size: ${codeFontSize}px;
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
    font-size: ${codeFontSize}px;
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
    if (isPreview) {
      // 预览环境：使用真正的圆形元素，确保在所有字体下都一致
      // 使用绝对定位而不是flex，避免微信兼容性问题
      const containerStyle = `position: absolute; top: 14px; left: 12px; z-index: 2; width: 54px; height: 12px;`;
      const lightStyle = `width: 12px; height: 12px; border-radius: 50%; position: absolute; top: 0;`;
      decorations += `
        <div class="mac-traffic-lights" style="${containerStyle}">
          <div style="${lightStyle} left: 0; background-color: #ff5f56;"></div>
          <div style="${lightStyle} left: 18px; background-color: #ffbd2e;"></div>
          <div style="${lightStyle} left: 36px; background-color: #27ca3f;"></div>
        </div>
      `.replace(/\s+/g, ' ').trim();
    } else {
      // 微信环境：使用字符实现，简单且兼容性好
      decorations += `
        <span class="mac-traffic-lights" style="position: absolute; top: 19px; left: 19px; font-size: 16px; line-height: 1; z-index: 2; letter-spacing: 5px;">
          <span style="color: #ff5f56;">●</span><span style="color: #ffbd2e;">●</span><span style="color: #27ca3f;">●</span>
        </span>
      `.replace(/\s+/g, ' ').trim();
    }
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
 * @param {number} baseFontSize - 基础字号
 */
function getBlockquoteStyles(baseFontSize = 16) {
  return {
    level1: {
      margin: '24px 0',
      padding: '18px 24px',
      fontSize: `${baseFontSize}px`,
      boxShadow: '0 4px 16px'
    },
    level2: {
      margin: '12px 0 12px 0px',
      padding: '12px 18px',
      fontSize: `${Math.round(baseFontSize * 0.94)}px`,
      boxShadow: '0 2px 8px'
    },
    level3: {
      margin: '8px 0 8px 0px',
      padding: '8px 12px',
      fontSize: `${Math.round(baseFontSize * 0.88)}px`,
      boxShadow: '0 1px 4px'
    },
    default: {
      margin: '6px 0 6px 0px',
      padding: '6px 10px',
      fontSize: `${Math.round(baseFontSize * 0.81)}px`,
      boxShadow: '0 1px 2px'
    }
  };
}

/**
 * 生成引用块样式字符串
 * @param {object} theme - 主题对象
 * @param {number} level - 引用层级
 * @param {number} baseFontSize - 基础字号
 * @returns {string} CSS样式字符串
 */
function generateBlockquoteStyle(theme, level, baseFontSize = 16) {
  const blockquoteStyles = getBlockquoteStyles(baseFontSize);
  const styleConfig = blockquoteStyles[`level${level}`] || blockquoteStyles.default;
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
 * @param {number} baseFontSize - 基础字号
 * @returns {string} 格式化后的段落HTML
 */
function processParagraphs(lines, theme, baseFontSize = 16) {
  const content = lines.join('\n').trim();
  if (!content) return '';

  const paragraphs = content.split(/\n{2,}/);
  const lineHeight = baseFontSize <= 14 ? '1.7' : baseFontSize <= 18 ? '1.6' : '1.5';

  return paragraphs.map(p => {
    const formattedP = formatInlineTextInternal(p.replace(/\n/g, '<br>'), theme, baseFontSize);
    return `<p style="margin: 8px 0; line-height: ${lineHeight}; font-size: ${baseFontSize}px;">${formattedP}</p>`;
  }).join('');
}

/**
 * 构建嵌套引用HTML结构
 * @param {string[]} lines - 内容行数组
 * @param {number} level - 引用层级
 * @param {object} theme - 主题对象
 * @param {number} baseFontSize - 基础字号
 * @returns {string} 引用块HTML
 */
function buildNestedQuotes(lines, level, theme, baseFontSize = 16) {
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
        html += processParagraphs(currentBlockLines, theme, baseFontSize);
        currentBlockLines = [];
      }
      childLines.push('>' + content);
    } else if (isQuote) {
      // 处理当前层级引用
      if (childLines.length > 0) {
        html += buildNestedQuotes(childLines, level + 1, theme, baseFontSize);
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
    html += processParagraphs(currentBlockLines, theme, baseFontSize);
  }
  if (childLines.length > 0) {
    html += buildNestedQuotes(childLines, level + 1, theme, baseFontSize);
  }

  const style = generateBlockquoteStyle(theme, level, baseFontSize);
  return `<blockquote style="${style}">${html}</blockquote>`;
}

/**
 * Formats a blockquote, handling nested quotes and applying theme styles.
 * @param {string[]} contentLines - The lines of content within the blockquote.
 * @param {object} [theme=defaultColorTheme] - The color theme object.
 * @param {number} [baseFontSize=16] - 基础字号
 * @returns {string} - The formatted HTML string for the blockquote.
 */
export function formatBlockquote(contentLines, theme = defaultColorTheme, baseFontSize = 16) {
  return buildNestedQuotes(contentLines, 1, theme, baseFontSize);
}

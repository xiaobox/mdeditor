/**
 * @file src/core/markdown/formatters/legacy.js
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
 * 内部调用的内联文本格式化（不处理转义字符）
 * @param {string} text - 待格式化的文本内容
 * @param {object} [theme=defaultColorTheme] - 颜色主题对象
 * @param {number} [baseFontSize=16] - 基础字号
 * @returns {string} - 格式化后的 HTML 字符串
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

  // 代码块字号固定为 14px（预览与复制保持一致）
  const codeFontSize = 14;

  const preStyle = `
    background: ${safeCodeTheme.background} ${!isPreview ? '!important' : ''};
    border-radius: 12px ${!isPreview ? '!important' : ''};
    ${safeCodeTheme.hasHeader ? `padding: 0 ${!isPreview ? '!important' : ''};` : `padding: 24px ${!isPreview ? '!important' : ''};`}
    overflow-x: auto ${!isPreview ? '!important' : ''};
    font-size: ${codeFontSize}px ${!isPreview ? '!important' : ''};
    line-height: 1.3 ${!isPreview ? '!important' : ''};
    border: none ${!isPreview ? '!important' : ''};
    position: relative ${!isPreview ? '!important' : ''};
    font-family: Consolas, monospace ${!isPreview ? '!important' : ''};
    margin: 32px 0 ${!isPreview ? '!important' : ''};
    font-weight: 400 ${!isPreview ? '!important' : ''};
    color: ${safeCodeTheme.color} ${!isPreview ? '!important' : ''};
    box-sizing: border-box ${!isPreview ? '!important' : ''};
    display: block ${!isPreview ? '!important' : ''};
    min-height: auto ${!isPreview ? '!important' : ''};
    height: auto ${!isPreview ? '!important' : ''};
    max-height: none ${!isPreview ? '!important' : ''};
    ${!isPreview ? 'vertical-align: top !important;' : ''}
  `.replace(/\s+/g, ' ').trim();

  const codeStyle = `
    background: transparent ${!isPreview ? '!important' : ''};
    border: none ${!isPreview ? '!important' : ''};
    font-family: Consolas, monospace ${!isPreview ? '!important' : ''};
    font-size: ${codeFontSize}px ${!isPreview ? '!important' : ''};
    line-height: 1.3 ${!isPreview ? '!important' : ''};
    color: ${safeCodeTheme.color} ${!isPreview ? '!important' : ''};
    display: block ${!isPreview ? '!important' : ''};
    white-space: pre-wrap ${!isPreview ? '!important' : ''};
    word-wrap: break-word ${!isPreview ? '!important' : ''};
    word-spacing: normal ${!isPreview ? '!important' : ''};
    letter-spacing: normal ${!isPreview ? '!important' : ''};
    margin: 0 ${!isPreview ? '!important' : ''};
    ${safeCodeTheme.hasHeader ? `padding: 12px 24px 20px 24px ${!isPreview ? '!important' : ''};` : `padding: 24px ${!isPreview ? '!important' : ''};`}
    box-sizing: border-box ${!isPreview ? '!important' : ''};
    min-height: auto ${!isPreview ? '!important' : ''};
    height: auto ${!isPreview ? '!important' : ''};
    max-height: none ${!isPreview ? '!important' : ''};
    ${!isPreview ? 'vertical-align: top !important;' : ''}
  `.replace(/\s+/g, ' ').trim();

  let decorations = '';

  if (safeCodeTheme.hasHeader) {
    let headerContent;

    // Mac样式特殊处理：动态生成红绿灯
    if (safeCodeTheme.id === 'mac') {
      // 红绿灯使用固定大小，不跟随字体变化（模拟真实Mac窗口）
      const trafficLightSize = 12; // 固定12px，接近真实Mac红绿灯大小
      const labelSize = Math.max(11, Math.round(baseFontSize * 0.75)); // 标签稍微跟随字体，但保持相对较小
      const spacing = 6; // 固定间距，保持一致性

      headerContent = `<span class="mac-traffic-light-red" style="color: #ff5f56 !important; margin-right: ${spacing}px !important; font-size: ${trafficLightSize}px !important; line-height: 1 !important; display: inline !important; width: auto !important; height: auto !important;">●</span><span class="mac-traffic-light-yellow" style="color: #ffbd2e !important; margin-right: ${spacing}px !important; font-size: ${trafficLightSize}px !important; line-height: 1 !important; display: inline !important; width: auto !important; height: auto !important;">●</span><span class="mac-traffic-light-green" style="color: #27ca3f !important; margin-right: ${spacing * 2}px !important; font-size: ${trafficLightSize}px !important; line-height: 1 !important; display: inline !important; width: auto !important; height: auto !important;">●</span><span class="mac-code-label" style="font-size: ${labelSize}px !important; color: #8b949e !important; line-height: 1 !important; display: inline !important;">${language || 'code'}</span>`;
    } else {
      // 其他样式使用原有逻辑
      headerContent = safeCodeTheme.headerContent.replace('代码', language || '代码');
    }

    // 为微信环境添加额外的样式保护，Mac样式动态调整padding
    let protectedHeaderStyle = !isPreview
      ? safeCodeTheme.headerStyle.replace(/line-height:\s*[\d.]+;?/g, 'line-height: 1.2 !important;') + ' min-height: auto !important; height: auto !important;'
      : safeCodeTheme.headerStyle;

    // Mac样式特殊处理：使用固定padding，保持一致的视觉效果
    if (safeCodeTheme.id === 'mac') {
      const headerPadding = 12; // 固定padding，不跟随字体变化
      protectedHeaderStyle = protectedHeaderStyle.replace(/padding:\s*[^;]+;/g, `padding: ${headerPadding}px 20px;`);
    }

    decorations += `
      <div style="${protectedHeaderStyle}">
        ${headerContent}
      </div>
    `.replace(/\s+/g, ' ').trim();
  }

  // 生成内联CSS来保护语法高亮颜色 - 多重选择器确保兼容性
  const syntaxProtectionCSS = safeCodeTheme.syntaxHighlight ? `
    <style>
      /* 类名选择器 - 最稳定的方式 */
      .syntax-keyword, .syntax-keyword font { color: ${safeCodeTheme.syntaxHighlight.keyword} !important; }
      .syntax-string, .syntax-string font { color: ${safeCodeTheme.syntaxHighlight.string} !important; }
      .syntax-comment, .syntax-comment font { color: ${safeCodeTheme.syntaxHighlight.comment} !important; }
      .syntax-number, .syntax-number font { color: ${safeCodeTheme.syntaxHighlight.number} !important; }
      .syntax-function, .syntax-function font { color: ${safeCodeTheme.syntaxHighlight.function} !important; }

      /* 数据属性选择器 - 备用方案 */
      [data-syntax="keyword"], [data-syntax="keyword"] font { color: ${safeCodeTheme.syntaxHighlight.keyword} !important; }
      [data-syntax="string"], [data-syntax="string"] font { color: ${safeCodeTheme.syntaxHighlight.string} !important; }
      [data-syntax="comment"], [data-syntax="comment"] font { color: ${safeCodeTheme.syntaxHighlight.comment} !important; }
      [data-syntax="number"], [data-syntax="number"] font { color: ${safeCodeTheme.syntaxHighlight.number} !important; }
      [data-syntax="function"], [data-syntax="function"] font { color: ${safeCodeTheme.syntaxHighlight.function} !important; }

      /* 颜色属性选择器 - 最后的保护 */
      [data-color="${safeCodeTheme.syntaxHighlight.keyword}"] { color: ${safeCodeTheme.syntaxHighlight.keyword} !important; }
      [data-color="${safeCodeTheme.syntaxHighlight.string}"] { color: ${safeCodeTheme.syntaxHighlight.string} !important; }
      [data-color="${safeCodeTheme.syntaxHighlight.comment}"] { color: ${safeCodeTheme.syntaxHighlight.comment} !important; }
      [data-color="${safeCodeTheme.syntaxHighlight.number}"] { color: ${safeCodeTheme.syntaxHighlight.number} !important; }
      [data-color="${safeCodeTheme.syntaxHighlight.function}"] { color: ${safeCodeTheme.syntaxHighlight.function} !important; }
    </style>
  ` : '';

  return `${syntaxProtectionCSS}<pre style="${preStyle}">${decorations}<code style="${codeStyle}">${highlightedContent}</code></pre>`;
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
 * 格式化引用块，支持嵌套引用并应用主题样式
 * @param {string[]} contentLines - 引用块中的内容行
 * @param {object} [theme=defaultColorTheme] - 颜色主题对象
 * @param {number} [baseFontSize=16] - 基础字号
 * @returns {string} - 引用块的 HTML 字符串
 */
export function formatBlockquote(contentLines, theme = defaultColorTheme, baseFontSize = 16) {
  return buildNestedQuotes(contentLines, 1, theme, baseFontSize);
}

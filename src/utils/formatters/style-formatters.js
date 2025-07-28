/**
 * @file src/utils/formatters/style-formatters.js
 * @description 可复用的样式格式化函数
 *
 * 本模块包含为特定 Markdown 元素（如代码块、引用块、表格）生成样式化 HTML 的函数。
 * 这些函数设计为可在格式化管道的不同部分重复使用。
 */

import { defaultColorTheme } from '../../config/themes/color-themes.js';
import { getCodeStyle } from '../../config/themes/code-styles.js';
import { processAllInlineFormats, processInlineFormatsWithoutEscapes } from './text-processors.js';
import { highlightCode } from './code-highlighter.js';

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
    // 统一使用相同的HTML结构，通过CSS来处理预览模式和微信模式的差异
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
 * Formats a blockquote, handling nested quotes and applying theme styles.
 * @param {string[]} contentLines - The lines of content within the blockquote.
 * @param {object} [theme=defaultColorTheme] - The color theme object.
 * @returns {string} - The formatted HTML string for the blockquote.
 */
export function formatBlockquote(contentLines, theme = defaultColorTheme) {
  function buildNestedQuotes(lines, level = 1) {
    if (!lines || lines.length === 0) return '';

    let html = '';
    let currentBlockLines = [];
    let childLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('>')) {
        const strippedLine = trimmedLine.substring(1).trim();
        if (strippedLine.startsWith('>')) {
          if (currentBlockLines.length > 0) {
            html += processParagraphs(currentBlockLines);
            currentBlockLines = [];
          }
          childLines.push(strippedLine);
        } else {
          if (childLines.length > 0) {
            html += buildNestedQuotes(childLines, level + 1);
            childLines = [];
          }
          currentBlockLines.push(strippedLine);
        }
      } else {
        currentBlockLines.push(line);
      }
    }

    if (currentBlockLines.length > 0) {
      html += processParagraphs(currentBlockLines);
    }
    if (childLines.length > 0) {
      html += buildNestedQuotes(childLines, level + 1);
    }

    let style = '';
    switch (level) {
      case 1:
        style = `border-left: 4px solid ${theme.primary}; background: linear-gradient(135deg, ${theme.primary}14 0%, ${theme.primary}0A 50%, ${theme.primary}14 100%); margin: 24px 0; padding: 18px 24px; border-radius: 6px; position: relative; box-shadow: 0 4px 16px ${theme.primary}1A; color: #1f2328; font-style: italic; line-height: 1.6; font-size: 16px;`;
        break;
      case 2:
        style = `border-left: 4px solid ${theme.primary}; background: linear-gradient(135deg, ${theme.primary}14 0%, ${theme.primary}0A 50%, ${theme.primary}14 100%); margin: 12px 0 12px 0px; padding: 12px 18px; border-radius: 6px; position: relative; box-shadow: 0 2px 8px ${theme.primary}14; color: #1f2328; font-style: italic; line-height: 1.6; font-size: 15px;`;
        break;
      case 3:
        style = `border-left: 4px solid ${theme.primary}; background: linear-gradient(135deg, ${theme.primary}14 0%, ${theme.primary}0A 50%, ${theme.primary}14 100%); margin: 8px 0 8px 0px; padding: 8px 12px; border-radius: 6px; position: relative; box-shadow: 0 1px 4px ${theme.primary}0F; color: #1f2328; font-style: italic; line-height: 1.6; font-size: 14px;`;
        break;
      default:
        style = `border-left: 4px solid ${theme.primary}; background: linear-gradient(135deg, ${theme.primary}14 0%, ${theme.primary}0A 50%, ${theme.primary}14 100%); margin: 6px 0 6px 0px; padding: 6px 10px; border-radius: 6px; position: relative; box-shadow: 0 1px 2px ${theme.primary}0A; color: #1f2328; font-style: italic; line-height: 1.6; font-size: 13px;`;
        break;
    }

    return `<blockquote style="${style}">${html}</blockquote>`;
  }

  function processParagraphs(lines) {
    let content = lines.join('\n').trim();
    if (!content) return '';

    const paragraphs = content.split(/\n{2,}/);
    return paragraphs.map(p => {
      const formattedP = formatInlineTextInternal(p.replace(/\n/g, '<br>'), theme);
      return `<p style="margin: 8px 0; line-height: 1.6;">${formattedP}</p>`;
    }).join('');
  }

  return buildNestedQuotes(contentLines);
}

/**
 * 将 Markdown 表格格式化为带有对齐和主题样式的 HTML 表格
 * @param {string[]} rows - 表格行数组，包括表头和分隔符
 * @param {object} [theme=defaultColorTheme] - 颜色主题对象
 * @returns {string} - 格式化后的表格 HTML 字符串
 */
export function formatTable(rows, theme = defaultColorTheme) {
  if (rows.length < 2) return '';

  const headerRow = rows[0];
  const alignmentRow = rows[1];
  const bodyRows = rows.slice(2);

  const alignments = alignmentRow.split('|').map(cell => {
    const trimmed = cell.trim();
    if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
    if (trimmed.endsWith(':')) return 'right';
    return 'left';
  }).slice(1, -1);

  let tableHtml = '<table style="border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 16px;">';

  const headerCells = headerRow.split('|').map(cell => cell.trim()).slice(1, -1);
  if (headerCells.length > 0) {
    tableHtml += '<thead><tr style="background-color: #f6f8fa;">';
    headerCells.forEach((cell, index) => {
      const align = alignments[index] || 'left';
      const formattedCell = formatInlineTextInternal(cell, theme);
      tableHtml += `<th style="border: 1px solid #d0d7de; padding: 8px 12px; text-align: ${align}; font-weight: 600; color: #24292e;">${formattedCell}</th>`;
    });
    tableHtml += '</tr></thead>';
  }

  tableHtml += '<tbody>';
  bodyRows.forEach(row => {
    const cells = row.split('|').map(cell => cell.trim()).slice(1, -1);
    if (cells.length > 0) {
      tableHtml += '<tr>';
      cells.forEach((cell, index) => {
        const align = alignments[index] || 'left';
        const formattedCell = formatInlineTextInternal(cell, theme);
        tableHtml += `<td style="border: 1px solid #d0d7de; padding: 8px 12px; text-align: ${align}; color: #24292e;">${formattedCell}</td>`;
      });
      tableHtml += '</tr>';
    }
  });
  tableHtml += '</tbody></table>';

  return tableHtml;
}

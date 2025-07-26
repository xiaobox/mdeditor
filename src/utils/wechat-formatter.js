/**
 * 微信公众号格式化器
 * 直接从 Markdown 文本生成微信兼容的 HTML
 * 支持主题切换的统一格式化解决方案
 */

import { getColorTheme, defaultColorTheme } from '../config/themes/color-themes.js'
import { getCodeStyle } from '../config/themes/code-styles.js'
import { getThemeSystem } from '../config/themes/theme-systems.js'
import { FormatterCoordinator } from './formatters/formatter-coordinator.js'
import {
  cleanReferenceLinks,
  processAllInlineFormats,
  processInlineFormatsWithoutEscapes
} from './formatters/text-processors.js'
import { highlightCode } from './formatters/code-highlighter.js'
import { getThemesSafe } from './shared/theme-utils.js'

/**
 * 将 Markdown 文本格式化为微信公众号兼容的 HTML
 *
 * 这是主要的格式化函数，将标准 Markdown 语法转换为适合微信公众号编辑器的 HTML 代码。
 * 支持多种主题、代码高亮和自定义样式。
 *
 * @param {string} markdownText - 要格式化的 Markdown 文本内容
 * @param {string|Object} [theme=defaultColorTheme] - 颜色主题ID（如 'wechat', 'github'）或主题对象
 * @param {Object|null} [codeTheme=null] - 代码高亮主题对象，为 null 时使用默认主题
 * @param {string} [themeSystem='wechat'] - 主题系统ID，决定整体布局和样式风格
 * @returns {string} 格式化后的 HTML 字符串，可直接粘贴到微信公众号编辑器
 *
 * @example
 * // 基本用法
 * const html = formatForWechat('# 标题\n\n这是一段文本。');
 *
 * @example
 * // 使用自定义主题
 * const html = formatForWechat(markdown, 'github', codeTheme, 'jetbrains');
 *
 * @example
 * // 使用主题对象
 * const customTheme = { background: '#fff', textPrimary: '#333' };
 * const html = formatForWechat(markdown, customTheme);
 *
 * @see {@link getColorTheme} 获取可用的颜色主题
 * @see {@link getCodeStyle} 获取可用的代码样式
 * @see {@link getThemeSystem} 获取可用的主题系统
 */
export function formatForWechat(markdownText, theme = defaultColorTheme, codeTheme = null, themeSystem = 'wechat') {
  if (!markdownText || typeof markdownText !== 'string') {
    return ''
  }

  // 使用安全的主题获取方法
  const themes = getThemesSafe({
    colorTheme: theme,
    codeStyle: codeTheme,
    themeSystem: themeSystem
  })
  const { colorTheme: currentTheme, codeStyle: safeCodeTheme } = themes

  // 预处理：移除引用式链接和图片引用（微信不兼容）
  const cleanedText = cleanReferenceLinks(markdownText)

  // 使用新的格式化协调器
  const coordinator = new FormatterCoordinator()
  coordinator.setThemes(currentTheme, safeCodeTheme, themeSystem)

  const lines = cleanedText.split('\n')
  let result = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()

    // 使用协调器处理当前行
    const processResult = coordinator.processLine(line, trimmedLine, lines, i)

    // 更新上下文
    if (processResult.updateContext) {
      coordinator.updateContext(processResult.updateContext)
    }

    // 添加处理结果
    if (processResult.result) {
      result += processResult.result
    }

    // 如果不需要继续处理，跳过当前行
    if (!processResult.shouldContinue) {
      // 某些处理器可能需要重新处理当前行
      if (processResult.reprocessLine) {
        i-- // 重新处理当前行
      }
    }

  }

  // 完成格式化处理，处理任何未结束的内容
  result += coordinator.finalize()

  return result
}

/**
 * 格式化内联文本（粗体、斜体、链接等）
 * @param {string} text - 文本内容
 * @param {Object} theme - 主题对象
 * @returns {string} - 格式化后的文本
 */
export function formatInlineText(text, theme = defaultColorTheme) {
  if (!text) return '';

  return processAllInlineFormats(text, theme);
}

/**
 * 格式化内联文本（用于内部嵌套调用，不处理转义字符）
 * @param {string} text - 文本内容
 * @param {Object} theme - 主题对象
 * @returns {string} - 格式化后的文本
 */
function formatInlineTextInternal(text, theme = defaultColorTheme) {
  if (!text) return '';

  return processInlineFormatsWithoutEscapes(text, theme);
}

/**
 * 格式化代码块 - 支持多种代码主题
 * @param {string} content - 代码内容
 * @param {string} language - 编程语言
 * @param {Object} theme - 主题对象
 * @param {Object} codeTheme - 代码主题对象
 * @returns {string} - 格式化后的HTML
 */
export function formatCodeBlock(content, language, theme = defaultColorTheme, codeTheme = null) {
  const trimmedContent = content.trim();

  // 使用安全的主题获取方法
  const safeCodeTheme = codeTheme || getCodeStyle('mac');

  // 使用代码高亮器，使用固定的代码样式配色
  const highlightedContent = highlightCode(trimmedContent, language, safeCodeTheme);

  // 生成容器样式 - 使用微信兼容的简化样式
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

  // 移除不必要的contentStyle复杂性

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

  // 生成装饰元素
  let decorations = '';

  // Mac 红绿灯 - 恢复正确位置（微信中显示正常）
  if (safeCodeTheme.hasTrafficLights) {
    decorations += `
      <span style="position: absolute; top: 14px; left: 12px; font-size: 16px; line-height: 1; z-index: 2; letter-spacing: 5px;">
        <span style="color: #ff5f56;">●</span><span style="color: #ffbd2e;">●</span><span style="color: #27ca3f;">●</span>
      </span>
    `.replace(/\s+/g, ' ').trim();
  }

  // 头部标题栏
  if (safeCodeTheme.hasHeader) {
    const headerContent = safeCodeTheme.headerContent.replace('代码', language || '代码');
    decorations += `
      <div style="${safeCodeTheme.headerStyle}">
        ${headerContent}
      </div>
    `.replace(/\s+/g, ' ').trim();
  }

  // 使用简化的结构
  return `<pre style="${preStyle}">${decorations}<code style="${codeStyle}">${highlightedContent}</code></pre>`;
}





/**
 * 格式化引用块 - 保持嵌套结构和样式
 * @param {Array} contentLines - 引用块内容行
 * @param {Object} theme - 主题对象
 * @returns {string} - 格式化后的HTML
 */
export function formatBlockquote(contentLines, theme = defaultColorTheme) {
  // 递归函数，用于构建嵌套的HTML
  function buildNestedQuotes(lines, level = 1) {
    if (!lines || lines.length === 0) {
      return '';
    }

    let html = '';
    let currentBlockLines = [];
    let childLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('>')) {
        // 移除一级的 '>'
        const strippedLine = trimmedLine.substring(1).trim();
        
        if (strippedLine.startsWith('>')) {
          // 这是下一层的嵌套
          if (currentBlockLines.length > 0) {
            // 先处理完当前层级的内容
            html += processParagraphs(currentBlockLines);
            currentBlockLines = [];
          }
          childLines.push(strippedLine);
        } else {
          // 这是当前层级的内容
          if (childLines.length > 0) {
            // 递归处理子层级
            html += buildNestedQuotes(childLines, level + 1);
            childLines = [];
          }
          currentBlockLines.push(strippedLine);
        }
      } else {
        // 非引用行，也属于当前块
        currentBlockLines.push(line);
      }
    }

    // 处理剩余的行
    if (currentBlockLines.length > 0) {
      html += processParagraphs(currentBlockLines);
    }
    if (childLines.length > 0) {
      html += buildNestedQuotes(childLines, level + 1);
    }

    // 根据层级应用不同的样式 - 保持微信兼容性，适度使用主题色
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

  // 将段落内容包装在 <p> 标签中
  function processParagraphs(lines) {
    let content = lines.join('\n').trim();
    if (!content) return '';

    // 按段落分割
    const paragraphs = content.split(/\n{2,}/);
    return paragraphs.map(p => {
      const formattedP = formatInlineTextInternal(p.replace(/\n/g, '<br>'), theme);
      return `<p style="margin: 8px 0; line-height: 1.6;">${formattedP}</p>`;
    }).join('');
  }

  return buildNestedQuotes(contentLines);
}

/**
 * 格式化表格 - 支持对齐
 * @param {Array} rows - 表格行数据
 * @param {Object} theme - 主题对象
 * @returns {string} - 格式化后的HTML
 */
export function formatTable(rows, theme = defaultColorTheme) {
  if (rows.length < 2) return '' // 至少需要表头和分隔行

  const headerRow = rows[0];
  const alignmentRow = rows[1];
  const bodyRows = rows.slice(2);

  // 1. 解析对齐行
  const alignments = alignmentRow.split('|').map(cell => {
    const trimmed = cell.trim();
    if (trimmed.startsWith(':') && trimmed.endsWith(':')) {
      return 'center';
    } else if (trimmed.endsWith(':')) {
      return 'right';
    } else {
      return 'left';
    }
  }).slice(1, -1); // 移除首尾空字符串

  let tableHtml = '<table style="border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 16px;">'

  // 2. 格式化表头
  const headerCells = headerRow.split('|').map(cell => cell.trim()).slice(1, -1);
  if (headerCells.length > 0) {
    tableHtml += '<thead><tr style="background-color: #f6f8fa;">'
    headerCells.forEach((cell, index) => {
      const align = alignments[index] || 'left';
      const formattedCell = formatInlineTextInternal(cell, theme)
      tableHtml += `<th style="border: 1px solid #d0d7de; padding: 8px 12px; text-align: ${align}; font-weight: 600; color: #24292e;">${formattedCell}</th>`
    })
    tableHtml += '</tr></thead>'
  }

  // 3. 格式化表体
  tableHtml += '<tbody>'
  bodyRows.forEach(row => {
    const cells = row.split('|').map(cell => cell.trim()).slice(1, -1);
    if (cells.length > 0) {
      tableHtml += '<tr>'
      cells.forEach((cell, index) => {
        const align = alignments[index] || 'left';
        const formattedCell = formatInlineTextInternal(cell, theme)
        tableHtml += `<td style="border: 1px solid #d0d7de; padding: 8px 12px; text-align: ${align}; color: #24292e;">${formattedCell}</td>`
      })
      tableHtml += '</tr>'
    }
  });
  tableHtml += '</tbody></table>'

  return tableHtml
}






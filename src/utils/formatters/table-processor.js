/**
 * @file src/utils/formatters/table-processor.js
 * @description 表格处理器
 * 
 * 专门处理 Markdown 表格的复杂逻辑，包括表格检测、行解析和格式化。
 * 将原本复杂的嵌套条件逻辑重构为清晰的状态机模式。
 */

import { REGEX_PATTERNS, MARKDOWN_SYNTAX } from '../../config/constants/index.js';
import { formatInlineText } from './style-formatters.js';

/**
 * 表格状态枚举
 */
export const TABLE_STATES = {
  NONE: 'none',
  DETECTING: 'detecting',
  PROCESSING: 'processing',
  COMPLETE: 'complete'
};

/**
 * 表格行类型枚举
 */
export const TABLE_ROW_TYPES = {
  HEADER: 'header',
  SEPARATOR: 'separator',
  DATA: 'data',
  INVALID: 'invalid'
};

/**
 * 表格处理器类
 */
export class TableProcessor {
  constructor() {
    this.reset();
  }

  /**
   * 重置处理器状态
   */
  reset() {
    this.state = TABLE_STATES.NONE;
    this.rows = [];
    this.currentRowIndex = 0;
  }

  /**
   * 检查行是否可能是表格行
   * @param {string} line - 行内容
   * @param {string} trimmedLine - 去除空白的行内容
   * @returns {boolean} 是否可能是表格行
   */
  isPotentialTableRow(line, trimmedLine) {
    return trimmedLine.includes(MARKDOWN_SYNTAX.TABLE_SEPARATOR) && 
           !this.isSeparatorRow(trimmedLine);
  }

  /**
   * 检查行是否是表格分隔符行
   * @param {string} trimmedLine - 去除空白的行内容
   * @returns {boolean} 是否是分隔符行
   */
  isSeparatorRow(trimmedLine) {
    return REGEX_PATTERNS.TABLE_SEPARATOR.test(trimmedLine);
  }

  /**
   * 确定行类型
   * @param {string} line - 行内容
   * @param {string} trimmedLine - 去除空白的行内容
   * @param {number} rowIndex - 行索引
   * @returns {string} 行类型
   */
  getRowType(line, trimmedLine, rowIndex) {
    if (this.isSeparatorRow(trimmedLine)) {
      return TABLE_ROW_TYPES.SEPARATOR;
    }
    
    if (this.isPotentialTableRow(line, trimmedLine)) {
      return rowIndex === 0 ? TABLE_ROW_TYPES.HEADER : TABLE_ROW_TYPES.DATA;
    }
    
    return TABLE_ROW_TYPES.INVALID;
  }

  /**
   * 检查是否应该开始表格处理
   * @param {string} line - 当前行
   * @param {string} trimmedLine - 去除空白的当前行
   * @param {Array} lines - 所有行
   * @param {number} currentIndex - 当前行索引
   * @returns {boolean} 是否应该开始表格处理
   */
  shouldStartTable(line, trimmedLine, lines, currentIndex) {
    if (!this.isPotentialTableRow(line, trimmedLine)) {
      return false;
    }

    // 查找下一个非空行
    let nextLineIndex = currentIndex + 1;
    while (nextLineIndex < lines.length && lines[nextLineIndex].trim() === '') {
      nextLineIndex++;
    }

    // 检查下一行是否是分隔符行
    if (nextLineIndex < lines.length) {
      const nextLine = lines[nextLineIndex].trim();
      return this.isSeparatorRow(nextLine);
    }

    return false;
  }

  /**
   * 处理表格行
   * @param {string} line - 当前行
   * @param {string} trimmedLine - 去除空白的当前行
   * @param {Array} lines - 所有行
   * @param {number} currentIndex - 当前行索引
   * @param {Object} theme - 主题对象
   * @returns {Object} 处理结果
   */
  processTableRow(line, trimmedLine, lines, currentIndex, theme = {}) {
    const rowType = this.getRowType(line, trimmedLine, this.rows.length);

    switch (this.state) {
      case TABLE_STATES.NONE:
        if (this.shouldStartTable(line, trimmedLine, lines, currentIndex)) {
          this.state = TABLE_STATES.DETECTING;
          this.rows = [line];
          return { shouldContinue: true, result: '', tableComplete: false };
        }
        return { shouldContinue: false, result: '', tableComplete: false };

      case TABLE_STATES.DETECTING:
        if (rowType === TABLE_ROW_TYPES.SEPARATOR) {
          this.state = TABLE_STATES.PROCESSING;
          this.rows.push(line);
          return { shouldContinue: true, result: '', tableComplete: false };
        } else {
          // 不是有效的表格，重置状态
          this.reset();
          return { shouldContinue: false, result: '', tableComplete: false };
        }

      case TABLE_STATES.PROCESSING:
        if (rowType === TABLE_ROW_TYPES.DATA) {
          this.rows.push(line);
          return { shouldContinue: true, result: '', tableComplete: false };
        } else {
          // 表格结束
          const result = this.formatTable(theme);
          this.reset();
          return { shouldContinue: false, result, tableComplete: true, reprocessLine: true };
        }

      default:
        this.reset();
        return { shouldContinue: false, result: '', tableComplete: false };
    }
  }

  /**
   * 格式化表格为 HTML
   * @param {Object} theme - 主题对象
   * @returns {string} 格式化后的 HTML
   */
  formatTable(theme = {}) {
    if (this.rows.length < 2) {
      return '';
    }

    const headerRow = this.rows[0];
    const alignmentRow = this.rows[1];
    const bodyRows = this.rows.slice(2);

    // 解析对齐方式
    const alignments = this.parseAlignments(alignmentRow);

    let tableHtml = '<table style="border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 16px;">';

    // 格式化表头
    tableHtml += this.formatTableHeader(headerRow, alignments, theme);

    // 格式化表体
    if (bodyRows.length > 0) {
      tableHtml += this.formatTableBody(bodyRows, alignments, theme);
    }

    tableHtml += '</table>';
    return tableHtml;
  }

  /**
   * 解析对齐方式
   * @param {string} alignmentRow - 对齐行
   * @returns {Array} 对齐方式数组
   */
  parseAlignments(alignmentRow) {
    return alignmentRow.split(MARKDOWN_SYNTAX.TABLE_SEPARATOR)
      .map(cell => {
        const trimmed = cell.trim();
        if (trimmed.startsWith(':') && trimmed.endsWith(':')) {
          return 'center';
        } else if (trimmed.endsWith(':')) {
          return 'right';
        } else {
          return 'left';
        }
      })
      .slice(1, -1); // 移除首尾空字符串
  }

  /**
   * 格式化表头
   * @param {string} headerRow - 表头行
   * @param {Array} alignments - 对齐方式
   * @param {Object} theme - 主题对象
   * @returns {string} 格式化后的表头 HTML
   */
  formatTableHeader(headerRow, alignments, theme) {
    const headerCells = headerRow.split(MARKDOWN_SYNTAX.TABLE_SEPARATOR)
      .map(cell => cell.trim())
      .slice(1, -1);

    if (headerCells.length === 0) {
      return '';
    }

    let html = '<thead><tr style="background-color: #f6f8fa;">';
    headerCells.forEach((cell, index) => {
      const align = alignments[index] || 'left';
      const formattedCell = formatInlineText(cell, theme);
      html += `<th style="border: 1px solid #d0d7de; padding: 8px 12px; text-align: ${align}; font-weight: 600; color: #24292e;">${formattedCell}</th>`;
    });
    html += '</tr></thead>';
    return html;
  }

  /**
   * 格式化表体
   * @param {Array} bodyRows - 表体行数组
   * @param {Array} alignments - 对齐方式
   * @param {Object} theme - 主题对象
   * @returns {string} 格式化后的表体 HTML
   */
  formatTableBody(bodyRows, alignments, theme) {
    let html = '<tbody>';
    bodyRows.forEach(row => {
      const cells = row.split(MARKDOWN_SYNTAX.TABLE_SEPARATOR)
        .map(cell => cell.trim())
        .slice(1, -1);

      if (cells.length > 0) {
        html += '<tr>';
        cells.forEach((cell, index) => {
          const align = alignments[index] || 'left';
          const formattedCell = formatInlineText(cell, theme);
          html += `<td style="border: 1px solid #d0d7de; padding: 8px 12px; text-align: ${align}; color: #24292e;">${formattedCell}</td>`;
        });
        html += '</tr>';
      }
    });
    html += '</tbody>';
    return html;
  }

  /**
   * 检查是否正在处理表格
   * @returns {boolean} 是否正在处理表格
   */
  isProcessingTable() {
    return this.state !== TABLE_STATES.NONE;
  }

  /**
   * 完成当前表格处理并返回结果
   * @param {Object} theme - 主题对象
   * @returns {string} 格式化后的表格 HTML
   */
  completeTable(theme) {
    const result = this.formatTable(theme);
    this.reset();
    return result;
  }
}

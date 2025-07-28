/**
 * @file src/utils/formatters/list-processor.js
 * @description 列表处理器
 * 
 * 专门处理 Markdown 列表的复杂逻辑，包括有序列表、无序列表和任务列表。
 * 支持嵌套列表和不同的列表符号。
 */

import {
  MARKDOWN_SYNTAX,
  WECHAT_FORMATTING,
  EDITOR_OPERATIONS
} from '../../config/constants/index.js';
import { formatInlineText } from './style-formatters.js';

/**
 * 列表类型枚举
 */
export const LIST_TYPES = {
  UNORDERED: 'unordered',
  ORDERED: 'ordered',
  TASK: 'task',
  NONE: 'none'
};

/**
 * 列表处理器类
 */
export class ListProcessor {
  constructor() {
    this.reset();
  }

  /**
   * 重置处理器状态
   */
  reset() {
    this.currentDepth = 0;
    this.lastListType = LIST_TYPES.NONE;
  }

  /**
   * 检查行是否是列表项
   * @param {string} line - 行内容
   * @returns {Object|null} 列表信息或 null
   */
  parseListItem(line) {
    // 匹配列表项模式
    const listMatch = line.match(/^(\s*)([*\-+]|\d+\.)\s+(.+)$/);
    if (!listMatch) {
      return null;
    }

    const [, indent, marker, content] = listMatch;
    const depth = Math.floor(indent.length / EDITOR_OPERATIONS.LIST_INDENT.SPACES_PER_LEVEL);
    const isOrdered = /^\d+\./.test(marker);

    // 检查是否为任务列表
    const taskMatch = content.match(/^\[([ x])\]\s+(.+)$/);
    if (taskMatch) {
      const [, checked, taskText] = taskMatch;
      return {
        type: LIST_TYPES.TASK,
        depth,
        marker,
        content: taskText,
        isChecked: checked === 'x',
        originalContent: content,
        indent: indent.length
      };
    }

    return {
      type: isOrdered ? LIST_TYPES.ORDERED : LIST_TYPES.UNORDERED,
      depth,
      marker,
      content,
      isChecked: false,
      originalContent: content,
      indent: indent.length
    };
  }

  /**
   * 格式化列表项
   * @param {Object} listItem - 列表项信息
   * @param {Object} theme - 主题对象
   * @returns {string} 格式化后的 HTML
   */
  formatListItem(listItem, theme) {
    const { type, depth, marker, content, isChecked } = listItem;

    switch (type) {
      case LIST_TYPES.TASK:
        return this.formatTaskListItem(listItem, theme);
      case LIST_TYPES.ORDERED:
        return this.formatOrderedListItem(listItem, theme);
      case LIST_TYPES.UNORDERED:
        return this.formatUnorderedListItem(listItem, theme);
      default:
        return '';
    }
  }

  /**
   * 格式化任务列表项
   * @param {Object} listItem - 任务列表项信息
   * @param {Object} theme - 主题对象
   * @returns {string} 格式化后的 HTML
   */
  formatTaskListItem(listItem, theme) {
    const { depth, content, isChecked } = listItem;
    const formattedTaskText = formatInlineText(content, theme);
    const marginLeft = depth * 20;

    // 创建复选框样式
    let checkboxHtml;
    if (isChecked) {
      // 已完成任务
      checkboxHtml = `<span style="display: inline-block; width: 18px; height: 18px; background-color: ${theme.primary}; border-radius: 3px; margin-right: 8px; text-align: center; line-height: 18px; color: white; font-size: 12px; font-weight: bold; vertical-align: middle;">${WECHAT_FORMATTING.LIST_SYMBOLS.TASK_CHECKED}</span>`;
    } else {
      // 未完成任务
      checkboxHtml = `<span style="display: inline-block; width: 18px; height: 18px; background-color: #ffffff; border: 2px solid ${theme.borderMedium}; border-radius: 3px; margin-right: 8px; vertical-align: middle;"></span>`;
    }

    const textStyle = isChecked 
      ? 'text-decoration: line-through; color: #656d76; opacity: 0.8;' 
      : 'color: #24292f;';

    return `<p style="margin-left: ${marginLeft}px; margin-top: 8px; margin-bottom: 8px; font-size: 16px; line-height: 1.6; display: flex; align-items: center;">${checkboxHtml}<span style="${textStyle}">${formattedTaskText}</span></p>`;
  }

  /**
   * 格式化有序列表项
   * @param {Object} listItem - 有序列表项信息
   * @param {Object} theme - 主题对象
   * @returns {string} 格式化后的 HTML
   */
  formatOrderedListItem(listItem, theme) {
    const { depth, marker, content } = listItem;
    const formattedContent = formatInlineText(content, theme);
    
    const num = marker.replace('.', '');
    const displayMarker = `${num}.`;
    
    const colors = theme.listColors || ['#333', '#666', '#999'];
    const color = colors[Math.min(depth, colors.length - 1)];
    const marginLeft = depth * 20;

    return `<p style="margin-left: ${marginLeft}px; margin-top: 8px; margin-bottom: 8px; font-size: 16px; line-height: 1.6;"><span style="color: ${color}; font-weight: 600;">${displayMarker}</span> ${formattedContent}</p>`;
  }

  /**
   * 格式化无序列表项
   * @param {Object} listItem - 无序列表项信息
   * @param {Object} theme - 主题对象
   * @returns {string} 格式化后的 HTML
   */
  formatUnorderedListItem(listItem, theme) {
    const { depth, content } = listItem;
    const formattedContent = formatInlineText(content, theme);
    
    const symbols = WECHAT_FORMATTING.LIST_SYMBOLS.UNORDERED;
    const displayMarker = symbols[Math.min(depth, symbols.length - 1)];
    
    const colors = theme.listColors || ['#333', '#666', '#999'];
    const color = colors[Math.min(depth, colors.length - 1)];
    const marginLeft = depth * 20;

    return `<p style="margin-left: ${marginLeft}px; margin-top: 8px; margin-bottom: 8px; font-size: 16px; line-height: 1.6;"><span style="color: ${color}; font-weight: 600;">${displayMarker}</span> ${formattedContent}</p>`;
  }

  /**
   * 处理列表行
   * @param {string} line - 当前行
   * @param {Object} theme - 主题对象
   * @returns {Object} 处理结果
   */
  processListLine(line, theme) {
    const listItem = this.parseListItem(line);
    
    if (!listItem) {
      return {
        isListItem: false,
        result: '',
        shouldContinue: false
      };
    }

    const result = this.formatListItem(listItem, theme);
    this.currentDepth = listItem.depth;
    this.lastListType = listItem.type;

    return {
      isListItem: true,
      result,
      shouldContinue: true,
      listItem
    };
  }

  /**
   * 检查行是否是列表项
   * @param {string} line - 行内容
   * @returns {boolean} 是否是列表项
   */
  isListItem(line) {
    return this.parseListItem(line) !== null;
  }

  /**
   * 获取当前列表深度
   * @returns {number} 当前深度
   */
  getCurrentDepth() {
    return this.currentDepth;
  }

  /**
   * 获取最后的列表类型
   * @returns {string} 列表类型
   */
  getLastListType() {
    return this.lastListType;
  }
}

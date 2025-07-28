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
} from '../../../config/constants/index.js';
import { formatInlineText } from '../formatters/legacy.js';

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
   * 根据深度和数字生成相应的有序列表标记
   * @param {number} num - 数字
   * @param {number} depth - 嵌套深度
   * @returns {string} 格式化后的标记
   */
  getOrderedListMarker(num, depth) {
    const number = parseInt(num);
    
    switch (depth % 4) {
      case 0: // 第一层：1. 2. 3.
        return `${number}.`;
      case 1: // 第二层：a. b. c.
        return `${this.numberToLowerAlpha(number)}.`;
      case 2: // 第三层：i. ii. iii.
        return `${this.numberToLowerRoman(number)}.`;
      case 3: // 第四层：(1) (2) (3)
        return `(${number})`;
      default:
        return `${number}.`;
    }
  }

  /**
   * 将数字转换为小写字母 (1->a, 2->b, etc.)
   * @param {number} num - 数字
   * @returns {string} 小写字母
   */
  numberToLowerAlpha(num) {
    let result = '';
    while (num > 0) {
      num--;
      result = String.fromCharCode(97 + (num % 26)) + result;
      num = Math.floor(num / 26);
    }
    return result || 'a';
  }

  /**
   * 将数字转换为小写罗马数字
   * @param {number} num - 数字
   * @returns {string} 小写罗马数字
   */
  numberToLowerRoman(num) {
    const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    const literals = ['m', 'cm', 'd', 'cd', 'c', 'xc', 'l', 'xl', 'x', 'ix', 'v', 'iv', 'i'];
    
    let result = '';
    let i = 0;
    
    while (num > 0) {
      if (num >= values[i]) {
        result += literals[i];
        num -= values[i];
      } else {
        i++;
      }
    }
    
    return result;
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
    const displayMarker = this.getOrderedListMarker(num, depth);
    
    // 改进颜色选择逻辑，确保跟随主题色
    const colors = this.getListColors(theme);
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
    
    // 改进颜色选择逻辑，确保跟随主题色
    const colors = this.getListColors(theme);
    const color = colors[Math.min(depth, colors.length - 1)];
    const marginLeft = depth * 20;
    
    // 针对不同深度的符号设置合适的字体大小
    const fontSize = this.getSymbolFontSize(depth, displayMarker);
    const fontWeight = depth === 0 ? '600' : '500'; // 第一层稍微粗一点

    return `<p style="margin-left: ${marginLeft}px; margin-top: 8px; margin-bottom: 8px; font-size: 16px; line-height: 1.6;"><span style="color: ${color}; font-weight: ${fontWeight}; font-size: ${fontSize}px;">${displayMarker}</span> ${formattedContent}</p>`;
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

  /**
   * 获取列表颜色数组，确保跟随主题色
   * @param {Object} theme - 主题对象
   * @returns {Array} 颜色数组
   */
  getListColors(theme) {
    // 如果主题有主色，基于主色生成协调的颜色序列
    if (theme.primary) {
      // 生成基于主题色的不同亮度变化
      const primaryColor = theme.primary;

      return [
        primaryColor,                                    // 第一层：主色 (100%)
        this.adjustColorBrightness(primaryColor, 0.7),  // 第二层：主色 70% 亮度
        this.adjustColorBrightness(primaryColor, 0.5),  // 第三层：主色 50% 亮度
        this.adjustColorBrightness(primaryColor, 0.3)   // 更深层：主色 30% 亮度
      ];
    }

    // 如果主题有自定义的 listColors，使用它们
    if (theme.listColors && Array.isArray(theme.listColors) && theme.listColors.length > 0) {
      return theme.listColors;
    }

    // 最后的备选方案：使用相对现代的颜色
    return ['#2563eb', '#7c3aed', '#dc2626', '#059669'];
  }

  /**
   * 调整颜色的亮度
   * @param {string} color - 原始颜色 (hex格式)
   * @param {number} factor - 亮度因子 (0-1)，1为原色，0为黑色
   * @returns {string} 调整后的颜色
   */
  adjustColorBrightness(color, factor) {
    // 如果是hex颜色，调整亮度
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      // 调整亮度：将RGB值乘以因子
      const newR = Math.round(r * factor);
      const newG = Math.round(g * factor);
      const newB = Math.round(b * factor);

      // 转换回hex格式
      const toHex = (n) => {
        const hex = n.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };

      return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
    }

    // 其他格式暂时返回原色
    return color;
  }

  /**
   * 根据深度和符号获取合适的字体大小
   * @param {number} _depth - 嵌套深度（暂未使用，保留以备将来扩展）
   * @param {string} symbol - 符号字符
   * @returns {number} 字体大小（像素）
   */
  getSymbolFontSize(_depth, symbol) {
    // 基础字体大小，不随深度变化，保持一致性
    const baseFontSize = 16;

    // 根据符号类型调整大小，但保持合理的最小尺寸
    const symbolSizeMap = {
      '●': 16,   // 实心圆，保持标准大小
      '○': 16,   // 空心圆，保持标准大小
      '▪': 16,   // 小方块，保持标准大小
      '▫': 16,   // 空心方块，保持标准大小
      '‣': 16,   // 三角形，保持标准大小
      '⁃': 16    // 短横线，保持标准大小
    };

    // 返回统一的字体大小，确保深层嵌套时图标仍然清晰可见
    return symbolSizeMap[symbol] || baseFontSize;
  }
}

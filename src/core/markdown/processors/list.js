/**
 * @file src/core/markdown/processors/list.js
 * @description 列表处理器
 *
 * 专门处理 Markdown 列表的复杂逻辑，包括有序列表、无序列表和任务列表。
 * 支持嵌套列表和不同的列表符号。
 */

import {
  SOCIAL_FORMATTING,
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
    // 列表基础缩进常量（统一提升，保持有序/无序一致）
    this.BASE_INDENT = 16; // 基础缩进16px
    this.ORDERED_BASE_INDENT = 16; // 与无序一致
    this.NESTED_INDENT = 20; // 嵌套层级缩进20px
    // 列表样式常量
    this.LIST_MARGIN_TOP = 8; // 列表项上边距
    this.LIST_MARGIN_BOTTOM = 8; // 列表项下边距
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
   * @param {Object} fontSettings - 字体设置（可选）
   * @returns {string} 格式化后的 HTML
   */
  formatListItem(listItem, theme, fontSettings = null) {
    const { type } = listItem;

    switch (type) {
      case LIST_TYPES.TASK:
        return this.formatTaskListItem(listItem, theme, fontSettings);
      case LIST_TYPES.ORDERED:
        return this.formatOrderedListItem(listItem, theme, fontSettings);
      case LIST_TYPES.UNORDERED:
        return this.formatUnorderedListItem(listItem, theme, fontSettings);
      default:
        return '';
    }
  }

  /**
   * 格式化任务列表项
   * @param {Object} listItem - 任务列表项信息
   * @param {Object} theme - 主题对象
   * @param {Object} fontSettings - 字体设置（可选）
   * @returns {string} 格式化后的 HTML
   */
  formatTaskListItem(listItem, theme, fontSettings = null) {
    const { depth, content, isChecked } = listItem;

    // 获取字体设置
    const { fontSize, lineHeight } = this.getFontSettings(fontSettings);

    const formattedTaskText = formatInlineText(content, theme, fontSize);
    // 使用类常量计算缩进
    const marginLeft = this.BASE_INDENT + (depth * this.NESTED_INDENT);

    // 创建复选框样式 - 根据字号动态调整大小
    const checkboxSize = Math.max(14, Math.round(fontSize * 0.9)); // 最小14px，约为字号的90%
    const checkboxFontSize = Math.max(10, Math.round(checkboxSize * 0.7)); // checkbox内字符大小

    let checkboxHtml;
    if (isChecked) {
      // 已完成任务 - 使用 flex 布局确保对勾完美居中
      checkboxHtml = `<span style="display: inline-flex; align-items: center; justify-content: center; width: ${checkboxSize}px; height: ${checkboxSize}px; background-color: ${theme.primary}; border-radius: 3px; margin-right: 8px; color: white; font-size: ${checkboxFontSize}px; font-weight: bold; vertical-align: middle; flex-shrink: 0;">${SOCIAL_FORMATTING.LIST_SYMBOLS.TASK_CHECKED}</span>`;
    } else {
      // 未完成任务
      checkboxHtml = `<span style="display: inline-block; width: ${checkboxSize}px; height: ${checkboxSize}px; background-color: ${theme.bgPrimary || '#ffffff'}; border: 2px solid ${theme.borderMedium || '#8b949e'}; border-radius: 3px; margin-right: 8px; vertical-align: middle; flex-shrink: 0;"></span>`;
    }

    const textStyle = isChecked
      ? `text-decoration: line-through; color: ${theme.textSecondary || '#656d76'}; opacity: 0.8;`
      : `color: ${theme.textPrimary || '#24292f'};`;

    return `<p style="margin-left: ${marginLeft}px; margin-top: ${this.LIST_MARGIN_TOP}px; margin-bottom: ${this.LIST_MARGIN_BOTTOM}px; font-size: ${fontSize}px; line-height: ${lineHeight}; display: flex; align-items: center;">${checkboxHtml}<span style="${textStyle}">${formattedTaskText}</span></p>`;
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
   * @param {Object} fontSettings - 字体设置（可选）
   * @returns {string} 格式化后的 HTML
   */
  formatOrderedListItem(listItem, theme, fontSettings = null) {
    const { depth, marker, content } = listItem;

    const num = marker.replace('.', '');
    const displayMarker = this.getOrderedListMarker(num, depth);

    // 改进颜色选择逻辑，确保跟随主题色
    const colors = this.getListColors(theme);
    const color = colors[Math.min(depth, colors.length - 1)];
    // 使用统一基础缩进
    const marginLeft = this.ORDERED_BASE_INDENT + (depth * this.NESTED_INDENT);

    // 获取字体设置
    const { fontSize, lineHeight } = this.getFontSettings(fontSettings);

    const formattedContent = formatInlineText(content, theme, fontSize);

    return `<p style="margin-left: ${marginLeft}px; margin-top: ${this.LIST_MARGIN_TOP}px; margin-bottom: ${this.LIST_MARGIN_BOTTOM}px; font-size: ${fontSize}px; line-height: ${lineHeight};"><span style="color: ${color}; font-weight: 600; font-size: ${fontSize}px; margin-right: 8px; display: inline-block;">${displayMarker}</span>${formattedContent}</p>`;
  }

  /**
   * 格式化无序列表项
   * @param {Object} listItem - 无序列表项信息
   * @param {Object} theme - 主题对象
   * @param {Object} fontSettings - 字体设置（可选）
   * @returns {string} 格式化后的 HTML
   */
  formatUnorderedListItem(listItem, theme, fontSettings = null) {
    const { depth, content } = listItem;

    const symbols = SOCIAL_FORMATTING.LIST_SYMBOLS.UNORDERED;
    const displayMarker = symbols[Math.min(depth, symbols.length - 1)];

    // 改进颜色选择逻辑，确保跟随主题色
    const colors = this.getListColors(theme);
    const color = colors[Math.min(depth, colors.length - 1)];
    // 使用类常量计算缩进
    const marginLeft = this.BASE_INDENT + (depth * this.NESTED_INDENT);

    // 获取字体设置
    const { fontSize, lineHeight } = this.getFontSettings(fontSettings);

    const formattedContent = formatInlineText(content, theme, fontSize);

    // 获取符号的字体大小和缩放比例
    const symbolFontSize = this.getSymbolFontSize(depth, displayMarker, fontSize);
    const symbolScale = this.getSymbolScale(displayMarker);
    const fontWeight = depth === 0 ? '600' : '500'; // 第一层稍微粗一点

    return `<p style="margin-left: ${marginLeft}px; margin-top: ${this.LIST_MARGIN_TOP}px; margin-bottom: ${this.LIST_MARGIN_BOTTOM}px; font-size: ${fontSize}px; line-height: ${lineHeight};"><span style="color: ${color}; font-weight: ${fontWeight}; font-size: ${symbolFontSize}px; display: inline-block; transform: scale(${symbolScale}); transform-origin: center; margin-right: 8px;">${displayMarker}</span>${formattedContent}</p>`;
  }

  /**
   * 处理列表行
   * @param {string} line - 当前行
   * @param {Object} theme - 主题对象
   * @param {Object} fontSettings - 字体设置（可选）
   * @returns {Object} 处理结果
   */
  processListLine(line, theme, fontSettings = null) {
    const listItem = this.parseListItem(line);

    if (!listItem) {
      return {
        isListItem: false,
        result: '',
        shouldContinue: false
      };
    }

    const result = this.formatListItem(listItem, theme, fontSettings);
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

    // 最后的备选方案：使用主题色或现代的颜色
    const fallbackPrimary = theme.primary || '#2563eb';
    return [
      fallbackPrimary,
      this.adjustColorBrightness(fallbackPrimary, 0.7),
      this.adjustColorBrightness(fallbackPrimary, 0.5),
      this.adjustColorBrightness(fallbackPrimary, 0.3)
    ];
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
   * 获取字体设置
   * @param {Object} fontSettings - 字体设置对象
   * @returns {Object} 包含fontSize和lineHeight的对象
   */
  getFontSettings(fontSettings = null) {
    const fontSize = fontSettings?.fontSize || 16;
    const lineHeight = fontSize <= 14 ? '1.7' : fontSize <= 18 ? '1.6' : '1.5';
    return { fontSize, lineHeight };
  }

  /**
   * 根据深度和符号获取合适的字体大小
   * @param {number} _depth - 嵌套深度（暂未使用，保留以备将来扩展）
   * @param {string} symbol - 符号字符
   * @param {number} baseFontSize - 基础字体大小
   * @returns {number} 字体大小（像素）
   */
  getSymbolFontSize(_depth, _symbol, baseFontSize = 16) {
    // 统一符号字体大小，通过CSS transform来调整实际显示大小
    // 这样可以更精确地控制不同Unicode字符的视觉大小
    const symbolRatio = 0.88;
    const calculatedSize = Math.round(baseFontSize * symbolRatio);
    const minSize = Math.max(12, Math.round(baseFontSize * 0.75));

    return Math.max(minSize, calculatedSize);
  }

  /**
   * 获取符号的CSS transform scale值
   * 用于补偿不同Unicode字符的内在尺寸差异
   * @param {string} symbol - 符号字符
   * @returns {number} CSS transform scale值
   */
  getSymbolScale(symbol) {
    // 基于实际视觉效果调整，让所有符号看起来大小一致
    const symbolScales = {
      '●': 1.0,   // 实心圆：标准大小
      '○': 0.5,  // 空心圆：进一步缩小，因为它还是比实心圆大
      '▪': 1.2,   // 小方块：需要放大更多，因为它看起来很小
      '▫': 0.8,   // 空心方块：需要缩小
      '‣': 1.0,   // 三角形：标准大小
      '⁃': 1.0    // 短横线：标准大小
    };

    return symbolScales[symbol] || 1.0;
  }
}

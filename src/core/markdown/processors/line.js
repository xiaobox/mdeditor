/**
 * @file src/core/markdown/processors/line.js
 * @description 行处理器（策略模式实现）
 * 
 * 将复杂的行级判断重构为策略模式：每个处理器只负责一种类型的 Markdown 行。
 * 这种设计让代码更易扩展与维护。
 */

import { REGEX_PATTERNS, MARKDOWN_SYNTAX } from '../../../config/constants/index.js';
import { formatCodeBlock, formatInlineText } from '../formatters/legacy.js';

/**
 * 行处理器基类
 */
class LineProcessor {
  /**
   * 检查是否可以处理当前行
   * @param {string} line - 当前行内容
   * @param {string} trimmedLine - 去除空白的行内容
   * @param {Object} context - 处理上下文
   * @returns {boolean} 是否可以处理
   */
  canProcess(line, trimmedLine, context) {
    throw new Error('子类必须实现 canProcess 方法');
  }

  /**
   * 处理当前行
   * @param {string} line - 当前行内容
   * @param {string} trimmedLine - 去除空白的行内容
   * @param {Object} context - 处理上下文
   * @returns {Object} 处理结果 { result: string, shouldContinue: boolean, updateContext: Object }
   */
  process(line, trimmedLine, context) {
    throw new Error('子类必须实现 process 方法');
  }
}

/**
 * 代码块处理器
 */
export class CodeBlockProcessor extends LineProcessor {
  canProcess(line, trimmedLine, context) {
    return trimmedLine.startsWith(MARKDOWN_SYNTAX.CODE_BLOCK);
  }

  process(line, trimmedLine, context) {
    if (!context.isInCodeBlock()) {
      // 开始代码块
      const language = trimmedLine.replace(MARKDOWN_SYNTAX.CODE_BLOCK, '').trim();
      context.startCodeBlock(language);
      return {
        result: '',
        shouldContinue: true,
        updateContext: {} // 状态已通过 context.startCodeBlock 更新
      };
    } else {
      // 结束代码块
      const blockInfo = context.endCodeBlock();
      const fontSize = context.fontSettings?.fontSize || 16;

      const result = formatCodeBlock(
        blockInfo.content,
        blockInfo.language,
        context.currentTheme,
        context.codeTheme,
        context.options?.isPreview || false, // 使用上下文中的isPreview设置
        fontSize
      );
      return {
        result,
        shouldContinue: true,
        updateContext: {} // 状态已通过 context.endCodeBlock 更新
      };
    }
  }
}

/**
 * 分割线处理器
 */
export class HorizontalRuleProcessor extends LineProcessor {
  canProcess(line, trimmedLine, context) {
    return REGEX_PATTERNS.HORIZONTAL_RULE.test(trimmedLine);
  }

  process(line, trimmedLine, context) {
    const { currentTheme } = context;
    const result = `<hr style="height: 2px; background: linear-gradient(to right, transparent, ${currentTheme.primary}, transparent); border: none; margin: 32px 0;">`;
    
    return {
      result,
      shouldContinue: true,
      updateContext: {}
    };
  }
}

/**
 * 标题处理器
 */
export class HeadingProcessor extends LineProcessor {
  canProcess(line, trimmedLine, context) {
    return REGEX_PATTERNS.HEADING.test(trimmedLine);
  }

  process(line, trimmedLine, context) {
    const { currentTheme } = context;
    const level = trimmedLine.match(/^#+/)[0].length;
    const text = trimmedLine.replace(/^#+\s*/, '');
    const fontSize = context.fontSettings?.fontSize || 16;
    const formattedText = formatInlineText(text, currentTheme, fontSize);

    let result = '';
    
    if (level === 1) {
      result = this.formatH1(formattedText, currentTheme, context);
    } else if (level === 2) {
      result = this.formatH2(formattedText, currentTheme, context);
    } else {
      result = this.formatOtherHeading(level, formattedText, currentTheme, context);
    }

    return {
      result,
      shouldContinue: true,
      updateContext: {}
    };
  }

  formatH1(formattedText, currentTheme, context = {}) {
    const isPreview = context.options?.isPreview || false;

    if (isPreview) {
      // 预览模式：使用CSS类，样式由主题文件控制
      return `<h1>${formattedText}</h1>`;
    } else {
      // 社交平台模式：使用绝对像素值确保字号正确
      const baseFontSize = context.fontSettings?.fontSize || 16;
      const h1FontSize = Math.round(baseFontSize * 2.2);

      // 修复微信公众号编辑器兼容性：使用flexbox布局和居中对齐
      const h1Style = `
        margin: 1.8em 0 1.5em 0;
        font-weight: 700;
        font-size: ${h1FontSize}px;
        line-height: 1.3;
        text-align: center;
        background: linear-gradient(135deg, ${currentTheme.primary} 0%, ${currentTheme.primaryDark || currentTheme.primary} 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        color: ${currentTheme.textPrimary};
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.8rem;
      `.replace(/\s+/g, ' ').trim();

      // 下划线样式：使用简单的块级元素，避免绝对定位
      const underlineStyle = `
        width: 60px;
        height: 3px;
        background: linear-gradient(90deg, transparent 0%, ${currentTheme.primary} 20%, ${currentTheme.primary} 80%, transparent 100%);
        border-radius: 2px;
        box-shadow: 0 2px 8px ${currentTheme.primary}40;
        display: block;
        margin: 0 auto;
      `.replace(/\s+/g, ' ').trim();

      return `<h1 style="${h1Style}"><span>${formattedText}</span><span style="${underlineStyle}"></span></h1>`;
    }
  }

  formatH2(formattedText, currentTheme, context = {}) {
    const isPreview = context.options?.isPreview || false;

    if (isPreview) {
      // 预览模式：使用CSS类，样式由主题文件控制
      return `<h2>${formattedText}</h2>`;
    } else {
      // 社交平台模式：使用绝对像素值确保字号正确
      const baseFontSize = context.fontSettings?.fontSize || 16;
      const h2FontSize = Math.round(baseFontSize * 1.5);

      // 修复微信公众号编辑器换行问题：使用flexbox布局确保装饰线条和文字在同一行
      const h2Style = `
        margin-top: 2rem;
        margin-bottom: 1.5rem;
        font-weight: 600;
        font-size: ${h2FontSize}px;
        line-height: 1.4;
        color: ${currentTheme.textPrimary};
        display: flex;
        align-items: center;
        gap: 0.5em;
      `.replace(/\s+/g, ' ').trim();

      // 装饰线条样式：使用inline-block确保不换行
      const borderStyle = `
        width: 5px;
        height: 1.1em;
        background: linear-gradient(180deg, ${currentTheme.primary}20 0%, ${currentTheme.primary}60 15%, ${currentTheme.primary} 35%, ${currentTheme.primary} 65%, ${currentTheme.primary}60 85%, ${currentTheme.primary}20 100%);
        border-radius: 3px;
        box-shadow: 0 0 6px ${currentTheme.primary}25;
        display: inline-block;
        flex-shrink: 0;
      `.replace(/\s+/g, ' ').trim();

      return `<h2 style="${h2Style}"><span style="${borderStyle}"></span><span>${formattedText}</span></h2>`;
    }
  }

  formatOtherHeading(level, formattedText, currentTheme, context = {}) {
    const baseFontSize = context.fontSettings?.fontSize || 16;

    // 使用与预览中相同的倍数
    const fontMultipliers = {
      3: 1.3,
      4: 1.1,
      5: 1.0,
      6: 0.9
    };
    const multiplier = fontMultipliers[level] || 1.0;
    const fontSize = Math.round(baseFontSize * multiplier);

    const titleStyle = `
      font-size: ${fontSize}px;
      color: ${currentTheme.textPrimary};
      font-weight: 600;
      margin-top: 1.5rem;
      margin-bottom: 1rem;
      line-height: 1.25;
    `.replace(/\s+/g, ' ').trim();

    return `<h${level} style="${titleStyle}">${formattedText}</h${level}>`;
  }
}

/**
 * 引用块处理器
 */
export class BlockquoteProcessor extends LineProcessor {
  canProcess(line, trimmedLine, context) {
    // 识别所有引用行：'> ' 或者只有 '>'
    return trimmedLine.startsWith('>');
  }

  process(line, trimmedLine, context) {
    // 处理引用行，包括只有 '>' 的空引用行
    let processedLine = trimmedLine;
    if (trimmedLine === '>') {
      // 空的引用行，转换为空字符串
      processedLine = '';
    }

    if (!context.isInBlockquote()) {
      context.startBlockquote();
      context.addBlockquoteContent(processedLine);
      return {
        result: '',
        shouldContinue: true,
        updateContext: {} // 状态已通过 context 方法更新
      };
    } else {
      context.addBlockquoteContent(processedLine);
      return {
        result: '',
        shouldContinue: true,
        updateContext: {} // 状态已通过 context 方法更新
      };
    }
  }
}

/**
 * 处理器注册表
 */
export const LINE_PROCESSORS = [
  new CodeBlockProcessor(),
  new HorizontalRuleProcessor(),
  new HeadingProcessor(),
  new BlockquoteProcessor(),
];

/**
 * 获取适合处理当前行的处理器
 * @param {string} line - 当前行内容
 * @param {string} trimmedLine - 去除空白的行内容
 * @param {Object} context - 处理上下文
 * @returns {LineProcessor|null} 处理器实例或 null
 */
export function getLineProcessor(line, trimmedLine, context) {
  return LINE_PROCESSORS.find(processor => processor.canProcess(line, trimmedLine, context)) || null;
}

/**
 * @file src/utils/formatters/line-processors.js
 * @description 行处理器策略模式实现
 * 
 * 将复杂的条件逻辑重构为策略模式，每个处理器负责处理特定类型的 Markdown 行。
 * 这种设计提高了代码的可维护性和可扩展性。
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
      const result = formatCodeBlock(
        blockInfo.content, 
        blockInfo.language, 
        context.currentTheme, 
        context.codeTheme
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
    const formattedText = formatInlineText(text, currentTheme);

    let result = '';
    
    if (level === 1) {
      result = this.formatH1(formattedText, currentTheme, context);
    } else if (level === 2) {
      result = this.formatH2(formattedText, currentTheme, context);
    } else {
      result = this.formatOtherHeading(level, formattedText, currentTheme);
    }

    return {
      result,
      shouldContinue: true,
      updateContext: {}
    };
  }

  formatH1(formattedText, currentTheme, context = {}) {
    const { isPreview = false } = context.options || {};

    if (isPreview) {
      // 预览模式：使用CSS类，样式由主题文件控制
      return `<h1>${formattedText}</h1>`;
    } else {
      // 微信公众号模式：保留内联样式以确保兼容性
      const h1Style = `
        margin: 1.8em 0 1.5em 0;
        font-weight: 700;
        font-size: 2.2em;
        line-height: 1.3;
        text-align: center;
        position: relative;
        padding-bottom: 0.8rem;
        background: linear-gradient(135deg, ${currentTheme.primary} 0%, ${currentTheme.primaryDark || currentTheme.primary} 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        color: ${currentTheme.textPrimary};
      `.replace(/\s+/g, ' ').trim();

      const underlineStyle = `
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 3px;
        background: linear-gradient(90deg, transparent 0%, ${currentTheme.primary} 20%, ${currentTheme.primary} 80%, transparent 100%);
        border-radius: 2px;
        box-shadow: 0 2px 8px ${currentTheme.primary}40;
        display: block;
      `.replace(/\s+/g, ' ').trim();

      return `<h1 style="${h1Style}">${formattedText}<span style="${underlineStyle}"></span></h1>`;
    }
  }

  formatH2(formattedText, currentTheme, context = {}) {
    const { isPreview = false } = context.options || {};

    if (isPreview) {
      // 预览模式：使用CSS类，样式由主题文件控制
      return `<h2>${formattedText}</h2>`;
    } else {
      // 微信公众号模式：保留装饰线
      const h2Style = `
        margin-top: 2rem;
        margin-bottom: 1.5rem;
        font-weight: 600;
        padding-left: 0.5em;
        font-size: 1.5em;
        line-height: 1.4;
        color: ${currentTheme.textPrimary};
        position: relative;
      `.replace(/\s+/g, ' ').trim();

      const borderStyle = `
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 5px;
        height: 1.1em;
        background: linear-gradient(180deg, ${currentTheme.primary}20 0%, ${currentTheme.primary}60 15%, ${currentTheme.primary} 35%, ${currentTheme.primary} 65%, ${currentTheme.primary}60 85%, ${currentTheme.primary}20 100%);
        border-radius: 3px;
        box-shadow: 0 0 6px ${currentTheme.primary}25;
        display: block;
      `.replace(/\s+/g, ' ').trim();

      return `<h2 style="${h2Style}"><span style="${borderStyle}"></span>${formattedText}</h2>`;
    }
  }

  formatOtherHeading(level, formattedText, currentTheme) {
    const fontSizes = {
      3: '1.1em',
      4: '1.05em',
      5: '1em',
      6: '0.95em'
    };
    const fontSize = fontSizes[level] || '1em';

    const titleStyle = `
      font-size: ${fontSize};
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

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
        margin: 0.67em 0;
        font-weight: 600;
        padding-bottom: 16px;
        font-size: 1.5em;
        border-bottom: none;
        position: relative;
        color: ${currentTheme.textPrimary};
        line-height: 1.25;
        text-align: center;
      `.replace(/\s+/g, ' ').trim();

      const underlineStyle = `display: block; position: absolute; bottom: 2px; left: 3%; right: 3%; height: 3px; background: linear-gradient(90deg, transparent 0%, ${currentTheme.primary}4D 10%, ${currentTheme.primary}CC 30%, ${currentTheme.primary} 50%, ${currentTheme.primary}CC 70%, ${currentTheme.primary}4D 90%, transparent 100%); border-radius: 2px; box-shadow: 0 0 6px ${currentTheme.primary}33;`;
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
        margin-top: 1.5rem;
        margin-bottom: 1rem;
        font-weight: 600;
        padding-left: 1.2em;
        font-size: 1.2em;
        color: ${currentTheme.textPrimary};
        line-height: 1.25;
        position: relative;
      `.replace(/\s+/g, ' ').trim();

      const borderStyle = `position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 1.4em; background: linear-gradient(180deg, ${currentTheme.primary}4D 0%, ${currentTheme.primary} 30%, ${currentTheme.primary} 70%, ${currentTheme.primary}4D 100%); border-radius: 2px; box-shadow: 0 0 4px ${currentTheme.primary}4D;`;
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

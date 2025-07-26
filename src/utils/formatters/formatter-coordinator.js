/**
 * @file src/utils/formatters/formatter-coordinator.js
 * @description 格式化协调器
 * 
 * 协调各种格式化处理器，实现复杂的 Markdown 到 HTML 转换逻辑。
 * 使用策略模式和状态机模式来简化原本复杂的条件逻辑。
 */

import { getLineProcessor } from './line-processors.js';
import { TableProcessor } from './table-processor.js';
import { ListProcessor } from './list-processor.js';
import { formatBlockquote, formatCodeBlock } from '../wechat-formatter.js';
import { processInlineFormatsWithoutEscapes } from './text-processors.js';

/**
 * 格式化协调器类
 */
export class FormatterCoordinator {
  constructor() {
    this.tableProcessor = new TableProcessor();
    this.listProcessor = new ListProcessor();
    this.reset();
  }

  /**
   * 重置协调器状态
   */
  reset() {
    this.context = {
      inCodeBlock: false,
      codeBlockContent: '',
      codeBlockLanguage: '',
      inBlockquote: false,
      blockquoteContent: [],
      currentTheme: null,
      codeTheme: null,
      themeSystem: 'wechat'
    };
    this.tableProcessor.reset();
    this.listProcessor.reset();
  }

  /**
   * 处理单行内容
   * @param {string} line - 当前行
   * @param {string} trimmedLine - 去除空白的当前行
   * @param {Array} lines - 所有行
   * @param {number} index - 当前行索引
   * @returns {Object} 处理结果
   */
  processLine(line, trimmedLine, lines, index) {
    // 如果在代码块中，直接添加内容
    if (this.context.inCodeBlock) {
      return this.handleCodeBlockContent(line, trimmedLine);
    }

    // 处理空行
    if (!trimmedLine) {
      return this.handleEmptyLine();
    }

    // 检查是否需要结束引用块
    // 只有当行不是空行且不以 '>' 开头时才结束引用块
    if (this.context.inBlockquote && trimmedLine && !trimmedLine.startsWith('>')) {
      const result = this.endBlockquote();
      // 重新处理当前行
      const reprocessResult = this.processLine(line, trimmedLine, lines, index);
      return {
        result: result + reprocessResult.result,
        shouldContinue: reprocessResult.shouldContinue,
        updateContext: reprocessResult.updateContext
      };
    }

    // 尝试表格处理
    const tableResult = this.tableProcessor.processTableRow(line, trimmedLine, lines, index);
    if (tableResult.shouldContinue || tableResult.tableComplete) {
      if (tableResult.reprocessLine) {
        // 表格结束，需要重新处理当前行
        const reprocessResult = this.processLine(line, trimmedLine, lines, index);
        return {
          result: tableResult.result + reprocessResult.result,
          shouldContinue: reprocessResult.shouldContinue,
          updateContext: reprocessResult.updateContext
        };
      }
      return {
        result: tableResult.result,
        shouldContinue: true,
        updateContext: {}
      };
    }

    // 尝试列表处理
    const listResult = this.listProcessor.processListLine(line, this.context.currentTheme);
    if (listResult.isListItem) {
      return {
        result: listResult.result,
        shouldContinue: true,
        updateContext: {}
      };
    }

    // 尝试使用行处理器
    const processor = getLineProcessor(line, trimmedLine, this.context);
    if (processor) {
      const result = processor.process(line, trimmedLine, this.context);
      return {
        result: result.result,
        shouldContinue: result.shouldContinue,
        updateContext: result.updateContext
      };
    }

    // 处理普通段落
    return this.handleParagraph(line, trimmedLine);
  }

  /**
   * 处理代码块内容
   * @param {string} line - 当前行
   * @param {string} trimmedLine - 去除空白的当前行
   * @returns {Object} 处理结果
   */
  handleCodeBlockContent(line, trimmedLine) {
    if (trimmedLine.startsWith('```')) {
      // 结束代码块
      const result = formatCodeBlock(
        this.context.codeBlockContent, 
        this.context.codeBlockLanguage, 
        this.context.currentTheme, 
        this.context.codeTheme
      );
      
      return {
        result,
        shouldContinue: true,
        updateContext: {
          inCodeBlock: false,
          codeBlockContent: '',
          codeBlockLanguage: ''
        }
      };
    } else {
      // 添加到代码块内容
      return {
        result: '',
        shouldContinue: true,
        updateContext: {
          codeBlockContent: this.context.codeBlockContent + line + '\n'
        }
      };
    }
  }

  /**
   * 处理空行
   * @returns {Object} 处理结果
   */
  handleEmptyLine() {
    if (this.context.inBlockquote) {
      return {
        result: '',
        shouldContinue: true,
        updateContext: {
          blockquoteContent: [...this.context.blockquoteContent, '']
        }
      };
    }
    
    return {
      result: '',
      shouldContinue: true,
      updateContext: {}
    };
  }

  /**
   * 结束引用块
   * @returns {string} 格式化后的引用块 HTML
   */
  endBlockquote() {
    if (this.context.blockquoteContent.length > 0) {
      const result = formatBlockquote(this.context.blockquoteContent, this.context.currentTheme);
      this.context.inBlockquote = false;
      this.context.blockquoteContent = [];
      return result;
    }
    return '';
  }

  /**
   * 处理普通段落
   * @param {string} line - 当前行
   * @param {string} trimmedLine - 去除空白的当前行
   * @returns {Object} 处理结果
   */
  handleParagraph(_line, trimmedLine) {
    const formattedText = processInlineFormatsWithoutEscapes(trimmedLine, this.context.currentTheme);
    const result = `<p style="margin: 12px 0; line-height: 1.6; font-size: 16px;">${formattedText}</p>`;

    return {
      result,
      shouldContinue: true,
      updateContext: {}
    };
  }

  /**
   * 更新上下文
   * @param {Object} updates - 要更新的上下文属性
   */
  updateContext(updates) {
    Object.assign(this.context, updates);
  }

  /**
   * 设置主题
   * @param {Object} currentTheme - 当前主题
   * @param {Object} codeTheme - 代码主题
   * @param {string} themeSystem - 主题系统
   */
  setThemes(currentTheme, codeTheme, themeSystem) {
    this.context.currentTheme = currentTheme;
    this.context.codeTheme = codeTheme;
    this.context.themeSystem = themeSystem;
  }

  /**
   * 完成格式化处理
   * @returns {string} 剩余未处理内容的 HTML
   */
  finalize() {
    let result = '';
    
    // 处理未结束的表格
    if (this.tableProcessor.isProcessingTable()) {
      result += this.tableProcessor.completeTable(this.context.currentTheme);
    }
    
    // 处理未结束的引用块
    if (this.context.inBlockquote && this.context.blockquoteContent.length > 0) {
      result += this.endBlockquote();
    }
    
    return result;
  }

  /**
   * 获取当前上下文
   * @returns {Object} 当前上下文
   */
  getContext() {
    return { ...this.context };
  }
}

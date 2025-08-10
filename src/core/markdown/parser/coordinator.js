/**
 * @file src/core/markdown/parser/coordinator.js
 * @description 格式化协调器
 *
 * 协调各种格式化处理器，实现复杂的 Markdown 到 HTML 转换逻辑。
 * 使用策略模式和状态机模式来简化原本复杂的条件逻辑。
 */

import { getLineProcessor } from '../processors/line.js';
import { TableProcessor } from '../processors/table.js';
import { ListProcessor } from '../processors/list.js';
import { formatBlockquote } from '../formatters/legacy.js';
import { getThemesSafe } from '../../../shared/utils/theme.js';
import { cleanReferenceLinks } from '../formatters/text.js';
import { FormatterContext } from './context.js';
import { SocialStyler } from '../post-processors/social-styler.js';



// 导入处理策略
import {
  CodeBlockContentStrategy,
  EmptyLineStrategy,
  BlockquoteEndCheckStrategy,
  TableProcessingStrategy,
  ListProcessingStrategy,
  LineProcessorStrategy,
  ParagraphStrategy
} from './strategies/index.js';

/**
 * 行处理策略注册表
 */
const LINE_PROCESSING_STRATEGIES = [
  new CodeBlockContentStrategy(),
  new EmptyLineStrategy(),
  new BlockquoteEndCheckStrategy(),
  new TableProcessingStrategy(),
  new ListProcessingStrategy(),
  new LineProcessorStrategy(),
  new ParagraphStrategy() // 必须放在最后作为兜底策略
];

/**
 * 格式化协调器类
 * 重构后只负责策略调度，状态管理由 FormatterContext 负责
 */
export class FormatterCoordinator {
  constructor() {
    this.context = new FormatterContext();
    this.tableProcessor = new TableProcessor();
    this.listProcessor = new ListProcessor();
  }

  /**
   * 重置协调器状态
   */
  reset() {
    // 保留当前主题和选项
    const preserveOptions = {
      currentTheme: this.context.currentTheme,
      codeTheme: this.context.codeTheme,
      themeSystem: this.context.themeSystem,
      options: this.context.options
    };
    
    this.context.reset(preserveOptions);
    this.tableProcessor.reset();
    this.listProcessor.reset();
  }

  /**
   * 设置附加选项
   * @param {Object} options - 选项对象
   */
  setOptions(options) {
    this.context.setOptions(options);
  }

  /**
   * 处理单行内容 - 重构后的版本
   * @param {string} line - 当前行
   * @param {string} trimmedLine - 去除空白的当前行
   * @param {Array} lines - 所有行
   * @param {number} index - 当前行索引
   * @returns {Object} 处理结果
   */
  processLine(line, trimmedLine, lines, index) {
    // 使用策略模式处理行
    for (const strategy of LINE_PROCESSING_STRATEGIES) {
      if (strategy.canProcess(this.context, line, trimmedLine, lines, index)) {
        const result = strategy.process(this, line, trimmedLine, lines, index);
        
        // 如果策略返回 null，表示不能处理，继续下一个策略
        if (result !== null) {
          return result;
        }
      }
    }
    
    // 理论上不应该到达这里，因为 ParagraphStrategy 总是可以处理
    throw new Error('没有找到合适的处理策略');
  }



  /**
   * 结束引用块
   * @returns {string} 格式化后的引用块 HTML
   */
  endBlockquote() {
    const content = this.context.endBlockquote();
    if (content.length > 0) {
      // 获取字体设置
      const fontSize = this.context.fontSettings?.fontSize || 16;
      return formatBlockquote(content, this.context.currentTheme, fontSize);
    }
    return '';
  }



  /**
   * 更新上下文
   * @param {Object} updates - 要更新的上下文属性
   */
  updateContext(updates) {
    this.context.updateState(updates);
  }

  /**
   * 设置主题
   * @param {Object} currentTheme - 当前主题
   * @param {Object} codeTheme - 代码主题
   * @param {string} themeSystem - 主题系统
   */
  setThemes(currentTheme, codeTheme, themeSystem) {
    this.context.setThemes(currentTheme, codeTheme, themeSystem);
  }

  /**
   * 设置字体配置
   * @param {Object} fontSettings - 字体设置对象
   */
  setFontSettings(fontSettings) {
    this.context.setFontSettings(fontSettings);
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
    if (this.context.isInBlockquote()) {
      result += this.endBlockquote();
    }
    
    return result;
  }

  /**
   * 获取当前上下文
   * @returns {Object} 当前上下文
   */
  getContext() {
    return this.context.getState();
  }
}

/**
 * 解析 Markdown 文本为 HTML 的内部实现
 * @param {string} markdownText - 要解析的 Markdown 文本
 * @param {object} options - 解析器的配置选项
 * @returns {string} - 生成的 HTML 字符串
 */
function _parseMarkdownInternal(markdownText, options = {}) {
  if (!markdownText || typeof markdownText !== 'string') {
    return '';
  }

  // 获取安全的主题配置
  const { colorTheme, codeStyle, themeSystem } = getThemesSafe({
    colorTheme: options.theme,
    codeStyle: options.codeTheme,
    themeSystem: options.themeSystem
  });

  // 获取字体设置
  const fontSettings = options.fontSettings || null;

  // 创建协调器实例
  const coordinator = new FormatterCoordinator();
  coordinator.setThemes(colorTheme, codeStyle, themeSystem);

  // 设置字体配置
  if (fontSettings) {
    coordinator.setFontSettings(fontSettings);
  }

  if (options.isPreview) {
    coordinator.setOptions({
      isPreview: true,
      cleanHtml: options.cleanHtml || false
    });
  }

  // 预处理：清理不兼容的语法
  const cleanedText = cleanReferenceLinks(markdownText);
  const lines = cleanedText.split('\n');
  let result = '';

  coordinator.reset(); // 每次解析前重置状态

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    const processResult = coordinator.processLine(line, trimmedLine, lines, i);

    if (processResult.updateContext) {
      coordinator.updateContext(processResult.updateContext);
    }

    if (processResult.result) {
      result += processResult.result;
    }

    if (processResult.reprocessLine) {
      i--; // 重新处理当前行
    }
  }

  result += coordinator.finalize(); // 处理任何未结束的块

  // 使用 WeChat 后处理器应用字体样式和平台兼容性处理
  result = SocialStyler.process(result, {
    fontSettings,
    themeSystem,
    colorTheme, // 传递颜色主题，便于内联主色样式
    isPreview: options.isPreview
  });

  return result;
}

/**
 * 解析 Markdown 文本为 HTML 的便捷函数
 * 这个函数替代了原来的 MarkdownParser 类，提供相同的功能但更简洁
 *
 * @param {string} markdownText - 要解析的 Markdown 文本
 * @param {object} [options={}] - 解析器的配置选项
 * @param {object} [options.theme] - 颜色主题对象或 ID
 * @param {object} [options.codeTheme] - 代码样式对象或 ID
 * @param {string} [options.themeSystem] - 排版系统 ID
 * @param {boolean} [options.isPreview=false] - 是否为预览模式
 * @returns {string} - 生成的 HTML 字符串
 */
export function parseMarkdown(markdownText, options = {}) {
  return _parseMarkdownInternal(markdownText, options);
}

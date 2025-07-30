/**
 * @file src/utils/formatters/formatter-coordinator.js
 * @description 格式化协调器
 * 
 * 协调各种格式化处理器，实现复杂的 Markdown 到 HTML 转换逻辑。
 * 使用策略模式和状态机模式来简化原本复杂的条件逻辑。
 */

import { getLineProcessor } from '../processors/line.js';
import { TableProcessor } from '../processors/table.js';
import { ListProcessor } from '../processors/list.js';
import { formatBlockquote, formatCodeBlock } from '../formatters/legacy.js';
import { processInlineFormatsWithoutEscapes } from '../formatters/text.js';
import { getThemesSafe } from '../../../shared/utils/theme.js';
import { cleanReferenceLinks } from '../formatters/text.js';
import { FormatterContext } from './context.js';
import { memoize } from '../../../shared/utils/performance.js';

/**
 * 使用字体设置包装 HTML 内容 - 采用 doocs/md 的成功方案
 * @param {string} html - 原始 HTML 内容
 * @param {Object} fontSettings - 字体设置对象
 * @returns {string} - 包装后的 HTML
 */
function wrapWithFontStyles(html, fontSettings) {
  if (!fontSettings || !html) return html;

  // 字体族映射 - 使用微信公众号兼容的字体名称
  const fontFamilyMap = {
    'system-default': '-apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB, Microsoft YaHei UI, Microsoft YaHei, Arial, sans-serif',
    'microsoft-yahei': 'Microsoft YaHei, 微软雅黑, Arial, sans-serif',
    'pingfang-sc': 'PingFang SC, Microsoft YaHei, 微软雅黑, Arial, sans-serif',
    'source-han-sans': 'Source Han Sans SC, Microsoft YaHei, 微软雅黑, Arial, sans-serif',
    'helvetica-neue': 'Helvetica Neue, Arial, sans-serif',
    'roboto': 'Roboto, Arial, sans-serif',
    'inter': 'Inter, Arial, sans-serif'
  };

  const fontFamily = fontFamilyMap[fontSettings.fontFamily] || fontFamilyMap['system-default'];
  const fontSize = fontSettings.fontSize || 16;
  const lineHeight = fontSize <= 14 ? '1.75' : fontSize <= 18 ? '1.6' : '1.5';

  // 关键：使用更强的 CSS 选择器，确保微信公众号识别
  const cssStyles = `
<style>
/* 微信公众号兼容的字体设置 - 使用更强的选择器 */
section[data-role="outer"] {
  font-family: ${fontFamily} !important;
  font-size: ${fontSize}px !important;
  line-height: ${lineHeight} !important;
}

section[data-role="outer"] * {
  font-family: ${fontFamily} !important;
}

/* 基础元素样式 - 使用更具体的选择器 */
section[data-role="outer"] p,
section p,
.rich_media_content p,
div p {
  font-family: ${fontFamily} !important;
  font-size: ${fontSize}px !important;
  line-height: ${lineHeight} !important;
  margin: 1.5em 8px !important;
  color: #333 !important;
}

/* 标题样式 - 多重选择器确保生效 */
section[data-role="outer"] h1, section h1, .rich_media_content h1, div h1 {
  font-family: ${fontFamily} !important;
  font-size: ${Math.round(fontSize * 2.2)}px !important;
  line-height: 1.3 !important;
  font-weight: bold !important;
  margin: 1.8em 0 1.5em !important;
  color: #333 !important;
  text-align: center !important;
}

section[data-role="outer"] h2, section h2, .rich_media_content h2, div h2 {
  font-family: ${fontFamily} !important;
  font-size: ${Math.round(fontSize * 1.5)}px !important;
  line-height: 1.4 !important;
  font-weight: 600 !important;
  margin: 2em 0 1.5em !important;
  color: #333 !important;
}

section[data-role="outer"] h3, section h3, .rich_media_content h3, div h3 {
  font-family: ${fontFamily} !important;
  font-size: ${Math.round(fontSize * 1.3)}px !important;
  line-height: ${lineHeight} !important;
  font-weight: 600 !important;
  margin: 1.5em 0 1em !important;
  color: #333 !important;
}

section[data-role="outer"] h4, section h4, .rich_media_content h4, div h4 {
  font-family: ${fontFamily} !important;
  font-size: ${Math.round(fontSize * 1.1)}px !important;
  line-height: ${lineHeight} !important;
  font-weight: 600 !important;
  margin: 1.3em 0 1em !important;
  color: #333 !important;
}

section[data-role="outer"] h5, section h5, .rich_media_content h5, div h5 {
  font-family: ${fontFamily} !important;
  font-size: ${Math.round(fontSize * 1.0)}px !important;
  line-height: ${lineHeight} !important;
  font-weight: 600 !important;
  margin: 1.2em 0 1em !important;
  color: #333 !important;
}

section[data-role="outer"] h6, section h6, .rich_media_content h6, div h6 {
  font-family: ${fontFamily} !important;
  font-size: ${Math.round(fontSize * 0.9)}px !important;
  line-height: ${lineHeight} !important;
  font-weight: 600 !important;
  margin: 1.2em 0 1em !important;
  color: #333 !important;
}

/* 列表样式 */
section[data-role="outer"] ul, section ul, .rich_media_content ul, div ul,
section[data-role="outer"] ol, section ol, .rich_media_content ol, div ol {
  font-family: ${fontFamily} !important;
  font-size: ${fontSize}px !important;
  line-height: ${lineHeight} !important;
  margin: 1.5em 8px !important;
  padding-left: 25px !important;
  color: #333 !important;
}

section[data-role="outer"] li, section li, .rich_media_content li, div li {
  font-family: ${fontFamily} !important;
  font-size: ${fontSize}px !important;
  line-height: ${lineHeight} !important;
  margin-bottom: 0.5em !important;
  color: #333 !important;
}

/* 引用块样式 */
section[data-role="outer"] blockquote, section blockquote, .rich_media_content blockquote, div blockquote {
  font-family: ${fontFamily} !important;
  font-size: ${fontSize}px !important;
  line-height: ${lineHeight} !important;
  margin: 1.5em 8px !important;
  padding: 1em 1em 1em 2em !important;
  border-left: 3px solid #dbdbdb !important;
  background-color: #f8f8f8 !important;
  color: #333 !important;
}

/* 表格样式 */
section[data-role="outer"] table, section table, .rich_media_content table, div table {
  font-family: ${fontFamily} !important;
  font-size: ${fontSize}px !important;
  line-height: ${lineHeight} !important;
  margin: 1.5em 8px !important;
  border-collapse: collapse !important;
}

section[data-role="outer"] th, section th, .rich_media_content th, div th,
section[data-role="outer"] td, section td, .rich_media_content td, div td {
  font-family: ${fontFamily} !important;
  font-size: ${fontSize}px !important;
  line-height: ${lineHeight} !important;
  padding: 8px 12px !important;
  border: 1px solid #ddd !important;
  color: #333 !important;
}

/* 强调样式 */
section[data-role="outer"] strong, section strong, .rich_media_content strong, div strong,
section[data-role="outer"] b, section b, .rich_media_content b, div b {
  font-family: ${fontFamily} !important;
  font-size: ${fontSize}px !important;
  font-weight: bold !important;
  color: #333 !important;
}

section[data-role="outer"] em, section em, .rich_media_content em, div em,
section[data-role="outer"] i, section i, .rich_media_content i, div i {
  font-family: ${fontFamily} !important;
  font-size: ${fontSize}px !important;
  font-style: italic !important;
  color: #333 !important;
}

/* 行内代码 */
section[data-role="outer"] code, section code, .rich_media_content code, div code {
  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace !important;
  background: #f5f5f5 !important;
  padding: 2px 4px !important;
  border-radius: 3px !important;
  color: #333 !important;
}

/* 代码块 */
section[data-role="outer"] pre, section pre, .rich_media_content pre, div pre {
  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace !important;
  line-height: 1.4 !important;
  margin: 1.5em 8px !important;
  padding: 1em !important;
  background: #f5f5f5 !important;
  border-radius: 5px !important;
  overflow-x: auto !important;
}

section[data-role="outer"] pre code, section pre code, .rich_media_content pre code, div pre code {
  background: none !important;
  padding: 0 !important;
}
</style>`;

  // 使用微信公众号标准的 HTML 结构
  return `${cssStyles}
<section data-role="outer" class="rich_media_content" style="font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lineHeight};">
<section data-role="inner" style="font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lineHeight};">
${html}
</section>
</section>`;
}

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
   * 处理代码块内容
   * @param {string} line - 当前行
   * @param {string} trimmedLine - 去除空白的当前行
   * @returns {Object} 处理结果
   */
  handleCodeBlockContent(line, trimmedLine) {
    if (trimmedLine.startsWith('```')) {
      // 结束代码块
      const blockInfo = this.context.endCodeBlock();
      const fontSize = this.context.fontSettings?.fontSize || 16;
      const result = formatCodeBlock(
        blockInfo.content,
        blockInfo.language,
        this.context.currentTheme,
        this.context.codeTheme,
        this.context.options.isPreview || false,
        fontSize
      );
      
      return {
        result,
        shouldContinue: true,
        updateContext: {} // 不需要额外更新，endCodeBlock已处理
      };
    } else {
      // 添加到代码块内容
      this.context.addCodeBlockContent(line);
      return {
        result: '',
        shouldContinue: true,
        updateContext: {}
      };
    }
  }

  /**
   * 处理空行
   * @returns {Object} 处理结果
   */
  handleEmptyLine() {
    if (this.context.isInBlockquote()) {
      this.context.addBlockquoteContent('');
      return {
        result: '',
        shouldContinue: true,
        updateContext: {}
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
    const content = this.context.endBlockquote();
    if (content.length > 0) {
      // 获取字体设置
      const fontSize = this.context.fontSettings?.fontSize || 16;
      return formatBlockquote(content, this.context.currentTheme, fontSize);
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
    // 获取字体设置
    const fontSettings = this.context.fontSettings;
    const fontSize = fontSettings?.fontSize || 16;
    const lineHeight = fontSettings?.fontSize <= 14 ? '1.7' : fontSettings?.fontSize <= 18 ? '1.6' : '1.5';

    const formattedText = processInlineFormatsWithoutEscapes(trimmedLine, this.context.currentTheme, fontSize);

    const result = `<p style="margin: 12px 0; line-height: ${lineHeight}; font-size: ${fontSize}px;">${formattedText}</p>`;

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

  // 如果不是预览模式且有字体设置，包装结果以应用字体样式
  if (!options.isPreview && fontSettings) {
    result = wrapWithFontStyles(result, fontSettings);
  }

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

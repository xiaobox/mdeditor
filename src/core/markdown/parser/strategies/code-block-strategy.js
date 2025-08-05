/**
 * @file src/core/markdown/parser/strategies/code-block-strategy.js
 * @description 代码块内容处理策略
 */

import { LineProcessingStrategy } from './base-strategy.js';
import { formatCodeBlock } from '../../formatters/legacy.js';

/**
 * 代码块内容处理策略
 * 现在包含完整的代码块处理逻辑，不再依赖协调器的具体实现
 */
export class CodeBlockContentStrategy extends LineProcessingStrategy {
  canProcess(context, _line, _trimmedLine, _lines, _index) {
    return context.isInCodeBlock();
  }

  process(coordinator, line, trimmedLine, _lines, _index) {
    const context = coordinator.context;

    if (trimmedLine.startsWith('```')) {
      // 结束代码块
      const blockInfo = context.endCodeBlock();
      const fontSize = context.fontSettings?.fontSize || 16;

      const result = formatCodeBlock(
        blockInfo.content,
        blockInfo.language,
        context.currentTheme,
        context.codeTheme,
        context.options.isPreview || false,
        fontSize
      );

      return {
        result,
        shouldContinue: true,
        updateContext: {} // 不需要额外更新，endCodeBlock已处理
      };
    } else {
      // 添加到代码块内容
      context.addCodeBlockContent(line);
      return {
        result: '',
        shouldContinue: true,
        updateContext: {}
      };
    }
  }
}
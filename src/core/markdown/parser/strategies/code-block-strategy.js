/**
 * @file src/utils/formatters/processing-strategies/code-block-strategy.js
 * @description 代码块内容处理策略
 */

import { LineProcessingStrategy } from './base-strategy.js';

/**
 * 代码块内容处理策略
 */
export class CodeBlockContentStrategy extends LineProcessingStrategy {
  canProcess(context, line, trimmedLine, lines, index) {
    return context.isInCodeBlock();
  }

  process(coordinator, line, trimmedLine, lines, index) {
    return coordinator.handleCodeBlockContent(line, trimmedLine);
  }
} 
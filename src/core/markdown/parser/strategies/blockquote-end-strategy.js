/**
 * @file src/core/markdown/parser/strategies/blockquote-end-strategy.js
 * @description 引用块结束检查策略
 */

import { LineProcessingStrategy } from './base-strategy.js';

/**
 * 引用块结束检查策略
 */
export class BlockquoteEndCheckStrategy extends LineProcessingStrategy {
  canProcess(context, line, trimmedLine, lines, index) {
    return context.isInBlockquote() && trimmedLine && !trimmedLine.startsWith('>');
  }

  process(coordinator, line, trimmedLine, lines, index) {
    const result = coordinator.endBlockquote();
    // 重新处理当前行
    const reprocessResult = coordinator.processLine(line, trimmedLine, lines, index);
    return {
      result: result + reprocessResult.result,
      shouldContinue: reprocessResult.shouldContinue,
      updateContext: reprocessResult.updateContext
    };
  }
} 
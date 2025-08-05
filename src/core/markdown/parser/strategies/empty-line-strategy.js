/**
 * @file src/core/markdown/parser/strategies/empty-line-strategy.js
 * @description 空行处理策略
 */

import { LineProcessingStrategy } from './base-strategy.js';

/**
 * 空行处理策略
 * 现在包含完整的空行处理逻辑，不再依赖协调器的具体实现
 */
export class EmptyLineStrategy extends LineProcessingStrategy {
  canProcess(_context, _line, trimmedLine, _lines, _index) {
    return !trimmedLine;
  }

  process(coordinator, _line, _trimmedLine, _lines, _index) {
    const context = coordinator.context;

    if (context.isInBlockquote()) {
      context.addBlockquoteContent('');
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
}
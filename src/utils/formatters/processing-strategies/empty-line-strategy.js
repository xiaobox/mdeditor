/**
 * @file src/utils/formatters/processing-strategies/empty-line-strategy.js
 * @description 空行处理策略
 */

import { LineProcessingStrategy } from './base-strategy.js';

/**
 * 空行处理策略
 */
export class EmptyLineStrategy extends LineProcessingStrategy {
  canProcess(context, line, trimmedLine, lines, index) {
    return !trimmedLine;
  }

  process(coordinator, line, trimmedLine, lines, index) {
    return coordinator.handleEmptyLine();
  }
} 
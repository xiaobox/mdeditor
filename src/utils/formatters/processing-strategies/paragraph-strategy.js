/**
 * @file src/utils/formatters/processing-strategies/paragraph-strategy.js
 * @description 普通段落处理策略（默认策略）
 */

import { LineProcessingStrategy } from './base-strategy.js';

/**
 * 普通段落处理策略（默认策略）
 */
export class ParagraphStrategy extends LineProcessingStrategy {
  canProcess(context, line, trimmedLine, lines, index) {
    return true; // 总是可以处理（作为兜底策略）
  }

  process(coordinator, line, trimmedLine, lines, index) {
    return coordinator.handleParagraph(line, trimmedLine);
  }
} 
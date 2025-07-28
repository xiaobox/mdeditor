/**
 * @file src/utils/formatters/processing-strategies/line-processor-strategy.js
 * @description 行处理器策略（标题、分割线等）
 */

import { LineProcessingStrategy } from './base-strategy.js';
import { getLineProcessor } from '../line-processors.js';

/**
 * 行处理器策略（标题、分割线等）
 */
export class LineProcessorStrategy extends LineProcessingStrategy {
  canProcess(context, line, trimmedLine, lines, index) {
    return getLineProcessor(line, trimmedLine, context) !== null;
  }

  process(coordinator, line, trimmedLine, lines, index) {
    const processor = getLineProcessor(line, trimmedLine, coordinator.context);
    if (processor) {
      const result = processor.process(line, trimmedLine, coordinator.context);
      return {
        result: result.result,
        shouldContinue: result.shouldContinue,
        updateContext: result.updateContext
      };
    }
    return null;
  }
} 
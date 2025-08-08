/**
 * @file src/core/markdown/parser/strategies/list-strategy.js
 * @description 列表处理策略
 */

import { LineProcessingStrategy } from './base-strategy.js';

/**
 * 列表处理策略
 */
export class ListProcessingStrategy extends LineProcessingStrategy {
  canProcess(context, line, trimmedLine, lines, index) {
    // 列表处理器会自己判断是否处理列表
    return true;
  }

  process(coordinator, line, trimmedLine, lines, index) {
    const listResult = coordinator.listProcessor.processListLine(
      line, coordinator.context.currentTheme, coordinator.context.fontSettings
    );

    if (listResult.isListItem) {
      return {
        result: listResult.result,
        shouldContinue: true,
        updateContext: {}
      };
    }

    // 列表处理器不能处理，返回 null 继续下一个策略
    return null;
  }
} 
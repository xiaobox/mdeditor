/**
 * @file src/core/markdown/parser/strategies/table-strategy.js
 * @description 表格处理策略
 */

import { LineProcessingStrategy } from './base-strategy.js';

/**
 * 表格处理策略
 */
export class TableProcessingStrategy extends LineProcessingStrategy {
  canProcess(context, line, trimmedLine, lines, index) {
    // 表格处理器会自己判断是否处理表格
    return true;
  }

  process(coordinator, line, trimmedLine, lines, index) {
    const tableResult = coordinator.tableProcessor.processTableRow(
      line, trimmedLine, lines, index, coordinator.context.currentTheme, coordinator.context.fontSettings
    );
    
    if (tableResult.shouldContinue || tableResult.tableComplete) {
      if (tableResult.reprocessLine) {
        // 表格结束，需要重新处理当前行
        const reprocessResult = coordinator.processLine(line, trimmedLine, lines, index);
        return {
          result: tableResult.result + reprocessResult.result,
          shouldContinue: reprocessResult.shouldContinue,
          updateContext: reprocessResult.updateContext
        };
      }
      return {
        result: tableResult.result,
        shouldContinue: true,
        updateContext: {}
      };
    }
    
    // 表格处理器不能处理，返回 null 继续下一个策略
    return null;
  }
} 
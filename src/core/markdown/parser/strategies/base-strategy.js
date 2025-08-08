/**
 * @file src/core/markdown/parser/strategies/base-strategy.js
 * @description 行处理策略基类
 */

/**
 * 行处理策略基类
 */
export class LineProcessingStrategy {
  /**
   * 检查是否可以处理当前行
   * @param {Object} context - 处理上下文
   * @param {string} line - 当前行
   * @param {string} trimmedLine - 去除空白的当前行
   * @param {Array} lines - 所有行
   * @param {number} index - 当前行索引
   * @returns {boolean} 是否可以处理
   */
  canProcess(context, line, trimmedLine, lines, index) {
    throw new Error('子类必须实现 canProcess 方法');
  }

  /**
   * 处理当前行
   * @param {Object} coordinator - 协调器实例
   * @param {string} line - 当前行
   * @param {string} trimmedLine - 去除空白的当前行
   * @param {Array} lines - 所有行
   * @param {number} index - 当前行索引
   * @returns {Object} 处理结果
   */
  process(coordinator, line, trimmedLine, lines, index) {
    throw new Error('子类必须实现 process 方法');
  }
} 
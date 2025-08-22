/**
 * @file src/core/markdown/parser/coordinator.js
 * @description 格式化协调器
 *
 * 协调各种格式化处理器，实现复杂的 Markdown 到 HTML 转换逻辑。
 * 使用策略模式和状态机模式来简化原本复杂的条件逻辑。
 */

import { MarkdownParser } from './core/MarkdownParser.js';


/**
 * 格式化协调器类
 * 重构后只负责策略调度，状态管理由 FormatterContext 负责
 */
// 迁移：从提取的模块导入，保持对外类名不变
export { FormatterCoordinator } from './formatter-coordinator.js';

/**
 * 解析 Markdown 文本为 HTML 的便捷函数
 * - 保持对外 API 不变
 * - 内部委托给新的 MarkdownParser
 * @param {string} markdownText
 * @param {object} [options]
 * @returns {string}
 */
export function parseMarkdown(markdownText, options = {}) {
  const parser = new MarkdownParser();
  return parser.parse(markdownText, options);
}

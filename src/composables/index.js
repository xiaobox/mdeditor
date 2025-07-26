/**
 * @file src/composables/index.js
 * @description Composables 的统一出口文件。
 *
 * 该文件作为 `composables` 目录的公共 API 入口，
 * 使得其他模块可以从一个集中的位置导入所有可用的 Composable 函数。
 * 这种模式简化了导入语句，并使得 `composables` 目录的结构更清晰、更易于维护。
 *
 * @example
 * // 在其他文件中，可以这样导入：
 * import { useThemeManager, useMarkdownEditor } from '@/composables';
 */

// 统一导出主题管理器相关 hooks
export { useThemeManager, useGlobalThemeManager } from './useThemeManager.js'

// 统一导出 Markdown 编辑器相关 hooks
export { useMarkdownEditor } from './useMarkdownEditor.js'

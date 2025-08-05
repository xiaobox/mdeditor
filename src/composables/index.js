/**
 * @file src/composables/index.js
 * @description 统一导出所有组合式API
 *
 * 重构后的模块化架构，按功能分组导出
 */

// 编辑器相关组合式API
export * from './editor/index.js';

// 主题相关组合式API
export * from './theme/index.js';

// 应用状态管理相关组合式API
export { useAppState } from './useAppState.js';
export { useContentState } from './useContentState.js';
export { useUIState } from './useUIState.js';
export { useNotification } from './useNotification.js';
export { useClipboard } from './useClipboard.js';

// 为向后兼容性保留的别名导出
export { useEditor as useMarkdownEditor } from './editor/index.js';

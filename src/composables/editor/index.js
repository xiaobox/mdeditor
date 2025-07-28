/**
 * @file src/composables/editor/index.js
 * @description 编辑器相关组合式API统一导出
 * 
 * 重构后的模块化组织，将编辑器相关的所有composables集中管理
 */

// 主编辑器组合
export { useMarkdownEditor as useEditor } from './useEditor.js';

// 编辑器状态管理
export { useEditorState } from './useEditorState.js';

// 编辑器事件处理
export { useEditorEvents } from './useEditorEvents.js';

// 编辑器生命周期管理
export { useEditorLifecycle } from './useEditorLifecycle.js';

// 编辑器操作
export { useEditorOperations } from './useEditorOperations.js';

// 编辑器主题
export { useEditorTheme } from './useEditorTheme.js'; 
/**
 * @file src/composables/editor/useEditor.js
 * @description Markdown 编辑器 Composable
 *
 * 本文件封装了与 CodeMirror 6 编辑器相关的所有逻辑，为 Vue 组件提供一个简洁、
 * 响应式的接口来管理 Markdown 编辑器。
 *
 * 主要功能:
 * 1.  **编辑器实例化**: 动态创建和销毁 CodeMirror 实例。
 * 2.  **响应式内容**: `content` ref 双向绑定编辑器内容。
 * 3.  **主题集成**: 通过 `useGlobalThemeManager` 与全局主题系统联动，
 *     自动根据当前颜色主题（亮/暗）切换 CodeMirror 的基础主题。
 * 4.  **工具栏操作**: 封装了 `editor-operations.js` 中的原子操作，
 *     提供如加粗、插入链接等易于调用的方法。
 * 5.  **滚动同步**: 监听编辑器的滚动事件，并以百分比形式通知父组件，
 *     用于实现编辑器与预览窗格的同步滚动。
 * 6.  **生命周期管理**: 在组件挂载时初始化编辑器，在卸载时销毁，防止内存泄漏。
 *
 * 设计思想:
 * - **关注点分离**: 将复杂的 CodeMirror 配置和 API 操作封装在此 Composable 中，
 *   让 Vue 组件只关注业务逻辑。
 * - **可组合性**: 返回一个包含状态和方法的对象，方便在不同组件中复用。
 * - **响应式**: 利用 Vue 的 `ref` 和 `computed` 属性，使编辑器状态能自然地融入 Vue 的响应式系统。
 * - **模块化**: 通过组合多个小的 composables 实现复杂功能，提高代码的可维护性。
 */

// 导入拆分后的 composables
import { useEditorState } from './useEditorState.js'
import { useEditorEvents } from './useEditorEvents.js'
import { useEditorTheme } from './useEditorTheme.js'
import { useEditorOperations } from './useEditorOperations.js'
import { useEditorLifecycle } from './useEditorLifecycle.js'
import { useThemeWatcher } from '../theme/useThemeWatcher.js'

/**
 * 创建并管理一个 Markdown 编辑器实例。
 * @param {Object} [options={}] - 配置选项。
 * @param {string} [options.initialValue=''] - 编辑器的初始内容。
 * @param {'auto'|'light'|'dark'} [options.theme='auto'] - 编辑器主题模式。
 *   - 'auto': 根据全局颜色主题自动切换亮/暗模式。
 *   - 'light': 强制使用亮色主题。
 *   - 'dark': 强制使用暗色主题。
 * @param {Function} [options.onContentChange=() => {}] - 内容变化时的回调函数。
 * @param {Function} [options.onScroll=() => {}] - 滚动事件的回调函数。
 * @returns {Object} 包含编辑器状态和方法的对象。
 */
export function useMarkdownEditor(options = {}) {
  const {
    initialValue = '',
    theme = 'auto',
    onContentChange = () => {},
    onScroll = () => {}
  } = options

  // 使用拆分后的 composables
  const editorState = useEditorState(initialValue)
  const editorEvents = useEditorEvents(onContentChange, onScroll)
  const editorTheme = useEditorTheme(theme)
  const editorOperations = useEditorOperations(editorState.getEditorView)

  // 使用生命周期管理器
  const editorLifecycle = useEditorLifecycle({
    editorState,
    editorEvents,
    editorTheme
  })

  // 使用主题监听器
  const themeWatcher = useThemeWatcher({
    editorTheme,
    reinitEditor: editorLifecycle.reinitEditor
  }, theme)

  // 设置主题监听
  const watchers = themeWatcher.setupThemeWatchers()

  // --- 返回 API ---

  return {
    // 来自 editorState 的状态和方法
    editorElement: editorState.editorElement,
    content: editorState.content,
    isInitialized: editorState.isInitialized,

    // 来自 editorTheme 的状态
    currentTheme: editorTheme.currentTheme,
    themeManager: editorTheme.themeManager,

    // 来自 editorLifecycle 的控制方法
    initEditor: editorLifecycle.initEditor,
    destroyEditor: editorLifecycle.destroyEditor,
    reinitEditor: editorLifecycle.reinitEditor,
    updateContent: editorLifecycle.updateContent,

    // 来自 themeWatcher 的主题控制方法
    forceThemeUpdate: themeWatcher.forceThemeUpdate,

    // 来自 editorOperations 的工具栏操作
    ...editorOperations,

    // 实例访问 (用于高级操作)
    getEditorView: editorState.getEditorView,

    // 清理方法（用于手动清理时使用）
    cleanup: () => themeWatcher.cleanupWatchers(watchers)
  }
}
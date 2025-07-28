/**
 * @file src/composables/useMarkdownEditor.js
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

import { watch, onMounted, onUnmounted } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { EditorState } from '@codemirror/state'

// 导入拆分后的 composables
import { useEditorState } from './useEditorState.js'
import { useEditorEvents } from './useEditorEvents.js'
import { useEditorTheme } from './useEditorTheme.js'
import { useEditorOperations } from './useEditorOperations.js'

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

  // --- 私有方法 (Private Methods) ---

  /**
   * 初始化 CodeMirror 编辑器。
   */
  const initEditor = () => {
    if (!editorState.editorElement.value || editorState.getEditorView()) return;

    // 创建更新监听器
    const updateListener = EditorView.updateListener.of(
      editorEvents.createUpdateListener(editorState.updateContent)
    );

    // 获取编辑器扩展
    const extensions = [
      basicSetup,
      markdown(),
      updateListener,
      ...editorTheme.getEditorExtensions(updateListener)
    ];

    // 创建编辑器状态
    const state = EditorState.create({
      doc: editorState.content.value,
      extensions
    });

    // 创建编辑器视图
    const editorView = new EditorView({
      state,
      parent: editorState.editorElement.value
    });

    // 设置编辑器实例
    editorState.setEditorView(editorView);

    // 绑定滚动事件
    editorEvents.bindScrollListener(editorView);
  };

  /**
   * 销毁 CodeMirror 编辑器实例，清理资源。
   */
  const destroyEditor = () => {
    const editorView = editorState.getEditorView();
    if (editorView) {
      // 解绑滚动事件
      editorEvents.unbindScrollListener(editorView);
      
      // 销毁编辑器
      editorView.destroy();
      editorState.setEditorView(null);
    }
  };

  /**
   * 重新初始化编辑器。通常在主题等需要完全重建编辑器的配置变化时调用。
   */
  const reinitEditor = () => {
    destroyEditor()
    initEditor()
  };

  /**
   * 以编程方式更新编辑器的内容。
   * @param {string} newValue - 新的 Markdown 内容。
   */
  const updateContent = (newValue) => {
    const editorView = editorState.getEditorView();
    if (newValue !== editorState.content.value && editorView) {
      const transaction = editorView.state.update({
        changes: {
          from: 0,
          to: editorView.state.doc.length,
          insert: newValue
        }
      })
      editorView.dispatch(transaction)
      // content.value 会在 updateListener 中被更新，这里无需重复设置
    }
  };

  // --- 侦听器 (Watchers) ---

  // 监听主题变化，自动重新初始化编辑器
  watch(editorTheme.currentTheme, () => {
    reinitEditor()
  })

  // 如果使用 'auto' 主题，还需监听全局颜色主题的变化
  if (theme === 'auto') {
    watch(() => editorTheme.themeManager.currentColorTheme.value, () => {
      // reinitEditor() 会由上面的 currentTheme watcher 触发
    }, { deep: true })
  }

  // --- 生命周期钩子 (Lifecycle Hooks) ---

  onMounted(() => {
    // 使用 setTimeout 确保父组件的 DOM 已经完全渲染。
    setTimeout(initEditor, 0)
  })

  onUnmounted(() => {
    destroyEditor()
  })

  // --- 返回 API ---

  return {
    // 来自 editorState 的状态和方法
    editorElement: editorState.editorElement,
    content: editorState.content,
    isInitialized: editorState.isInitialized,

    // 来自 editorTheme 的状态
    currentTheme: editorTheme.currentTheme,
    themeManager: editorTheme.themeManager,

    // 控制方法
    initEditor,
    destroyEditor,
    reinitEditor,
    updateContent,

    // 来自 editorOperations 的工具栏操作
    ...editorOperations,

    // 实例访问 (用于高级操作)
    getEditorView: editorState.getEditorView
  }
}
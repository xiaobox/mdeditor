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
 */

import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorState } from '@codemirror/state'
import { toolbarOperations } from '../utils/editor-operations.js'
import { useGlobalThemeManager } from './useThemeManager.js'

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
    theme = 'auto', // 默认使用自动主题
    onContentChange = () => {},
    onScroll = () => {}
  } = options

  // 获取全局主题管理器实例
  const themeManager = useGlobalThemeManager()

  // --- 响应式状态 (Reactive State) ---

  /** @type {import('vue').Ref<HTMLElement|null>} 编辑器的 DOM 挂载点 */
  const editorElement = ref(null)
  /** @type {import('vue').Ref<string>} 编辑器的当前内容 */
  const content = ref(initialValue)
  /** @type {EditorView|null} CodeMirror 编辑器实例 */
  let editorView = null

  // --- 计算属性 (Computed Properties) ---

  /**
   * 根据配置和全局主题计算出当前应使用的编辑器主题（'light' 或 'dark'）。
   */
  const currentTheme = computed(() => {
    if (theme === 'auto') {
      const colorTheme = themeManager.currentColorTheme.value
      return colorTheme?.isDark ? 'dark' : 'light'
    }
    return theme
  })

  // --- 私有方法 (Private Methods) ---

  /**
   * 创建 CodeMirror 的基础主题扩展。
   * @returns {import('@codemirror/state').Extension}
   */
  const getEditorTheme = () => {
    return EditorView.theme({
      '&': {
        height: '100%',
      },
      '.cm-scroller': {
        fontFamily: '"SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        fontSize: '14px',
        lineHeight: '1.6'
      },
      '.cm-focused': {
        outline: 'none'
      },
      '.cm-editor': {
        height: '100%'
      },
      '.cm-content': {
        padding: '16px',
        minHeight: '100%'
      }
    })
  }

  /**
   * 处理编辑器滚动事件，计算滚动百分比并触发回调。
   * @param {Event} e - 滚动事件对象。
   */
  const handleScroll = (e) => {
    const element = e.target
    const scrollTop = element.scrollTop
    const scrollHeight = element.scrollHeight
    const clientHeight = element.clientHeight

    const maxScrollTop = Math.max(0, scrollHeight - clientHeight)
    const scrollPercentage = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0

    onScroll(scrollPercentage)
  }

  // --- 公开方法 (Public Methods) ---

  /**
   * 初始化 CodeMirror 编辑器。
   */
  const initEditor = () => {
    if (!editorElement.value || editorView) return

    const extensions = [
      basicSetup,
      markdown(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const newContent = update.state.doc.toString()
          content.value = newContent
          onContentChange(newContent)
        }
      }),
      getEditorTheme()
    ]

    // 如果是暗色主题，添加 oneDark 扩展
    if (currentTheme.value === 'dark') {
      extensions.push(oneDark)
    }

    const state = EditorState.create({
      doc: content.value, // 使用响应式 ref 的当前值
      extensions
    })

    editorView = new EditorView({
      state,
      parent: editorElement.value
    })

    // 绑定滚动事件
    const scrollElement = editorView.scrollDOM
    scrollElement.addEventListener('scroll', handleScroll, { passive: true })
  }

  /**
   * 销毁 CodeMirror 编辑器实例，清理资源。
   */
  const destroyEditor = () => {
    if (editorView) {
      const scrollElement = editorView.scrollDOM
      if (scrollElement) {
        scrollElement.removeEventListener('scroll', handleScroll)
      }
      editorView.destroy()
      editorView = null
    }
  }

  /**
   * 重新初始化编辑器。通常在主题等需要完全重建编辑器的配置变化时调用。
   */
  const reinitEditor = () => {
    destroyEditor()
    initEditor()
  }

  /**
   * 以编程方式更新编辑器的内容。
   * @param {string} newValue - 新的 Markdown 内容。
   */
  const updateContent = (newValue) => {
    if (newValue !== content.value && editorView) {
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
  }

  /**
   * 创建一个包含所有工具栏操作的对象。
   * 每个方法都会自动将当前的 editorView 实例作为第一个参数传入。
   * @returns {Object} 工具栏操作方法的集合。
   */
  const createToolbarOperations = () => {
    const operations = {}
    
    Object.keys(toolbarOperations).forEach(key => {
      operations[key] = (...args) => {
        if (editorView) {
          toolbarOperations[key](editorView, ...args)
        }
      }
    })

    return operations
  }

  const toolbar = createToolbarOperations()

  // --- 侦听器 (Watchers) ---

  // 监听 `currentTheme` 的变化，自动重新初始化编辑器以应用新主题。
  watch(currentTheme, () => {
    reinitEditor()
  })

  // 如果使用 'auto' 主题，还需监听全局颜色主题的变化。
  if (theme === 'auto') {
    watch(() => themeManager.currentColorTheme.value, () => {
      // reinitEditor() 会由上面的 `currentTheme` watcher 触发
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
    // 响应式状态
    editorElement,
    content,
    currentTheme,

    // 控制方法
    initEditor,
    destroyEditor,
    reinitEditor,
    updateContent,

    // 工具栏操作
    ...toolbar,

    // 实例访问 (用于高级操作)
    getEditorView: () => editorView,

    // 主题管理器访问
    themeManager
  }
}
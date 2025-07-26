/**
 * Markdown 编辑器 Composable
 * 提供编辑器初始化、配置和操作的统一接口
 * 已整合主题系统支持
 */

import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorState } from '@codemirror/state'
import { toolbarOperations } from '../utils/editor-operations.js'
import { useGlobalThemeManager } from './useThemeManager.js'

/**
 * 使用 Markdown 编辑器
 * @param {Object} options - 配置选项
 * @returns {Object} 编辑器相关的响应式数据和方法
 */
export function useMarkdownEditor(options = {}) {
  const {
    initialValue = '',
    theme = 'auto', // 默认使用自动主题
    onContentChange = () => {},
    onScroll = () => {}
  } = options

  // 主题管理器
  const themeManager = useGlobalThemeManager()

  // 响应式数据
  const editorElement = ref(null)
  const content = ref(initialValue)
  let editorView = null

  // 计算当前主题
  const currentTheme = computed(() => {
    if (theme === 'auto') {
      // 根据颜色主题自动判断
      const colorTheme = themeManager.currentColorTheme.value
      return colorTheme?.isDark ? 'dark' : 'light'
    }
    return theme
  })

  // 编辑器主题配置
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

  // 滚动同步处理
  const handleScroll = (e) => {
    const element = e.target
    const scrollTop = element.scrollTop
    const scrollHeight = element.scrollHeight
    const clientHeight = element.clientHeight

    // 计算滚动百分比
    const maxScrollTop = Math.max(0, scrollHeight - clientHeight)
    const scrollPercentage = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0

    // 调用外部滚动处理函数
    onScroll(scrollPercentage)
  }

  // 初始化编辑器
  const initEditor = () => {
    if (!editorElement.value) return

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

    // 添加暗色主题
    if (currentTheme.value === 'dark') {
      extensions.push(oneDark)
    }

    const state = EditorState.create({
      doc: initialValue,
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

  // 销毁编辑器
  const destroyEditor = () => {
    if (editorView) {
      // 清理滚动事件监听器
      const scrollElement = editorView.scrollDOM
      if (scrollElement) {
        scrollElement.removeEventListener('scroll', handleScroll)
      }
      editorView.destroy()
      editorView = null
    }
  }

  // 重新初始化编辑器（主题变化时）
  const reinitEditor = () => {
    destroyEditor()
    initEditor()
  }

  // 更新编辑器内容
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
      content.value = newValue
    }
  }

  // 创建工具栏操作函数
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

  // 获取工具栏操作
  const toolbar = createToolbarOperations()

  // 监听主题变化
  watch(currentTheme, () => {
    reinitEditor()
  })

  // 监听全局主题变化（当使用 auto 主题时）
  if (theme === 'auto') {
    watch(() => themeManager.currentColorTheme.value, () => {
      reinitEditor()
    }, { deep: true })
  }

  // 生命周期
  onMounted(() => {
    // 使用 setTimeout 确保 DOM 已渲染
    setTimeout(initEditor, 0)
  })

  onUnmounted(() => {
    destroyEditor()
  })

  return {
    // 响应式数据
    editorElement,
    content,
    currentTheme,

    // 方法
    initEditor,
    destroyEditor,
    reinitEditor,
    updateContent,

    // 工具栏操作
    ...toolbar,

    // 编辑器实例访问（谨慎使用）
    getEditorView: () => editorView,

    // 主题管理器访问
    themeManager
  }
}

/**
 * 编辑器工具栏配置
 */
export const defaultToolbarConfig = [
  {
    group: 'headings',
    items: [
      { type: 'heading', level: 1, title: '一级标题', icon: 'H1' },
      { type: 'heading', level: 2, title: '二级标题', icon: 'H2' },
      { type: 'heading', level: 3, title: '三级标题', icon: 'H3' }
    ]
  },
  {
    group: 'formatting',
    items: [
      { type: 'bold', title: '粗体 (Ctrl+B)', icon: 'Bold' },
      { type: 'italic', title: '斜体 (Ctrl+I)', icon: 'Italic' },
      { type: 'strikethrough', title: '删除线', icon: 'Strikethrough' }
    ]
  },
  {
    group: 'links',
    items: [
      { type: 'link', title: '插入链接 (Ctrl+K)', icon: 'Link' },
      { type: 'image', title: '插入图片', icon: 'Image' }
    ]
  },
  {
    group: 'code',
    items: [
      { type: 'code', title: '行内代码', icon: 'Code' },
      { type: 'codeBlock', title: '代码块', icon: 'CodeBlock' }
    ]
  },
  {
    group: 'lists',
    items: [
      { type: 'quote', title: '引用', icon: 'Quote' },
      { type: 'list', title: '无序列表', icon: 'List' },
      { type: 'orderedList', title: '有序列表', icon: 'OrderedList' },
      { type: 'table', title: '插入表格', icon: 'Table' }
    ]
  },
  {
    group: 'misc',
    items: [
      { type: 'horizontalRule', title: '分割线', icon: 'HorizontalRule' }
    ]
  }
]

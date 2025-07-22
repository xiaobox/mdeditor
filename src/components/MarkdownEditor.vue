<template>
  <div class="markdown-editor">
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <div class="toolbar-group">
          <button @click="insertHeading(1)" title="一级标题" class="toolbar-btn">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M3 4v6h4V6h4v12h-4v4h12v-4h-4V6h4v4h4V4H3z"/>
            </svg>
          </button>
          <button @click="insertHeading(2)" title="二级标题" class="toolbar-btn">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M5 4v3h5v12h3V7h5V4H5z"/>
            </svg>
          </button>
          <button @click="insertHeading(3)" title="三级标题" class="toolbar-btn">
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path fill="currentColor" d="M5 4v3h5v12h3V7h5V4H5z"/>
            </svg>
          </button>
        </div>
        
        <div class="toolbar-divider"></div>
        
        <div class="toolbar-group">
          <button @click="insertBold" title="粗体 (Ctrl+B)" class="toolbar-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M13.5,15.5H10V12.5H13.5A1.5,1.5 0 0,1 15,14A1.5,1.5 0 0,1 13.5,15.5M10,6.5H13A1.5,1.5 0 0,1 14.5,8A1.5,1.5 0 0,1 13,9.5H10M15.6,10.79C16.57,10.11 17.25,9 17.25,8C17.25,5.74 15.5,4 13.25,4H7V18H14.04C16.14,18 17.75,16.3 17.75,14.21C17.75,12.69 16.89,11.39 15.6,10.79Z"/>
            </svg>
          </button>
          <button @click="insertItalic" title="斜体 (Ctrl+I)" class="toolbar-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M10,4V7H12.21L8.79,15H6V18H14V15H11.79L15.21,7H18V4H10Z"/>
            </svg>
          </button>
          <button @click="insertStrikethrough" title="删除线" class="toolbar-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M23,12V14H18.61C19.61,16.14 19.56,22 12.38,22C4.05,22.05 4.37,15.5 4.37,15.5L8.34,15.55C8.34,15.55 8.14,18.82 11.5,18.82C14.86,18.82 15.12,16.5 14.5,14H1V12H23M3.41,10H20.59C20.59,10 20.75,5.23 15.19,5.23C12.82,5.23 10.73,6.41 10.73,8.55C10.73,10.68 12.91,10 12.91,10H3.41Z"/>
            </svg>
          </button>
        </div>
        
        <div class="toolbar-divider"></div>
        
        <div class="toolbar-group">
          <button @click="insertLink" title="插入链接 (Ctrl+K)" class="toolbar-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M10.59,13.41C11,13.8 11,14.44 10.59,14.83C10.2,15.22 9.56,15.22 9.17,14.83C7.22,12.88 7.22,9.71 9.17,7.76V7.76L12.71,4.22C14.66,2.27 17.83,2.27 19.78,4.22C21.73,6.17 21.73,9.34 19.78,11.29L18.29,12.78C18.3,11.96 18.17,11.14 17.89,10.36L18.36,9.88C19.54,8.71 19.54,6.81 18.36,5.64C17.19,4.46 15.29,4.46 14.12,5.64L10.59,9.17C9.41,10.34 9.41,12.24 10.59,13.41M13.41,9.17C13.8,8.78 14.44,8.78 14.83,9.17C16.78,11.12 16.78,14.29 14.83,16.24V16.24L11.29,19.78C9.34,21.73 6.17,21.73 4.22,19.78C2.27,17.83 2.27,14.66 4.22,12.71L5.71,11.22C5.7,12.04 5.83,12.86 6.11,13.65L5.64,14.12C4.46,15.29 4.46,17.19 5.64,18.36C6.81,19.54 8.71,19.54 9.88,18.36L13.41,14.83C14.59,13.66 14.59,11.76 13.41,10.59C13,10.2 13,9.56 13.41,9.17Z"/>
            </svg>
          </button>
          <button @click="insertImage" title="插入图片" class="toolbar-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M21,17H7V3H21M21,1H7A2,2 0 0,0 5,3V17A2,2 0 0,0 7,19H21A2,2 0 0,0 23,17V3A2,2 0 0,0 21,1M3,5H1V21A2,2 0 0,0 3,23H19V21H3M15.96,10.29L13.21,13.83L11.25,11.47L8.5,15H19.5L15.96,10.29Z"/>
            </svg>
          </button>
        </div>
        
        <div class="toolbar-divider"></div>
        
        <div class="toolbar-group">
          <button @click="insertCode" title="行内代码" class="toolbar-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M9.4,16.6L4.8,12L9.4,7.4L8,6L2,12L8,18L9.4,16.6M14.6,16.6L19.2,12L14.6,7.4L16,6L22,12L16,18L14.6,16.6Z"/>
            </svg>
          </button>
          <button @click="insertCodeBlock" title="代码块" class="toolbar-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M8,3A2,2 0 0,0 6,5V9A2,2 0 0,1 4,11H3V13H4A2,2 0 0,1 6,15V19A2,2 0 0,0 8,21H10V19H8V14A2,2 0 0,0 6,12A2,2 0 0,0 8,10V5H10V3M16,3A2,2 0 0,1 18,5V9A2,2 0 0,0 20,11H21V13H20A2,2 0 0,0 18,15V19A2,2 0 0,1 16,21H14V19H16V14A2,2 0 0,1 18,12A2,2 0 0,1 16,10V5H14V3H16Z"/>
            </svg>
          </button>
        </div>
        
        <div class="toolbar-divider"></div>
        
        <div class="toolbar-group">
          <button @click="insertQuote" title="引用" class="toolbar-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z"/>
            </svg>
          </button>
          <button @click="insertList" title="无序列表" class="toolbar-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M7,5H21V7H7V5M7,13V11H21V13H7M4,4.5A1.5,1.5 0 0,1 5.5,6A1.5,1.5 0 0,1 4,7.5A1.5,1.5 0 0,1 2.5,6A1.5,1.5 0 0,1 4,4.5M4,10.5A1.5,1.5 0 0,1 5.5,12A1.5,1.5 0 0,1 4,13.5A1.5,1.5 0 0,1 2.5,12A1.5,1.5 0 0,1 4,10.5M7,19V17H21V19H7M4,16.5A1.5,1.5 0 0,1 5.5,18A1.5,1.5 0 0,1 4,19.5A1.5,1.5 0 0,1 2.5,18A1.5,1.5 0 0,1 4,16.5Z"/>
            </svg>
          </button>
          <button @click="insertOrderedList" title="有序列表" class="toolbar-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M7,13V11H21V13H7M7,19V17H21V19H7M7,7V5H21V7H7M3,8V5H2V4H4V8H3M2,17V16H5V20H2V19H4V18.5H3V17.5H4V17H2M4.25,10A0.75,0.75 0 0,1 5,10.75C5,10.95 4.92,11.14 4.79,11.27L3.12,13H5V14H2V13.08L4,11H2V10H4.25Z"/>
            </svg>
          </button>
          <button @click="insertTable" title="插入表格" class="toolbar-btn">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M5,4H19A2,2 0 0,1 21,6V18A2,2 0 0,1 19,20H5A2,2 0 0,1 3,18V6A2,2 0 0,1 5,4M5,8V12H11V8H5M13,8V12H19V8H13M5,14V18H11V14H5M13,14V18H19V14H13Z"/>
            </svg>
          </button>
        </div>
        
        <button @click="insertHorizontalRule" title="分割线" class="toolbar-btn">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M19,13H5V11H19V13Z"/>
          </svg>
        </button>
      </div>
      <div class="toolbar-right">
        <!-- 工具栏右侧预留 -->
      </div>
    </div>
    
    <div class="editor-container">
      <div ref="editorElement" class="codemirror-wrapper"></div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorState } from '@codemirror/state'


export default {
  name: 'MarkdownEditor',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    theme: {
      type: String,
      default: 'light'
    },

  },
  emits: ['update:modelValue', 'showMarkdownGuide'],
  setup(props, { emit }) {
    const editorElement = ref(null)
    const content = ref(props.modelValue)
    let editorView = null

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
            emit('update:modelValue', newContent)
          }
        }),
        EditorView.theme({
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
      ]

      // 添加暗色主题
      if (props.theme === 'dark') {
        extensions.push(oneDark)
      }

      const state = EditorState.create({
        doc: props.modelValue,
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

    // 滚动同步处理
    const handleScroll = (e) => {
      const element = e.target
      const scrollTop = element.scrollTop
      const scrollHeight = element.scrollHeight
      const clientHeight = element.clientHeight

      // 计算滚动百分比
      const maxScrollTop = Math.max(0, scrollHeight - clientHeight)
      const scrollPercentage = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0

      // 同步到预览区
      const previewElement = document.querySelector('.preview-rendered')
      if (previewElement) {
        const previewMaxScrollTop = Math.max(0, previewElement.scrollHeight - previewElement.clientHeight)
        const targetScrollTop = Math.round(previewMaxScrollTop * scrollPercentage)
        previewElement.scrollTop = targetScrollTop
      }
    }

    // 工具栏操作函数
    const insertText = (before, after = '', placeholder = '') => {
      if (!editorView) return
      
      const selection = editorView.state.selection.main
      const selectedText = editorView.state.doc.sliceString(selection.from, selection.to)
      const text = selectedText || placeholder
      
      const newText = before + text + after
      
      editorView.dispatch({
        changes: {
          from: selection.from,
          to: selection.to,
          insert: newText
        },
        selection: {
          anchor: selection.from + before.length,
          head: selection.from + before.length + text.length
        }
      })
      
      editorView.focus()
    }

    const insertHeading = (level = 2) => {
      const prefix = '#'.repeat(level) + ' '
      insertText(prefix, '', '标题')
    }
    const insertBold = () => insertText('**', '**', '粗体文本')
    const insertItalic = () => insertText('*', '*', '斜体文本')
    const insertStrikethrough = () => insertText('~~', '~~', '删除线文本')
    const insertCode = () => insertText('`', '`', '代码')
    const insertCodeBlock = () => {
      const selection = editorView.state.selection.main
      const text = editorView.state.doc.sliceString(selection.from, selection.to) || '代码'
      const newText = '```javascript\n' + text + '\n```'
      
      editorView.dispatch({
        changes: {
          from: selection.from,
          to: selection.to,
          insert: newText
        },
        selection: {
          anchor: selection.from + 14,
          head: selection.from + 14 + text.length
        }
      })
      editorView.focus()
    }
    const insertQuote = () => insertText('> ', '', '引用内容')
    const insertList = () => insertText('- ', '', '列表项')
    const insertOrderedList = () => insertText('1. ', '', '列表项')
    const insertLink = () => insertText('[', '](https://)', '链接文本')
    const insertImage = () => insertText('![', '](https://)', '图片描述')
    const insertTable = () => {
      const table = '| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容1 | 内容2 | 内容3 |\n'
      insertText(table, '', '')
    }
    const insertHorizontalRule = () => insertText('\n---\n', '', '')
    


    // 监听props变化
    watch(() => props.modelValue, (newValue) => {
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
    })

    // 监听主题变化
    watch(() => props.theme, () => {
      if (editorView) {
        // 清理滚动事件监听器
        const scrollElement = editorView.scrollDOM
        if (scrollElement) {
          scrollElement.removeEventListener('scroll', handleScroll)
        }
        editorView.destroy()
        initEditor()
      }
    })

    onMounted(() => {
      // 使用nextTick确保DOM已渲染
      setTimeout(initEditor, 0)
    })

    onUnmounted(() => {
      if (editorView) {
        // 清理滚动事件监听器
        const scrollElement = editorView.scrollDOM
        if (scrollElement) {
          scrollElement.removeEventListener('scroll', handleScroll)
        }
        editorView.destroy()
      }
    })

    return {
      editorElement,
      content,
      insertHeading,
      insertBold,
      insertItalic,
      insertStrikethrough,
      insertCode,
      insertCodeBlock,
      insertQuote,
      insertList,
      insertOrderedList,
      insertLink,
      insertImage,
      insertTable,
      insertHorizontalRule
    }
  }
}
</script>

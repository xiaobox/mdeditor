/**
 * Markdown 编辑器操作工具
 * 提供各种 Markdown 格式化操作的实用函数
 */

/**
 * 通用文本插入函数
 * @param {Object} editorView - CodeMirror 编辑器实例
 * @param {string} before - 插入文本前的内容
 * @param {string} after - 插入文本后的内容
 * @param {string} placeholder - 占位符文本
 */
export const insertText = (editorView, before, after = '', placeholder = '') => {
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

/**
 * 插入标题
 * @param {Object} editorView - CodeMirror 编辑器实例
 * @param {number} level - 标题级别 (1-6)
 */
export const insertHeading = (editorView, level = 2) => {
  const prefix = '#'.repeat(Math.max(1, Math.min(6, level))) + ' '
  insertText(editorView, prefix, '', '标题')
}

/**
 * 插入粗体文本
 * @param {Object} editorView - CodeMirror 编辑器实例
 */
export const insertBold = (editorView) => {
  insertText(editorView, '**', '**', '粗体文本')
}

/**
 * 插入斜体文本
 * @param {Object} editorView - CodeMirror 编辑器实例
 */
export const insertItalic = (editorView) => {
  insertText(editorView, '*', '*', '斜体文本')
}

/**
 * 插入删除线文本
 * @param {Object} editorView - CodeMirror 编辑器实例
 */
export const insertStrikethrough = (editorView) => {
  insertText(editorView, '~~', '~~', '删除线文本')
}

/**
 * 插入行内代码
 * @param {Object} editorView - CodeMirror 编辑器实例
 */
export const insertCode = (editorView) => {
  insertText(editorView, '`', '`', '代码')
}

/**
 * 插入代码块
 * @param {Object} editorView - CodeMirror 编辑器实例
 * @param {string} language - 代码语言
 */
export const insertCodeBlock = (editorView, language = 'javascript') => {
  if (!editorView) return

  const selection = editorView.state.selection.main
  const text = editorView.state.doc.sliceString(selection.from, selection.to) || '代码'
  const newText = `\`\`\`${language}\n${text}\n\`\`\``

  editorView.dispatch({
    changes: {
      from: selection.from,
      to: selection.to,
      insert: newText
    },
    selection: {
      anchor: selection.from + language.length + 4,
      head: selection.from + language.length + 4 + text.length
    }
  })
  editorView.focus()
}

/**
 * 插入引用块
 * @param {Object} editorView - CodeMirror 编辑器实例
 */
export const insertQuote = (editorView) => {
  insertText(editorView, '> ', '', '引用内容')
}

/**
 * 插入无序列表
 * @param {Object} editorView - CodeMirror 编辑器实例
 */
export const insertList = (editorView) => {
  insertText(editorView, '- ', '', '列表项')
}

/**
 * 插入有序列表
 * @param {Object} editorView - CodeMirror 编辑器实例
 */
export const insertOrderedList = (editorView) => {
  insertText(editorView, '1. ', '', '列表项')
}

/**
 * 插入链接
 * @param {Object} editorView - CodeMirror 编辑器实例
 */
export const insertLink = (editorView) => {
  insertText(editorView, '[', '](https://)', '链接文本')
}

/**
 * 插入图片
 * @param {Object} editorView - CodeMirror 编辑器实例
 */
export const insertImage = (editorView) => {
  insertText(editorView, '![', '](https://)', '图片描述')
}

/**
 * 插入表格
 * @param {Object} editorView - CodeMirror 编辑器实例
 * @param {number} rows - 行数
 * @param {number} cols - 列数
 */
export const insertTable = (editorView, rows = 3, cols = 3) => {
  const headers = Array(cols).fill().map((_, i) => `列${i + 1}`).join(' | ')
  const separator = Array(cols).fill('---').join(' | ')
  const dataRows = Array(rows - 1).fill().map((_, i) => 
    Array(cols).fill().map((_, j) => `内容${i + 1}-${j + 1}`).join(' | ')
  )
  
  const table = `| ${headers} |\n| ${separator} |\n${dataRows.map(row => `| ${row} |`).join('\n')}\n`
  insertText(editorView, table, '', '')
}

/**
 * 插入分割线
 * @param {Object} editorView - CodeMirror 编辑器实例
 */
export const insertHorizontalRule = (editorView) => {
  insertText(editorView, '\n---\n', '', '')
}

/**
 * 工具栏操作映射
 */
export const toolbarOperations = {
  heading: insertHeading,
  bold: insertBold,
  italic: insertItalic,
  strikethrough: insertStrikethrough,
  code: insertCode,
  codeBlock: insertCodeBlock,
  quote: insertQuote,
  list: insertList,
  orderedList: insertOrderedList,
  link: insertLink,
  image: insertImage,
  table: insertTable,
  horizontalRule: insertHorizontalRule
}



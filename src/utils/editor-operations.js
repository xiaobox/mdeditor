/**
 * @file src/utils/editor-operations.js
 * @description Markdown 编辑器原子操作集合
 *
 * 本文件定义了一系列用于操作 CodeMirror 编辑器内容的底层函数。
 * 每个函数都封装了一个特定的 Markdown 格式化命令，如插入粗体、标题或列表等。
 * 这些函数是构建编辑器工具栏功能的基础。
 *
 * 主要特点:
 * 1.  **原子化**: 每个函数只负责一项具体、单一的格式化任务。
 * 2.  **参数化**: 函数接受 CodeMirror 的 `editorView` 实例作为第一个参数，
 *     可以直接对编辑器状态进行操作。
 * 3.  **智能选区处理**: 函数能够正确处理两种情况：
 *     - 如果用户已经选择了一段文本，格式化会应用到这段文本上（例如，将选中文本变为粗体）。
 *     - 如果用户没有选择文本，函数会插入一个带有占位符的格式化模板（例如，插入 `**粗体文本**`）。
 * 4.  **光标定位**: 在插入文本后，会自动将光标定位到最合适的位置，方便用户继续输入。
 * 5.  **统一导出**: `toolbarOperations` 对象将所有操作函数映射到一个易于使用的集合中，
 *     方便 `useMarkdownEditor` 这个 Composable 进行调用。
 *
 * 设计思想:
 * - **逻辑分离**: 将具体的 Markdown 语法操作与编辑器组件的 UI 和状态管理分离开来，
 *   使得代码更清晰，易于测试和维护。
 * - **可复用性**: 这些原子操作可以被工具栏、快捷键或任何其他需要修改编辑器内容的功能复用。
 * - **基于 CodeMirror API**: 所有操作都通过 CodeMirror 6 的 `dispatch` 和 `state` API 完成，
 *   确保了操作的正确性和高效性。
 */

/**
 * 通用的文本插入与包裹函数，是大多数操作的基础。
 * @param {import('@codemirror/view').EditorView} editorView - CodeMirror 编辑器实例。
 * @param {string} before - 要在选区前插入的文本（例如 `**`）。
 * @param {string} [after=''] - 要在选区后插入的文本（例如 `**`）。
 * @param {string} [placeholder=''] - 如果没有选区，使用的占位符文本。
 */
export const insertText = (editorView, before, after = '', placeholder = '') => {
  if (!editorView) return;

  const { state, dispatch } = editorView;
  const selection = state.selection.main;
  const selectedText = state.doc.sliceString(selection.from, selection.to);
  const textToInsert = selectedText || placeholder;

  const newText = before + textToInsert + after;

  dispatch({
    changes: {
      from: selection.from,
      to: selection.to,
      insert: newText
    },
    // 插入后，选中原来的文本或占位符，方便用户修改
    selection: {
      anchor: selection.from + before.length,
      head: selection.from + before.length + textToInsert.length
    },
    // 确保编辑器在操作后保持焦点
    userEvent: 'input'
  });

  // 确保编辑器在操作后获得焦点
  editorView.focus();
};

// --- 具体操作函数 ---

/** 插入标题 */
export const insertHeading = (editorView, level = 2) => {
  const prefix = '#'.repeat(Math.max(1, Math.min(6, level))) + ' ';
  insertText(editorView, prefix, '', '标题');
};

/** 插入粗体 */
export const insertBold = (editorView) => {
  insertText(editorView, '**', '**', '粗体文本');
};

/** 插入斜体 */
export const insertItalic = (editorView) => {
  insertText(editorView, '*', '*', '斜体文本');
};

/** 插入删除线 */
export const insertStrikethrough = (editorView) => {
  insertText(editorView, '~~', '~~', '删除线文本');
};

/** 插入行内代码 */
export const insertCode = (editorView) => {
  insertText(editorView, '`', '`', '代码');
};

/** 插入代码块 */
export const insertCodeBlock = (editorView, language = 'javascript') => {
  const placeholder = '\n  // 在这里输入代码\n';
  insertText(editorView, `${language}
`, `
`, placeholder);
};

/** 插入引用 */
export const insertQuote = (editorView) => {
  insertText(editorView, '> ', '', '引用内容');
};

/** 插入无序列表 */
export const insertList = (editorView) => {
  insertText(editorView, '- ', '', '列表项');
};

/** 插入有序列表 */
export const insertOrderedList = (editorView) => {
  insertText(editorView, '1. ', '', '列表项');
};

/** 插入链接 */
export const insertLink = (editorView) => {
  insertText(editorView, '[', '](https://)', '链接文本');
};

/** 插入图片 */
export const insertImage = (editorView) => {
  insertText(editorView, '![', '](https://)', '图片描述');
};

/** 插入表格 */
export const insertTable = (editorView, rows = 2, cols = 3) => {
  const header = Array(cols).fill('表头').join(' | ');
  const separator = Array(cols).fill('---').join(' | ');
  const body = Array(rows - 1).fill(Array(cols).fill('单元格').join(' | ')).join('\n');
  
  const table = `| ${header} |\n| ${separator} |\n| ${body} |\n`;
  insertText(editorView, table, '', '');
};

/** 插入分割线 */
export const insertHorizontalRule = (editorView) => {
  // 分割线前后需要换行以确保其独立成块
  insertText(editorView, '\n---\n', '', '');
};

/**
 * 将所有操作函数映射到一个对象中，供工具栏使用。
 * key 的名称应与工具栏配置中的 `type` 相对应。
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
};
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

import {
  EDITOR_OPERATIONS,
  PLACEHOLDER_TEXT,
  MARKDOWN_SYNTAX,
} from '../config/constants/index.js';

/**
 * 获取当前选区信息
 * @param {import('@codemirror/view').EditorView} editorView - CodeMirror 编辑器实例
 * @returns {Object} 选区信息对象
 */
function getSelectionInfo(editorView) {
  const { state } = editorView;
  const selection = state.selection.main;
  const selectedText = state.doc.sliceString(selection.from, selection.to);
  
  return {
    selection,
    selectedText,
    hasSelection: selectedText.length > 0
  };
}

/**
 * 构建要插入的文本
 * @param {string} before - 要在选区前插入的文本
 * @param {string} after - 要在选区后插入的文本
 * @param {string} selectedText - 选中的文本
 * @param {string} placeholder - 占位符文本
 * @returns {Object} 文本构建结果
 */
function buildInsertText(before, after, selectedText, placeholder) {
  const textToInsert = selectedText || placeholder;
  const newText = before + textToInsert + after;
  
  return {
    newText,
    textToInsert,
    contentStart: before.length,
    contentEnd: before.length + textToInsert.length
  };
}

/**
 * 计算插入后的光标位置
 * @param {Object} selection - 当前选区
 * @param {Object} insertInfo - 插入信息
 * @returns {Object} 新的选区配置
 */
function calculateNewSelection(selection, insertInfo) {
  return {
    anchor: selection.from + insertInfo.contentStart,
    head: selection.from + insertInfo.contentEnd
  };
}

/**
 * 创建编辑器事务
 * @param {Object} selection - 当前选区
 * @param {string} newText - 要插入的新文本
 * @param {Object} newSelection - 新的选区配置
 * @returns {Object} 事务配置
 */
function createEditorTransaction(selection, newText, newSelection) {
  return {
    changes: {
      from: selection.from,
      to: selection.to,
      insert: newText
    },
    selection: newSelection,
    userEvent: 'input'
  };
}

/**
 * 确保编辑器获得焦点
 * @param {import('@codemirror/view').EditorView} editorView - CodeMirror 编辑器实例
 */
function ensureEditorFocus(editorView) {
  editorView.focus();
}

/**
 * 通用的文本插入与包裹函数，是大多数操作的基础。
 * @param {import('@codemirror/view').EditorView} editorView - CodeMirror 编辑器实例。
 * @param {string} before - 要在选区前插入的文本（例如 `**`）。
 * @param {string} [after=''] - 要在选区后插入的文本（例如 `**`）。
 * @param {string} [placeholder=''] - 如果没有选区，使用的占位符文本。
 */
export const insertText = (editorView, before, after = '', placeholder = '') => {
  if (!editorView) return;

  // 获取选区信息
  const selectionInfo = getSelectionInfo(editorView);
  
  // 构建插入文本
  const insertInfo = buildInsertText(before, after, selectionInfo.selectedText, placeholder);
  
  // 计算新的选区位置
  const newSelection = calculateNewSelection(selectionInfo.selection, insertInfo);
  
  // 创建事务
  const transaction = createEditorTransaction(selectionInfo.selection, insertInfo.newText, newSelection);
  
  // 分发事务
  editorView.dispatch(transaction);
  
  // 确保编辑器获得焦点
  ensureEditorFocus(editorView);
};

// --- 具体操作函数 ---

/**
 * 插入 Markdown 标题
 *
 * 在编辑器当前光标位置插入指定级别的 Markdown 标题。
 * 如果有选中文本，会将选中文本转换为标题；否则插入带占位符的标题模板。
 *
 * @param {EditorView} editorView - CodeMirror 编辑器视图实例
 * @param {number} [level=2] - 标题级别，范围 1-6，默认为 2
 *
 * @example
 * // 插入二级标题（默认）
 * insertHeading(editorView);
 *
 * @example
 * // 插入一级标题
 * insertHeading(editorView, 1);
 *
 * @example
 * // 插入六级标题
 * insertHeading(editorView, 6);
 *
 * @see {@link EDITOR_OPERATIONS.HEADING_LEVELS} 标题级别配置
 * @see {@link MARKDOWN_SYNTAX.HEADING_PREFIX} Markdown 标题语法
 */
export const insertHeading = (editorView, level = EDITOR_OPERATIONS.HEADING_LEVELS.DEFAULT) => {
  const { MIN, MAX } = EDITOR_OPERATIONS.HEADING_LEVELS;
  const headingLevel = Math.max(MIN, Math.min(MAX, level));
  const prefix = MARKDOWN_SYNTAX.HEADING_PREFIX.repeat(headingLevel) + ' ';
  insertText(editorView, prefix, '', PLACEHOLDER_TEXT.HEADING);
};

/**
 * 插入粗体文本格式
 *
 * 在编辑器中插入 Markdown 粗体语法。如果有选中文本，会将其包装为粗体；
 * 否则插入带占位符的粗体模板。
 *
 * @param {EditorView} editorView - CodeMirror 编辑器视图实例
 *
 * @example
 * // 插入粗体模板
 * insertBold(editorView); // 结果: **粗体文本**
 */
export const insertBold = (editorView) => {
  insertText(editorView, MARKDOWN_SYNTAX.BOLD, MARKDOWN_SYNTAX.BOLD, PLACEHOLDER_TEXT.BOLD);
};

/**
 * 插入斜体文本格式
 *
 * 在编辑器中插入 Markdown 斜体语法。如果有选中文本，会将其包装为斜体；
 * 否则插入带占位符的斜体模板。
 *
 * @param {EditorView} editorView - CodeMirror 编辑器视图实例
 *
 * @example
 * // 插入斜体模板
 * insertItalic(editorView); // 结果: *斜体文本*
 */
export const insertItalic = (editorView) => {
  insertText(editorView, MARKDOWN_SYNTAX.ITALIC, MARKDOWN_SYNTAX.ITALIC, PLACEHOLDER_TEXT.ITALIC);
};

/**
 * 插入删除线文本格式
 *
 * 在编辑器中插入 Markdown 删除线语法。如果有选中文本，会将其包装为删除线；
 * 否则插入带占位符的删除线模板。
 *
 * @param {EditorView} editorView - CodeMirror 编辑器视图实例
 *
 * @example
 * // 插入删除线模板
 * insertStrikethrough(editorView); // 结果: ~~删除线文本~~
 */
export const insertStrikethrough = (editorView) => {
  insertText(editorView, MARKDOWN_SYNTAX.STRIKETHROUGH, MARKDOWN_SYNTAX.STRIKETHROUGH, PLACEHOLDER_TEXT.STRIKETHROUGH);
};

/**
 * 插入行内代码格式
 *
 * 在编辑器中插入 Markdown 行内代码语法。如果有选中文本，会将其包装为行内代码；
 * 否则插入带占位符的行内代码模板。
 *
 * @param {EditorView} editorView - CodeMirror 编辑器视图实例
 *
 * @example
 * // 插入行内代码模板
 * insertCode(editorView); // 结果: `代码`
 */
export const insertCode = (editorView) => {
  insertText(editorView, MARKDOWN_SYNTAX.CODE, MARKDOWN_SYNTAX.CODE, PLACEHOLDER_TEXT.CODE);
};

/** 插入代码块 */
export const insertCodeBlock = (editorView, language = 'javascript') => {
  insertText(editorView, `${MARKDOWN_SYNTAX.CODE_BLOCK}${language}
`, `
${MARKDOWN_SYNTAX.CODE_BLOCK}`, PLACEHOLDER_TEXT.CODE_BLOCK);
};

/** 插入引用 */
export const insertQuote = (editorView) => {
  insertText(editorView, MARKDOWN_SYNTAX.BLOCKQUOTE, '', PLACEHOLDER_TEXT.QUOTE);
};

/** 插入无序列表 */
export const insertList = (editorView) => {
  insertText(editorView, MARKDOWN_SYNTAX.UNORDERED_LIST, '', PLACEHOLDER_TEXT.LIST_ITEM);
};

/** 插入有序列表 */
export const insertOrderedList = (editorView) => {
  insertText(editorView, MARKDOWN_SYNTAX.ORDERED_LIST, '', PLACEHOLDER_TEXT.LIST_ITEM);
};

/** 插入链接 */
export const insertLink = (editorView) => {
  insertText(
    editorView,
    MARKDOWN_SYNTAX.LINK_START,
    `${MARKDOWN_SYNTAX.LINK_MIDDLE}${PLACEHOLDER_TEXT.LINK_URL}${MARKDOWN_SYNTAX.LINK_END}`,
    PLACEHOLDER_TEXT.LINK_TEXT
  );
};

/** 插入图片 */
export const insertImage = (editorView) => {
  insertText(
    editorView,
    `${MARKDOWN_SYNTAX.IMAGE_PREFIX}${MARKDOWN_SYNTAX.LINK_START}`,
    `${MARKDOWN_SYNTAX.LINK_MIDDLE}${PLACEHOLDER_TEXT.IMAGE_URL}${MARKDOWN_SYNTAX.LINK_END}`,
    PLACEHOLDER_TEXT.IMAGE_ALT
  );
};

/** 插入表格 */
export const insertTable = (
  editorView,
  numberOfRows = EDITOR_OPERATIONS.TABLE_DEFAULTS.ROWS,
  numberOfColumns = EDITOR_OPERATIONS.TABLE_DEFAULTS.COLS
) => {
  const { TABLE_SEPARATOR } = MARKDOWN_SYNTAX;
  const headerRow = Array(numberOfColumns).fill(PLACEHOLDER_TEXT.TABLE_HEADER).join(` ${TABLE_SEPARATOR} `);
  const separatorRow = Array(numberOfColumns).fill(PLACEHOLDER_TEXT.TABLE_SEPARATOR).join(` ${TABLE_SEPARATOR} `);
  
  // 生成数据行，确保每行都有正确的格式
  const dataRow = Array(numberOfColumns).fill(PLACEHOLDER_TEXT.TABLE_CELL).join(` ${TABLE_SEPARATOR} `);
  const bodyRows = Array(numberOfRows - 1)
    .fill(`${TABLE_SEPARATOR} ${dataRow} ${TABLE_SEPARATOR}`)
    .join('\n');

  const tableMarkdown = `${TABLE_SEPARATOR} ${headerRow} ${TABLE_SEPARATOR}\n${TABLE_SEPARATOR} ${separatorRow} ${TABLE_SEPARATOR}\n${bodyRows}\n`;
  insertText(editorView, tableMarkdown, '', '');
};

/** 插入分割线 */
export const insertHorizontalRule = (editorView) => {
  // 分割线前后需要换行以确保其独立成块
  insertText(editorView, `\n${MARKDOWN_SYNTAX.HORIZONTAL_RULE}\n`, '', '');
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
/**
 * @file src/config/constants/editor.js
 * @description 编辑器相关的常量定义
 * 
 * 包含编辑器操作、配置和行为相关的所有常量，
 * 用于替换代码中的魔法数字和硬编码字符串。
 */

/**
 * 编辑器基础配置常量
 */
export const EDITOR_CONFIG = {
  // 字体配置
  FONT_FAMILY: '"SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  FONT_SIZE: '14px',
  LINE_HEIGHT: '1.6',
  
  // 编辑器尺寸和间距
  PADDING: '16px',
  MIN_HEIGHT: '100%',
  
  // 滚动配置
  SCROLL_BEHAVIOR: 'smooth',
  SCROLL_OFFSET: 0,
};

/**
 * 编辑器操作相关常量
 */
export const EDITOR_OPERATIONS = {
  // 标题级别
  HEADING_LEVELS: {
    MIN: 1,
    MAX: 6,
    DEFAULT: 2,
  },
  
  // 列表缩进
  LIST_INDENT: {
    SPACES_PER_LEVEL: 2,
    MAX_DEPTH: 6,
  },
  
  // 表格默认配置
  TABLE_DEFAULTS: {
    ROWS: 2,
    COLS: 3,
  },
};

/**
 * 编辑器占位符文本
 */
export const PLACEHOLDER_TEXT = {
  HEADING: '标题',
  BOLD: '粗体文本',
  ITALIC: '斜体文本',
  STRIKETHROUGH: '删除线文本',
  CODE: '代码',
  CODE_BLOCK: '\n  // 在这里输入代码\n',
  QUOTE: '引用内容',
  LIST_ITEM: '列表项',
  LINK_TEXT: '链接文本',
  LINK_URL: 'https://',
  IMAGE_ALT: '图片描述',
  IMAGE_URL: 'https://',
  TABLE_HEADER: '表头',
  TABLE_CELL: '单元格',
  TABLE_SEPARATOR: '---',
};

/**
 * 编辑器快捷键配置
 */
export const KEYBOARD_SHORTCUTS = {
  BOLD: 'Ctrl+B',
  ITALIC: 'Ctrl+I',
  CODE: 'Ctrl+`',
  LINK: 'Ctrl+K',
  SAVE: 'Ctrl+S',
  COPY: 'Ctrl+C',
  PASTE: 'Ctrl+V',
  UNDO: 'Ctrl+Z',
  REDO: 'Ctrl+Y',
};

/**
 * 编辑器主题相关常量
 */
export const EDITOR_THEMES = {
  AUTO: 'auto',
  LIGHT: 'light',
  DARK: 'dark',
};

/**
 * 编辑器状态常量
 */
export const EDITOR_STATES = {
  IDLE: 'idle',
  TYPING: 'typing',
  SAVING: 'saving',
  ERROR: 'error',
  LOADING: 'loading',
};

/**
 * 编辑器事件类型
 */
export const EDITOR_EVENTS = {
  CONTENT_CHANGE: 'content-change',
  SCROLL: 'scroll',
  FOCUS: 'focus',
  BLUR: 'blur',
  SELECTION_CHANGE: 'selection-change',
};

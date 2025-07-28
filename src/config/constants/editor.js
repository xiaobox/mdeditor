/**
 * @file src/config/constants/editor.js
 * @description 编辑器配置相关的常量定义
 * 
 * 包含编辑器行为、操作、占位符文本等配置常量，
 * 用于统一管理编辑器的各种参数和设置。
 */

/**
 * 编辑器基础配置常量
 */
export const EDITOR_CONFIG = {
  // 编辑器基本设置
  DEFAULT_THEME: 'auto',
  MIN_HEIGHT: 300,
  MAX_HEIGHT: 800,
  FONT_SIZE: 14,
  LINE_HEIGHT: 1.6,
  TAB_SIZE: 2,
  WORD_WRAP: true,
  LINE_NUMBERS: false,
  
  // 自动保存设置
  AUTO_SAVE_ENABLED: true,
  AUTO_SAVE_DELAY: 2000, // 毫秒
};

/**
 * 编辑器操作相关常量
 */
export const EDITOR_OPERATIONS = {
  // 标题级别配置
  HEADING_LEVELS: {
    MIN: 1,
    MAX: 6,
    DEFAULT: 2,
  },
  
  // 列表缩进配置
  LIST_INDENT: {
    SPACES_PER_LEVEL: 2,
    MAX_DEPTH: 6,
  },
  
  // 表格默认配置
  TABLE_DEFAULTS: {
    ROWS: 3,
    COLS: 3,
  },
  
  // 代码块默认语言
  DEFAULT_CODE_LANGUAGE: 'javascript',
};

/**
 * 占位符文本常量
 */
export const PLACEHOLDER_TEXT = {
  HEADING: '标题',
  BOLD: '粗体文本',
  ITALIC: '斜体文本',
  STRIKETHROUGH: '删除线文本',
  CODE: '代码',
  CODE_BLOCK: '在这里输入代码',
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

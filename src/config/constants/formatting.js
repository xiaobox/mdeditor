/**
 * @file src/config/constants/formatting.js
 * @description Markdown 格式化相关的常量定义
 * 
 * 包含 Markdown 语法、格式化规则、正则表达式等常量，
 * 用于 Markdown 解析和 HTML 生成。
 */

/**
 * Markdown 语法常量
 */
export const MARKDOWN_SYNTAX = {
  // 标题语法
  HEADING_PREFIX: '#',
  
  // 文本格式
  BOLD: '**',
  ITALIC: '*',
  STRIKETHROUGH: '~~',
  CODE: '`',
  CODE_BLOCK: '```',
  
  // 列表语法
  UNORDERED_LIST: '- ',
  ORDERED_LIST: '1. ',
  TASK_LIST: '- [ ] ',
  TASK_LIST_CHECKED: '- [x] ',
  
  // 链接和图片
  LINK_START: '[',
  LINK_MIDDLE: '](',
  LINK_END: ')',
  IMAGE_PREFIX: '!',
  
  // 其他元素
  BLOCKQUOTE: '> ',
  HORIZONTAL_RULE: '---',
  TABLE_SEPARATOR: '|',
  
  // 换行
  LINE_BREAK: '  \n',
  HARD_BREAK: '\n\n',
};

/**
 * 微信公众号格式化配置
 */
export const WECHAT_FORMATTING = {
  // 列表符号配置
  LIST_SYMBOLS: {
    UNORDERED: ['●', '○', '▪', '▫', '‣', '⁃'],
    ORDERED: ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'],
    TASK_CHECKED: '✓',
    TASK_UNCHECKED: '○',
  },
  
  // 颜色配置
  COLORS: {
    PRIMARY: '#07c160',
    SECONDARY: '#576b95',
    SUCCESS: '#10aeff',
    WARNING: '#ffbe00',
    ERROR: '#ee0a24',
    TEXT_PRIMARY: '#1f2329',
    TEXT_SECONDARY: '#646a73',
    TEXT_MUTED: '#8a919f',
    BORDER: '#ebedf0',
    BACKGROUND: '#f7f8fa',
  },
  
  // 字体配置
  TYPOGRAPHY: {
    FONT_FAMILY: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, "Segoe UI", Arial, Roboto, "PingFang SC", miui, "Hiragino Sans GB", "Microsoft Yahei", sans-serif',
    FONT_SIZE_BASE: '16px',
    FONT_SIZE_SMALL: '14px',
    FONT_SIZE_LARGE: '18px',
    LINE_HEIGHT: '1.6',
  },
  
  // 间距配置
  SPACING: {
    PARAGRAPH: '1em 0',
    HEADING: '1.5em 0 1em 0',
    LIST_ITEM: '0.5em 0',
    BLOCKQUOTE: '1em 0',
    CODE_BLOCK: '1em 0',
  },
};

/**
 * 正则表达式模式
 */
export const REGEX_PATTERNS = {
  // 标题匹配
  HEADING: /^#{1,6}\s+(.+)$/,
  
  // 文本格式匹配
  BOLD: /\*\*([^*]+)\*\*/g,
  BOLD_UNDERSCORE: /__([^_]+)__/g,
  ITALIC: /\*([^*]+)\*/g,
  ITALIC_UNDERSCORE: /_([^_]+)_/g,
  STRIKETHROUGH: /~~([^~]+)~~/g,
  CODE: /`([^`]+)`/g,
  
  // 链接和图片匹配
  LINK: /\[([^\]]+)\]\(([^)]+)\)/g,
  IMAGE: /!\[([^\]]*)\]\(([^)]+)\)/g,
  
  // 列表匹配
  UNORDERED_LIST: /^(\s*)[-*+]\s+(.+)$/,
  ORDERED_LIST: /^(\s*)\d+\.\s+(.+)$/,
  TASK_LIST: /^(\s*)- \[([ x])\]\s+(.+)$/,
  
  // 其他元素匹配
  BLOCKQUOTE: /^>\s?(.*)$/,
  CODE_BLOCK: /^```(\w*)\s*$/,
  HORIZONTAL_RULE: /^(-{3,}|={3,}|\*{3,}|_{3,})$/,
  TABLE_ROW: /^\s*\|(.+)\|\s*$/,
  TABLE_SEPARATOR: /^\s*\|(\s*:?-+:?\s*\|)+\s*$/,
  
  // 特殊字符和格式
  ESCAPE_CHAR: /\\(.)/g,
  WHITESPACE: /^\s*$/,
  EMPTY_LINE: /^\s*$/,
};

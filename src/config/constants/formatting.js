/**
 * @file src/config/constants/formatting.js
 * @description 格式化相关的常量定义
 * 
 * 包含 Markdown 格式化、HTML 生成、微信公众号适配等
 * 相关的所有常量，用于替换硬编码的格式化规则。
 */

/**
 * Markdown 语法常量
 */
export const MARKDOWN_SYNTAX = {
  // 标题前缀
  HEADING_PREFIX: '#',
  
  // 文本格式化标记
  BOLD: '**',
  ITALIC: '*',
  STRIKETHROUGH: '~~',
  CODE: '`',
  CODE_BLOCK: '```',
  
  // 列表标记
  UNORDERED_LIST: '- ',
  ORDERED_LIST: '1. ',
  TASK_LIST_UNCHECKED: '- [ ] ',
  TASK_LIST_CHECKED: '- [x] ',
  
  // 引用和分割线
  BLOCKQUOTE: '> ',
  HORIZONTAL_RULE: '---',
  
  // 链接和图片
  LINK_START: '[',
  LINK_MIDDLE: '](',
  LINK_END: ')',
  IMAGE_PREFIX: '!',
  
  // 表格分隔符
  TABLE_SEPARATOR: '|',
  TABLE_ALIGNMENT: {
    LEFT: ':---',
    CENTER: ':---:',
    RIGHT: '---:',
  },
};

/**
 * HTML 标签常量
 */
export const HTML_TAGS = {
  // 标题标签
  HEADINGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  
  // 文本格式化标签
  BOLD: 'strong',
  ITALIC: 'em',
  STRIKETHROUGH: 'del',
  CODE: 'code',
  
  // 块级元素
  PARAGRAPH: 'p',
  BLOCKQUOTE: 'blockquote',
  PRE: 'pre',
  DIV: 'div',
  
  // 列表标签
  UNORDERED_LIST: 'ul',
  ORDERED_LIST: 'ol',
  LIST_ITEM: 'li',
  
  // 表格标签
  TABLE: 'table',
  THEAD: 'thead',
  TBODY: 'tbody',
  TR: 'tr',
  TH: 'th',
  TD: 'td',
  
  // 其他
  LINK: 'a',
  IMAGE: 'img',
  SPAN: 'span',
  HR: 'hr',
};

/**
 * CSS 样式常量
 */
export const CSS_PROPERTIES = {
  // 字体相关
  FONT_FAMILY: 'font-family',
  FONT_SIZE: 'font-size',
  FONT_WEIGHT: 'font-weight',
  LINE_HEIGHT: 'line-height',
  
  // 颜色相关
  COLOR: 'color',
  BACKGROUND_COLOR: 'background-color',
  BORDER_COLOR: 'border-color',
  
  // 布局相关
  MARGIN: 'margin',
  PADDING: 'padding',
  BORDER: 'border',
  BORDER_RADIUS: 'border-radius',
  
  // 定位相关
  POSITION: 'position',
  TOP: 'top',
  LEFT: 'left',
  RIGHT: 'right',
  BOTTOM: 'bottom',
  
  // 显示相关
  DISPLAY: 'display',
  VISIBILITY: 'visibility',
  OPACITY: 'opacity',
  
  // 变换相关
  TRANSFORM: 'transform',
  TRANSITION: 'transition',
  
  // 阴影和效果
  BOX_SHADOW: 'box-shadow',
  TEXT_SHADOW: 'text-shadow',
};

/**
 * 微信公众号格式化常量
 */
export const WECHAT_FORMATTING = {
  // 字体大小
  FONT_SIZES: {
    H1: '1.5em',
    H2: '1.2em',
    H3: '1.1em',
    H4: '1.05em',
    H5: '1em',
    H6: '0.95em',
    BODY: '16px',
    CODE: '14px',
  },
  
  // 间距配置
  SPACING: {
    PARAGRAPH_MARGIN: '12px 0',
    HEADING_MARGIN_TOP: '1.5rem',
    HEADING_MARGIN_BOTTOM: '1rem',
    LIST_MARGIN: '8px 0',
    CODE_BLOCK_MARGIN: '16px 0',
    TABLE_MARGIN: '16px 0',
  },
  
  // 列表符号
  LIST_SYMBOLS: {
    UNORDERED: ['●', '○', '■', '▪'],
    TASK_CHECKED: '✓',
    TASK_UNCHECKED: '',
  },
  
  // 表格样式
  TABLE_STYLES: {
    BORDER_COLLAPSE: 'collapse',
    BORDER: '1px solid #d0d7de',
    CELL_PADDING: '8px 12px',
    HEADER_BACKGROUND: '#f6f8fa',
  },
};

/**
 * 正则表达式常量
 */
export const REGEX_PATTERNS = {
  // Markdown 语法模式
  MARKDOWN_HEADING: /^#+\s*/,
  MARKDOWN_BOLD: /\*\*(.*?)\*\*/g,
  MARKDOWN_ITALIC: /\*([^*]+)\*/g, // 简化的斜体匹配
  MARKDOWN_BOLD_UNDERSCORE: /__(.*?)__/g, // 下划线粗体
  MARKDOWN_ITALIC_UNDERSCORE: /_([^_]+)_/g, // 下划线斜体
  MARKDOWN_INLINE_CODE: /`(.*?)`/g,
  MARKDOWN_LINK: /\[([^\]]+)\]\(([^)]+)\)/g,
  MARKDOWN_IMAGE: /!\[([^\]]*)\]\(([^)]+)\)/g,
  MARKDOWN_HORIZONTAL_RULE: /^(\s*[-*_]\s*){3,}\s*$/,

  // HTML 语法模式
  HTML_TAG: /<[^>]+>/g,
  HTML_ENTITY: /&[a-zA-Z0-9#]+;/g,

  // 表格语法模式
  TABLE_ROW_SEPARATOR: /\|/,
  TABLE_ALIGNMENT_SEPARATOR: /^\|?[-\s|:]+\|?$/,

  // 空白字符模式
  WHITESPACE_MULTIPLE: /\s+/g,
  WHITESPACE_LEADING: /^\s+/,
  WHITESPACE_TRAILING: /\s+$/,

  // 向后兼容的别名（逐步废弃）
  HEADING: /^#+\s*/,
  BOLD: /\*\*(.*?)\*\*/g,
  ITALIC: /\*([^*]+)\*/g, // 更新为简化版本
  BOLD_UNDERSCORE: /__(.*?)__/g, // 新增下划线粗体支持
  ITALIC_UNDERSCORE: /_([^_]+)_/g, // 新增下划线斜体支持
  CODE: /`(.*?)`/g,
  LINK: /\[([^\]]+)\]\(([^)]+)\)/g,
  IMAGE: /!\[([^\]]*)\]\(([^)]+)\)/g,
  HORIZONTAL_RULE: /^(\s*[-*_]\s*){3,}\s*$/,
  TABLE_SEPARATOR: /^\|?[-\s|:]+\|?$/,
  WHITESPACE: /\s+/g,
  LEADING_WHITESPACE: /^\s+/,
  TRAILING_WHITESPACE: /\s+$/,
};

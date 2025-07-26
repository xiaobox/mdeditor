/**
 * @file src/config/constants/ui-text.js
 * @description UI 文本和消息常量定义
 * 
 * 包含应用程序中所有用户界面文本、提示消息、错误信息等，
 * 便于国际化和统一管理用户可见的文本内容。
 */

/**
 * 通用 UI 文本
 */
export const UI_TEXT = {
  // 通用操作
  SAVE: '保存',
  CANCEL: '取消',
  CONFIRM: '确认',
  DELETE: '删除',
  EDIT: '编辑',
  COPY: '复制',
  PASTE: '粘贴',
  CLEAR: '清空',
  RESET: '重置',
  CLOSE: '关闭',
  
  // 状态文本
  LOADING: '加载中...',
  SAVING: '保存中...',
  SAVED: '已保存',
  ERROR: '错误',
  SUCCESS: '成功',
  WARNING: '警告',
  INFO: '信息',
  
  // 编辑器相关
  EDITOR: '编辑器',
  PREVIEW: '预览',
  SETTINGS: '设置',
  THEME: '主题',
  EXPORT: '导出',
  IMPORT: '导入',
};

/**
 * 编辑器工具栏文本
 */
export const TOOLBAR_TEXT = {
  HEADING: '标题',
  BOLD: '粗体',
  ITALIC: '斜体',
  STRIKETHROUGH: '删除线',
  CODE: '代码',
  CODE_BLOCK: '代码块',
  QUOTE: '引用',
  LIST: '列表',
  ORDERED_LIST: '有序列表',
  TASK_LIST: '任务列表',
  LINK: '链接',
  IMAGE: '图片',
  TABLE: '表格',
  HORIZONTAL_RULE: '分割线',
};

/**
 * 主题相关文本
 */
export const THEME_TEXT = {
  COLOR_THEME: '颜色主题',
  CODE_STYLE: '代码样式',
  LAYOUT: '布局',
  LIGHT_MODE: '浅色模式',
  DARK_MODE: '深色模式',
  AUTO_MODE: '自动模式',
  CUSTOM: '自定义',
};

/**
 * 设置面板文本
 */
export const SETTINGS_TEXT = {
  GENERAL: '通用',
  APPEARANCE: '外观',
  EDITOR: '编辑器',
  EXPORT: '导出',
  ABOUT: '关于',
  
  // 设置项
  AUTO_SAVE: '自动保存',
  WORD_WRAP: '自动换行',
  LINE_NUMBERS: '行号',
  MINIMAP: '小地图',
  FONT_SIZE: '字体大小',
  TAB_SIZE: '制表符大小',
};

/**
 * 帮助和指南文本
 */
export const HELP_TEXT = {
  MARKDOWN_GUIDE: 'Markdown 指南',
  KEYBOARD_SHORTCUTS: '快捷键',
  TIPS: '使用技巧',
  FAQ: '常见问题',
  DOCUMENTATION: '文档',
  
  // 指南内容
  BASIC_SYNTAX: '基础语法',
  ADVANCED_FEATURES: '高级功能',
  EXAMPLES: '示例',
  BEST_PRACTICES: '最佳实践',
};

/**
 * 文件操作文本
 */
export const FILE_TEXT = {
  NEW_FILE: '新建文件',
  OPEN_FILE: '打开文件',
  SAVE_FILE: '保存文件',
  SAVE_AS: '另存为',
  EXPORT_HTML: '导出 HTML',
  EXPORT_PDF: '导出 PDF',
  EXPORT_MARKDOWN: '导出 Markdown',
  
  // 文件状态
  UNTITLED: '未命名',
  MODIFIED: '已修改',
  READONLY: '只读',
};

/**
 * UI 占位符文本
 */
export const UI_PLACEHOLDER_TEXT = {
  SEARCH: '搜索...',
  FILENAME: '文件名',
  URL: '请输入链接地址',
  ALT_TEXT: '请输入图片描述',
  TITLE: '请输入标题',
  CONTENT: '请输入内容',
  
  // 编辑器占位符
  EDITOR_EMPTY: '开始编写你的 Markdown 内容...',
  PREVIEW_EMPTY: '预览内容将在这里显示...',
  HTML_EMPTY: '生成的HTML代码将在这里显示...',
};

/**
 * 工具提示文本
 */
export const TOOLTIP_TEXT = {
  // 工具栏工具提示
  BOLD_TOOLTIP: '粗体 (Ctrl+B)',
  ITALIC_TOOLTIP: '斜体 (Ctrl+I)',
  CODE_TOOLTIP: '行内代码 (Ctrl+`)',
  LINK_TOOLTIP: '插入链接 (Ctrl+K)',
  
  // 功能按钮工具提示
  COPY_TOOLTIP: '复制到剪贴板',
  DOWNLOAD_TOOLTIP: '下载文件',
  FULLSCREEN_TOOLTIP: '全屏模式',
  SETTINGS_TOOLTIP: '打开设置',
  HELP_TOOLTIP: '查看帮助',
  
  // 主题切换工具提示
  THEME_TOGGLE_TOOLTIP: '切换主题',
  LAYOUT_TOGGLE_TOOLTIP: '切换布局',
};

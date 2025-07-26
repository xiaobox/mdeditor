/**
 * @file src/config/constants/defaults.js
 * @description 默认值常量定义
 * 
 * 包含应用程序中各种功能的默认配置值，
 * 确保在用户未设置或配置丢失时有合理的回退值。
 */

/**
 * 编辑器默认配置
 */
export const EDITOR_DEFAULTS = {
  // 内容相关
  INITIAL_CONTENT: '',
  PLACEHOLDER: '开始编写你的 Markdown 内容...',
  
  // 主题相关
  THEME: 'auto',
  COLOR_THEME: 'wechat',
  CODE_STYLE: 'mac',
  LAYOUT: 'wechat',
  
  // 编辑器行为
  AUTO_SAVE: true,
  AUTO_SAVE_INTERVAL: 30000, // 30秒
  WORD_WRAP: true,
  LINE_NUMBERS: false,
  MINIMAP: false,
  
  // 字体和显示
  FONT_SIZE: 14,
  TAB_SIZE: 2,
  LINE_HEIGHT: 1.6,
  FONT_FAMILY: '"SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
};

/**
 * 格式化默认配置
 */
export const FORMATTING_DEFAULTS = {
  // 标题默认级别
  HEADING_LEVEL: 2,
  
  // 表格默认尺寸
  TABLE_ROWS: 2,
  TABLE_COLS: 3,
  
  // 代码块默认语言
  CODE_LANGUAGE: 'javascript',
  
  // 列表默认类型
  LIST_TYPE: 'unordered',
  
  // 链接默认协议
  LINK_PROTOCOL: 'https://',
  
  // 图片默认属性
  IMAGE_ALT: '图片描述',
  IMAGE_WIDTH: '100%',
  IMAGE_HEIGHT: 'auto',
};

/**
 * UI 默认配置
 */
export const UI_DEFAULTS = {
  // 面板状态
  SIDEBAR_OPEN: true,
  PREVIEW_OPEN: true,
  SETTINGS_OPEN: false,
  HELP_OPEN: false,
  
  // 窗口尺寸
  WINDOW_WIDTH: 1200,
  WINDOW_HEIGHT: 800,
  SIDEBAR_WIDTH: 300,
  
  // 分割比例
  EDITOR_SPLIT_RATIO: 0.5,
  PREVIEW_SPLIT_RATIO: 0.5,
  
  // 动画设置
  ANIMATIONS_ENABLED: true,
  TRANSITION_DURATION: 300,
};

/**
 * 导出默认配置
 */
export const EXPORT_DEFAULTS = {
  // 文件格式
  FORMAT: 'html',
  FILENAME: 'document',
  
  // HTML 导出选项
  INCLUDE_CSS: true,
  INCLUDE_JAVASCRIPT: false,
  MINIFY: false,
  
  // PDF 导出选项
  PAGE_SIZE: 'A4',
  MARGIN: '1in',
  ORIENTATION: 'portrait',
  
  // 图片导出选项
  IMAGE_FORMAT: 'png',
  IMAGE_QUALITY: 0.9,
  IMAGE_DPI: 300,
};

/**
 * 网络默认配置
 */
export const NETWORK_DEFAULTS = {
  // 超时设置
  REQUEST_TIMEOUT: 5000,
  UPLOAD_TIMEOUT: 30000,
  DOWNLOAD_TIMEOUT: 60000,
  
  // 重试设置
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  
  // 缓存设置
  CACHE_ENABLED: true,
  CACHE_DURATION: 3600000, // 1小时
  
  // 请求头
  USER_AGENT: 'Markdown Editor/1.0',
  ACCEPT: 'application/json, text/plain, */*',
};

/**
 * 存储默认配置
 */
export const STORAGE_DEFAULTS = {
  // 存储类型
  STORAGE_TYPE: 'localStorage',
  
  // 存储键前缀
  KEY_PREFIX: 'markdown-editor-',
  
  // 数据压缩
  COMPRESS_DATA: false,
  
  // 加密设置
  ENCRYPT_DATA: false,
  
  // 清理设置
  AUTO_CLEANUP: true,
  CLEANUP_INTERVAL: 86400000, // 24小时
  MAX_STORAGE_SIZE: 10485760, // 10MB
};

/**
 * 主题默认配置
 */
export const THEME_DEFAULTS = {
  // 颜色主题
  COLOR_THEME_ID: 'wechat',
  
  // 代码样式
  CODE_STYLE_ID: 'mac',
  
  // 布局主题
  THEME_SYSTEM_ID: 'wechat',
  
  // 自动切换
  AUTO_SWITCH: true,
  FOLLOW_SYSTEM: true,
  
  // 过渡效果
  SMOOTH_TRANSITION: true,
  TRANSITION_DURATION: 300,
};

/**
 * 可访问性默认配置
 */
export const ACCESSIBILITY_DEFAULTS = {
  // 高对比度
  HIGH_CONTRAST: false,
  
  // 字体缩放
  FONT_SCALE: 1.0,
  
  // 键盘导航
  KEYBOARD_NAVIGATION: true,
  
  // 屏幕阅读器
  SCREEN_READER_SUPPORT: true,
  
  // 动画减少
  REDUCE_MOTION: false,
  
  // 焦点指示器
  FOCUS_INDICATORS: true,
};

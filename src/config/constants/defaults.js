/**
 * @file src/config/constants/defaults.js
 * @description 默认值常量定义
 * 
 * 包含应用程序中各种功能的默认配置值，
 * 确保在用户未设置或配置丢失时有合理的回退值。
 */



/**
 * 存储键
 */
export const STORAGE_KEYS = {
  COLOR_THEME: 'markdown-editor-color-theme',
  CODE_STYLE: 'markdown-editor-code-style',
  THEME_SYSTEM: 'markdown-editor-theme-system',
};

/**
 * 主题默认配置 - 简化为统一默认主题
 */
export const THEME_DEFAULTS = {
  // 颜色主题
  COLOR_THEME_ID: 'green',

  // 代码样式
  CODE_STYLE_ID: 'mac',

  // 布局主题
  THEME_SYSTEM_ID: 'default',

  // 自动切换
  AUTO_SWITCH: true,
  FOLLOW_SYSTEM: true,

  // 过渡效果
  SMOOTH_TRANSITION: true,
  TRANSITION_DURATION: 300,
};



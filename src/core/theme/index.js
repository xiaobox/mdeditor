/**
 * @file src/core/theme/index.js
 * @description 主题系统统一导出
 *
 * 集中管理主题相关的核心功能
 */

// 主题管理器（包含 hexToRgb, computeThemeVariables）
export { cssManager, hexToRgb, computeThemeVariables } from './manager.js';

// 主题存储
export { ThemeStorage, STORAGE_KEYS, STORAGE_DEFAULTS } from './storage.js';

// 主题预加载
export { loadThemeEarly } from './loader.js';

// 主题预设（从 config 层重新导出）
export {
  // 工厂函数
  createTheme,
  createCodeStyle,
  createThemeSystem,

  // 颜色主题
  colorThemes,
  defaultColorTheme,
  getColorTheme,
  getColorThemeList,
  colorThemePresets,
  CUSTOM_THEME_STORAGE_KEY,
  ColorThemeGenerator,

  // 代码样式
  codeStyles,
  defaultCodeStyle,
  getCodeStyle,
  getCodeStyleList,
  codeStylePresets,

  // 排版主题系统
  themeSystems,
  defaultThemeSystem,
  getThemeSystem,
  getThemeSystemList,
  themeSystemPresets,

  // 字体设置
  fontFamilyOptions,
  fontSizeOptions,
  fontFamilyGroups,
  defaultFontSettings,
  getFontFamily,
  getFontFamilyList,
  getAvailableFonts,
  getDefaultFontId,
  detectOS,
  getOSDisplayName,
  FONT_CATEGORIES,
  isValidFontSize,
  getValidFontSize,
  generateFontCSSVariables,
  fontSettingsUtils,
} from '../../config/theme-presets.js';

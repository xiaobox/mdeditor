/**
 * 主题配置统一入口
 * 简化的导出结构，减少重复
 */

// 核心功能
export { createTheme, createCodeStyle, createThemeSystem } from './base.js'

// 颜色主题
export {
  colorThemes,
  defaultColorTheme,
  getColorTheme,
  getColorThemeList,
  colorThemeUtils,
  colorThemePresets
} from './color-themes.js'

// 代码样式
export {
  codeStyles,
  defaultCodeStyle,
  getCodeStyle,
  getCodeStyleList,
  codeStyleUtils,
  codeStylePresets
} from './code-styles.js'

// 主题系统
export {
  themeSystems,
  defaultThemeSystem,
  getThemeSystem,
  getThemeSystemList,
  themeSystemUtils,
  themeSystemPresets
} from './theme-systems.js'

// 存储管理
export {
  STORAGE_KEYS,
  ThemeStorage,
  STORAGE_DEFAULTS
} from './storage.js'


// 简化的默认导出 - 最常用的功能
export default {
  // 主要数据
  colorThemes,
  codeStyles,
  themeSystems,

  // 默认值
  defaultColorTheme,
  defaultCodeStyle,
  defaultThemeSystem,

  // 获取函数
  getColorTheme,
  getCodeStyle,
  getThemeSystem,

  // 工厂函数
  createTheme,
  createCodeStyle,
  createThemeSystem
}

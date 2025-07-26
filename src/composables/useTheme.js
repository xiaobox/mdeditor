/**
 * 颜色主题管理 Composable
 * 轻量级包装器，保持向后兼容性
 *
 * @deprecated 推荐新代码直接使用 useGlobalThemeManager
 */

import { useGlobalThemeManager } from './useThemeManager.js'
import { colorThemeUtils } from '../config/themes/color-themes.js'

/**
 * 颜色主题管理 Hook - 向后兼容包装器
 */
export function useColorTheme() {
  const themeManager = useGlobalThemeManager()

  return {
    // 状态映射
    currentColorThemeId: themeManager.currentColorThemeId,
    currentColorTheme: themeManager.currentColorTheme,
    colorThemeList: themeManager.colorThemeList,
    isColorThemeLoaded: themeManager.isInitialized,

    // 方法映射
    setColorTheme: themeManager.setColorTheme,
    resetColorTheme: themeManager.resetColorTheme,
    toggleColorTheme: themeManager.toggleColorTheme,
    initColorTheme: themeManager.initialize,

    // 预览样式生成
    getColorThemePreviewStyles: (themeId) => {
      return themeManager.generatePreviewStyles({ colorTheme: themeId })
    },

    // 向后兼容
    updateCSSVariables: themeManager.updateAllCSS,
    themeUtils: colorThemeUtils
  }
}

/**
 * 主题预设快捷方式（向后兼容）
 */
export const themePresets = {
  light: ['green', 'blue', 'red', 'purple', 'orange'],
  all: ['green', 'blue', 'red', 'purple', 'orange', 'pink'],
  business: ['blue', 'green', 'purple'],
  creative: ['purple', 'orange', 'red', 'pink'],
  minimal: ['green', 'blue', 'pink']
}

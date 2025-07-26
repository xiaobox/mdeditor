/**
 * 布局主题管理 Composable
 * 轻量级包装器，保持向后兼容性
 *
 * @deprecated 推荐新代码直接使用 useGlobalThemeManager
 */

import { useGlobalThemeManager } from './useThemeManager.js'
import { themeSystemUtils } from '../config/themes/theme-systems.js'

/**
 * 布局主题管理 Hook - 向后兼容包装器
 */
export function useLayout() {
  const themeManager = useGlobalThemeManager()

  return {
    // 状态映射
    currentLayoutId: themeManager.currentThemeSystemId,
    currentLayout: themeManager.currentThemeSystem,
    layoutList: themeManager.themeSystemList,
    isLayoutLoaded: themeManager.isInitialized,

    // 方法映射
    setLayout: themeManager.setThemeSystem,
    resetLayout: themeManager.resetThemeSystem,
    initLayout: themeManager.initialize,

    // 预览样式生成
    getLayoutPreviewStyles: (systemId) => {
      return themeManager.generatePreviewStyles({ themeSystem: systemId })
    },

    // 工具函数和预设
    themeSystemUtils,
    presets: themeManager.presets.themeSystems
  }
}


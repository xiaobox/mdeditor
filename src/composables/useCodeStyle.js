/**
 * 代码样式管理 Composable
 * 轻量级包装器，保持向后兼容性
 *
 * @deprecated 推荐新代码直接使用 useGlobalThemeManager
 */

import { useGlobalThemeManager } from './useThemeManager.js'
import { codeStyleUtils, getCodeStyle } from '../config/themes/code-styles.js'

/**
 * 代码样式管理 Hook - 向后兼容包装器
 */
export function useCodeStyle() {
  const themeManager = useGlobalThemeManager()

  return {
    // 状态映射
    currentCodeStyleId: themeManager.currentCodeStyleId,
    currentCodeStyle: themeManager.currentCodeStyle,
    codeStyleList: themeManager.codeStyleList,
    isCodeStyleLoaded: themeManager.isInitialized,

    // 方法映射
    setCodeStyle: themeManager.setCodeStyle,
    resetCodeStyle: themeManager.resetCodeStyle,
    toggleCodeStyle: themeManager.toggleCodeStyle,
    initCodeStyle: themeManager.initialize,

    // 预览样式生成 - 返回 CSS 变量用于 :style 绑定
    getCodeStylePreviewStyles: (styleId) => {
      const style = getCodeStyle(styleId)
      return {
        '--code-preview-bg': style.background,
        '--code-preview-color': style.color,
        '--code-preview-border': style.border || 'none',
        '--code-preview-radius': style.borderRadius,
        '--code-preview-padding': style.padding,
        '--code-preview-font-family': style.fontFamily,
        '--code-preview-font-size': style.fontSize,
        '--code-preview-line-height': style.lineHeight,
        '--code-preview-box-shadow': style.boxShadow || 'none'
      }
    },

    // 工具函数和预设
    codeStyleUtils,
    presets: themeManager.presets.codeStyles
  }
}

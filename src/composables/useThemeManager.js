/**
 * 统一主题管理 Composable
 * 整合所有主题相关的状态管理，消除重复代码
 */

import { ref, computed, watch, reactive } from 'vue'
import { cssManager } from '../config/themes/css-manager.js'
import { ThemeStorage, STORAGE_KEYS, STORAGE_DEFAULTS } from '../config/themes/storage.js'
import {
  getColorTheme,
  getColorThemeList,
  defaultColorTheme,
  colorThemePresets
} from '../config/themes/color-themes.js'
import {
  getCodeStyle,
  getCodeStyleList,
  defaultCodeStyle,
  codeStylePresets
} from '../config/themes/code-styles.js'
import {
  getThemeSystem,
  getThemeSystemList,
  defaultThemeSystem,
  themeSystemPresets
} from '../config/themes/theme-systems.js'

// 全局主题状态
const themeState = reactive({
  colorThemeId: ThemeStorage.load(STORAGE_KEYS.COLOR_THEME, STORAGE_DEFAULTS.COLOR_THEME),
  codeStyleId: ThemeStorage.load(STORAGE_KEYS.CODE_STYLE, STORAGE_DEFAULTS.CODE_STYLE),
  themeSystemId: ThemeStorage.load(STORAGE_KEYS.THEME_SYSTEM, STORAGE_DEFAULTS.THEME_SYSTEM),
  isInitialized: false
})

/**
 * 统一主题管理 Hook
 * @returns {Object} 主题管理相关的响应式数据和方法
 */
export function useThemeManager() {
  // 计算属性
  const currentColorTheme = computed(() => getColorTheme(themeState.colorThemeId))
  const currentCodeStyle = computed(() => getCodeStyle(themeState.codeStyleId))
  const currentThemeSystem = computed(() => getThemeSystem(themeState.themeSystemId))

  const colorThemeList = computed(() => getColorThemeList())
  const codeStyleList = computed(() => getCodeStyleList())
  const themeSystemList = computed(() => getThemeSystemList())

  // 主题切换方法
  const setColorTheme = (themeId) => {
    if (themeId && getColorTheme(themeId)) {
      themeState.colorThemeId = themeId
      ThemeStorage.save(STORAGE_KEYS.COLOR_THEME, themeId)
      updateAllCSS()
      return true
    }
    return false
  }

  const setCodeStyle = (styleId) => {
    if (styleId && getCodeStyle(styleId)) {
      themeState.codeStyleId = styleId
      ThemeStorage.save(STORAGE_KEYS.CODE_STYLE, styleId)
      updateAllCSS()
      return true
    }
    return false
  }

  const setThemeSystem = (systemId) => {
    if (systemId && getThemeSystem(systemId)) {
      themeState.themeSystemId = systemId
      ThemeStorage.save(STORAGE_KEYS.THEME_SYSTEM, systemId)
      updateAllCSS()
      return true
    }
    return false
  }

  // 批量设置主题
  const setThemes = ({ colorTheme, codeStyle, themeSystem }) => {
    let changed = false
    
    if (colorTheme && colorTheme !== themeState.colorThemeId) {
      themeState.colorThemeId = colorTheme
      ThemeStorage.save(STORAGE_KEYS.COLOR_THEME, colorTheme)
      changed = true
    }
    
    if (codeStyle && codeStyle !== themeState.codeStyleId) {
      themeState.codeStyleId = codeStyle
      ThemeStorage.save(STORAGE_KEYS.CODE_STYLE, codeStyle)
      changed = true
    }
    
    if (themeSystem && themeSystem !== themeState.themeSystemId) {
      themeState.themeSystemId = themeSystem
      ThemeStorage.save(STORAGE_KEYS.THEME_SYSTEM, themeSystem)
      changed = true
    }
    
    if (changed) {
      updateAllCSS()
    }
    
    return changed
  }

  // 重置方法
  const resetColorTheme = () => setColorTheme(defaultColorTheme.id)
  const resetCodeStyle = () => setCodeStyle(defaultCodeStyle.id)
  const resetThemeSystem = () => setThemeSystem(defaultThemeSystem.id)
  const resetAllThemes = () => {
    setThemes({
      colorTheme: defaultColorTheme.id,
      codeStyle: defaultCodeStyle.id,
      themeSystem: defaultThemeSystem.id
    })
  }

  // 切换方法
  const toggleColorTheme = (themeIds = colorThemePresets.all) => {
    const currentIndex = themeIds.indexOf(themeState.colorThemeId)
    const nextIndex = (currentIndex + 1) % themeIds.length
    setColorTheme(themeIds[nextIndex])
  }

  const toggleCodeStyle = (styleIds = codeStylePresets.all) => {
    const currentIndex = styleIds.indexOf(themeState.codeStyleId)
    const nextIndex = (currentIndex + 1) % styleIds.length
    setCodeStyle(styleIds[nextIndex])
  }

  // CSS 更新方法
  const updateAllCSS = () => {
    cssManager.applyAllThemes({
      colorTheme: currentColorTheme.value,
      codeStyle: currentCodeStyle.value,
      themeSystem: currentThemeSystem.value
    })
  }

  // 预览样式生成
  const generatePreviewStyles = (themes = {}) => {
    const previewThemes = {
      colorTheme: themes.colorTheme ? getColorTheme(themes.colorTheme) : currentColorTheme.value,
      codeStyle: themes.codeStyle ? getCodeStyle(themes.codeStyle) : currentCodeStyle.value,
      themeSystem: themes.themeSystem ? getThemeSystem(themes.themeSystem) : currentThemeSystem.value
    }
    
    return cssManager.generatePreviewStyles(previewThemes)
  }

  // 导出/导入设置
  const exportSettings = () => {
    return {
      colorTheme: themeState.colorThemeId,
      codeStyle: themeState.codeStyleId,
      themeSystem: themeState.themeSystemId,
      timestamp: Date.now(),
      version: '1.0'
    }
  }

  const importSettings = (settings) => {
    if (!settings || typeof settings !== 'object') return false
    
    return setThemes({
      colorTheme: settings.colorTheme,
      codeStyle: settings.codeStyle,
      themeSystem: settings.themeSystem
    })
  }

  // 清除所有设置
  const clearAllSettings = () => {
    ThemeStorage.clearAll()
    resetAllThemes()
  }

  // 初始化
  const initialize = () => {
    if (!themeState.isInitialized) {
      updateAllCSS()
      themeState.isInitialized = true
    }
  }

  // 监听主题变化，自动更新 CSS
  watch([currentColorTheme, currentCodeStyle, currentThemeSystem], () => {
    if (themeState.isInitialized) {
      updateAllCSS()
    }
  }, { deep: true })

  return {
    // 状态
    currentColorThemeId: computed(() => themeState.colorThemeId),
    currentCodeStyleId: computed(() => themeState.codeStyleId),
    currentThemeSystemId: computed(() => themeState.themeSystemId),
    isInitialized: computed(() => themeState.isInitialized),

    // 当前主题对象
    currentColorTheme,
    currentCodeStyle,
    currentThemeSystem,

    // 主题列表
    colorThemeList,
    codeStyleList,
    themeSystemList,

    // 设置方法
    setColorTheme,
    setCodeStyle,
    setThemeSystem,
    setThemes,

    // 重置方法
    resetColorTheme,
    resetCodeStyle,
    resetThemeSystem,
    resetAllThemes,

    // 切换方法
    toggleColorTheme,
    toggleCodeStyle,

    // 工具方法
    updateAllCSS,
    generatePreviewStyles,
    exportSettings,
    importSettings,
    clearAllSettings,
    initialize,

    // 预设配置
    presets: {
      colorThemes: colorThemePresets,
      codeStyles: codeStylePresets,
      themeSystems: themeSystemPresets
    }
  }
}

// 创建全局实例以确保状态一致性
let globalThemeManager = null

/**
 * 获取全局主题管理器实例
 * @returns {Object} 主题管理器实例
 */
export function useGlobalThemeManager() {
  if (!globalThemeManager) {
    globalThemeManager = useThemeManager()
    globalThemeManager.initialize()
  }
  return globalThemeManager
}

/**
 * @file src/composables/theme/useThemeManager.js
 * @description 统一主题管理 Composable
 *
 * 集中管理应用的主题状态：颜色主题、代码样式、排版主题、字体设置。
 * 通过 `useGlobalThemeManager` 获取全局单例实例。
 */

import { computed, watch, reactive } from 'vue'
import {
  cssManager,
  ThemeStorage,
  STORAGE_KEYS,
  STORAGE_DEFAULTS,
  getColorTheme,
  defaultColorTheme,
  CUSTOM_THEME_STORAGE_KEY,
  getCodeStyle,
  getCodeStyleList,
  getThemeSystem,
  getThemeSystemList,
  themeSystems,
  getFontFamily,
  getFontFamilyList,
  getAvailableFonts,
  defaultFontSettings,
  fontSettingsUtils,
  getValidFontSize
} from '../../core/theme/index.js'

/** 全局响应式主题状态 */
const themeState = reactive({
  colorThemeId: ThemeStorage.load(STORAGE_KEYS.COLOR_THEME, STORAGE_DEFAULTS.COLOR_THEME),
  codeStyleId: ThemeStorage.load(STORAGE_KEYS.CODE_STYLE, STORAGE_DEFAULTS.CODE_STYLE),
  themeSystemId: ThemeStorage.load(STORAGE_KEYS.THEME_SYSTEM, STORAGE_DEFAULTS.THEME_SYSTEM),
  fontFamily: ThemeStorage.load(STORAGE_KEYS.FONT_FAMILY, STORAGE_DEFAULTS.FONT_FAMILY),
  fontSize: parseInt(ThemeStorage.load(STORAGE_KEYS.FONT_SIZE, STORAGE_DEFAULTS.FONT_SIZE.toString()), 10),
  letterSpacing: parseFloat(ThemeStorage.load(STORAGE_KEYS.LETTER_SPACING, String(STORAGE_DEFAULTS.LETTER_SPACING))),
  lineHeight: parseFloat(ThemeStorage.load(STORAGE_KEYS.LINE_HEIGHT, String(STORAGE_DEFAULTS.LINE_HEIGHT))),
  isInitialized: false,
  hasTemporaryCustomTheme: false
})

/**
 * 统一主题管理 Hook
 */
export function useThemeManager() {
  // --- 计算属性 ---

  /** 当前颜色主题对象 */
  const currentColorTheme = computed(() => {
    const builtinTheme = getColorTheme(themeState.colorThemeId)
    if (builtinTheme) return builtinTheme

    try {
      const customThemes = JSON.parse(localStorage.getItem(CUSTOM_THEME_STORAGE_KEY) || '[]')
      const customTheme = customThemes.find(t => t.id === themeState.colorThemeId)
      if (customTheme) return customTheme
    } catch (error) {
      console.error('Failed to load custom theme:', error)
    }

    return defaultColorTheme
  })

  /** 当前代码高亮样式对象 */
  const currentCodeStyle = computed(() => getCodeStyle(themeState.codeStyleId))

  /** 当前排版主题对象 */
  const currentThemeSystem = computed(() => getThemeSystem(themeState.themeSystemId))

  /** 当前字体设置对象 */
  const currentFontSettings = computed(() => ({
    fontFamily: themeState.fontFamily,
    fontSize: themeState.fontSize,
    letterSpacing: themeState.letterSpacing,
    lineHeight: themeState.lineHeight
  }))

  /** 当前字体族对象 */
  const currentFontFamily = computed(() =>
    getFontFamily(themeState.fontFamily) || getFontFamily(defaultFontSettings.fontFamily)
  )

  /** 代码高亮样式列表 */
  const codeStyleList = computed(() => getCodeStyleList())

  /** 排版主题列表 */
  const themeSystemList = computed(() => getThemeSystemList())

  /** 字体族列表（扁平，向后兼容） */
  const fontFamilyList = computed(() => getFontFamilyList())

  /** 按 OS 分类的字体数据 */
  const availableFonts = computed(() => getAvailableFonts())

  // --- 设置方法 ---

  /** 设置颜色主题 */
  const setColorTheme = (themeId) => {
    const theme = getColorTheme(themeId) || (() => {
      try {
        const customThemes = JSON.parse(localStorage.getItem(CUSTOM_THEME_STORAGE_KEY) || '[]')
        return customThemes.find(t => t.id === themeId)
      } catch {
        return null
      }
    })()

    if (themeId && theme) {
      themeState.colorThemeId = themeId
      ThemeStorage.save(STORAGE_KEYS.COLOR_THEME, themeId)

      if (themeId.startsWith('custom-')) {
        setTimeout(() => cssManager.forceApplyColorTheme(theme), 0)
      }
      return true
    }
    return false
  }

  /** 设置代码高亮样式 */
  const setCodeStyle = (styleId) => {
    if (styleId && getCodeStyle(styleId)) {
      themeState.codeStyleId = styleId
      ThemeStorage.save(STORAGE_KEYS.CODE_STYLE, styleId)
      return true
    }
    return false
  }

  /** 设置排版主题 */
  const setThemeSystem = (systemId) => {
    if (systemId && themeSystems[systemId]) {
      themeState.themeSystemId = systemId
      ThemeStorage.save(STORAGE_KEYS.THEME_SYSTEM, systemId)
      return true
    }
    return false
  }

  /** 应用字体设置到 CSS */
  const applyCurrentFontSettings = () => {
    cssManager.applyFontSettings({
      fontFamily: themeState.fontFamily,
      fontSize: themeState.fontSize,
      letterSpacing: themeState.letterSpacing,
      lineHeight: themeState.lineHeight
    })
  }

  /** 设置字体族 */
  const setFontFamily = (fontId) => {
    if (fontId && fontSettingsUtils.isFontAvailable(fontId)) {
      themeState.fontFamily = fontId
      ThemeStorage.save(STORAGE_KEYS.FONT_FAMILY, fontId)
      applyCurrentFontSettings()
      return true
    }
    return false
  }

  /** 设置字号 */
  const setFontSize = (fontSize) => {
    const validSize = getValidFontSize(fontSize)
    if (validSize !== themeState.fontSize) {
      themeState.fontSize = validSize
      ThemeStorage.save(STORAGE_KEYS.FONT_SIZE, validSize.toString())
      applyCurrentFontSettings()
      return true
    }
    return false
  }

  /** 设置字间距(px) */
  const setLetterSpacing = (value) => {
    const spacing = Number.isFinite(value) ? value : 0
    if (spacing !== themeState.letterSpacing) {
      themeState.letterSpacing = spacing
      ThemeStorage.save(STORAGE_KEYS.LETTER_SPACING, String(spacing))
      applyCurrentFontSettings()
      return true
    }
    return false
  }

  /** 设置行高(倍数) */
  const setLineHeight = (value) => {
    const lh = Number.isFinite(value) && value > 0 ? value : 1.6
    if (lh !== themeState.lineHeight) {
      themeState.lineHeight = lh
      ThemeStorage.save(STORAGE_KEYS.LINE_HEIGHT, String(lh))
      applyCurrentFontSettings()
      return true
    }
    return false
  }

  // --- CSS 管理 ---

  /** 应用所有主题 CSS */
  const updateAllCSS = () => {
    cssManager.applyAllThemes({
      colorTheme: currentColorTheme.value,
      codeStyle: currentCodeStyle.value,
      themeSystem: currentThemeSystem.value,
      fontSettings: currentFontSettings.value
    })
  }

  /** 初始化主题管理器 */
  const initialize = () => {
    if (themeState.isInitialized) return

    try {
      const savedColor = localStorage.getItem('temp-custom-color')
      const savedTheme = localStorage.getItem('temp-custom-theme')

      if (savedColor && savedTheme) {
        const customTheme = JSON.parse(savedTheme)
        themeState.hasTemporaryCustomTheme = true
        cssManager.forceApplyColorTheme(customTheme)
      } else {
        themeState.hasTemporaryCustomTheme = false
        updateAllCSS()
        cssManager.applyFontSettings(currentFontSettings.value)
      }
    } catch (error) {
      console.warn('Failed to restore custom color on init:', error)
      localStorage.removeItem('temp-custom-color')
      localStorage.removeItem('temp-custom-theme')
      themeState.hasTemporaryCustomTheme = false
      updateAllCSS()
      cssManager.applyFontSettings(currentFontSettings.value)
    }

    themeState.isInitialized = true
  }

  // --- 侦听器 ---

  watch([currentColorTheme, currentCodeStyle, currentThemeSystem, currentFontSettings], () => {
    if (themeState.isInitialized && !themeState.hasTemporaryCustomTheme) {
      updateAllCSS()
    }
  }, { deep: true, immediate: false })

  // --- 返回 API ---

  return {
    // 状态 ID
    currentColorThemeId: computed(() => themeState.colorThemeId),
    currentCodeStyleId: computed(() => themeState.codeStyleId),
    currentThemeSystemId: computed(() => themeState.themeSystemId),
    currentFontFamily: computed(() => themeState.fontFamily),
    currentFontSize: computed(() => themeState.fontSize),
    isInitialized: computed(() => themeState.isInitialized),

    // 主题状态（用于外部访问临时主题标记等）
    themeState,

    // 当前主题对象
    currentColorTheme,
    currentCodeStyle,
    currentThemeSystem,
    currentFontSettings,
    currentFontFamily,

    // 主题列表
    codeStyleList,
    themeSystemList,
    fontFamilyList,
    availableFonts,

    // 设置方法
    setColorTheme,
    setCodeStyle,
    setThemeSystem,
    setFontFamily,
    setFontSize,
    setLetterSpacing,
    setLineHeight,

    // CSS 管理
    updateAllCSS,
    initialize,
    cssManager
  }
}

// --- 全局单例 ---

let globalThemeManager = null

/**
 * 获取全局唯一的主题管理器实例
 */
export function useGlobalThemeManager() {
  if (!globalThemeManager) {
    globalThemeManager = useThemeManager()
    globalThemeManager.initialize()
  }
  return globalThemeManager
}

/**
 * @file src/composables/useThemeManager.js
 * @description 统一主题管理 Composable
 *
 * 本文件负责集中管理应用程序的所有主题相关状态，包括：
 * - 颜色主题 (Color Theme): 如亮色、暗色、社交平台等。
 * - 代码高亮样式 (Code Style): 如 Mac、GitHub、VS Code、Terminal 等。
 * - 排版主题 (Theme System): 如默认主题、掘金等，定义整体布局和字体。
 *
 * 主要功能：
 * 1.  **状态管理**: 使用 Vue 3 的 `reactive` API 创建全局响应式主题状态 `themeState`。
 * 2.  **持久化**: 通过 `ThemeStorage` (localStorage 封装) 实现主题设置的本地持久化。
 * 3.  **CSS 管理**: 调用 `cssManager` 动态加载和应用主题 CSS。
 * 4.  **API 封装**: 提供 `useThemeManager` hook，向组件暴露易于使用的 API，如：
 *     - 获取当前主题和主题列表。
 *     - 设置、重置和切换主题。
 *     - 导入/导出主题配置。
 * 5.  **全局单例**: 通过 `useGlobalThemeManager` 提供一个全局唯一的 `themeManager` 实例，确保整个应用共享同一份主题状态。
 *
 * 设计思想：
 * - **单一数据源**: 所有主题状态由 `themeState` 统一管理，避免状态分散和不一致。
 * - **模块化**: 将主题相关的逻辑（状态、存储、CSS）清晰地分离到不同的模块中。
 * - **响应式**: 利用 Vue 的计算属性和侦听器，自动响应主题变化并更新 UI。
 */

import { computed, watch, reactive } from 'vue'
import { cssManager } from '../../core/theme/manager.js'
import { ThemeStorage, STORAGE_KEYS, STORAGE_DEFAULTS } from '../../core/theme/storage.js'
import {
  getColorTheme,
  getColorThemeList,
  defaultColorTheme,
  colorThemePresets,
  ColorThemeGenerator,
  CUSTOM_THEME_STORAGE_KEY
} from '../../core/theme/presets/color-themes.js'
import {
  getCodeStyle,
  getCodeStyleList,
  defaultCodeStyle,
  codeStylePresets
} from '../../core/theme/presets/code-styles.js'
import {
  getThemeSystem,
  getThemeSystemList,
  defaultThemeSystem,
  themeSystemPresets,
  themeSystems
} from '../../core/theme/presets/theme-systems.js'
import {
  getFontFamily,
  getFontFamilyList,
  defaultFontSettings,
  fontSettingsUtils,
  getValidFontSize
} from '../../core/theme/presets/font-settings.js'

/**
 * 全局响应式主题状态。
 * @property {string} colorThemeId - 当前颜色主题的 ID。
 * @property {string} codeStyleId - 当前代码高亮样式的 ID。
 * @property {string} themeSystemId - 当前排版主题的 ID。
 * @property {boolean} isInitialized - 标记主题管理器是否已初始化。
 */
const themeState = reactive({
  colorThemeId: ThemeStorage.load(STORAGE_KEYS.COLOR_THEME, STORAGE_DEFAULTS.COLOR_THEME),
  codeStyleId: ThemeStorage.load(STORAGE_KEYS.CODE_STYLE, STORAGE_DEFAULTS.CODE_STYLE),
  themeSystemId: ThemeStorage.load(STORAGE_KEYS.THEME_SYSTEM, STORAGE_DEFAULTS.THEME_SYSTEM),
  fontFamily: ThemeStorage.load(STORAGE_KEYS.FONT_FAMILY, STORAGE_DEFAULTS.FONT_FAMILY),
  fontSize: parseInt(ThemeStorage.load(STORAGE_KEYS.FONT_SIZE, STORAGE_DEFAULTS.FONT_SIZE.toString()), 10),
  isInitialized: false,
  hasTemporaryCustomTheme: false, // 标记是否有临时自定义主题
  customThemeUpdateTrigger: 0 // 用于触发自定义主题列表的响应式更新
})

/**
 * 统一主题管理 Hook。
 * 提供完整的 API 用于管理应用的主题。
 * @returns {Object} 主题管理相关的响应式数据和方法。
 */
export function useThemeManager() {
  // --- 计算属性 (Computed Properties) ---

  /** 当前激活的颜色主题对象 */
  const currentColorTheme = computed(() => {
    // 依赖触发器以响应自定义主题的变化
    themeState.customThemeUpdateTrigger

    // 先尝试获取内置主题
    const builtinTheme = getColorTheme(themeState.colorThemeId)
    if (builtinTheme) return builtinTheme

    // 再尝试获取自定义主题
    try {
      const customThemes = JSON.parse(localStorage.getItem(CUSTOM_THEME_STORAGE_KEY) || '[]')
      const customTheme = customThemes.find(t => t.id === themeState.colorThemeId)
      if (customTheme) return customTheme
    } catch (error) {
      console.error('Failed to load custom theme:', error)
    }

    return defaultColorTheme
  })

  /** 当前实际应用的颜色主题对象（包括临时自定义主题） */
  const currentAppliedColorTheme = computed(() => {
    // 依赖触发器以响应自定义主题的变化
    themeState.customThemeUpdateTrigger

    // 如果有临时自定义主题，优先返回临时主题
    if (themeState.hasTemporaryCustomTheme) {
      try {
        const tempTheme = localStorage.getItem('temp-custom-theme')
        if (tempTheme) {
          return JSON.parse(tempTheme)
        }
      } catch (error) {
        console.error('Failed to load temporary custom theme:', error)
      }
    }

    // 否则返回正常的当前主题
    return currentColorTheme.value
  })
  /** 当前激活的代码高亮样式对象 */
  const currentCodeStyle = computed(() => getCodeStyle(themeState.codeStyleId))
  /** 当前激活的排版主题对象 */
  const currentThemeSystem = computed(() => getThemeSystem(themeState.themeSystemId))

  /** 当前字体设置对象 */
  const currentFontSettings = computed(() => ({
    fontFamily: themeState.fontFamily,
    fontSize: themeState.fontSize
  }))

  /** 当前字体族对象 */
  const currentFontFamily = computed(() => getFontFamily(themeState.fontFamily) || getFontFamily(defaultFontSettings.fontFamily))

  /** 所有可用的颜色主题列表（包含自定义主题） */
  const colorThemeList = computed(() => {
    const builtinThemes = getColorThemeList()
    try {
      const customThemes = JSON.parse(localStorage.getItem(CUSTOM_THEME_STORAGE_KEY) || '[]')
      return [...builtinThemes, ...customThemes]
    } catch (error) {
      console.error('Failed to load custom themes:', error)
      return builtinThemes
    }
  })
  /** 所有可用的代码高亮样式列表 */
  const codeStyleList = computed(() => getCodeStyleList())
  /** 所有可用的排版主题列表 */
  const themeSystemList = computed(() => getThemeSystemList())
  /** 所有可用的字体族列表 */
  const fontFamilyList = computed(() => getFontFamilyList())

  // --- 主题切换方法 (Theme Setters) ---

  /**
   * 设置颜色主题。
   * @param {string} themeId - 目标颜色主题的 ID。
   * @returns {boolean} 如果设置成功，返回 true。
   */
  const setColorTheme = (themeId) => {
    // 检查内置主题或自定义主题
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

      // 对于自定义主题，立即强制更新CSS
      if (themeId.startsWith('custom-')) {
        setTimeout(() => {
          cssManager.forceApplyColorTheme(theme)
        }, 0)
      }

      // updateAllCSS() 会由 watch 触发
      return true
    }
    return false
  }

  /**
   * 设置代码高亮样式。
   * @param {string} styleId - 目标代码样式的 ID。
   * @returns {boolean} 如果设置成功，返回 true。
   */
  const setCodeStyle = (styleId) => {
    if (styleId && getCodeStyle(styleId)) {
      themeState.codeStyleId = styleId
      ThemeStorage.save(STORAGE_KEYS.CODE_STYLE, styleId)
      return true
    }
    return false
  }

  /**
   * 设置排版主题。
   * @param {string} systemId - 目标排版主题的 ID。
   * @returns {boolean} 如果设置成功，返回 true。
   */
  const setThemeSystem = (systemId) => {
    if (systemId && themeSystems[systemId]) {
      themeState.themeSystemId = systemId
      ThemeStorage.save(STORAGE_KEYS.THEME_SYSTEM, systemId)
      return true
    }
    return false
  }

  /**
   * 设置字体族。
   * @param {string} fontId - 目标字体族的 ID。
   * @returns {boolean} 如果设置成功，返回 true。
   */
  const setFontFamily = (fontId) => {
    if (fontId && fontSettingsUtils.isFontAvailable(fontId)) {
      themeState.fontFamily = fontId
      ThemeStorage.save(STORAGE_KEYS.FONT_FAMILY, fontId)

      // 立即应用字体设置，不受其他条件限制
      cssManager.applyFontSettings({
        fontFamily: fontId,
        fontSize: themeState.fontSize
      })

      return true
    }
    return false
  }

  /**
   * 设置字号。
   * @param {number} fontSize - 目标字号。
   * @returns {boolean} 如果设置成功，返回 true。
   */
  const setFontSize = (fontSize) => {
    const validSize = getValidFontSize(fontSize)
    if (validSize !== themeState.fontSize) {
      themeState.fontSize = validSize
      ThemeStorage.save(STORAGE_KEYS.FONT_SIZE, validSize.toString())

      // 立即应用字体设置，不受其他条件限制
      cssManager.applyFontSettings({
        fontFamily: themeState.fontFamily,
        fontSize: validSize
      })

      return true
    }
    return false
  }

  /**
   * 批量设置字体。
   * @param {Object} fontSettings - 包含 fontFamily, fontSize 的对象。
   * @returns {boolean} 如果有任何设置发生变化，返回 true。
   */
  const setFontSettings = ({ fontFamily, fontSize }) => {
    let changed = false

    if (fontFamily && fontFamily !== themeState.fontFamily) {
      changed = setFontFamily(fontFamily) || changed
    }

    if (fontSize && fontSize !== themeState.fontSize) {
      changed = setFontSize(fontSize) || changed
    }

    return changed
  }

  /**
   * 批量设置主题。
   * @param {Object} themes - 包含 colorTheme, codeStyle, themeSystem, fontSettings 的对象。
   * @returns {boolean} 如果有任何主题发生变化，返回 true。
   */
  const setThemes = ({ colorTheme, codeStyle, themeSystem, fontSettings }) => {
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

    if (fontSettings) {
      changed = setFontSettings(fontSettings) || changed
    }

    // CSS 更新将由 watch 自动处理
    return changed
  }

  // --- 重置方法 (Reset Methods) ---

  const resetColorTheme = () => setColorTheme(defaultColorTheme.id)
  const resetCodeStyle = () => setCodeStyle(defaultCodeStyle.id)
  const resetThemeSystem = () => setThemeSystem(defaultThemeSystem.id)
  const resetFontSettings = () => setFontSettings(defaultFontSettings)
  const resetAllThemes = () => {
    setThemes({
      colorTheme: defaultColorTheme.id,
      codeStyle: defaultCodeStyle.id,
      themeSystem: defaultThemeSystem.id,
      fontSettings: defaultFontSettings
    })
  }

  // --- 切换方法 (Toggle Methods) ---

  /**
   * 在给定的主题 ID 列表中循环切换颜色主题。
   * @param {string[]} [themeIds=colorThemePresets.all] - 用于切换的主题 ID 数组。
   */
  const toggleColorTheme = (themeIds = colorThemePresets.all) => {
    const currentIndex = themeIds.indexOf(themeState.colorThemeId)
    const nextIndex = (currentIndex + 1) % themeIds.length
    setColorTheme(themeIds[nextIndex])
  }

  /**
   * 在给定的样式 ID 列表中循环切换代码样式。
   * @param {string[]} [styleIds=codeStylePresets.all] - 用于切换的样式 ID 数组。
   */
  const toggleCodeStyle = (styleIds = codeStylePresets.all) => {
    const currentIndex = styleIds.indexOf(themeState.codeStyleId)
    const nextIndex = (currentIndex + 1) % styleIds.length
    setCodeStyle(styleIds[nextIndex])
  }

  // --- CSS 管理 (CSS Management) ---

  /**
   * 根据当前主题状态，应用所有相关的 CSS。
   */
  const updateAllCSS = () => {
    cssManager.applyAllThemes({
      colorTheme: currentColorTheme.value,
      codeStyle: currentCodeStyle.value,
      themeSystem: currentThemeSystem.value,
      fontSettings: currentFontSettings.value
    })
  }

  /**
   * 生成用于预览的组合样式。
   * @param {Object} [themes={}] - 可选的预览主题配置。
   * @returns {string} 生成的 CSS 文本。
   */
  const generatePreviewStyles = (themes = {}) => {
    const previewThemes = {
      colorTheme: themes.colorTheme ? getColorTheme(themes.colorTheme) : currentColorTheme.value,
      codeStyle: themes.codeStyle ? getCodeStyle(themes.codeStyle) : currentCodeStyle.value,
      themeSystem: themes.themeSystem ? getThemeSystem(themes.themeSystem) : currentThemeSystem.value
    }
    
    return cssManager.generatePreviewStyles(previewThemes)
  }

  // --- 工具方法 (Utility Methods) ---

  /**
   * 导出当前主题配置。
   * @returns {Object} 包含当前主题设置的对象。
   */
  const exportSettings = () => {
    return {
      colorTheme: themeState.colorThemeId,
      codeStyle: themeState.codeStyleId,
      themeSystem: themeState.themeSystemId,
      fontSettings: {
        fontFamily: themeState.fontFamily,
        fontSize: themeState.fontSize
      },
      timestamp: Date.now(),
      version: '1.1'
    }
  }

  /**
   * 导入并应用主题配置。
   * @param {Object} settings - 包含主题设置的对象。
   * @returns {boolean} 如果导入成功，返回 true。
   */
  const importSettings = (settings) => {
    if (!settings || typeof settings !== 'object') return false

    return setThemes({
      colorTheme: settings.colorTheme,
      codeStyle: settings.codeStyle,
      themeSystem: settings.themeSystem,
      fontSettings: settings.fontSettings
    })
  }

  /**
   * 清除所有本地存储的主题设置并重置为默认值。
   */
  const clearAllSettings = () => {
    ThemeStorage.clearAll()
    resetAllThemes()
  }

  /**
   * 初始化主题管理器，首次加载时应用当前主题。
   */
  const initialize = () => {
    if (!themeState.isInitialized) {
      // 首先检查是否有临时自定义颜色需要恢复
      try {
        const savedColor = localStorage.getItem('temp-custom-color')
        const savedTheme = localStorage.getItem('temp-custom-theme')

        if (savedColor && savedTheme) {
          const customTheme = JSON.parse(savedTheme)
          // 设置临时主题标记，阻止自动更新
          themeState.hasTemporaryCustomTheme = true
          // 直接应用自定义主题，不更新themeState
          cssManager.forceApplyColorTheme(customTheme)
        } else {
          // 没有自定义颜色，清除标记并应用正常主题
          themeState.hasTemporaryCustomTheme = false
          updateAllCSS()
          // 确保字体设置也被应用
          cssManager.applyFontSettings(currentFontSettings.value)
        }
      } catch (error) {
        console.warn('Failed to restore custom color on init:', error)
        // 清除损坏的数据并应用正常主题
        localStorage.removeItem('temp-custom-color')
        localStorage.removeItem('temp-custom-theme')
        themeState.hasTemporaryCustomTheme = false
        updateAllCSS()
        // 确保字体设置也被应用
        cssManager.applyFontSettings(currentFontSettings.value)
      }

      themeState.isInitialized = true
    }
  }

  // --- 侦听器 (Watcher) ---

  /**
   * 侦听主题状态的变化，并在变化时自动更新 CSS。
   * `deep: true` 确保即使主题对象的内部属性变化也能被捕获。
   */
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

    // 主题状态（用于外部访问）
    themeState,

    // 当前主题对象
    currentColorTheme,
    currentAppliedColorTheme,
    currentCodeStyle,
    currentThemeSystem,
    currentFontSettings,
    currentFontFamily,

    // 主题列表
    colorThemeList,
    codeStyleList,
    themeSystemList,
    fontFamilyList,

    // 设置方法
    setColorTheme,
    setCodeStyle,
    setThemeSystem,
    setFontFamily,
    setFontSize,
    setFontSettings,
    setThemes,

    // 重置方法
    resetColorTheme,
    resetCodeStyle,
    resetThemeSystem,
    resetFontSettings,
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

    // CSS 管理器
    cssManager,

    // 预设 ID
    presets: {
      colorThemes: colorThemePresets,
      codeStyles: codeStylePresets,
      themeSystems: themeSystemPresets
    },

    // --- 自定义主题管理 ---

    // 获取所有自定义主题
    getCustomThemes() {
      try {
        const stored = localStorage.getItem(CUSTOM_THEME_STORAGE_KEY)
        return stored ? JSON.parse(stored) : []
      } catch (error) {
        console.error('Failed to load custom themes:', error)
        return []
      }
    },

    // 保存自定义主题
    saveCustomTheme(color, name = '自定义主题', description = '用户自定义的颜色主题') {
      const customTheme = ColorThemeGenerator.createCustomTheme(color, name, description)
      const customThemes = this.getCustomThemes()

      // 检查是否已存在相同颜色的主题
      const existingIndex = customThemes.findIndex(theme => theme.primary === color)
      if (existingIndex >= 0) {
        // 更新现有主题
        customThemes[existingIndex] = customTheme
      } else {
        // 添加新主题
        customThemes.push(customTheme)
      }

      // 限制自定义主题数量（最多20个）
      if (customThemes.length > 20) {
        customThemes.splice(0, customThemes.length - 20)
      }

      try {
        localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(customThemes))

        // 触发自定义主题列表的响应式更新
        themeState.customThemeUpdateTrigger++

        return customTheme
      } catch (error) {
        console.error('Failed to save custom theme:', error)
        throw new Error('保存自定义主题失败')
      }
    },

    // 删除自定义主题
    deleteCustomTheme(themeId) {
      const customThemes = this.getCustomThemes()
      const filteredThemes = customThemes.filter(theme => theme.id !== themeId)

      try {
        localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(filteredThemes))

        // 如果删除的是当前主题，切换到默认主题
        if (themeState.currentColorTheme === themeId) {
          this.setColorTheme(defaultColorTheme.id)
        }

        return true
      } catch (error) {
        console.error('Failed to delete custom theme:', error)
        throw new Error('删除自定义主题失败')
      }
    },

    // 获取扩展的颜色主题列表（包含自定义主题）
    getExtendedColorThemeList() {
      const builtinThemes = getColorThemeList()
      const customThemes = this.getCustomThemes()
      return [...builtinThemes, ...customThemes]
    },

    // 获取扩展的颜色主题（包含自定义主题）
    getExtendedColorTheme(id) {
      // 先尝试获取内置主题
      const builtinTheme = getColorTheme(id)
      if (builtinTheme) {
        return builtinTheme
      }

      // 再尝试获取自定义主题
      const customThemes = this.getCustomThemes()
      return customThemes.find(theme => theme.id === id) || null
    }
  }
}

// --- 全局单例 (Global Singleton) ---

let globalThemeManager = null

/**
 * 获取全局唯一的主题管理器实例。
 * 这种模式确保整个应用共享同一个主题状态，避免不一致。
 * @returns {Object} 全局主题管理器实例。
 */
export function useGlobalThemeManager() {
  if (!globalThemeManager) {
    globalThemeManager = useThemeManager()
    // 首次获取时自动初始化
    globalThemeManager.initialize()
  }
  return globalThemeManager
}
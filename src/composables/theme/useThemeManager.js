/**
 * @file src/composables/useThemeManager.js
 * @description 统一主题管理 Composable
 *
 * 本文件负责集中管理应用程序的所有主题相关状态，包括：
 * - 颜色主题 (Color Theme): 如亮色、暗色、微信主题等。
 * - 代码高亮样式 (Code Style): 如 Mac、GitHub、VS Code、Terminal 等。
 * - 排版主题 (Theme System): 如微信、掘金等，定义整体布局和字体。
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
  colorThemePresets
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
  isInitialized: false
})

/**
 * 统一主题管理 Hook。
 * 提供完整的 API 用于管理应用的主题。
 * @returns {Object} 主题管理相关的响应式数据和方法。
 */
export function useThemeManager() {
  // --- 计算属性 (Computed Properties) ---

  /** 当前激活的颜色主题对象 */
  const currentColorTheme = computed(() => getColorTheme(themeState.colorThemeId))
  /** 当前激活的代码高亮样式对象 */
  const currentCodeStyle = computed(() => getCodeStyle(themeState.codeStyleId))
  /** 当前激活的排版主题对象 */
  const currentThemeSystem = computed(() => getThemeSystem(themeState.themeSystemId))

  /** 所有可用的颜色主题列表 */
  const colorThemeList = computed(() => getColorThemeList())
  /** 所有可用的代码高亮样式列表 */
  const codeStyleList = computed(() => getCodeStyleList())
  /** 所有可用的排版主题列表 */
  const themeSystemList = computed(() => getThemeSystemList())

  // --- 主题切换方法 (Theme Setters) ---

  /**
   * 设置颜色主题。
   * @param {string} themeId - 目标颜色主题的 ID。
   * @returns {boolean} 如果设置成功，返回 true。
   */
  const setColorTheme = (themeId) => {
    if (themeId && getColorTheme(themeId)) {
      themeState.colorThemeId = themeId
      ThemeStorage.save(STORAGE_KEYS.COLOR_THEME, themeId)
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
   * 批量设置主题。
   * @param {Object} themes - 包含 colorTheme, codeStyle, themeSystem 的对象。
   * @returns {boolean} 如果有任何主题发生变化，返回 true。
   */
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
    
    // CSS 更新将由 watch 自动处理
    return changed
  }

  // --- 重置方法 (Reset Methods) ---

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
      themeSystem: currentThemeSystem.value
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
      timestamp: Date.now(),
      version: '1.0'
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
      themeSystem: settings.themeSystem
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
      updateAllCSS()
      themeState.isInitialized = true
    }
  }

  // --- 侦听器 (Watcher) ---

  /**
   * 侦听主题状态的变化，并在变化时自动更新 CSS。
   * `deep: true` 确保即使主题对象的内部属性变化也能被捕获。
   */
  watch([currentColorTheme, currentCodeStyle, currentThemeSystem], () => {
    if (themeState.isInitialized) {
      updateAllCSS()
    }
  }, { deep: true })

  // --- 返回 API ---

  return {
    // 状态 ID
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

    // CSS 管理器
    cssManager,

    // 预设 ID
    presets: {
      colorThemes: colorThemePresets,
      codeStyles: codeStylePresets,
      themeSystems: themeSystemPresets
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
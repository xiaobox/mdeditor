/**
 * 主题存储管理
 * 提供存储键和基础存储工具函数
 * 注意：实际的存储操作已移至各个 composable 中以更好地管理响应式状态
 */

import { defaultColorTheme } from './color-themes.js'
import { defaultCodeStyle } from './code-styles.js'
import { defaultThemeSystem } from './theme-systems.js'

// 存储键常量
export const STORAGE_KEYS = {
  COLOR_THEME: 'markdown-editor-color-theme',
  CODE_STYLE: 'markdown-editor-code-style',
  THEME_SYSTEM: 'markdown-editor-theme-system'
}

// 默认值常量
export const STORAGE_DEFAULTS = {
  COLOR_THEME: defaultColorTheme.id,
  CODE_STYLE: defaultCodeStyle.id,
  THEME_SYSTEM: defaultThemeSystem.id
}

/**
 * 通用存储工具类
 */
export class ThemeStorage {
  /**
   * 安全地保存到 localStorage
   * @param {string} key - 存储键
   * @param {string} value - 存储值
   * @returns {boolean} 是否保存成功
   */
  static save(key, value) {
    try {
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      console.warn(`无法保存设置 ${key}:`, error)
      return false
    }
  }

  /**
   * 安全地从 localStorage 加载
   * @param {string} key - 存储键
   * @param {string} defaultValue - 默认值
   * @returns {string} 加载的值或默认值
   */
  static load(key, defaultValue = '') {
    try {
      return localStorage.getItem(key) || defaultValue
    } catch (error) {
      console.warn(`无法加载设置 ${key}:`, error)
      return defaultValue
    }
  }

  /**
   * 移除存储项
   * @param {string} key - 存储键
   * @returns {boolean} 是否移除成功
   */
  static remove(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn(`无法移除设置 ${key}:`, error)
      return false
    }
  }

  /**
   * 批量保存主题设置
   * @param {Object} settings - 设置对象
   * @returns {boolean} 是否全部保存成功
   */
  static saveAll(settings) {
    let allSuccess = true

    if (settings.colorTheme) {
      allSuccess &= this.save(STORAGE_KEYS.COLOR_THEME, settings.colorTheme)
    }
    if (settings.codeStyle) {
      allSuccess &= this.save(STORAGE_KEYS.CODE_STYLE, settings.codeStyle)
    }
    if (settings.themeSystem) {
      allSuccess &= this.save(STORAGE_KEYS.THEME_SYSTEM, settings.themeSystem)
    }

    return Boolean(allSuccess)
  }

  /**
   * 批量加载主题设置
   * @returns {Object} 设置对象
   */
  static loadAll() {
    return {
      colorTheme: this.load(STORAGE_KEYS.COLOR_THEME, STORAGE_DEFAULTS.COLOR_THEME),
      codeStyle: this.load(STORAGE_KEYS.CODE_STYLE, STORAGE_DEFAULTS.CODE_STYLE),
      themeSystem: this.load(STORAGE_KEYS.THEME_SYSTEM, STORAGE_DEFAULTS.THEME_SYSTEM)
    }
  }

  /**
   * 清除所有主题设置
   * @returns {boolean} 是否全部清除成功
   */
  static clearAll() {
    let allSuccess = true
    allSuccess &= this.remove(STORAGE_KEYS.COLOR_THEME)
    allSuccess &= this.remove(STORAGE_KEYS.CODE_STYLE)
    allSuccess &= this.remove(STORAGE_KEYS.THEME_SYSTEM)
    return Boolean(allSuccess)
  }
}

// 向后兼容的函数导出
export const saveColorTheme = (themeId) => ThemeStorage.save(STORAGE_KEYS.COLOR_THEME, themeId)
export const saveCodeStyle = (styleId) => ThemeStorage.save(STORAGE_KEYS.CODE_STYLE, styleId)
export const saveThemeSystem = (systemId) => ThemeStorage.save(STORAGE_KEYS.THEME_SYSTEM, systemId)

export const loadSavedColorTheme = () => ThemeStorage.load(STORAGE_KEYS.COLOR_THEME, STORAGE_DEFAULTS.COLOR_THEME)
export const loadSavedCodeStyle = () => ThemeStorage.load(STORAGE_KEYS.CODE_STYLE, STORAGE_DEFAULTS.CODE_STYLE)
export const loadSavedThemeSystem = () => ThemeStorage.load(STORAGE_KEYS.THEME_SYSTEM, STORAGE_DEFAULTS.THEME_SYSTEM)

// 向后兼容的导出/导入函数
export const clearAllThemeSettings = () => ThemeStorage.clearAll()
export const exportThemeSettings = () => ThemeStorage.loadAll()
export const importThemeSettings = (settings) => ThemeStorage.saveAll(settings)

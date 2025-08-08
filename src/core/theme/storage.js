/**
 * @file src/core/theme/storage.js
 * @description 主题设置的本地存储管理（路径注释已统一到 core）
 */

import { THEME_DEFAULTS, STORAGE_KEYS } from '../../config/constants/defaults.js';

// 重新导出 STORAGE_KEYS 以保持向后兼容性
export { STORAGE_KEYS };

export const STORAGE_DEFAULTS = {
  COLOR_THEME: THEME_DEFAULTS.COLOR_THEME_ID,
  CODE_STYLE: THEME_DEFAULTS.CODE_STYLE_ID,
  THEME_SYSTEM: THEME_DEFAULTS.THEME_SYSTEM_ID,
  FONT_FAMILY: 'system-default',
  FONT_SIZE: 16,
  LETTER_SPACING: THEME_DEFAULTS.LETTER_SPACING,
  LINE_HEIGHT: THEME_DEFAULTS.LINE_HEIGHT
};

/**
 * 封装了 localStorage 操作的静态工具类。
 */
export class ThemeStorage {
  /**
   * 安全地将键值对保存到 localStorage。
   * @param {string} key - 存储键。
   * @param {string} value - 要存储的值。
   * @returns {boolean} - 操作是否成功。
   */
  static save(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`[ThemeStorage] 无法保存设置 '${key}':`, error);
      return false;
    }
  }

  /**
   * 安全地从 localStorage 加载值。
   * @param {string} key - 存储键。
   * @param {string} [defaultValue=''] - 加载失败或值不存在时返回的默认值。
   * @returns {string} - 加载到的值或默认值。
   */
  static load(key, defaultValue = '') {
    try {
      return localStorage.getItem(key) || defaultValue;
    } catch (error) {
      console.warn(`[ThemeStorage] 无法加载设置 '${key}':`, error);
      return defaultValue;
    }
  }

  /**
   * 安全地从 localStorage 移除一个键。
   * @param {string} key - 存储键。
   * @returns {boolean} - 操作是否成功。
   */
  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`[ThemeStorage] 无法移除设置 '${key}':`, error);
      return false;
    }
  }

  /**
   * 批量保存所有主题相关的设置。
   * @param {object} settings - 包含 `colorTheme`, `codeStyle`, `themeSystem` 的对象。
   * @returns {boolean} - 是否所有设置都保存成功。
   */
  static saveAll(settings) {
    let allSuccess = true;
    if (settings.colorTheme) {
      allSuccess = allSuccess && this.save(STORAGE_KEYS.COLOR_THEME, settings.colorTheme);
    }
    if (settings.codeStyle) {
      allSuccess = allSuccess && this.save(STORAGE_KEYS.CODE_STYLE, settings.codeStyle);
    }
    if (settings.themeSystem) {
      allSuccess = allSuccess && this.save(STORAGE_KEYS.THEME_SYSTEM, settings.themeSystem);
    }
    return allSuccess;
  }

  /**
   * 批量加载所有主题相关的设置。
   * @returns {object} - 包含 `colorTheme`, `codeStyle`, `themeSystem`, `fontFamily`, `fontSize` 的对象。
   */
  static loadAll() {
    return {
      colorTheme: this.load(STORAGE_KEYS.COLOR_THEME, STORAGE_DEFAULTS.COLOR_THEME),
      codeStyle: this.load(STORAGE_KEYS.CODE_STYLE, STORAGE_DEFAULTS.CODE_STYLE),
      themeSystem: this.load(STORAGE_KEYS.THEME_SYSTEM, STORAGE_DEFAULTS.THEME_SYSTEM),
      fontFamily: this.load(STORAGE_KEYS.FONT_FAMILY, STORAGE_DEFAULTS.FONT_FAMILY),
      fontSize: parseInt(this.load(STORAGE_KEYS.FONT_SIZE, STORAGE_DEFAULTS.FONT_SIZE.toString()), 10),
      letterSpacing: parseFloat(this.load(STORAGE_KEYS.LETTER_SPACING, String(STORAGE_DEFAULTS.LETTER_SPACING))),
      lineHeight: parseFloat(this.load(STORAGE_KEYS.LINE_HEIGHT, String(STORAGE_DEFAULTS.LINE_HEIGHT)))
    };
  }

  /**
   * 清除所有与主题相关的 localStorage 设置。
   * @returns {boolean} - 是否所有设置都清除成功。
   */
  static clearAll() {
    let allSuccess = true;
    allSuccess = allSuccess && this.remove(STORAGE_KEYS.COLOR_THEME);
    allSuccess = allSuccess && this.remove(STORAGE_KEYS.CODE_STYLE);
    allSuccess = allSuccess && this.remove(STORAGE_KEYS.THEME_SYSTEM);
    allSuccess = allSuccess && this.remove(STORAGE_KEYS.FONT_FAMILY);
    allSuccess = allSuccess && this.remove(STORAGE_KEYS.FONT_SIZE);
    allSuccess = allSuccess && this.remove(STORAGE_KEYS.LETTER_SPACING);
    allSuccess = allSuccess && this.remove(STORAGE_KEYS.LINE_HEIGHT);
    return allSuccess;
  }
}
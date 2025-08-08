/**
 * @file src/config/themes/storage.js
 * @description 主题设置的本地存储管理
 *
 * 本文件负责处理主题配置的持久化，即将用户的选择（如颜色主题、代码样式等）
 * 保存到浏览器的 `localStorage` 中，以便在下次访问时恢复这些设置。
 *
 * 主要功能:
 * 1.  **统一定义存储键**: `STORAGE_KEYS` 对象集中管理所有用于 `localStorage` 的键名，
 *     避免了在代码中散布硬编码的字符串，便于维护和防止冲突。
 * 2.  **提供默认值**: `STORAGE_DEFAULTS` 对象定义了每个设置项的默认值，
 *     当无法从 `localStorage` 中加载到有效值时，将使用这些默认值。
 * 3.  **封装 `localStorage` API**: `ThemeStorage` 类封装了 `localStorage` 的
 *     `getItem`, `setItem`, `removeItem` 等操作，并加入了 `try...catch` 块。
 *     这使得存储操作更安全，即使在某些浏览器禁用了 `localStorage` 的情况下，
 *     应用也不会因此崩溃。
 * 4.  **提供批量操作**: 提供了 `saveAll`, `loadAll`, `clearAll` 等方法，
 *     方便进行导入/导出设置或一键重置等功能。
 *
 * 设计思想:
 * - **防错与健壮性**: 对 `localStorage` 的所有访问都进行了错误处理，这是编写健壮的
 *   Web 应用的良好实践。
 * - **集中管理**: 将所有与存储相关的常量和逻辑都集中在此文件中，使得存储策略清晰、
 *   易于理解和修改。
 * - **向后兼容**: 文件底部导出了一些独立的函数（如 `saveColorTheme`），这可能是为了
 *   兼容旧版本代码，确保平滑过渡。
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
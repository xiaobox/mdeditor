/**
 * @file src/shared/utils/theme.js
 * @description 共享主题工具函数
 *
 * 提供统一的主题获取、应用和处理逻辑，消除代码中重复的主题处理模式。
 */

import { 
  getColorTheme, 
  defaultColorTheme 
} from '../../core/theme/presets/color-themes.js';
import { 
  getCodeStyle, 
  defaultCodeStyle 
} from '../../core/theme/presets/code-styles.js';
import { 
  getThemeSystem, 
  defaultThemeSystem 
} from '../../core/theme/presets/theme-systems.js';


/**
 * 主题类型枚举
 */
export const THEME_TYPES = {
  COLOR: 'color',
  CODE: 'code',
  SYSTEM: 'system'
};

/**
 * 主题工具类
 *
 * 提供安全的主题获取、验证、合并和应用功能。
 * 所有方法都包含错误处理和回退机制，确保应用程序的稳定性。
 *
 * @class ThemeUtils
 *
 * @example
 * // 安全获取主题
 * const theme = ThemeUtils.getColorThemeSafe('dark');
 *
 * @example
 * // 合并主题
 * const customTheme = ThemeUtils.mergeThemes(baseTheme, userOverrides);
 *
 * @example
 * // 验证主题完整性
 * const isValid = ThemeUtils.validateTheme(theme, ['background', 'textPrimary']);
 */
export class ThemeUtils {
  /**
   * 安全获取颜色主题
   *
   * 提供安全的主题获取机制，支持主题ID字符串和主题对象。
   * 如果提供的主题无效或不存在，将返回默认主题。
   *
   * @param {string|Object|null} theme - 主题ID字符串、主题对象或null
   * @returns {Object} 有效的主题对象，保证包含所有必需的属性
   *
   * @example
   * // 使用主题ID
   * const darkTheme = ThemeUtils.getColorThemeSafe('dark');
   *
   * @example
   * // 使用主题对象（会与默认主题合并）
   * const customTheme = ThemeUtils.getColorThemeSafe({ background: '#custom' });
   *
   * @example
   * // 处理无效输入（返回默认主题）
   * const fallbackTheme = ThemeUtils.getColorThemeSafe(null);
   */
  static getColorThemeSafe(theme) {
    if (!theme) {
      return defaultColorTheme;
    }
    
    if (typeof theme === 'object') {
      return { ...defaultColorTheme, ...theme };
    }
    
    return getColorTheme(theme) || defaultColorTheme;
  }

  /**
   * 安全获取代码样式
   * @param {string|Object} style - 样式ID或样式对象
   * @returns {Object} 样式对象
   */
  static getCodeStyleSafe(style) {
    if (!style) {
      return defaultCodeStyle;
    }
    
    if (typeof style === 'object') {
      return { ...defaultCodeStyle, ...style };
    }
    
    return getCodeStyle(style) || defaultCodeStyle;
  }

  /**
   * 安全获取主题系统
   * @param {string|Object} system - 系统ID或系统对象
   * @returns {Object} 系统对象
   */
  static getThemeSystemSafe(system) {
    if (!system) {
      return defaultThemeSystem;
    }
    
    if (typeof system === 'object') {
      return { ...defaultThemeSystem, ...system };
    }
    
    return getThemeSystem(system) || defaultThemeSystem;
  }

  /**
   * 批量获取主题配置
   * @param {Object} themes - 主题配置对象
   * @returns {Object} 安全的主题配置
   */
  static getThemesSafe(themes = {}) {
    return {
      colorTheme: ThemeUtils.getColorThemeSafe(themes.colorTheme),
      codeStyle: ThemeUtils.getCodeStyleSafe(themes.codeStyle),
      themeSystem: ThemeUtils.getThemeSystemSafe(themes.themeSystem)
    };
  }

  /**
   * 检查主题是否为深色主题
   * @param {Object} colorTheme - 颜色主题对象
   * @returns {boolean} 是否为深色主题
   */
  static isDarkTheme(colorTheme) {
    if (!colorTheme || !colorTheme.background) {
      return false;
    }
    
    // 简单的亮度检测：解析背景色的亮度
    const bg = colorTheme.background.toLowerCase();
    
    // 处理常见的深色值
    if (bg.includes('dark') || bg.includes('black') || bg === '#000' || bg === '#000000') {
      return true;
    }
    
    // 处理 hex 颜色
    if (bg.startsWith('#')) {
      const hex = bg.slice(1);
      if (hex.length === 3) {
        const r = parseInt(hex[0] + hex[0], 16);
        const g = parseInt(hex[1] + hex[1], 16);
        const b = parseInt(hex[2] + hex[2], 16);
        return (r + g + b) / 3 < 128;
      } else if (hex.length === 6) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return (r + g + b) / 3 < 128;
      }
    }
    
    return false;
  }

  /**
   * 生成主题CSS变量
   * @param {Object} theme - 主题对象
   * @param {string} prefix - CSS变量前缀
   * @returns {Object} CSS变量对象
   */
  static generateCSSVariables(theme, prefix = '--theme') {
    const variables = {};
    
    const processObject = (obj, currentPrefix) => {
      Object.entries(obj).forEach(([key, value]) => {
        const cssKey = `${currentPrefix}-${ThemeUtils.kebabCase(key)}`;
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          processObject(value, cssKey);
        } else {
          variables[cssKey] = value;
        }
      });
    };
    
    processObject(theme, prefix);
    return variables;
  }



  /**
   * 将驼峰命名转换为kebab-case
   * @param {string} str - 驼峰命名字符串
   * @returns {string} kebab-case字符串
   */
  static kebabCase(str) {
    if (!str) return '';
    return String(str)
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase();
  }

  /**
   * 合并主题对象
   * @param {Object} baseTheme - 基础主题
   * @param {Object} overrideTheme - 覆盖主题
   * @returns {Object} 合并后的主题
   */
  static mergeThemes(baseTheme, overrideTheme) {
    if (!overrideTheme) return baseTheme;
    if (!baseTheme) return overrideTheme;
    
    const merged = { ...baseTheme };
    
    Object.entries(overrideTheme).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        merged[key] = ThemeUtils.mergeThemes(merged[key] || {}, value);
      } else {
        merged[key] = value;
      }
    });
    
    return merged;
  }

  /**
   * 验证主题对象的完整性
   * @param {Object} theme - 主题对象
   * @param {Array<string>} requiredKeys - 必需的键
   * @returns {boolean} 是否有效
   */
  static validateTheme(theme, requiredKeys = []) {
    if (!theme || typeof theme !== 'object') {
      return false;
    }
    
    return requiredKeys.every(key => {
      const keys = key.split('.');
      let current = theme;
      
      for (const k of keys) {
        if (!current || typeof current !== 'object' || !(k in current)) {
          return false;
        }
        current = current[k];
      }
      
      return true;
    });
  }


}

/**
 * 便捷函数导出 - 只导出实际使用的函数
 */
export const getThemesSafe = ThemeUtils.getThemesSafe;

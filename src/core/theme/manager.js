/**
 * @file src/core/theme/manager.js
 * @description 统一的 CSS 变量管理器
 *
 * 说明：头部路径注释已统一到实际文件位置 `src/core/theme/`，
 * 避免与历史 `src/config/themes/` 路径混淆。
 */

import { debounce } from '../../shared/utils/performance.js';
import { generateFontCSSVariables } from '../../config/theme-presets.js';

// ============================================================================
// 颜色工具函数（从 variables.js 合并）
// ============================================================================

/**
 * 将十六进制颜色转换为RGB对象
 * @param {string} hex - 十六进制颜色值 (如 #00A86B)
 * @returns {{r:number,g:number,b:number}|null}
 */
export function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null;
  const cleanHex = hex.replace('#', '');
  const shorthand = /^([a-f\d])([a-f\d])([a-f\d])$/i;
  const full = cleanHex.replace(shorthand, (m, r, g, b) => r + r + g + g + b + b);
  const match = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(full);
  if (!match) return null;
  return { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) };
}

/**
 * 基于颜色主题生成 CSS 变量（包含新老命名兼容）
 * @param {Object} colorTheme - 颜色主题对象
 * @returns {Record<string, string>} CSS 变量映射
 */
export function computeThemeVariables(colorTheme) {
  if (!colorTheme) return {};

  const variables = {
    '--theme-primary': colorTheme.primary,
    '--theme-primary-hover': colorTheme.primaryHover,
    '--theme-primary-light': colorTheme.primaryLight,
    '--theme-primary-dark': colorTheme.primaryDark,
    '--theme-text-primary': colorTheme.textPrimary,
    '--theme-text-secondary': colorTheme.textSecondary,
    '--theme-text-tertiary': colorTheme.textTertiary,
    '--theme-bg-primary': colorTheme.bgPrimary,
    '--theme-bg-secondary': colorTheme.bgSecondary,
    '--theme-bg-tertiary': colorTheme.bgTertiary,
    '--theme-border-light': colorTheme.borderLight,
    '--theme-border-medium': colorTheme.borderMedium,
    '--theme-inline-code-bg': colorTheme.inlineCodeBg,
    '--theme-inline-code-text': colorTheme.inlineCodeText,
    '--theme-inline-code-border': colorTheme.inlineCodeBorder,
    '--theme-blockquote-border': colorTheme.blockquoteBorder,
    '--theme-blockquote-bg': colorTheme.blockquoteBackground,
    '--theme-hr-color': colorTheme.hrColor,
    '--theme-table-header-bg': colorTheme.tableHeaderBg,
    '--theme-table-border': colorTheme.tableBorder,
  };

  // 列表色（如果存在）
  if (colorTheme.listColors && Array.isArray(colorTheme.listColors)) {
    colorTheme.listColors.forEach((color, index) => {
      variables[`--theme-list-color-${index + 1}`] = color;
    });
  }

  // 透明度变体与 rgb 值
  if (colorTheme.primary) {
    const rgb = hexToRgb(colorTheme.primary);
    if (rgb) {
      variables['--theme-primary-rgb'] = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
      variables['--theme-primary-15'] = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`;
      variables['--theme-primary-20'] = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.20)`;
      variables['--theme-primary-25'] = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`;
      variables['--theme-primary-40'] = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.40)`;
      variables['--theme-primary-60'] = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.60)`;
    }
  }

  return variables;
}

// ============================================================================
// CSS 变量管理器
// ============================================================================

/**
 * CSS 变量管理器类，用于动态操作 `:root` 上的 CSS 变量。
 * 包含性能优化和缓存机制。
 */
class CSSVariableManager {
  constructor() {
    /** @type {HTMLElement | null} */
    this.root = typeof document !== 'undefined' ? document.documentElement : null;
    
    // 防抖的 DOM 更新函数，减少频繁的样式更新
    this._debouncedSetVariables = debounce(this._setVariables.bind(this), 16);
    
    // 当前应用的主题缓存，用于避免重复设置
    this._currentThemeCache = {
      colorTheme: null,
      codeStyle: null,
      themeSystem: null
    };
  }

  /**
   * 将一个对象中的键值对设置为 CSS 变量。
   * @private
   * @param {Record<string, string | number>} variables - 变量名到值的映射。
   */
  _setVariables(variables) {
    if (!this.root) return;

    for (const [name, value] of Object.entries(variables)) {
      if (value !== undefined && value !== null) {
        this.root.style.setProperty(name, String(value));
      }
    }
  }

  /**
   * 将驼峰式字符串转换为 kebab-case。
   * @private
   * @param {string} str - 输入字符串。
   * @returns {string} - kebab-case 格式的字符串。
   */
  _kebabCase(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * 检查主题是否已经应用，避免重复设置
   * @private
   * @param {Object} theme - 主题对象
   * @param {string} type - 主题类型
   * @returns {boolean} 是否需要更新
   */
  _shouldUpdateTheme(theme, type) {
    if (!theme) return false;

    const cached = this._currentThemeCache[type];
    if (!cached) return true;

    // 对于自定义主题，需要更深入的比较
    if (theme.id && theme.id.startsWith('custom-')) {
      // 自定义主题比较主要颜色值
      return cached.primary !== theme.primary || cached.id !== theme.id;
    }

    // 内置主题的简单相等性检查
    return cached.id !== theme.id || cached.name !== theme.name;
  }

  /**
   * 更新主题缓存
   * @private
   * @param {Object} theme - 主题对象
   * @param {string} type - 主题类型
   */
  _updateThemeCache(theme, type) {
    if (!theme) {
      this._currentThemeCache[type] = null;
      return;
    }

    // 对于自定义主题，缓存更多信息
    if (theme.id && theme.id.startsWith('custom-')) {
      this._currentThemeCache[type] = {
        id: theme.id,
        name: theme.name,
        primary: theme.primary
      };
    } else {
      this._currentThemeCache[type] = { id: theme.id, name: theme.name };
    }
  }

  /**
   * 将主题对象转换为 CSS 变量映射
   * @private
   * @param {Object} obj - 主题对象
   * @param {string} prefix - CSS 变量前缀
   * @returns {Object} CSS 变量映射
   */
  _objectToVariables(obj, prefix = '--theme-') {
    const variables = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined && value !== null && typeof value !== 'object') {
        variables[`${prefix}${this._kebabCase(key)}`] = value;
      }
    }
    
    return variables;
  }

  /**
   * 强制应用颜色主题，跳过缓存检查
   * @param {Object} colorTheme - 颜色主题对象。
   */
  forceApplyColorTheme(colorTheme) {
    if (!colorTheme) return;

    // 清除缓存以强制更新
    this._currentThemeCache.colorTheme = null;
    this.applyColorTheme(colorTheme);
  }

  /**
   * 应用颜色主题相关的 CSS 变量。
   * @param {Object} colorTheme - 颜色主题对象。
   */
  applyColorTheme(colorTheme) {
    if (!colorTheme || !this._shouldUpdateTheme(colorTheme, 'colorTheme')) return;

    const variables = computeThemeVariables(colorTheme);

    this._debouncedSetVariables(variables);
    this._updateThemeCache(colorTheme, 'colorTheme');
  }

  /**
   * 应用代码样式相关的 CSS 变量。
   * @param {Object} codeStyle - 代码样式对象。
   */
  applyCodeStyle(codeStyle) {
    if (!codeStyle || !this._shouldUpdateTheme(codeStyle, 'codeStyle')) return;

    const variables = {
      '--code-bg': codeStyle.background,
      '--code-color': codeStyle.color,
      '--code-border': codeStyle.border || 'none',
      '--code-border-radius': codeStyle.borderRadius,
      '--code-padding': codeStyle.padding,
      '--code-margin': codeStyle.margin,
      '--code-font-family': codeStyle.fontFamily,
      '--code-font-size': codeStyle.fontSize,
      '--code-line-height': codeStyle.lineHeight,
      '--code-box-shadow': codeStyle.boxShadow || 'none',
    };

    if (codeStyle.syntaxHighlight) {
      for (const [key, value] of Object.entries(codeStyle.syntaxHighlight)) {
        variables[`--code-syntax-${key}`] = value;
      }
    }

    this._debouncedSetVariables(variables);
    this._updateThemeCache(codeStyle, 'codeStyle');
  }

  /**
   * 应用排版主题系统相关的 CSS 变量。
   * @param {Object} themeSystem - 排版主题系统对象。
   */
  applyThemeSystem(themeSystem) {
    if (!themeSystem) return;

    const variables = {};
    const mapping = {
      layout: '--layout',
      typography: '--font',
      spacing: '--spacing',
      borderRadius: '--border-radius',
      shadows: '--shadow'
    };

    for (const [category, prefix] of Object.entries(mapping)) {
      if (themeSystem[category]) {
        for (const [key, value] of Object.entries(themeSystem[category])) {
          if (typeof value === 'object') {
            for (const [subKey, subValue] of Object.entries(value)) {
              variables[`${prefix}-${this._kebabCase(key)}-${this._kebabCase(subKey)}`] = subValue;
            }
          } else {
            variables[`${prefix}-${this._kebabCase(key)}`] = value;
          }
        }
      }
    }
    this._setVariables(variables);
  }

  /**
   * 应用字体设置到 CSS 变量。
   * @param {object} fontSettings - 字体设置对象
   * @param {string} fontSettings.fontFamily - 字体族 ID
   * @param {number} fontSettings.fontSize - 字号
   */
  applyFontSettings(fontSettings) {
    if (!fontSettings) return;

    // 直接生成字体CSS变量，避免异步导入的延迟
    const fontVariables = this._generateFontCSSVariables(fontSettings);
    this._debouncedSetVariables(fontVariables);
  }

  /**
   * 生成字体相关的 CSS 变量
   * @private
   * @param {object} fontSettings - 字体设置
   * @returns {object} CSS 变量对象
   */
  _generateFontCSSVariables(fontSettings) {
    return generateFontCSSVariables(fontSettings);
  }

  /**
   * 批量应用所有主题。
   * @param {object} themes - 包含 `colorTheme`, `codeStyle`, `themeSystem`, `fontSettings` 的对象。
   */
  applyAllThemes({ colorTheme, codeStyle, themeSystem, fontSettings }) {
    // 合并所有变量后一次性写入，避免防抖合并导致此前变量被覆盖
    const mergedVariables = {};

    // 颜色主题变量
    if (colorTheme) {
      Object.assign(mergedVariables, computeThemeVariables(colorTheme));
    }

    // 代码样式变量
    if (codeStyle) {
      const codeVars = {
        '--code-bg': codeStyle.background,
        '--code-color': codeStyle.color,
        '--code-border': codeStyle.border || 'none',
        '--code-border-radius': codeStyle.borderRadius,
        '--code-padding': codeStyle.padding,
        '--code-margin': codeStyle.margin,
        '--code-font-family': codeStyle.fontFamily,
        '--code-font-size': codeStyle.fontSize,
        '--code-line-height': codeStyle.lineHeight,
        '--code-box-shadow': codeStyle.boxShadow || 'none',
      };
      if (codeStyle.syntaxHighlight) {
        for (const [key, value] of Object.entries(codeStyle.syntaxHighlight)) {
          codeVars[`--code-syntax-${key}`] = value;
        }
      }
      Object.assign(mergedVariables, codeVars);
    }

    // 排版主题系统变量
    if (themeSystem) {
      const mapping = {
        layout: '--layout',
        typography: '--font',
        spacing: '--spacing',
        borderRadius: '--border-radius',
        shadows: '--shadow'
      };
      for (const [category, prefix] of Object.entries(mapping)) {
        if (themeSystem[category]) {
          for (const [key, value] of Object.entries(themeSystem[category])) {
            if (typeof value === 'object') {
              for (const [subKey, subValue] of Object.entries(value)) {
                mergedVariables[`${prefix}-${this._kebabCase(key)}-${this._kebabCase(subKey)}`] = subValue;
              }
            } else {
              mergedVariables[`${prefix}-${this._kebabCase(key)}`] = value;
            }
          }
        }
      }
    }

    // 字体设置变量
    if (fontSettings) {
      Object.assign(mergedVariables, this._generateFontCSSVariables(fontSettings));
    }

    // 一次性同步写入，避免丢失前序变量
    this._setVariables(mergedVariables);
  }

  /**
   * 生成用于UI预览的样式对象，不直接应用到DOM。
   * @param {object} themes - 包含 `colorTheme`, `codeStyle`, `themeSystem` 的对象。
   * @returns {Record<string, string>} - 一个CSS变量到其值的映射，可用于组件的 `style` 绑定。
   */
  generatePreviewStyles({ colorTheme, codeStyle }) {
    const styles = {};
    if (colorTheme) {
      styles['--preview-primary'] = colorTheme.primary;
      styles['--preview-bg'] = colorTheme.bgPrimary;
      styles['--preview-text'] = colorTheme.textPrimary;
    }
    if (codeStyle) {
      styles['--preview-code-bg'] = codeStyle.background;
      styles['--preview-code-color'] = codeStyle.color;
    }
    return styles;
  }
}

// 创建并导出一个 CSSVariableManager 的单例。
export const cssManager = new CSSVariableManager();

/**
 * @file src/config/themes/css-manager.js
 * @description 统一的 CSS 变量管理器
 *
 * 本文件定义了一个 `CSSVariableManager` 类，它是一个单例（通过 `cssManager` 实例导出），
 * 负责将主题配置（颜色、字体、间距等）动态地应用到应用的根元素 (`:root`) 上作为 CSS 变量。
 * 这是实现动态主题切换的核心机制。
 *
 * 主要功能:
 * 1.  **动态设置 CSS 变量**: 提供了 `applyColorTheme`, `applyCodeStyle`, `applyThemeSystem`
 *     等方法，接收相应的主题对象，并将其属性转换为 CSS 变量（例如 `primary` -> `--theme-primary`）
 *     设置到 `document.documentElement.style` 上。
 * 2.  **批量更新**: `applyAllThemes` 方法可以一次性应用所有类型的主题，简化了调用。
 * 3.  **解耦**: 将“如何将主题配置应用到 DOM”的逻辑与“主题配置本身”以及“主题状态管理”
 *     完全分离开来。`useThemeManager` 只负责状态变化，然后调用 `cssManager` 来执行实际的 DOM 操作。
 * 4.  **预览支持**: `generatePreviewStyles` 方法可以生成用于组件预览的样式对象，而不会
 *     实际影响全局 CSS 变量，这在设置面板等场景中非常有用。
 * 5.  **工具函数**: 包含一个 `kebabCase` 工具函数，用于将驼峰命名的对象键转换为 CSS 变量风格的
 *     kebab-case 命名。
 *
 * 设计思想:
 * - **单例模式**: 整个应用只需要一个 `CSSVariableManager` 实例来操作根元素的样式，
 *   因此导出一个单例 `cssManager` 是最合适的模式。
 * - **面向接口编程**: 管理器提供了一组清晰的、高级的接口（如 `applyColorTheme`），
 *   隐藏了底层 `setProperty` 的实现细节。
 * - **高性能**: 直接操作 `style` 属性来设置 CSS 变量是一种非常高效的动态样式更新方式，
 *   浏览器会即时重绘受这些变量影响的元素。
 */

/**
 * CSS 变量管理器类，用于动态操作 `:root` 上的 CSS 变量。
 */
class CSSVariableManager {
  constructor() {
    /** @type {HTMLElement | null} */
    this.root = typeof document !== 'undefined' ? document.documentElement : null;
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
   * 应用颜色主题相关的 CSS 变量。
   * @param {Object} colorTheme - 颜色主题对象。
   */
  applyColorTheme(colorTheme) {
    if (!colorTheme) return;

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
    this._setVariables(variables);
  }

  /**
   * 应用代码样式相关的 CSS 变量。
   * @param {Object} codeStyle - 代码样式对象。
   */
  applyCodeStyle(codeStyle) {
    if (!codeStyle) return;

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

    this._setVariables(variables);
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
   * 批量应用所有主题。
   * @param {object} themes - 包含 `colorTheme`, `codeStyle`, `themeSystem` 的对象。
   */
  applyAllThemes({ colorTheme, codeStyle, themeSystem }) {
    this.applyColorTheme(colorTheme);
    this.applyCodeStyle(codeStyle);
    this.applyThemeSystem(themeSystem);
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
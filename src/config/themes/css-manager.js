/**
 * 统一的 CSS 变量管理器
 * 负责所有主题相关的 CSS 变量更新和管理
 */

/**
 * CSS 变量管理器类
 */
class CSSVariableManager {
  constructor() {
    this.root = typeof document !== 'undefined' ? document.documentElement : null
  }

  /**
   * 应用颜色主题 CSS 变量
   * @param {Object} colorTheme - 颜色主题对象
   */
  applyColorTheme(colorTheme) {
    if (!this.root || !colorTheme) return

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
      '--theme-table-border': colorTheme.tableBorder
    }

    this.setVariables(variables)
  }

  /**
   * 应用代码样式 CSS 变量
   * @param {Object} codeStyle - 代码样式对象
   */
  applyCodeStyle(codeStyle) {
    if (!this.root || !codeStyle) return

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
      '--code-box-shadow': codeStyle.boxShadow || 'none'
    }

    // 语法高亮变量
    if (codeStyle.syntaxHighlight) {
      Object.entries(codeStyle.syntaxHighlight).forEach(([key, value]) => {
        variables[`--code-${key}`] = value
      })
    }

    this.setVariables(variables)
  }

  /**
   * 应用主题系统 CSS 变量
   * @param {Object} themeSystem - 主题系统对象
   */
  applyThemeSystem(themeSystem) {
    if (!this.root || !themeSystem) return

    const variables = {}

    // 布局变量
    if (themeSystem.layout) {
      Object.entries(themeSystem.layout).forEach(([key, value]) => {
        variables[`--layout-${this.kebabCase(key)}`] = value
      })
    }

    // 字体变量
    if (themeSystem.typography) {
      variables['--font-family'] = themeSystem.typography.fontFamily
      variables['--code-font-family'] = themeSystem.typography.codeFontFamily
      
      if (themeSystem.typography.fontSize) {
        Object.entries(themeSystem.typography.fontSize).forEach(([key, value]) => {
          variables[`--font-size-${key}`] = value
        })
      }
      
      if (themeSystem.typography.fontWeight) {
        Object.entries(themeSystem.typography.fontWeight).forEach(([key, value]) => {
          variables[`--font-weight-${key}`] = value
        })
      }
    }

    // 间距变量
    if (themeSystem.spacing) {
      Object.entries(themeSystem.spacing).forEach(([key, value]) => {
        variables[`--spacing-${key}`] = value
      })
    }

    // 圆角变量
    if (themeSystem.borderRadius) {
      Object.entries(themeSystem.borderRadius).forEach(([key, value]) => {
        variables[`--border-radius-${key}`] = value
      })
    }

    // 阴影变量
    if (themeSystem.shadows) {
      Object.entries(themeSystem.shadows).forEach(([key, value]) => {
        variables[`--shadow-${key}`] = value
      })
    }

    this.setVariables(variables)
  }

  /**
   * 设置多个 CSS 变量
   * @param {Object} variables - 变量对象
   */
  setVariables(variables) {
    if (!this.root) return

    Object.entries(variables).forEach(([name, value]) => {
      if (value !== undefined && value !== null) {
        this.root.style.setProperty(name, value)
      }
    })
  }

  /**
   * 移除 CSS 变量
   * @param {Array} variableNames - 变量名数组
   */
  removeVariables(variableNames) {
    if (!this.root) return

    variableNames.forEach(name => {
      this.root.style.removeProperty(name)
    })
  }

  /**
   * 获取 CSS 变量值
   * @param {string} variableName - 变量名
   * @returns {string} 变量值
   */
  getVariable(variableName) {
    if (!this.root) return ''
    return getComputedStyle(this.root).getPropertyValue(variableName).trim()
  }

  /**
   * 批量应用所有主题
   * @param {Object} themes - 主题对象
   */
  applyAllThemes({ colorTheme, codeStyle, themeSystem }) {
    if (colorTheme) this.applyColorTheme(colorTheme)
    if (codeStyle) this.applyCodeStyle(codeStyle)
    if (themeSystem) this.applyThemeSystem(themeSystem)
  }

  /**
   * 生成预览样式对象
   * @param {Object} themes - 主题对象
   * @returns {Object} 样式对象
   */
  generatePreviewStyles({ colorTheme, codeStyle, themeSystem }) {
    const styles = {}

    if (colorTheme) {
      Object.assign(styles, {
        '--preview-primary': colorTheme.primary,
        '--preview-text-primary': colorTheme.textPrimary,
        '--preview-bg-primary': colorTheme.bgPrimary,
        '--preview-border-light': colorTheme.borderLight
      })
    }

    if (codeStyle) {
      Object.assign(styles, {
        '--preview-code-bg': codeStyle.background,
        '--preview-code-color': codeStyle.color
      })
    }

    return styles
  }

  /**
   * 转换为 kebab-case
   * @param {string} str - 输入字符串
   * @returns {string} kebab-case 字符串
   */
  kebabCase(str) {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase()
  }

  /**
   * 重置所有主题变量
   */
  reset() {
    if (!this.root) return

    // 获取所有以 --theme, --code, --layout, --font, --spacing 开头的变量并移除
    const styles = getComputedStyle(this.root)
    const variablesToRemove = []

    for (let i = 0; i < styles.length; i++) {
      const property = styles[i]
      if (property.startsWith('--theme') || 
          property.startsWith('--code') || 
          property.startsWith('--layout') ||
          property.startsWith('--font') ||
          property.startsWith('--spacing') ||
          property.startsWith('--border-radius') ||
          property.startsWith('--shadow')) {
        variablesToRemove.push(property)
      }
    }

    this.removeVariables(variablesToRemove)
  }
}

// 创建单例实例
export const cssManager = new CSSVariableManager()

// 导出类以供测试或特殊用途
export { CSSVariableManager }

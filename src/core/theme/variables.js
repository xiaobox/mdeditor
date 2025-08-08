/**
 * @file src/core/theme/variables.js
 * @description 基于颜色主题生成 CSS 变量的通用方法
 */

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
  const m = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(full);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
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



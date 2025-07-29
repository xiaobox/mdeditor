/**
 * @file src/core/theme/theme-loader.js
 * @description 主题预加载器，用于防止主题闪烁 (FOUC)
 *
 * 该脚本应在 `index.html` 的 `<head>` 中、在主应用脚本加载前以内联方式或同步加载。
 * 它的核心职责是：
 * 1.  在页面渲染前，立即从 localStorage 读取已保存的主题设置。
 * 2.  根据这些设置，生成对应的 CSS 变量。
 * 3.  将这些变量动态注入到 `<html>` 元素的 `style` 属性中。
 *
 * 这样做可以确保浏览器在首次渲染页面时就拥有正确的主题颜色，
 * 从而避免了从默认主题到用户选择主题之间的视觉闪烁。
 *
 * 注意：此脚本是独立的，不依赖任何外部模块，以确保最快的执行速度。
 */

(function () {
  // 预设颜色主题的最小化版本，确保脚本独立性
  const colorThemePresets = {
    green: { primary: '#00A86B', primaryHover: '#008B5A', primaryLight: 'rgba(0, 168, 107, 0.08)', primaryDark: '#006B47', inlineCodeBg: 'rgba(0, 168, 107, 0.08)', inlineCodeText: '#006B47', inlineCodeBorder: 'rgba(0, 168, 107, 0.15)' },
    blue: { primary: '#0066CC', primaryHover: '#0052A3', primaryLight: 'rgba(0, 102, 204, 0.08)', primaryDark: '#003D7A', inlineCodeBg: 'rgba(0, 102, 204, 0.08)', inlineCodeText: '#003D7A', inlineCodeBorder: 'rgba(0, 102, 204, 0.15)' },
    red: { primary: '#E53E3E', primaryHover: '#C53030', primaryLight: 'rgba(229, 62, 62, 0.08)', primaryDark: '#9B2C2C', inlineCodeBg: 'rgba(229, 62, 62, 0.08)', inlineCodeText: '#9B2C2C', inlineCodeBorder: 'rgba(229, 62, 62, 0.15)' },
    purple: { primary: '#805AD5', primaryHover: '#6B46C1', primaryLight: 'rgba(128, 90, 213, 0.08)', primaryDark: '#553C9A', inlineCodeBg: 'rgba(128, 90, 213, 0.08)', inlineCodeText: '#553C9A', inlineCodeBorder: 'rgba(128, 90, 213, 0.15)' },
    orange: { primary: '#FF8C00', primaryHover: '#E67E00', primaryLight: 'rgba(255, 140, 0, 0.08)', primaryDark: '#CC7000', inlineCodeBg: 'rgba(255, 140, 0, 0.08)', inlineCodeText: '#CC7000', inlineCodeBorder: 'rgba(255, 140, 0, 0.15)' },
    pink: { primary: '#FF69B4', primaryHover: '#FF1493', primaryLight: 'rgba(255, 105, 180, 0.08)', primaryDark: '#DC143C', inlineCodeBg: 'rgba(255, 105, 180, 0.08)', inlineCodeText: '#DC143C', inlineCodeBorder: 'rgba(255, 105, 180, 0.15)' },
  };

  // localStorage 的键
  const STORAGE_KEY = 'markdown-editor-color-theme';
  const DEFAULT_THEME_ID = 'green';

  /**
   * 将十六进制颜色转换为 RGB 对象
   * @param {string} hex - 十六进制颜色值
   * @returns {{r: number, g: number, b: number} | null}
   */
  function hexToRgb(hex) {
    if (!hex || typeof hex !== 'string') return null;
    const cleanHex = hex.replace('#', '');
    const shorthandRegex = /^([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = cleanHex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * 应用主题变量到根元素
   * @param {string} themeId - 主题 ID
   */
  function applyTheme(themeId) {
    const theme = colorThemePresets[themeId] || colorThemePresets[DEFAULT_THEME_ID];
    if (!theme) return;

    const root = document.documentElement;
    const styles = {
      '--theme-primary': theme.primary,
      '--theme-primary-hover': theme.primaryHover,
      '--theme-primary-light': theme.primaryLight,
      '--theme-primary-dark': theme.primaryDark,
      '--theme-inline-code-bg': theme.inlineCodeBg,
      '--theme-inline-code-text': theme.inlineCodeText,
      '--theme-inline-code-border': theme.inlineCodeBorder,
    };

    // 生成透明度变体
    const primaryRgb = hexToRgb(theme.primary);
    if (primaryRgb) {
      styles['--theme-primary-15'] = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.15)`;
      styles['--theme-primary-20'] = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.20)`;
      styles['--theme-primary-25'] = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.25)`;
      styles['--theme-primary-40'] = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.40)`;
      styles['--theme-primary-60'] = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.60)`;
    }

    for (const [key, value] of Object.entries(styles)) {
      root.style.setProperty(key, value);
    }
  }

  try {
    const savedThemeId = localStorage.getItem(STORAGE_KEY);
    applyTheme(savedThemeId || DEFAULT_THEME_ID);
  } catch (e) {
    // 如果 localStorage 不可用或出错，应用默认主题
    applyTheme(DEFAULT_THEME_ID);
    console.error('Failed to load theme from localStorage:', e);
  }
})();

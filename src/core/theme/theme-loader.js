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
    chijin: { primary: '#FF0097', primaryHover: '#E60087', primaryLight: 'rgba(255, 0, 151, 0.08)', primaryDark: '#CC0077', inlineCodeBg: 'rgba(255, 0, 151, 0.08)', inlineCodeText: '#CC0077', inlineCodeBorder: 'rgba(255, 0, 151, 0.15)' },
    dianlan: { primary: '#56004F', primaryHover: '#4A0043', primaryLight: 'rgba(86, 0, 79, 0.08)', primaryDark: '#3E0037', inlineCodeBg: 'rgba(86, 0, 79, 0.08)', inlineCodeText: '#3E0037', inlineCodeBorder: 'rgba(86, 0, 79, 0.15)' },
    ehuang: { primary: '#FFA631', primaryHover: '#E6952C', primaryLight: 'rgba(255, 166, 49, 0.08)', primaryDark: '#CC8427', inlineCodeBg: 'rgba(255, 166, 49, 0.08)', inlineCodeText: '#CC8427', inlineCodeBorder: 'rgba(255, 166, 49, 0.15)' },
    conglv: { primary: '#0AA344', primaryHover: '#09923C', primaryLight: 'rgba(10, 163, 68, 0.08)', primaryDark: '#088234', inlineCodeBg: 'rgba(10, 163, 68, 0.08)', inlineCodeText: '#088234', inlineCodeBorder: 'rgba(10, 163, 68, 0.15)' },
    shiliuhong: { primary: '#F20C00', primaryHover: '#DA0B00', primaryLight: 'rgba(242, 12, 0, 0.08)', primaryDark: '#C20A00', inlineCodeBg: 'rgba(242, 12, 0, 0.08)', inlineCodeText: '#C20A00', inlineCodeBorder: 'rgba(242, 12, 0, 0.15)' },
    meihei: { primary: '#312C20', primaryHover: '#2A251B', primaryLight: 'rgba(49, 44, 32, 0.08)', primaryDark: '#231E16', inlineCodeBg: 'rgba(49, 44, 32, 0.08)', inlineCodeText: '#231E16', inlineCodeBorder: 'rgba(49, 44, 32, 0.15)' },
    ganziqing: { primary: '#003371', primaryHover: '#002D64', primaryLight: 'rgba(0, 51, 113, 0.08)', primaryDark: '#002757', inlineCodeBg: 'rgba(0, 51, 113, 0.08)', inlineCodeText: '#002757', inlineCodeBorder: 'rgba(0, 51, 113, 0.15)' },
    xuanse: { primary: '#622A1D', primaryHover: '#552419', primaryLight: 'rgba(98, 42, 29, 0.08)', primaryDark: '#481E15', inlineCodeBg: 'rgba(98, 42, 29, 0.08)', inlineCodeText: '#481E15', inlineCodeBorder: 'rgba(98, 42, 29, 0.15)' }
  };

  // localStorage 的键
  const STORAGE_KEY = 'markdown-editor-color-theme';
  const CUSTOM_THEME_KEY = 'temp-custom-theme';
  const CUSTOM_COLOR_KEY = 'temp-custom-color';
  const DEFAULT_THEME_ID = 'meihei';

  /**
   * 将十六进制颜色转换为 RGB 对象
   * @param {string} hex - 十六进制颜色值
   * @returns {{r: number, g: number, b: number} | null}
   */
  function hexToRgb(hex) {
    if (!hex || typeof hex !== 'string') return null;
    const cleanHex = hex.replace('#', '');
    const shorthand = /^([a-f\d])([a-f\d])([a-f\d])$/i;
    const full = cleanHex.replace(shorthand, (m, r, g, b) => r + r + g + g + b + b);
    const m = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(full);
    return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
  }

  /**
   * 应用主题变量到根元素
   * @param {string} themeId - 主题 ID
   */
  function applyTheme(themeId) {
    // 优先使用持久化的自定义颜色主题，避免刷新时先渲染内置主题再切换
    try {
      const savedCustom = localStorage.getItem(CUSTOM_THEME_KEY);
      if (savedCustom) {
        const customTheme = JSON.parse(savedCustom);
        return applyThemeObject(customTheme);
      }
    } catch (_) {}

    const theme = colorThemePresets[themeId] || colorThemePresets[DEFAULT_THEME_ID];
    if (!theme) return;

    applyThemeObject(theme);
  }

  function applyThemeObject(theme) {
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
      styles['--theme-primary-rgb'] = `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`;
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

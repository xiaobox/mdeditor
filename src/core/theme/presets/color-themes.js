/**
 * @file src/config/themes/color-themes.js
 * @description 颜色主题的定义文件
 *
 * 本文件集中定义了所有可用的颜色主题（Color Theme）。
 * 每个颜色主题都是一个通过 `createTheme` 工厂函数创建的对象，
 * 这确保了它们都具有一致的结构和默认值。
 *
 * 主要内容:
 * 1.  **主题定义 (`colorThemes`)**: 一个包含了所有颜色主题对象的集合。
 *     每个主题都围绕一个主色调（`primary` color）构建，例如“翡翠绿”、“深海蓝”等。
 *     除了主色调，还定义了相关的悬浮色、浅色、深色版本，以及文本、背景、边框等
 *     一系列配套颜色，形成一个完整、和谐的色彩系统。
 *
 * 2.  **默认导出 (`defaultColorTheme`)**: 指定一个默认的颜色主题，当无法加载用户设置时使用。
 *
 * 3.  **工具函数 (`getColorTheme`, `getColorThemeList`, `colorThemeUtils`)**: 
 *     - `getColorTheme(id)`: 根据 ID 安全地获取一个颜色主题对象，如果 ID 无效则返回默认主题。
 *     - `getColorThemeList()`: 返回一个简化的列表，包含 `id`, `name`, `description`, `primary`，
 *       主要用于在 UI（如设置面板的颜色选择器）中展示所有可用的主题。
 *     - `colorThemeUtils`: 提供一些辅助逻辑，例如判断主题是深色还是浅色（当前版本已移除深色主题）。
 *
 * 4.  **预设 (`colorThemePresets`)**: 定义了一些颜色主题的分组，例如 `business` 分组包含了
 *     看起来比较专业的颜色。这可以用于在 UI 中提供分类筛选功能。
 */

import { createTheme } from './base.js';

/**
 * 包含所有预定义颜色主题的对象。
 */
export const colorThemes = {
  // 翡翠绿 (默认)
  green: createTheme({
    id: 'green',
    name: '翡翠绿',
    description: '清新自然的翡翠绿，如春日新芽般生机盎然',
    primary: '#00A86B',
    primaryHover: '#008B5A',
    primaryLight: 'rgba(0, 168, 107, 0.08)',
    primaryDark: '#006B47',
    inlineCodeBg: 'rgba(0, 168, 107, 0.08)',
    inlineCodeText: '#006B47',
    inlineCodeBorder: 'rgba(0, 168, 107, 0.15)',
  }),

  // 深海蓝
  blue: createTheme({
    id: 'blue',
    name: '深海蓝',
    description: '沉稳专业的深海蓝，如深邃海洋般宁静致远',
    primary: '#0066CC',
    primaryHover: '#0052A3',
    primaryLight: 'rgba(0, 102, 204, 0.08)',
    primaryDark: '#003D7A',
    inlineCodeBg: 'rgba(0, 102, 204, 0.08)',
    inlineCodeText: '#003D7A',
    inlineCodeBorder: 'rgba(0, 102, 204, 0.15)',
  }),

  // 朱砂红
  red: createTheme({
    id: 'red',
    name: '朱砂红',
    description: '热情醒目的朱砂红，如晚霞般绚烂夺目',
    primary: '#E53E3E',
    primaryHover: '#C53030',
    primaryLight: 'rgba(229, 62, 62, 0.08)',
    primaryDark: '#9B2C2C',
    inlineCodeBg: 'rgba(229, 62, 62, 0.08)',
    inlineCodeText: '#9B2C2C',
    inlineCodeBorder: 'rgba(229, 62, 62, 0.15)',
  }),

  // 薰衣草紫
  purple: createTheme({
    id: 'purple',
    name: '薰衣草紫',
    description: '优雅神秘的薰衣草紫，如梦境般浪漫迷人',
    primary: '#805AD5',
    primaryHover: '#6B46C1',
    primaryLight: 'rgba(128, 90, 213, 0.08)',
    primaryDark: '#553C9A',
    inlineCodeBg: 'rgba(128, 90, 213, 0.08)',
    inlineCodeText: '#553C9A',
    inlineCodeBorder: 'rgba(128, 90, 213, 0.15)',
  }),

  // 琥珀橙
  orange: createTheme({
    id: 'orange',
    name: '琥珀橙',
    description: '温暖活力的琥珀橙，如秋日暖阳般温馨明亮',
    primary: '#FF8C00',
    primaryHover: '#E67E00',
    primaryLight: 'rgba(255, 140, 0, 0.08)',
    primaryDark: '#CC7000',
    inlineCodeBg: 'rgba(255, 140, 0, 0.08)',
    inlineCodeText: '#CC7000',
    inlineCodeBorder: 'rgba(255, 140, 0, 0.15)',
  }),

  // 樱花粉
  pink: createTheme({
    id: 'pink',
    name: '樱花粉',
    description: '温馨浪漫的樱花粉，如春日樱花般柔美动人',
    primary: '#FF69B4',
    primaryHover: '#FF1493',
    primaryLight: 'rgba(255, 105, 180, 0.08)',
    primaryDark: '#DC143C',
    inlineCodeBg: 'rgba(255, 105, 180, 0.08)',
    inlineCodeText: '#DC143C',
    inlineCodeBorder: 'rgba(255, 105, 180, 0.15)',
  }),
};

/** 默认的颜色主题 */
export const defaultColorTheme = colorThemes.green;

/**
 * 根据 ID 获取颜色主题对象。
 * @param {string} themeId - 颜色主题的 ID。
 * @returns {object} - 对应的颜色主题对象，如果找不到则返回默认主题。
 */
export const getColorTheme = (themeId) => {
  return colorThemes[themeId] || defaultColorTheme;
};

/**
 * 获取简化的颜色主题列表，用于 UI 显示
 * @returns {Array} 主题列表，包含 id、name、description、primary 字段
 */
export const getColorThemeList = () => {
  return Object.values(colorThemes).map(theme => ({
    id: theme.id,
    name: theme.name,
    description: theme.description,
    primary: theme.primary,
  }));
};

/**
 * 颜色主题预设分组
 * 这个对象定义了主题的分组，用于在 UI 中展示和快速切换。
 */
export const colorThemePresets = {
  // 所有主题 ID
  all: Object.keys(colorThemes),

  // 商务风格主题
  business: ['blue', 'purple'],

  // 自然风格主题
  nature: ['green', 'orange'],

  // 热情风格主题
  warm: ['red', 'pink'],
};

/**
 * 自定义颜色主题的存储键
 */
export const CUSTOM_THEME_STORAGE_KEY = 'markdown-editor-custom-themes';

/**
 * 从单一颜色生成完整主题色板的工具函数
 */
export class ColorThemeGenerator {
  /**
   * 将十六进制颜色转换为HSL
   * @param {string} hex - 十六进制颜色值
   * @returns {{h: number, s: number, l: number}}
   */
  static hexToHsl(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  /**
   * 将HSL转换为十六进制颜色
   * @param {number} h - 色相 (0-360)
   * @param {number} s - 饱和度 (0-100)
   * @param {number} l - 亮度 (0-100)
   * @returns {string} 十六进制颜色值
   */
  static hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (c) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /**
   * 计算颜色的相对亮度
   * @param {string} hex - 十六进制颜色值
   * @returns {number} 相对亮度值 (0-1)
   */
  static getLuminance(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const sRGB = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  }

  /**
   * 计算两个颜色之间的对比度
   * @param {string} color1 - 第一个颜色
   * @param {string} color2 - 第二个颜色
   * @returns {number} 对比度值
   */
  static getContrastRatio(color1, color2) {
    const lum1 = this.getLuminance(color1);
    const lum2 = this.getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * 调整颜色亮度以确保足够的对比度
   * @param {string} color - 要调整的颜色
   * @param {string} background - 背景颜色
   * @param {number} targetRatio - 目标对比度
   * @returns {string} 调整后的颜色
   */
  static adjustColorForContrast(color, background = '#ffffff', targetRatio = 4.5) {
    const hsl = this.hexToHsl(color);
    let adjustedColor = color;
    let currentRatio = this.getContrastRatio(color, background);

    // 如果对比度已经足够，直接返回
    if (currentRatio >= targetRatio) {
      return color;
    }

    // 尝试调整亮度
    let step = currentRatio < targetRatio ? -5 : 5;
    let newL = hsl.l;

    for (let i = 0; i < 20; i++) {
      newL += step;
      newL = Math.max(0, Math.min(100, newL));

      adjustedColor = this.hslToHex(hsl.h, hsl.s, newL);
      currentRatio = this.getContrastRatio(adjustedColor, background);

      if (currentRatio >= targetRatio) {
        break;
      }

      if (newL <= 0 || newL >= 100) {
        break;
      }
    }

    return adjustedColor;
  }

  /**
   * 从主色生成完整的主题色板
   * @param {string} primaryColor - 主色的十六进制值
   * @returns {object} 完整的主题色板
   */
  static generateThemeColors(primaryColor) {
    const hsl = this.hexToHsl(primaryColor);

    // 确保主色有足够的对比度
    const adjustedPrimary = this.adjustColorForContrast(primaryColor, '#ffffff', 4.5);
    const adjustedHsl = this.hexToHsl(adjustedPrimary);

    // 生成悬停色（稍微深一点）
    const hoverL = Math.max(adjustedHsl.l - 8, 0);
    const primaryHover = this.hslToHex(adjustedHsl.h, adjustedHsl.s, hoverL);

    // 生成深色版本（用于文本等）
    const darkL = Math.max(adjustedHsl.l - 15, 0);
    const primaryDark = this.hslToHex(adjustedHsl.h, adjustedHsl.s, darkL);

    // 生成RGB值用于透明色
    const r = parseInt(adjustedPrimary.slice(1, 3), 16);
    const g = parseInt(adjustedPrimary.slice(3, 5), 16);
    const b = parseInt(adjustedPrimary.slice(5, 7), 16);

    return {
      // 核心颜色
      primary: adjustedPrimary,
      primaryHover,
      primaryLight: `rgba(${r}, ${g}, ${b}, 0.08)`,
      primaryDark,

      // 文本颜色（使用默认值）
      textPrimary: '#1f2328',
      textSecondary: '#656d76',
      textTertiary: '#8b949e',

      // 背景颜色（使用默认值）
      bgPrimary: '#ffffff',
      bgSecondary: '#f6f8fa',
      bgTertiary: '#f1f3f4',

      // 边框颜色（使用默认值）
      borderLight: '#d0d7de',
      borderMedium: '#8b949e',

      // 内联代码颜色
      inlineCodeBg: `rgba(${r}, ${g}, ${b}, 0.08)`,
      inlineCodeText: primaryDark,
      inlineCodeBorder: `rgba(${r}, ${g}, ${b}, 0.15)`,

      // 特定组件颜色
      tableHeaderBg: '#f6f8fa',
      tableBorder: '#d0d7de',
      blockquoteBorder: adjustedPrimary,
      blockquoteBackground: `rgba(${r}, ${g}, ${b}, 0.05)`,
      hrColor: adjustedPrimary,
      listColors: [adjustedPrimary, '#10A0FF', '#FA5151', '#666']
    };
  }

  /**
   * 创建自定义主题
   * @param {string} primaryColor - 主色
   * @param {string} name - 主题名称
   * @param {string} description - 主题描述
   * @returns {object} 完整的主题对象
   */
  static createCustomTheme(primaryColor, name = '自定义主题', description = '用户自定义的颜色主题') {
    const colors = this.generateThemeColors(primaryColor);
    const customId = `custom-${Date.now()}`;

    return createTheme({
      id: customId,
      name,
      description,
      ...colors
    });
  }
}
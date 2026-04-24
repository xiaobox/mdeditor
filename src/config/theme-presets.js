/**
 * @file src/config/theme-presets.js
 * @description 主题预设配置文件
 *
 * 整合了所有主题相关的预设定义，包括：
 * - 基础工厂函数（createTheme, createCodeStyle, createThemeSystem）
 * - 颜色主题（Color Themes）
 * - 代码高亮样式（Code Styles）
 * - 排版主题系统（Theme Systems）
 * - 字体设置（Font Settings）
 */

// ============================================================================
// 基础工厂函数
// ============================================================================

/**
 * 创建一个"颜色主题"对象。
 * @param {object} config - 主题的核心配置。
 * @returns {object} - 一个完整的、带有默认值的颜色主题对象。
 */
export const createTheme = (config) => ({
  // --- 基本信息 ---
  id: config.id,
  name: config.name,
  description: config.description,
  isDark: config.isDark || false,

  // --- 核心颜色 ---
  primary: config.primary,
  primaryHover: config.primaryHover,
  primaryLight: config.primaryLight,
  primaryDark: config.primaryDark,

  // --- 文本颜色 ---
  textPrimary: config.textPrimary || '#1f2328',
  textSecondary: config.textSecondary || '#656d76',
  textTertiary: config.textTertiary || '#8b949e',

  // --- 背景颜色 ---
  bgPrimary: config.bgPrimary || '#ffffff',
  bgSecondary: config.bgSecondary || '#f6f8fa',
  bgTertiary: config.bgTertiary || '#f1f3f4',

  // --- 边框颜色 ---
  borderLight: config.borderLight || '#d0d7de',
  borderMedium: config.borderMedium || '#8b949e',

  // --- 特定组件颜色 ---
  tableHeaderBg: config.tableHeaderBg || '#f6f8fa',
  tableBorder: config.tableBorder || '#d0d7de',
  blockquoteBorder: config.blockquoteBorder || config.primary,
  blockquoteBackground: config.blockquoteBackground || config.primaryLight,
  hrColor: config.hrColor || config.primary,
  listColors: config.listColors || [config.primary, '#10A0FF', '#FA5151', '#666'],

  // --- 内联代码颜色 ---
  inlineCodeBg: config.inlineCodeBg || 'rgba(251, 146, 60, 0.08)',
  inlineCodeText: config.inlineCodeText || '#ea580c',
  inlineCodeBorder: config.inlineCodeBorder || 'rgba(251, 146, 60, 0.15)',

  // --- 布局与排版 ---
  layout: {
    maxWidth: config.layout?.maxWidth || '800px',
    lineHeight: config.layout?.lineHeight || '1.6',
    ...config.layout,
  },
  typography: {
    fontFamily: config.typography?.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    codeFontFamily: config.typography?.codeFontFamily || '"SF Mono", monospace',
    ...config.typography,
  },
});

/**
 * 创建一个"代码高亮样式"对象。
 * @param {object} config - 代码样式的核心配置。
 * @returns {object} - 一个完整的、带有默认值的代码样式对象。
 */
export const createCodeStyle = (config) => ({
  // --- 基本信息 ---
  id: config.id,
  name: config.name,
  description: config.description,

  // --- 容器样式 ---
  background: config.background,
  borderRadius: config.borderRadius || '12px',
  padding: config.padding || '24px',
  margin: config.margin || '32px 0',
  border: config.border || 'none',
  boxShadow: config.boxShadow || 'none',

  // --- 文本样式 ---
  color: config.color,
  fontSize: config.fontSize || '14px',
  lineHeight: config.lineHeight || '1.7',
  fontFamily: config.fontFamily || '"SF Mono", Monaco, Inconsolata, "Fira Code", Consolas, monospace',
  fontWeight: config.fontWeight || '400',

  // --- 装饰元素 ---
  hasTrafficLights: config.hasTrafficLights || false,
  trafficLightsStyle: config.trafficLightsStyle || '',
  hasHeader: config.hasHeader || false,
  headerStyle: config.headerStyle || '',
  headerContent: config.headerContent || '',

  // --- 语法高亮颜色 ---
  syntaxHighlight: {
    comment: '#6a737d',
    keyword: '#d73a49',
    string: '#032f62',
    number: '#005cc5',
    function: '#6f42c1',
    operator: '#d73a49',
    punctuation: '#24292e',
    ...config.syntaxHighlight,
  },

  // --- 特殊效果 ---
  hasGlow: config.hasGlow || false,
  glowColor: config.glowColor || '',
});

/**
 * 创建一个"排版主题系统"对象。
 * @param {object} config - 排版系统的核心配置。
 * @returns {object} - 一个完整的、带有默认值的排版系统对象。
 */
export const createThemeSystem = (config) => ({
  // --- 基本信息 ---
  id: config.id,
  name: config.name,
  description: config.description,

  // --- 支持的颜色主题 ---
  supportedColors: config.supportedColors || [],

  // --- 布局 ---
  layout: {
    maxWidth: '100%',
    padding: '16px',
    lineHeight: '1.75',
    paragraphSpacing: '16px',
    ...config.layout,
  },

  // --- 排版 ---
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    codeFontFamily: '"SF Mono", Monaco, monospace',
    fontSize: {
      base: '16px',
      h1: '28px',
      h2: '24px',
      h3: '20px',
      ...config.typography?.fontSize,
    },
    fontWeight: {
      normal: '400',
      bold: '600',
      ...config.typography?.fontWeight,
    },
    ...config.typography,
  },

  // --- 基础组件样式 ---
  styles: {
    codeBlock: {
      background: '#f6f8fa',
      borderRadius: '6px',
      padding: '16px',
      ...config.styles?.codeBlock,
    },
    blockquote: {
      borderLeft: '4px solid',
      paddingLeft: '16px',
      margin: '16px 0',
      ...config.styles?.blockquote,
    },
    ...config.styles,
  },

  // --- 复制适配配置 ---
  copy: config.copy || null,
});

// ============================================================================
// 颜色主题 (Color Themes)
// ============================================================================

/**
 * 包含所有预定义颜色主题的对象。
 */
export const colorThemes = {
  // 洋红
  chijin: createTheme({
    id: 'chijin',
    name: '洋红',
    description: '色橘红，鲜艳明亮如玫瑰般绚烂夺目',
    primary: '#FF0097',
    primaryHover: '#E60087',
    primaryLight: 'rgba(255, 0, 151, 0.08)',
    primaryDark: '#CC0077',
    inlineCodeBg: 'rgba(255, 0, 151, 0.08)',
    inlineCodeText: '#CC0077',
    inlineCodeBorder: 'rgba(255, 0, 151, 0.15)',
  }),

  // 紫棠
  dianlan: createTheme({
    id: 'dianlan',
    name: '紫棠',
    description: '黑红色，深沉神秘如紫檀般高贵典雅',
    primary: '#56004F',
    primaryHover: '#4A0043',
    primaryLight: 'rgba(86, 0, 79, 0.08)',
    primaryDark: '#3E0037',
    inlineCodeBg: 'rgba(86, 0, 79, 0.08)',
    inlineCodeText: '#3E0037',
    inlineCodeBorder: 'rgba(86, 0, 79, 0.15)',
  }),

  // 杏黄
  ehuang: createTheme({
    id: 'ehuang',
    name: '杏黄',
    description: '成熟杏子的黄色，温润典雅如秋日暖阳般温馨',
    primary: '#FFA631',
    primaryHover: '#E6952C',
    primaryLight: 'rgba(255, 166, 49, 0.08)',
    primaryDark: '#CC8427',
    inlineCodeBg: 'rgba(255, 166, 49, 0.08)',
    inlineCodeText: '#CC8427',
    inlineCodeBorder: 'rgba(255, 166, 49, 0.15)',
  }),

  // 葱绿
  conglv: createTheme({
    id: 'conglv',
    name: '葱绿',
    description: '葱叶的绿色，清新自然如春草般生机盎然',
    primary: '#0AA344',
    primaryHover: '#09923C',
    primaryLight: 'rgba(10, 163, 68, 0.08)',
    primaryDark: '#088234',
    inlineCodeBg: 'rgba(10, 163, 68, 0.08)',
    inlineCodeText: '#088234',
    inlineCodeBorder: 'rgba(10, 163, 68, 0.15)',
  }),

  // 石榴红
  shiliuhong: createTheme({
    id: 'shiliuhong',
    name: '石榴红',
    description: '石榴花的颜色，热情醒目如火焰般绚烂',
    primary: '#F20C00',
    primaryHover: '#DA0B00',
    primaryLight: 'rgba(242, 12, 0, 0.08)',
    primaryDark: '#C20A00',
    inlineCodeBg: 'rgba(242, 12, 0, 0.08)',
    inlineCodeText: '#C20A00',
    inlineCodeBorder: 'rgba(242, 12, 0, 0.15)',
  }),

  // 煤黑
  meihei: createTheme({
    id: 'meihei',
    name: '煤黑',
    description: '煤炭的黑色，深沉稳重如墨玉般典雅',
    primary: '#312C20',
    primaryHover: '#2A251B',
    primaryLight: 'rgba(49, 44, 32, 0.08)',
    primaryDark: '#231E16',
    inlineCodeBg: 'rgba(49, 44, 32, 0.08)',
    inlineCodeText: '#231E16',
    inlineCodeBorder: 'rgba(49, 44, 32, 0.15)',
  }),

  // 绀青绀紫
  ganziqing: createTheme({
    id: 'ganziqing',
    name: '绀青绀紫',
    description: '纯度较低的深紫色，神秘优雅如紫檀般高贵',
    primary: '#003371',
    primaryHover: '#002D64',
    primaryLight: 'rgba(0, 51, 113, 0.08)',
    primaryDark: '#002757',
    inlineCodeBg: 'rgba(0, 51, 113, 0.08)',
    inlineCodeText: '#002757',
    inlineCodeBorder: 'rgba(0, 51, 113, 0.15)',
  }),

  // 玄色
  xuanse: createTheme({
    id: 'xuanse',
    name: '玄色',
    description: '赤黑色，黑中带红的颜色，深邃神秘如古韵般幽远',
    primary: '#622A1D',
    primaryHover: '#552419',
    primaryLight: 'rgba(98, 42, 29, 0.08)',
    primaryDark: '#481E15',
    inlineCodeBg: 'rgba(98, 42, 29, 0.08)',
    inlineCodeText: '#481E15',
    inlineCodeBorder: 'rgba(98, 42, 29, 0.15)',
  }),
};

/** 默认的颜色主题 */
export const defaultColorTheme = colorThemes.meihei;

/**
 * 根据 ID 获取颜色主题对象。
 * @param {string} themeId - 颜色主题的 ID。
 * @returns {object|null} - 对应的颜色主题对象，如果找不到则返回 null。
 */
export const getColorTheme = (themeId) => {
  return colorThemes[themeId] || null;
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
 */
export const colorThemePresets = {
  all: Object.keys(colorThemes),
  traditional: ['chijin', 'dianlan', 'ehuang', 'conglv', 'shiliuhong', 'meihei', 'ganziqing', 'xuanse'],
  warm: ['chijin', 'ehuang', 'shiliuhong'],
  cool: ['dianlan', 'ganziqing', 'conglv'],
  dark: ['meihei', 'xuanse', 'dianlan', 'ganziqing'],
};

/**
 * 自定义颜色主题的存储键
 */
export const CUSTOM_THEME_STORAGE_KEY = 'markdown-editor-custom-themes';

/**
 * 从单一颜色生成完整主题色板的工具类
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
      h = s = 0;
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
      r = g = b = l;
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

    if (currentRatio >= targetRatio) {
      return color;
    }

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
    const adjustedPrimary = this.adjustColorForContrast(primaryColor, '#ffffff', 4.5);
    const adjustedHsl = this.hexToHsl(adjustedPrimary);

    const hoverL = Math.max(adjustedHsl.l - 8, 0);
    const primaryHover = this.hslToHex(adjustedHsl.h, adjustedHsl.s, hoverL);

    const darkL = Math.max(adjustedHsl.l - 15, 0);
    const primaryDark = this.hslToHex(adjustedHsl.h, adjustedHsl.s, darkL);

    const r = parseInt(adjustedPrimary.slice(1, 3), 16);
    const g = parseInt(adjustedPrimary.slice(3, 5), 16);
    const b = parseInt(adjustedPrimary.slice(5, 7), 16);

    return {
      primary: adjustedPrimary,
      primaryHover,
      primaryLight: `rgba(${r}, ${g}, ${b}, 0.08)`,
      primaryDark,
      textPrimary: '#1f2328',
      textSecondary: '#656d76',
      textTertiary: '#8b949e',
      bgPrimary: '#ffffff',
      bgSecondary: '#f6f8fa',
      bgTertiary: '#f1f3f4',
      borderLight: '#d0d7de',
      borderMedium: '#8b949e',
      inlineCodeBg: `rgba(${r}, ${g}, ${b}, 0.08)`,
      inlineCodeText: primaryDark,
      inlineCodeBorder: `rgba(${r}, ${g}, ${b}, 0.15)`,
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

// ============================================================================
// 代码高亮样式 (Code Styles)
// ============================================================================

/**
 * 包含所有预定义代码高亮样式的对象。
 */
export const codeStyles = {
  // Mac 风格
  mac: createCodeStyle({
    id: 'mac',
    name: 'Mac 风格',
    description: '经典的 macOS 终端风格，深色背景配红绿灯',
    background: '#1e1e1e',
    color: '#e6edf3',
    borderRadius: '12px',
    padding: '16px',
    hasHeader: true,
    headerStyle: `background: #1e1e1e; border-bottom: none; padding: 8px 20px; border-radius: 11px 11px 0 0; font-size: 12px; color: #e6edf3; display: flex; align-items: center; width: 100%; box-sizing: border-box; margin: 0; line-height: 1.1 !important; min-height: auto !important; height: auto !important; position: relative;`,
    headerContent: 'mac-dynamic',
    syntaxHighlight: {
      keyword: '#ff7b72',
      string: '#a5d6ff',
      comment: '#8b949e',
      number: '#79c0ff',
      function: '#d2a8ff',
      operator: '#ff7b72',
      punctuation: '#e6edf3',
    }
  }),

  // GitHub 风格
  github: createCodeStyle({
    id: 'github',
    name: 'GitHub 风格',
    description: '清爽的 GitHub 代码块风格，浅色背景',
    background: '#f6f8fa',
    color: '#24292f',
    border: '1px solid #d0d7de',
    borderRadius: '8px',
    padding: '16px',
    hasHeader: true,
    headerStyle: `background: #f1f3f4; border-bottom: 1px solid #d0d7de; padding: 8px 16px; border-radius: 7px 7px 0 0; font-size: 12px; color: #656d76; display: block; width: 100%; box-sizing: border-box; margin: 0; line-height: 1.2 !important; min-height: auto !important; height: auto !important;`,
    headerContent: '📄 代码',
    syntaxHighlight: {
      keyword: '#d73a49',
      string: '#032f62',
      comment: '#6a737d',
      number: '#005cc5',
      function: '#6f42c1',
    }
  }),

  // VS Code 风格
  vscode: createCodeStyle({
    id: 'vscode',
    name: 'VS Code 风格',
    description: '现代的 VS Code 编辑器风格，深蓝背景',
    background: 'linear-gradient(135deg, #1e1e1e 0%, #252526 100%)',
    color: '#d4d4d4',
    borderRadius: '10px',
    padding: '20px',
    border: '1px solid #3c3c3c',
    hasHeader: true,
    headerStyle: `background: linear-gradient(135deg, #2d2d30 0%, #3c3c3c 100%); border-bottom: 1px solid #3c3c3c; padding: 10px 20px; border-radius: 9px 9px 0 0; font-size: 13px; color: #cccccc; display: block; width: 100%; box-sizing: border-box; margin: 0; line-height: 1.2 !important; min-height: auto !important; height: auto !important;`,
    headerContent: '⚡ 代码片段',
    syntaxHighlight: {
      keyword: '#569cd6',
      string: '#ce9178',
      comment: '#6a9955',
      number: '#b5cea8',
      function: '#dcdcaa',
      operator: '#569cd6',
      punctuation: '#d4d4d4',
    }
  }),

  // 终端风格
  terminal: createCodeStyle({
    id: 'terminal',
    name: '终端风格',
    description: '复古的终端风格，黑色背景配绿色文字',
    background: '#000000',
    color: '#00ff00',
    borderRadius: '6px',
    padding: '20px',
    border: '2px solid #333333',
    fontFamily: `'Courier New', 'Monaco', monospace`,
    hasHeader: true,
    headerStyle: `background: #1a1a1a; border-bottom: 1px solid #333333; padding: 8px 20px; border-radius: 4px 4px 0 0; font-size: 12px; color: #00ff00; font-family: 'Courier New', monospace; display: block; width: 100%; box-sizing: border-box; margin: 0; line-height: 1.2 !important; min-height: auto !important; height: auto !important;`,
    headerContent: '$ terminal',
    syntaxHighlight: {
      keyword: '#00ffff',
      string: '#ffff00',
      comment: '#888888',
      number: '#ff00ff',
      function: '#00ff88',
      operator: '#00ffff',
      punctuation: '#00ff00',
    }
  }),
};

/** 默认的代码样式 */
export const defaultCodeStyle = codeStyles.mac;

/**
 * 根据 ID 获取代码样式对象。
 * @param {string} styleId - 代码样式的 ID。
 * @returns {object|null} - 对应的代码样式对象，如果找不到则返回 null。
 */
export const getCodeStyle = (styleId) => {
  return codeStyles[styleId] || null;
};

/**
 * 获取简化的代码样式列表，用于 UI 显示
 * @returns {Array} 样式列表，包含 id、name、description 字段
 */
export const getCodeStyleList = () => {
  return Object.values(codeStyles).map(style => ({
    id: style.id,
    name: style.name,
    description: style.description,
  }));
};

/**
 * 代码样式预设分组
 */
export const codeStylePresets = {
  all: Object.keys(codeStyles),
  dark: ['mac', 'vscode', 'terminal'],
  light: ['github'],
  classic: ['mac', 'github'],
};

// ============================================================================
// 排版主题系统 (Theme Systems)
// ============================================================================

/**
 * 包含所有预定义排版主题系统的对象。
 */
export const themeSystems = {
  // 默认主题
  default: createThemeSystem({
    id: 'default',
    name: '默认主题',
    description: '现代化Markdown编辑器统一主题，简洁优雅',
    supportedColors: ['chijin', 'dianlan', 'ehuang', 'conglv', 'shiliuhong', 'meihei', 'ganziqing', 'xuanse'],
    layout: {
      padding: '16px',
      lineHeight: '1.75',
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif',
      fontSize: {
        base: '16px',
        h1: '28px',
        h2: '24px',
        h3: '20px',
      },
    },
  }),

  // 清风排版
  breeze: createThemeSystem({
    id: 'breeze',
    name: '清风排版',
    description: '面向移动端图文平台的清爽排版：舒适行高、自然间距与温和装饰',
    supportedColors: ['meihei', 'chijin', 'ehuang', 'conglv', 'shiliuhong', 'ganziqing'],
    layout: {
      maxWidth: '720px',
      padding: '24px',
      lineHeight: '1.8',
      paragraphSpacing: '1.2em'
    },
    typography: {
      fontFamily: 'PingFang SC, Microsoft YaHei, Arial, sans-serif',
      fontSize: {
        base: '17px',
        h1: '30px',
        h2: '24px',
        h3: '20px'
      },
      fontWeight: {
        normal: '400',
        bold: '700'
      }
    },
    copy: {
      headings: {
        h1: { pill: true, marginTop: '2.2em', marginBottom: '1.6em' },
        h2: { deco: { widthPx: 6, heightEm: 1.2, radiusPx: 3 }, fontScale: 1.5, lineHeight: '1.35em', marginTop: '1.8em', marginBottom: '1.1em' },
        h3: { deco: { widthPx: 4, heightEm: 1.1, radiusPx: 2 }, fontScale: 1.22, marginTop: '1.2em', marginBottom: '0.8em' },
        h4: { deco: { widthPx: 3, heightEm: 1.05, radiusPx: 2 }, fontScale: 1.08, marginTop: '1em', marginBottom: '0.6em' }
      },
      link: { underline: false },
      innerCard: { borderRadius: 12, padding: '24px 20px' },
      table: { headerShade: 0.06, borderAlpha: 0.18 }
    }
  }),
};

/** 默认的排版主题系统 */
export const defaultThemeSystem = themeSystems.default;

/**
 * 根据 ID 获取排版主题系统对象。
 * @param {string} systemId - 排版系统的 ID。
 * @returns {object|null} - 对应的排版系统对象，如果找不到则返回 null。
 */
export const getThemeSystem = (systemId) => {
  return themeSystems[systemId] || null;
};

/**
 * 获取所有可用排版主题系统的列表（用于 UI 展示）。
 * @returns {Array<{id: string, name: string, description: string}>}
 */
export const getThemeSystemList = () => {
  return Object.values(themeSystems).map(system => ({
    id: system.id,
    name: system.name,
    description: system.description,
    supportedColors: system.supportedColors || [],
  }));
};

/**
 * 主题系统预设
 */
export const themeSystemPresets = {
  all: ['default', 'breeze'],
  default: ['default', 'breeze'],
};

// ============================================================================
// 字体设置 (Font Settings)
// ============================================================================

/**
 * 检测当前操作系统
 * @returns {'macos'|'windows'|'android'|'ios'|'linux'|'unknown'}
 */
export function detectOS() {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';
  if (/Android/i.test(ua)) return 'android';
  if (/iPad|iPhone|iPod/.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Mac/i.test(platform)) return 'macos';
  if (/Win/i.test(platform)) return 'windows';
  if (/Linux/i.test(platform)) return 'linux';
  return 'unknown';
}

/**
 * OS 显示名称映射
 */
const osDisplayNames = {
  macos: 'macOS',
  ios: 'iOS',
  windows: 'Windows',
  android: 'Android',
  linux: 'Linux',
  unknown: ''
};

/**
 * 获取 OS 的显示名称
 * @param {string} os
 * @returns {string}
 */
export function getOSDisplayName(os) {
  return osDisplayNames[os] || '';
}

/**
 * 字体类别
 */
export const FONT_CATEGORIES = Object.freeze({
  SANS_SERIF: 'sans-serif',
  SERIF: 'serif',
  MONOSPACE: 'monospace'
});

/**
 * 完整字体库。按 OS 和类别组织，每个字体的 value 带完整跨平台 fallback 链。
 */
const fontDatabase = [
  // macOS / iOS 无衬线
  {
    id: 'pingfang-sc',
    value: '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif',
    category: FONT_CATEGORIES.SANS_SERIF,
    os: ['macos', 'ios'],
    preview: '苹方体预览'
  },
  {
    id: 'hiragino-sans',
    value: '"Hiragino Sans GB", "PingFang SC", "Microsoft YaHei", sans-serif',
    category: FONT_CATEGORIES.SANS_SERIF,
    os: ['macos', 'ios'],
    preview: '冬青黑预览'
  },
  // macOS / iOS 衬线
  {
    id: 'songti-sc',
    value: '"Songti SC", STSong, SimSun, "Noto Serif SC", serif',
    category: FONT_CATEGORIES.SERIF,
    os: ['macos', 'ios'],
    preview: '宋体预览文'
  },
  {
    id: 'kaiti-mac',
    value: '"Kaiti SC", "STKaiti", "华文楷体", KaiTi, "楷体", serif',
    category: FONT_CATEGORIES.SERIF,
    os: ['macos', 'ios'],
    preview: '楷体预览文'
  },
  // macOS / iOS 等宽
  {
    id: 'sf-mono',
    value: '"SF Mono", Menlo, Monaco, Consolas, monospace',
    category: FONT_CATEGORIES.MONOSPACE,
    os: ['macos', 'ios'],
    preview: '等宽对齐 Mono'
  },

  // Windows 无衬线
  {
    id: 'microsoft-yahei',
    value: '"Microsoft YaHei", "微软雅黑", "PingFang SC", sans-serif',
    category: FONT_CATEGORIES.SANS_SERIF,
    os: ['windows'],
    preview: '雅黑体预览'
  },
  {
    id: 'simhei',
    value: 'SimHei, "黑体", "Microsoft YaHei", sans-serif',
    category: FONT_CATEGORIES.SANS_SERIF,
    os: ['windows'],
    preview: '黑体风预览'
  },
  // Windows 衬线
  {
    id: 'simsun',
    value: 'SimSun, "宋体", "Songti SC", "Noto Serif SC", serif',
    category: FONT_CATEGORIES.SERIF,
    os: ['windows'],
    preview: '宋体预览文'
  },
  {
    id: 'kaiti-win',
    value: 'KaiTi, "楷体", "Kaiti SC", "STKaiti", "华文楷体", serif',
    category: FONT_CATEGORIES.SERIF,
    os: ['windows'],
    preview: '楷体预览文'
  },
  {
    id: 'fangsong',
    value: 'FangSong, "仿宋", STFangsong, serif',
    category: FONT_CATEGORIES.SERIF,
    os: ['windows'],
    preview: '仿宋预览文'
  },
  // Windows 等宽
  {
    id: 'consolas',
    value: 'Consolas, "Courier New", Menlo, monospace',
    category: FONT_CATEGORIES.MONOSPACE,
    os: ['windows'],
    preview: '等宽对齐 Mono'
  },

  // Android / Linux 无衬线
  {
    id: 'noto-sans-sc',
    value: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
    category: FONT_CATEGORIES.SANS_SERIF,
    os: ['android', 'linux'],
    preview: '思源黑预览'
  },
  // Android / Linux 衬线
  {
    id: 'noto-serif-sc',
    value: '"Noto Serif SC", "Songti SC", SimSun, serif',
    category: FONT_CATEGORIES.SERIF,
    os: ['android', 'linux'],
    preview: '思源宋预览'
  },
  // Android / Linux 等宽
  {
    id: 'noto-sans-mono',
    value: '"Noto Sans Mono", "Droid Sans Mono", Consolas, monospace',
    category: FONT_CATEGORIES.MONOSPACE,
    os: ['android', 'linux'],
    preview: '等宽对齐 Mono'
  },

  // 全平台通用
  {
    id: 'system-default',
    value: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif',
    category: FONT_CATEGORIES.SANS_SERIF,
    os: ['macos', 'ios', 'windows', 'android', 'linux', 'unknown'],
    preview: '系统默认体'
  }
];

/**
 * 所有字体的扁平列表（向后兼容）
 */
export const fontFamilyOptions = fontDatabase;

/**
 * 获取当前 OS 可用的字体列表，按类别分组
 * @param {string} [os] - 操作系统，默认自动检测
 * @returns {{ os: string, osName: string, categories: Array<{ id: string, fonts: Array }> }}
 */
export function getAvailableFonts(os) {
  const detectedOS = os || detectOS();
  const osName = getOSDisplayName(detectedOS);
  const available = fontDatabase.filter(font => font.os.includes(detectedOS));
  const categoryOrder = [FONT_CATEGORIES.SANS_SERIF, FONT_CATEGORIES.SERIF, FONT_CATEGORIES.MONOSPACE];
  const categories = categoryOrder
    .map(category => ({
      id: category,
      fonts: available.filter(font => font.category === category)
    }))
    .filter(group => group.fonts.length > 0);

  return { os: detectedOS, osName, categories };
}

/**
 * 获取指定 OS 的默认字体 ID
 * @param {string} [os]
 * @returns {string}
 */
export function getDefaultFontId(os) {
  const detectedOS = os || detectOS();
  const defaults = {
    macos: 'pingfang-sc',
    ios: 'pingfang-sc',
    windows: 'microsoft-yahei',
    android: 'noto-sans-sc',
    linux: 'noto-sans-sc',
    unknown: 'system-default'
  };
  return defaults[detectedOS] || 'system-default';
}

/**
 * 字号选项配置
 */
export const fontSizeOptions = {
  min: 12,
  max: 24,
  default: 16,
  step: 1,
  presets: [
    { value: 12, label: '小号 (12px)' },
    { value: 14, label: '较小 (14px)' },
    { value: 16, label: '标准 (16px)' },
    { value: 18, label: '较大 (18px)' },
    { value: 20, label: '大号 (20px)' },
    { value: 22, label: '特大 (22px)' },
    { value: 24, label: '超大 (24px)' }
  ]
};

/**
 * 字体族分组（向后兼容；新代码推荐使用 getAvailableFonts）
 */
export const fontFamilyGroups = (() => {
  const { categories } = getAvailableFonts();
  const sans = categories.find(category => category.id === FONT_CATEGORIES.SANS_SERIF);
  const serif = categories.find(category => category.id === FONT_CATEGORIES.SERIF);
  return {
    recommended: {
      name: '推荐字体',
      description: '当前系统可用的字体',
      options: sans ? sans.fonts : []
    },
    basic: {
      name: '衬线字体',
      description: '衬线风格字体选择',
      options: serif ? serif.fonts : []
    }
  };
})();

/**
 * 默认字体设置
 */
export const defaultFontSettings = {
  fontFamily: getDefaultFontId(),
  fontSize: 16,
  letterSpacing: 0,
  lineHeight: 1.6
};

/**
 * 根据 ID 获取字体族配置
 * @param {string} fontId - 字体 ID
 * @returns {object|null} 字体配置对象
 */
export function getFontFamily(fontId) {
  return fontDatabase.find(font => font.id === fontId) || null;
}

/**
 * 获取字体族列表（用于 UI 显示，返回当前 OS 可用的字体）
 * @returns {Array} 简化的字体族列表
 */
export function getFontFamilyList() {
  const os = detectOS();
  return fontDatabase
    .filter(font => font.os.includes(os))
    .map(font => ({
      id: font.id,
      name: font.id,
      description: '',
      category: font.category
    }));
}

/**
 * 验证字号是否在有效范围内
 * @param {number} fontSize - 字号值
 * @returns {boolean} 是否有效
 */
export function isValidFontSize(fontSize) {
  return typeof fontSize === 'number' &&
         fontSize >= fontSizeOptions.min &&
         fontSize <= fontSizeOptions.max;
}

/**
 * 获取最接近的有效字号
 * @param {number} fontSize - 输入的字号
 * @returns {number} 有效的字号
 */
export function getValidFontSize(fontSize) {
  if (!isValidFontSize(fontSize)) {
    return fontSizeOptions.default;
  }
  return Math.round(fontSize);
}

/**
 * 生成字体相关的 CSS 变量
 * @param {object} fontSettings - 字体设置
 * @returns {object} CSS 变量对象
 */
export function generateFontCSSVariables(fontSettings) {
  const fontFamily = getFontFamily(fontSettings.fontFamily);
  const fontSize = getValidFontSize(fontSettings.fontSize);
  const letterSpacing = typeof fontSettings.letterSpacing === 'number' ? fontSettings.letterSpacing : 0;
  const lineHeight = typeof fontSettings.lineHeight === 'number' ? fontSettings.lineHeight : (fontSize <= 14 ? 1.7 : fontSize <= 18 ? 1.6 : 1.5);
  const defaultFont = getFontFamily(getDefaultFontId());

  return {
    '--markdown-font-family': fontFamily ? fontFamily.value : (defaultFont ? defaultFont.value : 'sans-serif'),
    '--markdown-font-size': `${fontSize}px`,
    '--markdown-line-height': String(lineHeight),
    '--markdown-letter-spacing': `${letterSpacing}px`
  };
}

/**
 * 字体设置工具函数集合
 */
export const fontSettingsUtils = {
  getFontFamily,
  getFontFamilyList,
  getAvailableFonts,
  getDefaultFontId,
  detectOS,
  isValidFontSize,
  getValidFontSize,
  generateFontCSSVariables,

  /**
   * 获取字体预览样式
   * @param {string} fontId - 字体 ID
   * @param {number} fontSize - 字号
   * @returns {object} 样式对象
   */
  getPreviewStyle(fontId, fontSize) {
    const fontFamily = getFontFamily(fontId);
    return {
      fontFamily: fontFamily ? fontFamily.value : 'inherit',
      fontSize: `${getValidFontSize(fontSize)}px`,
      lineHeight: fontSize <= 14 ? '1.7' : fontSize <= 18 ? '1.6' : '1.5',
      letterSpacing: '0px'
    };
  },

  /**
   * 检查字体是否可用
   * @param {string} fontId - 字体 ID
   * @returns {boolean} 是否可用
   */
  isFontAvailable(fontId) {
    return fontDatabase.some(font => font.id === fontId);
  }
};

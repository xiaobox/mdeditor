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
 * 获取所有可用颜色主题的列表（用于 UI 展示）。
 * @returns {Array<{id: string, name: string, description: string, primary: string}>}
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
 * 颜色主题相关的工具函数。
 */
export const colorThemeUtils = {
  /**
   * 检查一个主题是否为深色主题。
   * @param {string} themeId - 主题的 ID。
   * @returns {boolean}
   */
  isDark: (themeId) => {
    return colorThemes[themeId]?.isDark || false;
  },
};

/**
 * 用于 UI 筛选的颜色主题预设分组。
 */
export const colorThemePresets = {
  all: ['green', 'blue', 'red', 'purple', 'orange', 'pink'],
  business: ['blue', 'green', 'purple'],
  creative: ['purple', 'orange', 'red', 'pink'],
  minimal: ['green', 'blue', 'pink'],
};
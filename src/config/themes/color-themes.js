/**
 * 颜色主题配置
 * 包含所有可用的颜色主题定义
 */

import { createTheme } from './base.js'

// 颜色主题定义
export const colorThemes = {
  // 翡翠绿（默认）
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
    blockquoteBorder: '#00A86B',
    blockquoteBackground: 'rgba(0, 168, 107, 0.05)',
    hrColor: '#00A86B',
    listColors: ['#00A86B', '#10A0FF', '#FA5151', '#666']
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
    blockquoteBorder: '#0066CC',
    blockquoteBackground: 'rgba(0, 102, 204, 0.05)',
    hrColor: '#0066CC',
    listColors: ['#0066CC', '#00A3FF', '#66B3FF', '#666']
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
    blockquoteBorder: '#E53E3E',
    blockquoteBackground: 'rgba(229, 62, 62, 0.05)',
    hrColor: '#E53E3E',
    listColors: ['#E53E3E', '#FF6B6B', '#FFA8A8', '#666']
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
    blockquoteBorder: '#805AD5',
    blockquoteBackground: 'rgba(128, 90, 213, 0.05)',
    hrColor: '#805AD5',
    listColors: ['#805AD5', '#9F7AEA', '#C4B5FD', '#666']
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
    blockquoteBorder: '#FF8C00',
    blockquoteBackground: 'rgba(255, 140, 0, 0.05)',
    hrColor: '#FF8C00',
    listColors: ['#FF8C00', '#FFA500', '#FFD700', '#666']
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
    textPrimary: '#1f2328',
    textSecondary: '#656d76',
    textTertiary: '#8c959f',
    bgPrimary: '#ffffff',
    bgSecondary: '#f6f8fa',
    bgTertiary: '#f1f3f4',
    borderLight: '#d0d7de',
    borderMedium: '#8c959f',
    tableHeaderBg: '#f6f8fa',
    tableBorder: '#d0d7de',
    blockquoteBorder: '#FF69B4',
    blockquoteBackground: 'rgba(255, 105, 180, 0.05)',
    hrColor: '#FF69B4',
    listColors: ['#FF69B4', '#FFB6C1', '#FFC0CB', '#8c959f']
  })
}

// 默认颜色主题
export const defaultColorTheme = colorThemes.green

// 获取颜色主题
export const getColorTheme = (themeId) => {
  return colorThemes[themeId] || defaultColorTheme
}

// 获取颜色主题列表
export const getColorThemeList = () => {
  return Object.values(colorThemes).map(theme => ({
    id: theme.id,
    name: theme.name,
    description: theme.description,
    primary: theme.primary
  }))
}

// 颜色主题工具函数
export const colorThemeUtils = {
  // 检查是否为深色主题
  isDarkTheme: () => {
    return false // 移除深色主题后，所有主题都是浅色
  },

  // 获取对比主题
  getContrastTheme: (themeId) => {
    return themeId === 'pink' ? 'green' : 'pink'
  },

  // 获取相似主题
  getSimilarThemes: (themeId) => {
    const similarMap = {
      green: ['blue', 'purple'],
      blue: ['green', 'purple'],
      red: ['orange', 'purple'],
      purple: ['blue', 'red', 'pink'],
      orange: ['red', 'green'],
      pink: ['purple', 'red']
    }
    return similarMap[themeId] || ['green', 'blue']
  }
}

// 主题预设
export const colorThemePresets = {
  light: ['green', 'blue', 'red', 'purple', 'orange'],
  all: ['green', 'blue', 'red', 'purple', 'orange', 'pink'],
  business: ['blue', 'green', 'purple'],
  creative: ['purple', 'orange', 'red', 'pink'],
  minimal: ['green', 'blue', 'pink']
}

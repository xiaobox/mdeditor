/**
 * 主题系统配置
 * 包含所有可用的主题系统定义
 */

import { createThemeSystem } from './base.js'

// 主题系统定义
export const themeSystems = {
  // 微信主题（当前默认主题）
  wechat: createThemeSystem({
    id: 'wechat',
    name: '微信主题',
    description: '专为微信公众号优化的经典主题，简洁易读',

    layout: {
      maxWidth: '100%',
      padding: '16px',
      lineHeight: '1.75',
      paragraphSpacing: '16px'
    },

    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      codeFontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
      fontSize: {
        base: '16px',
        h1: '28px',
        h2: '24px',
        h3: '20px',
        h4: '18px',
        h5: '16px',
        h6: '14px',
        code: '14px'
      }
    },

    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      xxl: '48px'
    },

    borderRadius: {
      sm: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px'
    },

    supportedColors: ['green', 'blue', 'red', 'purple', 'orange', 'pink'],
    defaultColor: 'green',

    styles: {
      codeBlock: {
        background: '#f6f8fa',
        border: '1px solid #d0d7de',
        borderRadius: '6px',
        padding: '16px'
      },

      blockquote: {
        borderLeft: '4px solid',
        paddingLeft: '16px',
        margin: '16px 0',
        fontStyle: 'normal'
      }
    }
  }),

  // 微信公众号专业版主题
  wechatPro: createThemeSystem({
    id: 'wechatPro',
    name: '微信公众号专业版',
    description: '专为微信公众号优化的专业主题，参考Typora设计理念，注重内容可读性和美观性',

    layout: {
      maxWidth: '100%',
      padding: '20px',
      lineHeight: '1.75',
      paragraphSpacing: '16px'
    },

    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif',
      codeFontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
      fontSize: {
        base: '16px',
        h1: '28px',
        h2: '24px',
        h3: '20px',
        h4: '18px',
        h5: '16px',
        h6: '14px',
        code: '14px'
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        bold: '600'
      }
    },

    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      xxl: '48px'
    },

    borderRadius: {
      sm: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px'
    },

    shadows: {
      sm: '0 1px 3px rgba(0,0,0,0.08)',
      md: '0 2px 8px rgba(0,0,0,0.1)',
      lg: '0 4px 16px rgba(0,0,0,0.12)'
    },

    supportedColors: ['green', 'blue', 'red', 'purple', 'orange', 'pink'],
    defaultColor: 'green',

    styles: {
      codeBlock: {
        background: '#F6F8FA',
        border: '1px solid #E1E4E8',
        borderRadius: '6px',
        padding: '16px'
      },

      blockquote: {
        borderLeft: '4px solid',
        paddingLeft: '16px',
        margin: '16px 0',
        fontStyle: 'normal'
      },

      table: {
        borderCollapse: 'collapse',
        borderSpacing: '0',
        width: '100%'
      }
    }
  })
}

// 默认主题系统
export const defaultThemeSystem = themeSystems.wechat

// 获取主题系统
export const getThemeSystem = (systemId) => {
  return themeSystems[systemId] || defaultThemeSystem
}

// 获取主题系统列表
export const getThemeSystemList = () => {
  return Object.values(themeSystems).map(system => ({
    id: system.id,
    name: system.name,
    description: system.description,
    supportedColors: system.supportedColors,
    defaultColor: system.defaultColor
  }))
}

// 主题系统工具函数
export const themeSystemUtils = {
  // 检查是否为移动端优化主题
  isMobileOptimized: (systemId) => {
    return ['wechat', 'wechatPro'].includes(systemId)
  },

  // 检查是否为桌面端优化主题
  isDesktopOptimized: (systemId) => {
    return ['wechat', 'wechatPro'].includes(systemId)
  }
}

// 主题系统预设
export const themeSystemPresets = {
  all: ['wechat', 'wechatPro'],
  mobile: ['wechat', 'wechatPro'],
  desktop: ['wechat', 'wechatPro']
}

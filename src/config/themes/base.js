/**
 * 主题基础配置和工厂函数
 * 提供创建主题对象的核心功能
 */

/**
 * 创建主题的工厂函数
 * @param {Object} config - 主题配置
 * @returns {Object} - 完整的主题对象
 */
export const createTheme = (config) => ({
  // 基本信息
  id: config.id,
  name: config.name,
  description: config.description,
  
  // 主色调
  primary: config.primary,
  primaryHover: config.primaryHover,
  primaryLight: config.primaryLight,
  primaryDark: config.primaryDark,
  
  // 文本颜色
  textPrimary: config.textPrimary || '#1f2328',
  textSecondary: config.textSecondary || '#656d76',
  textTertiary: config.textTertiary || '#8b949e',
  
  // 背景颜色
  bgPrimary: config.bgPrimary || '#ffffff',
  bgSecondary: config.bgSecondary || '#f6f8fa',
  bgTertiary: config.bgTertiary || '#f1f3f4',
  
  // 边框颜色
  borderLight: config.borderLight || '#d0d7de',
  borderMedium: config.borderMedium || '#8b949e',
  
  // 表格颜色
  tableHeaderBg: config.tableHeaderBg || '#f6f8fa',
  tableBorder: config.tableBorder || '#d0d7de',
  
  // 列表颜色（多级）
  listColors: config.listColors || ['#07C160', '#10A0FF', '#FA5151', '#666'],
  
  // 引用块颜色
  blockquoteBorder: config.blockquoteBorder,
  blockquoteBackground: config.blockquoteBackground,
  
  // 分割线颜色
  hrColor: config.hrColor,
  
  // 内联代码颜色
  inlineCodeBg: config.inlineCodeBg || 'rgba(251, 146, 60, 0.08)',
  inlineCodeText: config.inlineCodeText || '#ea580c',
  inlineCodeBorder: config.inlineCodeBorder || 'rgba(251, 146, 60, 0.15)',
  
  // 布局设置
  layout: {
    maxWidth: config.layout?.maxWidth || '800px',
    padding: config.layout?.padding || '20px',
    lineHeight: config.layout?.lineHeight || '1.6',
    paragraphSpacing: config.layout?.paragraphSpacing || '16px'
  },
  
  // 字体设置
  typography: {
    fontFamily: config.typography?.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
    codeFontFamily: config.typography?.codeFontFamily || '"SF Mono", "Monaco", "Inconsolata", "Fira Code", "Consolas", "Liberation Mono", "Courier New", monospace',
    fontSize: {
      base: config.typography?.fontSize?.base || '16px',
      h1: config.typography?.fontSize?.h1 || '32px',
      h2: config.typography?.fontSize?.h2 || '24px',
      h3: config.typography?.fontSize?.h3 || '20px',
      h4: config.typography?.fontSize?.h4 || '18px',
      h5: config.typography?.fontSize?.h5 || '16px',
      h6: config.typography?.fontSize?.h6 || '14px',
      code: config.typography?.fontSize?.code || '14px',
      inlineCode: config.typography?.fontSize?.inlineCode || '14px'
    },
    fontWeight: {
      normal: config.typography?.fontWeight?.normal || '400',
      medium: config.typography?.fontWeight?.medium || '500',
      bold: config.typography?.fontWeight?.bold || '600'
    }
  },
  
  // 间距设置
  spacing: {
    xs: config.spacing?.xs || '4px',
    sm: config.spacing?.sm || '8px',
    md: config.spacing?.md || '16px',
    lg: config.spacing?.lg || '24px',
    xl: config.spacing?.xl || '32px',
    xxl: config.spacing?.xxl || '48px',
    // 特定元素间距
    paragraphMargin: config.spacing?.paragraphMargin || '12px 0',
    headingMargin: config.spacing?.headingMargin || {
      h1: '32px 0 20px 0',
      h2: '24px 0 16px 0',
      h3: '20px 0 12px 0'
    },
    codeBlockMargin: config.spacing?.codeBlockMargin || '32px 0',
    tableMargin: config.spacing?.tableMargin || '16px 0'
  },
  
  // 圆角设置
  borderRadius: {
    sm: config.borderRadius?.sm || '4px',
    md: config.borderRadius?.md || '8px',
    lg: config.borderRadius?.lg || '12px',
    xl: config.borderRadius?.xl || '16px'
  },
  
  // 阴影设置
  shadows: {
    sm: config.shadows?.sm || '0 1px 3px rgba(0,0,0,0.1)',
    md: config.shadows?.md || '0 4px 16px rgba(0,0,0,0.1)',
    lg: config.shadows?.lg || '0 8px 32px rgba(0,0,0,0.15)'
  }
})

/**
 * 创建代码样式的工厂函数
 * @param {Object} config - 代码样式配置
 * @returns {Object} - 完整的代码样式对象
 */
export const createCodeStyle = (config) => ({
  // 基础信息
  id: config.id,
  name: config.name,
  description: config.description,
  
  // 容器样式
  background: config.background,
  borderRadius: config.borderRadius || '12px',
  padding: config.padding || '48px 24px 24px 24px',
  margin: config.margin || '32px 0',
  border: config.border || 'none',
  boxShadow: config.boxShadow || 'none',
  
  // 文字样式
  color: config.color,
  fontSize: config.fontSize || '14px',
  lineHeight: config.lineHeight || '1.7',
  fontFamily: config.fontFamily || "'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Consolas', 'Liberation Mono', 'Courier New', monospace",
  fontWeight: config.fontWeight || '400',
  
  // 装饰元素
  hasTrafficLights: config.hasTrafficLights || false,
  trafficLightsStyle: config.trafficLightsStyle || '',
  hasHeader: config.hasHeader || false,
  headerStyle: config.headerStyle || '',
  headerContent: config.headerContent || '',
  
  // 语法高亮
  syntaxHighlight: config.syntaxHighlight || {},
  
  // 特殊效果
  hasGlow: config.hasGlow || false,
  glowColor: config.glowColor || '',
  
  // 响应式
  mobileStyles: config.mobileStyles || {}
})

/**
 * 创建主题系统的工厂函数
 * @param {Object} config - 主题系统配置
 * @returns {Object} - 完整的主题系统对象
 */
export const createThemeSystem = (config) => ({
  // 基本信息
  id: config.id,
  name: config.name,
  description: config.description,
  
  // 支持的主题色列表
  supportedColors: config.supportedColors || ['green', 'blue', 'red', 'purple', 'orange', 'pink'],
  
  // 默认主题色
  defaultColor: config.defaultColor || 'green',
  
  // 布局设置
  layout: config.layout || {},
  
  // 字体设置
  typography: {
    fontFamily: config.typography?.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
    codeFontFamily: config.typography?.codeFontFamily || '"SF Mono", "Monaco", "Inconsolata", "Fira Code", "Consolas", "Liberation Mono", "Courier New", monospace',
    fontSize: config.typography?.fontSize || {
      base: '16px',
      h1: '32px',
      h2: '24px',
      h3: '20px',
      h4: '18px',
      h5: '16px',
      h6: '14px',
      code: '14px'
    },
    fontWeight: config.typography?.fontWeight || {
      normal: '400',
      medium: '500',
      bold: '600'
    }
  },

  // 间距设置
  spacing: config.spacing || {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },

  // 圆角设置
  borderRadius: config.borderRadius || {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px'
  },

  // 阴影设置
  shadows: config.shadows || {
    sm: '0 1px 3px rgba(0,0,0,0.1)',
    md: '0 4px 16px rgba(0,0,0,0.1)',
    lg: '0 8px 32px rgba(0,0,0,0.15)'
  },
  
  // 特殊样式设置
  styles: {
    // 代码块样式
    codeBlock: {
      background: config.styles?.codeBlock?.background || '#f6f8fa',
      border: config.styles?.codeBlock?.border || '1px solid #d0d7de',
      borderRadius: config.styles?.codeBlock?.borderRadius || '8px',
      padding: config.styles?.codeBlock?.padding || '16px'
    },
    
    // 表格样式
    table: {
      borderCollapse: config.styles?.table?.borderCollapse || 'collapse',
      borderSpacing: config.styles?.table?.borderSpacing || '0',
      width: config.styles?.table?.width || '100%'
    },
    
    // 引用块样式
    blockquote: {
      borderLeft: config.styles?.blockquote?.borderLeft || '4px solid',
      paddingLeft: config.styles?.blockquote?.paddingLeft || '16px',
      margin: config.styles?.blockquote?.margin || '16px 0',
      fontStyle: config.styles?.blockquote?.fontStyle || 'italic'
    }
  }
})

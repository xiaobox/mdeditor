/**
 * @file src/core/theme/presets/base.js
 * @description 主题对象的基础配置和工厂函数
 *
 * 本文件定义了创建各种主题对象（颜色主题、代码样式、排版系统）的“工厂函数”。
 * 这些工厂函数是构建整个主题系统的基础，它们确保了每个主题对象都具有一致的结构和默认值。
 *
 * 主要功能:
 * 1.  **`createTheme(config)`**: 用于创建“颜色主题”对象。
 *     - 它接收一个配置对象 `config`，其中包含主题的核心属性（如 `id`, `name`, `primary` 色等）。
 *     - 它为大量非必需的样式属性（如各种背景色、文本色、边框色、间距、字体等）提供了合理的默认值。
 *     - 这使得在定义新主题时，只需要关注那些有特色的、需要覆盖的属性即可，大大简化了主题的创建过程。
 *
 * 2.  **`createCodeStyle(config)`**: 用于创建“代码高亮样式”对象。
 *     - 类似于 `createTheme`，它为代码块的容器样式、字体、装饰元素（如macOS红绿灯）和语法高亮颜色提供了默认值。
 *
 * 3.  **`createThemeSystem(config)`**: 用于创建“排版主题系统”对象。
 *     - 定义了更高层次的布局、排版和基础组件样式（如代码块、表格、引用）的规范。
 *
 * 设计思想:
 * - **约定优于配置 (Convention over Configuration)**: 通过提供大量的默认值，
 *   这些工厂函数建立了一套“约定”。主题的定义者只需要关心他们想要“配置”的少数几个关键部分，
 *   其他的则自动遵循这些约定。这降低了心智负担，提高了开发效率。
 * - **结构一致性**: 确保了所有同类型的主题对象都共享相同的属性结构，
 *   这使得在其他地方（如 `CSSVariableManager` 或 `social-formatter`）使用这些对象时，
 *   可以安全地访问其属性，而不必担心 `undefined` 错误。
 * - **可扩展性**: 如果未来需要为主题添加新的属性，只需在相应的工厂函数中添加该属性及其默认值即可，
 *   所有现有的主题定义将自动继承这个新属性，具有良好的向后兼容性。
 */

/**
 * 创建一个“颜色主题”对象。
 * @param {object} config - 主题的核心配置。
 * @returns {object} - 一个完整的、带有默认值的颜色主题对象。
 */
export const createTheme = (config) => ({
  // --- 基本信息 ---
  id: config.id,
  name: config.name,
  description: config.description,
  isDark: config.isDark || false, // 默认是亮色主题

  // --- 核心颜色 ---
  primary: config.primary,
  primaryHover: config.primaryHover,
  primaryLight: config.primaryLight, // 通常是 primary 的半透明版本
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
  blockquoteBorder: config.blockquoteBorder || config.primary, // 默认使用主色
  blockquoteBackground: config.blockquoteBackground || config.primaryLight, // 默认使用主色的浅色版
  hrColor: config.hrColor || config.primary, // 默认使用主色
  listColors: config.listColors || [config.primary, '#10A0FF', '#FA5151', '#666'],

  // --- 内联代码颜色 ---
  inlineCodeBg: config.inlineCodeBg || 'rgba(251, 146, 60, 0.08)',
  inlineCodeText: config.inlineCodeText || '#ea580c',
  inlineCodeBorder: config.inlineCodeBorder || 'rgba(251, 146, 60, 0.15)',

  // --- 布局与排版 (通常由 ThemeSystem 定义，但这里提供兜底) ---
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
 * 创建一个“代码高亮样式”对象。
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
 * 创建一个“排版主题系统”对象。
 * @param {object} config - 排版系统的核心配置。
 * @returns {object} - 一个完整的、带有默认值的排版系统对象。
 */
export const createThemeSystem = (config) => ({
  // --- 基本信息 ---
  id: config.id,
  name: config.name,
  description: config.description,

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
      borderLeft: '4px solid', // 颜色将由主题主色决定
      paddingLeft: '16px',
      margin: '16px 0',
      ...config.styles?.blockquote,
    },
    ...config.styles,
  },
});
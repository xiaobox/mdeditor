/**
 * @file tests/shared/mock-data.js
 * @description 测试用模拟数据
 */

/**
 * 模拟颜色主题
 */
export const mockColorTheme = {
  id: 'test-theme',
  name: '测试主题',
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  primaryLight: 'rgba(59, 130, 246, 0.08)',
  primaryDark: '#1d4ed8',
  inlineCodeBg: 'rgba(59, 130, 246, 0.08)',
  inlineCodeText: '#1d4ed8',
  inlineCodeBorder: 'rgba(59, 130, 246, 0.15)'
}

/**
 * 模拟自定义主题
 */
export const mockCustomTheme = {
  id: 'custom-test',
  name: '自定义测试',
  primary: '#ff0000',
  primaryHover: '#cc0000',
  primaryLight: 'rgba(255, 0, 0, 0.08)',
  primaryDark: '#990000',
  inlineCodeBg: 'rgba(255, 0, 0, 0.08)',
  inlineCodeText: '#990000',
  inlineCodeBorder: 'rgba(255, 0, 0, 0.15)'
}

/**
 * 模拟字体设置
 */
export const mockFontSettings = {
  fontFamily: 'system-ui',
  fontSize: 16,
  letterSpacing: 0,
  lineHeight: 1.6
}

/**
 * 模拟 Markdown 内容
 */
export const mockMarkdownContent = {
  simple: '# Hello World\n\nThis is a test.',
  withCode: '# Code Example\n\n```javascript\nconst x = 1;\n```',
  withList: '# List\n\n- Item 1\n- Item 2\n- Item 3',
  withTable: '| A | B |\n|---|---|\n| 1 | 2 |',
  complex: '# Complex\n\n**Bold** and *italic* and `code`\n\n> Quote\n\n1. One\n2. Two'
}

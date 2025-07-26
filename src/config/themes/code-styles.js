/**
 * 代码样式配置
 * 包含所有可用的代码样式定义
 */

import { createCodeStyle } from './base.js'

// 代码样式定义
export const codeStyles = {
  // Mac 风格
  mac: createCodeStyle({
    id: 'mac',
    name: 'Mac 风格',
    description: '经典的 macOS 终端风格，深色背景配红绿灯',
    background: '#1e1e1e',
    color: '#e6edf3',
    hasTrafficLights: true,
    trafficLightsStyle: `
      position: absolute;
      top: 13px;
      left: 16px;
      font-size: 22px;
      line-height: 1;
      z-index: 2;
      letter-spacing: 4px;
    `,
    boxShadow: 'none',
    syntaxHighlight: {
      keyword: '#ff7b72',
      string: '#a5d6ff',
      comment: '#8b949e',
      number: '#79c0ff',
      function: '#d2a8ff'
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
    boxShadow: 'none',
    hasHeader: true,
    headerStyle: `
      background: #f1f3f4;
      border-bottom: 1px solid #d0d7de;
      padding: 8px 16px;
      border-radius: 7px 7px 0 0;
      font-size: 12px;
      color: #656d76;
      font-weight: 500;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1;
      box-sizing: border-box;
    `,
    headerContent: '📄 代码',
    syntaxHighlight: {
      keyword: '#cf222e',
      string: '#0a3069',
      comment: '#6e7781',
      number: '#0550ae',
      function: '#8250df'
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
    boxShadow: 'none',
    hasHeader: true,
    headerStyle: `
      background: linear-gradient(135deg, #2d2d30 0%, #3c3c3c 100%);
      border-bottom: 1px solid #3c3c3c;
      padding: 10px 20px;
      border-radius: 9px 9px 0 0;
      font-size: 13px;
      color: #cccccc;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1;
      box-sizing: border-box;
    `,
    headerContent: '⚡ 代码片段',
    hasGlow: false,
    syntaxHighlight: {
      keyword: '#569cd6',
      string: '#ce9178',
      comment: '#6a9955',
      number: '#b5cea8',
      function: '#dcdcaa'
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
    boxShadow: 'none',
    fontFamily: "'Courier New', 'Monaco', monospace",
    hasHeader: true,
    headerStyle: `
      background: #1a1a1a;
      border-bottom: 1px solid #333333;
      padding: 8px 20px;
      border-radius: 4px 4px 0 0;
      font-size: 12px;
      color: #00ff00;
      font-weight: bold;
      font-family: 'Courier New', monospace;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1;
      box-sizing: border-box;
    `,
    headerContent: '$ terminal',
    hasGlow: false,
    syntaxHighlight: {
      keyword: '#00ffff',
      string: '#ffff00',
      comment: '#808080',
      number: '#ff00ff',
      function: '#00ff00'
    }
  })
}

// 默认代码样式
export const defaultCodeStyle = codeStyles.mac

// 获取代码样式
export const getCodeStyle = (styleId) => {
  return codeStyles[styleId] || defaultCodeStyle
}

// 获取代码样式列表
export const getCodeStyleList = () => {
  return Object.values(codeStyles).map(style => ({
    id: style.id,
    name: style.name,
    description: style.description
  }))
}

// 代码样式工具函数
export const codeStyleUtils = {
  // 检查是否为深色代码样式
  isDarkCodeStyle: (styleId) => {
    return ['mac', 'vscode', 'terminal'].includes(styleId)
  },

  // 获取对比代码样式
  getContrastCodeStyle: (styleId) => {
    return codeStyleUtils.isDarkCodeStyle(styleId) ? 'github' : 'mac'
  },

  // 获取相似代码样式
  getSimilarCodeStyles: (styleId) => {
    const similarMap = {
      mac: ['vscode', 'terminal'],
      github: ['vscode'],
      vscode: ['mac', 'github'],
      terminal: ['mac']
    }
    return similarMap[styleId] || ['mac', 'github']
  }
}

// 代码样式预设
export const codeStylePresets = {
  all: ['mac', 'github', 'vscode', 'terminal'],
  dark: ['mac', 'vscode', 'terminal'],
  light: ['github'],
  modern: ['vscode', 'github'],
  retro: ['terminal', 'mac']
}

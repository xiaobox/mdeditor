/**
 * @file src/config/themes/code-styles.js
 * @description 代码高亮样式的定义文件
 *
 * 本文件集中定义了所有可用的代码高亮样式（Code Style）。
 * 每个代码样式都是一个通过 `createCodeStyle` 工厂函数创建的对象，
 * 这确保了它们都具有一致的结构和默认值。
 *
 * 主要内容:
 * 1.  **样式定义 (`codeStyles`)**: 一个包含了所有代码样式对象的集合。
 *     目前定义了四种风格：
 *     - `mac`: 模仿 macOS 终端的深色样式，带有标志性的“红绿灯”按钮。
 *     - `github`: 模仿 GitHub 网站的浅色代码块样式，简洁清晰。
 *     - `vscode`: 模仿 VS Code 编辑器的深色样式，具有现代感。
 *     - `terminal`: 模仿老式终端的风格，黑底绿字，复古感十足。
 *     每个对象都详细定义了背景、颜色、边框、字体、语法高亮颜色等属性。
 *
 * 2.  **默认导出 (`defaultCodeStyle`)**: 指定一个默认的代码样式，当无法加载用户设置时使用。
 *
 * 3.  **工具函数 (`getCodeStyle`, `getCodeStyleList`, `codeStyleUtils`)**: 
 *     - `getCodeStyle(id)`: 根据 ID 安全地获取一个代码样式对象，如果 ID 无效则返回默认样式。
 *     - `getCodeStyleList()`: 返回一个简化的列表，只包含 `id`, `name`, `description`，
 *       主要用于在 UI（如设置面板的下拉菜单）中展示所有可用的代码样式。
 *     - `codeStyleUtils`: 提供一些辅助逻辑，如判断一个样式是深色还是浅色。
 *
 * 4.  **预设 (`codeStylePresets`)**: 定义了一些代码样式的分组，例如 `dark` 分组包含了所有深色样式。
 *     这可以用于在 UI 中提供分类筛选功能。
 */

import { createCodeStyle } from './base.js';

/**
 * 包含所有预定义代码高亮样式的对象。
 */
export const codeStyles = {
  // Mac 风格: 经典的 macOS 终端深色风格
  mac: createCodeStyle({
    id: 'mac',
    name: 'Mac 风格',
    description: '经典的 macOS 终端风格，深色背景配红绿灯',
    background: '#1e1e1e',
    color: '#e6edf3',
    hasTrafficLights: true,
    trafficLightsStyle: `position: absolute; top: 14px; left: 12px; font-size: 16px; line-height: 1; z-index: 2; letter-spacing: 5px;`,
    syntaxHighlight: {
      keyword: '#ff7b72',  // 关键字 - 珊瑚红
      string: '#a5d6ff',   // 字符串 - 天空蓝
      comment: '#8b949e',  // 注释 - 中性灰
      number: '#79c0ff',   // 数字 - 亮蓝色
      function: '#d2a8ff', // 函数 - 淡紫色
    }
  }),

  // GitHub 风格: 清爽的 GitHub 浅色风格
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
    headerStyle: `background: #f1f3f4; border-bottom: 1px solid #d0d7de; padding: 8px 16px; border-radius: 7px 7px 0 0; font-size: 12px; color: #656d76; position: absolute; top: 0; left: 0; right: 0; z-index: 1;`,
    headerContent: '📄 代码',
    syntaxHighlight: {
      keyword: '#d73a49',  // 关键字 - GitHub 红
      string: '#032f62',   // 字符串 - 深蓝色
      comment: '#6a737d',  // 注释 - 温和灰
      number: '#005cc5',   // 数字 - 蓝色
      function: '#6f42c1', // 函数 - 紫色
    }
  }),

  // VS Code 风格: 现代的 VS Code 编辑器深色风格
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
    headerStyle: `background: linear-gradient(135deg, #2d2d30 0%, #3c3c3c 100%); border-bottom: 1px solid #3c3c3c; padding: 10px 20px; border-radius: 9px 9px 0 0; font-size: 13px; color: #cccccc; position: absolute; top: 0; left: 0; right: 0; z-index: 1;`,
    headerContent: '⚡ 代码片段',
    syntaxHighlight: {
      keyword: '#569cd6',  // 关键字 - VS Code 蓝
      string: '#ce9178',   // 字符串 - 温暖橙
      comment: '#6a9955',  // 注释 - 森林绿
      number: '#b5cea8',   // 数字 - 淡绿色
      function: '#dcdcaa', // 函数 - 淡黄色
    }
  }),

  // 终端风格: 复古的终端黑底绿字风格
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
    headerStyle: `background: #1a1a1a; border-bottom: 1px solid #333333; padding: 8px 20px; border-radius: 4px 4px 0 0; font-size: 12px; color: #00ff00; font-family: 'Courier New', monospace; position: absolute; top: 0; left: 0; right: 0; z-index: 1;`,
    headerContent: '$ terminal',
    syntaxHighlight: {
      keyword: '#00ffff',  // 关键字 - 青色
      string: '#ffff00',   // 字符串 - 黄色
      comment: '#808080',  // 注释 - 灰色
      number: '#ff00ff',   // 数字 - 洋红色
      function: '#00ff00', // 函数 - 绿色
    }
  }),
};

/** 默认的代码样式 */
export const defaultCodeStyle = codeStyles.mac;

/**
 * 根据 ID 获取代码样式对象。
 * @param {string} styleId - 代码样式的 ID。
 * @returns {object} - 对应的代码样式对象，如果找不到则返回默认样式。
 */
export const getCodeStyle = (styleId) => {
  return codeStyles[styleId] || defaultCodeStyle;
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
 * 这个对象定义了样式的分组，用于在 UI 中展示和快速切换。
 */
export const codeStylePresets = {
  // 所有样式 ID
  all: Object.keys(codeStyles),
  
  // 深色样式
  dark: ['mac', 'vscode', 'terminal'],
  
  // 浅色样式
  light: ['github'],
  
  // 经典样式
  classic: ['mac', 'github'],
};
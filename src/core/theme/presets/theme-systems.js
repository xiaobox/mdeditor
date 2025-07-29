/**
 * @file src/config/themes/theme-systems.js
 * @description 排版主题系统的定义文件
 *
 * 本文件定义了更高层次的“排版主题系统”（Theme System）。
 * 一个排版主题系统规定了文章的整体布局、字体、间距、以及基础元素
 * （如代码块、引用块）的宏观样式规范。它与“颜色主题”和“代码样式”相分离，
 * 允许用户独立地控制这三个维度。
 *
 * 主要内容:
 * 1.  **系统定义 (`themeSystems`)**: 一个包含了所有排版主题系统对象的集合。
 *     目前定义了一种系统：
 *     - `default`: 专为社交平台优化的经典主题，注重简洁和阅读性。
 *     每个系统都通过 `createThemeSystem` 工厂函数创建，确保结构一致。
 *
 * 2.  **默认导出 (`defaultThemeSystem`)**: 指定默认的排版系统。
 *
 * 3.  **工具函数 (`getThemeSystem`, `getThemeSystemList`)**: 
 *     - `getThemeSystem(id)`: 根据 ID 安全地获取一个排版系统对象。
 *     - `getThemeSystemList()`: 返回一个简化的列表，用于在 UI 中展示所有可用的系统。
 *
 * 4.  **预设 (`themeSystemPresets`)**: 定义了排版系统的分组，
 *     为未来的扩展（如增加“掘金风格”、“知乎风格”等）预留了结构。
 *
 * 设计思想:
 * - **关注点分离 (Separation of Concerns)**: 这是整个主题系统设计的核心原则。
 *   将“色彩”（Color Theme）、“代码块微观样式”（Code Style）和“整体排版宏观样式”
 *   （Theme System）三者分离，提供了极高的灵活性和可组合性。用户可以自由组合，
 *   例如使用“默认主题”的排版，搭配“深海蓝”的颜色和“VS Code”的代码样式。
 * - **宏观控制**: Theme System 负责定义整体的视觉基调和规范，而 Color Theme 和
 *   Code Style 则在此基础上进行具体的“着色”和“微调”。
 */

import { createThemeSystem } from './base.js';

/**
 * 包含所有预定义排版主题系统的对象。
 */
export const themeSystems = {
  // 默认主题: 统一的现代化主题
  default: createThemeSystem({
    id: 'default',
    name: '默认主题',
    description: '现代化Markdown编辑器统一主题，简洁优雅',
    supportedColors: ['green'],
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
};

/** 默认的排版主题系统 */
export const defaultThemeSystem = themeSystems.default;

/**
 * 根据 ID 获取排版主题系统对象。
 * @param {string} systemId - 排版系统的 ID。
 * @returns {object} - 对应的排版系统对象，如果找不到则返回默认系统。
 */
export const getThemeSystem = (systemId) => {
  return themeSystems[systemId] || defaultThemeSystem;
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
 * 主题系统预设 - 简化为单一默认主题
 */
export const themeSystemPresets = {
  all: ['default'],
  default: ['default'], // 统一默认主题
};
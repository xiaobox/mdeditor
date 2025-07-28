/**
 * @file src/composables/theme/index.js
 * @description 主题相关组合式API统一导出
 * 
 * 重构后的模块化组织，将主题相关的所有composables集中管理
 */

// 主题管理器
export { useThemeManager, useGlobalThemeManager } from './useThemeManager.js';

// 主题监听器
export { useThemeWatcher } from './useThemeWatcher.js'; 
/**
 * @file src/composables/useThemeWatcher.js
 * @description 主题变化监听管理 Composable
 * 
 * 专门负责监听主题变化并触发相应的编辑器重新初始化逻辑
 */

import { watch } from 'vue';

/**
 * 主题变化监听管理
 * @param {Object} dependencies - 依赖项
 * @param {Object} dependencies.editorTheme - 编辑器主题管理
 * @param {Function} dependencies.reinitEditor - 重新初始化编辑器的函数
 * @param {string} theme - 主题模式 ('auto', 'light', 'dark')
 * @returns {Object} 主题监听相关方法
 */
export function useThemeWatcher({ editorTheme, reinitEditor }, theme = 'auto') {
  /**
   * 设置主题监听器
   * 监听主题变化，自动重新初始化编辑器
   */
  const setupThemeWatchers = () => {
    // 监听当前主题变化，自动重新初始化编辑器
    const stopThemeWatcher = watch(editorTheme.currentTheme, () => {
      reinitEditor();
    });

    // 如果使用 'auto' 主题，还需监听全局颜色主题的变化
    let stopColorThemeWatcher = null;
    if (theme === 'auto') {
      stopColorThemeWatcher = watch(
        () => editorTheme.themeManager.currentColorTheme.value,
        () => {
          // reinitEditor() 会由上面的 currentTheme watcher 触发
        },
        { deep: true }
      );
    }

    return {
      stopThemeWatcher,
      stopColorThemeWatcher
    };
  };

  /**
   * 清理监听器
   * @param {Object} watchers - 监听器对象
   */
  const cleanupWatchers = (watchers) => {
    if (watchers.stopThemeWatcher) {
      watchers.stopThemeWatcher();
    }
    if (watchers.stopColorThemeWatcher) {
      watchers.stopColorThemeWatcher();
    }
  };

  /**
   * 手动触发主题更新
   * 用于需要强制更新主题的场景
   */
  const forceThemeUpdate = () => {
    reinitEditor();
  };

  return {
    setupThemeWatchers,
    cleanupWatchers,
    forceThemeUpdate
  };
} 
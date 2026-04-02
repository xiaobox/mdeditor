/**
 * @file src/composables/editor/useEditorTheme.js
 * @description 编辑器主题管理 Composable
 * 
 * 专门负责处理编辑器的主题相关逻辑
 */

import { computed } from 'vue';
import { EditorView } from 'codemirror';
import { Compartment } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { useGlobalThemeManager } from '../theme/useThemeManager.js';

/**
 * 编辑器主题管理
 * @param {string} theme - 主题模式 ('auto'|'light'|'dark')
 * @returns {Object} 主题管理对象
 */
export function useEditorTheme(theme = 'auto') {
  // 获取全局主题管理器实例
  const themeManager = useGlobalThemeManager();

  // 使用 Compartment 支持运行时主题热替换，无需重建编辑器
  const themeCompartment = new Compartment();

  /**
   * 根据配置和全局主题计算出当前应使用的编辑器主题
   */
  const currentTheme = computed(() => {
    if (theme === 'auto') {
      const colorTheme = themeManager.currentColorTheme.value;
      return colorTheme?.isDark ? 'dark' : 'light';
    }
    return theme;
  });

  /**
   * 创建 CodeMirror 的基础主题扩展
   * @returns {import('@codemirror/state').Extension}
   */
  const getEditorTheme = () => {
    return EditorView.theme({
      '&': {
        height: '100%',
      },
      '.cm-scroller': {
        fontFamily: '"SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        fontSize: '14px',
        lineHeight: '1.6',
        overflowX: 'hidden'
      },
      '.cm-focused': {
        outline: 'none'
      },
      '.cm-editor': {
        height: '100%'
      },
      '.cm-content': {
        padding: '16px',
        minHeight: '100%',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      },
      '.cm-line': {
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }
    });
  };

  /**
   * 获取当前主题对应的 dark mode 扩展
   * @returns {import('@codemirror/state').Extension}
   */
  const getDarkModeExtension = () => {
    return currentTheme.value === 'dark' ? oneDark : [];
  };

  /**
   * 获取编辑器扩展数组（使用 Compartment 包裹 dark mode 扩展）
   * @returns {Array} 扩展数组
   */
  const getEditorExtensions = () => {
    return [
      getEditorTheme(),
      themeCompartment.of(getDarkModeExtension())
    ];
  };

  /**
   * 运行时重配置主题扩展，无需重建编辑器
   * 保留光标位置、撤销历史和滚动位置
   * @param {import('@codemirror/view').EditorView} editorView
   */
  const reconfigureTheme = (editorView) => {
    if (!editorView) return
    editorView.dispatch({
      effects: themeCompartment.reconfigure(getDarkModeExtension())
    })
  };

  return {
    currentTheme,
    themeManager,
    getEditorTheme,
    getEditorExtensions,
    reconfigureTheme
  };
} 

/**
 * @file src/composables/editor/useEditorState.js
 * @description 编辑器状态管理 Composable
 * 
 * 专门负责管理编辑器的基础状态，包括内容、DOM引用等
 */

import { ref, computed } from 'vue';

/**
 * 编辑器状态管理
 * @param {string} initialValue - 初始内容
 * @returns {Object} 状态管理对象
 */
export function useEditorState(initialValue = '') {
  // 响应式状态
  const editorElement = ref(null);
  const content = ref(initialValue);
  
  // 编辑器实例引用（非响应式）
  let editorView = null;

  /**
   * 设置编辑器实例
   * @param {EditorView} view - CodeMirror 编辑器实例
   */
  const setEditorView = (view) => {
    editorView = view;
  };

  /**
   * 获取编辑器实例
   * @returns {EditorView|null} 编辑器实例
   */
  const getEditorView = () => editorView;

  /**
   * 更新内容
   * @param {string} newContent - 新内容
   */
  const updateContent = (newContent) => {
    content.value = newContent;
  };

  /**
   * 检查编辑器是否已初始化
   */
  const isInitialized = computed(() => editorView !== null);

  return {
    // 响应式状态
    editorElement,
    content,
    isInitialized,

    // 方法
    setEditorView,
    getEditorView,
    updateContent
  };
} 
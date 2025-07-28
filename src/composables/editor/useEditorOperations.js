/**
 * @file src/composables/useEditorOperations.js
 * @description 编辑器操作管理 Composable
 * 
 * 专门负责包装编辑器的操作方法
 */

import { toolbarOperations } from '../../core/editor/operations.js';

/**
 * 编辑器操作管理
 * @param {Function} getEditorView - 获取编辑器实例的函数
 * @returns {Object} 操作方法对象
 */
export function useEditorOperations(getEditorView) {
  /**
   * 创建包装后的工具栏操作对象
   * @returns {Object} 工具栏操作方法的集合
   */
  const createToolbarOperations = () => {
    const wrappedOperations = {};

    Object.keys(toolbarOperations).forEach(operationKey => {
      wrappedOperations[operationKey] = (...operationArgs) => {
        const editorView = getEditorView();
        if (editorView) {
          toolbarOperations[operationKey](editorView, ...operationArgs);
        }
      };
    });

    return wrappedOperations;
  };

  return {
    ...createToolbarOperations()
  };
} 
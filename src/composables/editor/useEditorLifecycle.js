/**
 * @file src/composables/useEditorLifecycle.js
 * @description 编辑器生命周期管理 Composable
 * 
 * 专门负责管理 CodeMirror 编辑器的创建、销毁和重新初始化逻辑
 */

import { onMounted, onUnmounted } from 'vue';
import { EditorView, basicSetup } from 'codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { EditorState } from '@codemirror/state';
import { indentUnit, indentOnInput } from '@codemirror/language';
import { keymap } from '@codemirror/view';
import { indentMore, indentLess } from '@codemirror/commands';
import { EDITOR_CONFIG } from '../../config/constants/editor.js';

/**
 * 编辑器生命周期管理
 * @param {Object} dependencies - 依赖项
 * @param {Object} dependencies.editorState - 编辑器状态管理
 * @param {Object} dependencies.editorEvents - 编辑器事件管理
 * @param {Object} dependencies.editorTheme - 编辑器主题管理
 * @returns {Object} 生命周期管理方法
 */
export function useEditorLifecycle({ editorState, editorEvents, editorTheme }) {
  /**
   * 初始化 CodeMirror 编辑器
   */
  const initEditor = () => {
    if (!editorState.editorElement.value || editorState.getEditorView()) return;

    // 创建更新监听器
    const updateListener = EditorView.updateListener.of(
      editorEvents.createUpdateListener(editorState.updateContent)
    );

    // 配置缩进和键绑定
    const indentConfig = [
      indentUnit.of(' '.repeat(EDITOR_CONFIG.TAB_SIZE)),
      indentOnInput(),
      keymap.of([
        {
          key: 'Tab',
          run: indentMore
        },
        {
          key: 'Shift-Tab',
          run: indentLess
        },
        {
          key: 'Ctrl-]',
          run: indentMore
        },
        {
          key: 'Ctrl-[',
          run: indentLess
        }
      ])
    ];

    // 获取编辑器扩展
    const extensions = [
      basicSetup,
      markdown(),
      ...indentConfig,
      updateListener,
      ...editorTheme.getEditorExtensions(updateListener)
    ];

    // 启用软换行，避免横向滚动条
    if (EDITOR_CONFIG.WORD_WRAP && EditorView && EditorView.lineWrapping) {
      extensions.push(EditorView.lineWrapping)
    }

    // 创建编辑器状态
    const state = EditorState.create({
      doc: editorState.content.value,
      extensions
    });

    // 创建编辑器视图
    const editorView = new EditorView({
      state,
      parent: editorState.editorElement.value
    });

    // 设置编辑器实例
    editorState.setEditorView(editorView);

    // 绑定滚动事件
    editorEvents.bindScrollListener(editorView);
  };

  /**
   * 销毁 CodeMirror 编辑器实例，清理资源
   */
  const destroyEditor = () => {
    const editorView = editorState.getEditorView();
    if (editorView) {
      // 解绑滚动事件
      editorEvents.unbindScrollListener(editorView);
      
      // 销毁编辑器
      editorView.destroy();
      editorState.setEditorView(null);
    }
  };

  /**
   * 重新初始化编辑器
   * 通常在主题等需要完全重建编辑器的配置变化时调用
   */
  const reinitEditor = () => {
    destroyEditor();
    initEditor();
  };

  /**
   * 以编程方式更新编辑器的内容
   * @param {string} newValue - 新的 Markdown 内容
   */
  const updateContent = (newValue) => {
    const editorView = editorState.getEditorView();
    if (newValue !== editorState.content.value && editorView) {
      const transaction = editorView.state.update({
        changes: {
          from: 0,
          to: editorView.state.doc.length,
          insert: newValue
        }
      });
      editorView.dispatch(transaction);
      // content.value 会在 updateListener 中被更新，这里无需重复设置
    }
  };

  // 生命周期钩子
  onMounted(() => {
    // 使用 setTimeout 确保父组件的 DOM 已经完全渲染
    setTimeout(initEditor, 0);
  });

  onUnmounted(() => {
    destroyEditor();
  });

  return {
    initEditor,
    destroyEditor,
    reinitEditor,
    updateContent
  };
} 
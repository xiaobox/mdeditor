/**
 * @file src/composables/editor/useEditorEvents.js
 * @description 编辑器事件处理 Composable
 * 
 * 专门负责处理编辑器的各种事件，如内容变化、滚动等
 */

/**
 * 编辑器事件处理
 * @param {Function} onContentChange - 内容变化回调
 * @param {Function} onScroll - 滚动回调
 * @returns {Object} 事件处理对象
 */
export function useEditorEvents(onContentChange = () => {}, onScroll = () => {}) {
  /**
   * 创建内容变化监听器
   * @param {Function} updateContent - 内容更新函数
   * @returns {Function} 更新监听器
   */
  const createUpdateListener = (updateContent) => {
    return (update) => {
      if (update.docChanged) {
        const newContent = update.state.doc.toString();
        updateContent(newContent);
        onContentChange(newContent);
      }
    };
  };

  /**
   * 处理编辑器滚动事件
   * @param {Event} e - 滚动事件对象
   */
  const handleScroll = (e) => {
    const element = e.target;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;

    const maxScrollTop = Math.max(0, scrollHeight - clientHeight);
    const scrollPercentage = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0;

    onScroll(scrollPercentage);
  };

  /**
   * 绑定滚动事件监听器
   * @param {EditorView} editorView - 编辑器实例
   */
  const bindScrollListener = (editorView) => {
    if (editorView) {
      const scrollElement = editorView.scrollDOM;
      scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    }
  };

  /**
   * 解绑滚动事件监听器
   * @param {EditorView} editorView - 编辑器实例
   */
  const unbindScrollListener = (editorView) => {
    if (editorView) {
      const scrollElement = editorView.scrollDOM;
      if (scrollElement) {
        scrollElement.removeEventListener('scroll', handleScroll);
      }
    }
  };

  return {
    createUpdateListener,
    handleScroll,
    bindScrollListener,
    unbindScrollListener
  };
} 
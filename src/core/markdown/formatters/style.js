/**
 * @file src/core/markdown/formatters/style.js
 * @description 基础样式格式处理器
 * 
 * 负责处理 Markdown 基础样式：
 * - 粗体文本（**text** 或 __text__）
 * - 斜体文本（*text* 或 _text_）
 * - 粗斜体组合（***text*** 或 ___text___）
 * - 删除线文本（~~text~~）
 * 
 * 从内联处理管道中抽离，增强可维护性与复用性。
 */

/**
 * 处理粗体和斜体文本的组合格式
 * 使用改进的算法处理嵌套格式，支持星号和下划线语法
 * 这是最核心的样式处理函数，能正确处理各种嵌套情况
 * 
 * @param {string} text - 包含格式标记的文本
 * @param {Object} theme - 主题对象
 * @returns {string} - 处理后的文本
 */
export function processBoldAndItalic(text, theme) {
  const transform = (input) => {
    let result = input;

    // 首先处理粗斜体 ***text*** 和 ___text___
    result = result.replace(/\*\*\*(.*?)\*\*\*/g, (_, content) => {
      return `<strong><em style="color: ${theme.primary}; font-style: italic; font-weight: 900;">${content}</em></strong>`;
    });

    result = result.replace(/_{3}(.*?)_{3}/g, (_, content) => {
      return `<strong><em style="color: ${theme.primary}; font-style: italic; font-weight: 900;">${content}</em></strong>`;
    });

    // 处理嵌套的粗体包含斜体的情况: **text*italic*text**
    // 使用更精确的正则表达式，确保正确匹配完整的粗体块
    result = result.replace(/\*\*([^*]*(?:\*[^*]+\*[^*]*)*)\*\*/g, (match, content) => {
      // 处理内部的斜体
      const processedContent = content.replace(/\*([^*]+)\*/g, '<em style="color: ' + theme.textSecondary + '; font-style: italic;">$1</em>');
      return `<strong style="color: ${theme.primary}; font-weight: 900;">${processedContent}</strong>`;
    });

    // 处理下划线粗体包含斜体: __text_italic_text__
    result = result.replace(/__([^_]*(?:_[^_]+_[^_]*)*)__/g, (match, content) => {
      // 处理内部的斜体
      const processedContent = content.replace(/_([^_]+)_/g, '<em style="color: ' + theme.textSecondary + '; font-style: italic;">$1</em>');
      return `<strong style="color: ${theme.primary}; font-weight: 900;">${processedContent}</strong>`;
    });

    // 处理剩余的独立粗体 **text**（不包含嵌套格式）
    result = result.replace(/\*\*([^*]+)\*\*/g, (_, content) => {
      return `<strong style="color: ${theme.primary}; font-weight: 900;">${content}</strong>`;
    });

    result = result.replace(/__([^_]+)__/g, (_, content) => {
      return `<strong style="color: ${theme.primary}; font-weight: 900;">${content}</strong>`;
    });

    // 最后处理独立的斜体 *text*（不在粗体内的）
    result = result.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, (_, content) => {
      return `<em style="color: ${theme.textSecondary}; font-style: italic;">${content}</em>`;
    });

    result = result.replace(/(?<!_)_([^_]+)_(?!_)/g, (_, content) => {
      return `<em style="color: ${theme.textSecondary}; font-style: italic;">${content}</em>`;
    });

    return result;
  };

  // 仅对标签外文本应用样式替换，避免破坏已有 HTML/属性（例如图片 src 中的下划线）
  return text.split(/(<[^>]+>)/g).map(seg => (seg && seg.startsWith('<')) ? seg : transform(seg)).join('');
}

/**
 * 处理粗体文本
 * 支持星号和下划线语法，为保持向后兼容性而保留
 * 实际处理委托给 processBoldAndItalic 函数
 * 
 * @param {string} text - 包含粗体标记的文本
 * @param {Object} theme - 主题对象
 * @returns {string} - 处理后的文本
 */
export function processBold(text, theme) {
  // 这个函数现在主要用于向后兼容
  return processBoldAndItalic(text, theme);
}

/**
 * 处理斜体文本
 * 支持星号和下划线语法，为保持向后兼容性而保留
 * 
 * 注意：实际的斜体处理在 processBoldAndItalic 中完成，
 * 这个函数主要用于向后兼容
 * 
 * @param {string} text - 包含斜体标记的文本
 * @param {Object} theme - 主题对象（未使用）
 * @returns {string} - 处理后的文本
 */
export function processItalic(text, _theme) {
  // 这个函数现在主要用于向后兼容，实际处理在 processBoldAndItalic 中完成
  return text;
}

/**
 * 处理删除线文本
 * 使用 ~~text~~ 语法创建删除线效果
 * 常用于标注已删除或过时的内容
 * 
 * @param {string} text - 包含删除线标记的文本
 * @param {Object} theme - 主题对象
 * @returns {string} - 处理后的文本
 */
export function processStrikethrough(text, theme) {
  return text.replace(/~~(.*?)~~/g, (_, content) => {
    return `<del style="color: ${theme.textMuted}; text-decoration: line-through;">${content}</del>`;
  });
} 
/**
 * @file src/utils/html-highlighter.js
 * @description HTML 语法高亮工具
 *
 * 本文件提供了一个轻量级的、无依赖的 HTML 语法高亮器。
 * 主要用于在预览面板中以美观、易读的方式展示由 Markdown 生成的 HTML 源代码。
 *
 * 主要功能:
 * 1.  **HTML 特殊字符转义**: `escapeHtml` 函数确保 HTML 字符串中的特殊字符（如 `<`, `>`, `&`）
 *     被正确转义，以防止浏览器将其作为真实 HTML 解析，从而避免 XSS 风险和显示错误。
 * 2.  **双主题支持**: 内置了 `dark` 和 `light` 两套配色方案 (`highlightThemes`)，
 *     可以根据应用的整体主题动态切换高亮颜色。
 * 3.  **基于正则的语法高亮**: `highlightHtml` 函数使用一系列正则表达式来匹配 HTML 的
 *     不同部分（如标签、属性、注释、DOCTYPE），并用带有内联样式的 `<span>` 标签包裹它们，
 *     从而实现语法着色。
 *
 * 设计思想:
 * - **性能与简洁性**: 采用正则表达式直接操作字符串，避免了构建复杂 AST (抽象语法树) 的开销，
 *   使得高亮处理速度快，实现简单。
 * - **安全第一**: 在进行任何高亮处理之前，首先对整个 HTML 输入进行转义，这是防止代码注入的关键步骤。
 * - **自包含**: 该模块不依赖任何外部语法高亮库（如 Prism.js 或 highlight.js），
 *   减少了项目的总体积和依赖复杂度。
 */

/**
 * 定义了亮色和暗色主题下的 HTML 语法高亮颜色。
 */
export const highlightThemes = {
  dark: {
    tag: '#7ee787',          // 标签的尖括号
    tagName: '#79c0ff',      // 标签名
    attribute: '#79c0ff',    // 属性名
    attributeValue: '#a5d6ff',// 属性值
    comment: '#7d8590',      // 注释
    text: '#e6edf3',          // 普通文本
    doctype: '#ff7b72'       // DOCTYPE
  },
  light: {
    tag: '#22863a',
    tagName: '#6f42c1',
    attribute: '#6f42c1',
    attributeValue: '#032f62',
    comment: '#6a737d',
    text: '#24292e',
    doctype: '#d73a49'
  }
};

/**
 * 转义 HTML 特殊字符，以防止浏览器解析它们。
 * @param {string} html - 需要转义的 HTML 字符串。
 * @returns {string} - 转义后的安全字符串。
 */
export const escapeHtml = (html) => {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/**
 * 对给定的 HTML 字符串应用语法高亮。
 * @param {string} html - 需要高亮的 HTML 字符串。
 * @param {'dark' | 'light'} [theme='dark'] - 使用的颜色主题。
 * @returns {string} - 包含内联样式 `<span>` 标签的高亮后 HTML 字符串。
 */
export const highlightHtml = (html, theme = 'dark') => {
  // 如果没有 HTML 内容，显示占位提示信息。
  if (!html) {
    return '<div class="html-placeholder">生成的HTML代码将在这里显示...</div>';
  }

  const colors = highlightThemes[theme] || highlightThemes.dark;
  
  // 1. 首先，对整个输入进行 HTML 转义，确保安全。
  let escaped = escapeHtml(html);

  // 2. 应用一系列正则表达式进行语法高亮。
  //    注意：处理顺序很重要，以避免错误的匹配。
  return escaped
    // DOCTYPE 声明
    .replace(/(&lt;!DOCTYPE[^&gt;]*&gt;)/gi, `<span style="color: ${colors.doctype};">$1</span>`)
    
    // HTML 注释
    .replace(/(&lt;!--[\s\S]*?--&gt;)/g, `<span style="color: ${colors.comment}; font-style: italic;">$1</span>`)
    
    // 标签（包括开始、结束和自闭合标签）
    // 使用回调函数来更精确地处理属性
    .replace(/(&lt;\/?)([\w-]+)([^&gt;]*)(\/?&gt;)/g, (match, open, tagName, attrs, close) => {
      const tagOpen = `<span style="color: ${colors.tag};">${open}</span>`;
      const tagClose = `<span style="color: ${colors.tag};">${close}</span>`;
      const name = `<span style="color: ${colors.tagName};">${tagName}</span>`;
      
      // 高亮属性
      const processedAttrs = attrs.replace(/([\w-]+)=(&quot;[^&quot;]*&quot;|&#39;[^&#39;]*&#39;)/g, 
        `<span style="color: ${colors.attribute};">$1</span>=<span style="color: ${colors.attributeValue};">$2</span>`
      );
      
      return tagOpen + name + processedAttrs + tagClose;
    });
};
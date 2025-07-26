/**
 * HTML 语法高亮工具
 * 提供 HTML 代码的语法高亮功能
 */

/**
 * HTML 语法高亮配色方案
 */
export const highlightThemes = {
  dark: {
    tag: '#7ee787',
    tagName: '#79c0ff',
    attribute: '#79c0ff',
    attributeValue: '#a5d6ff',
    comment: '#7d8590',
    text: '#e6edf3',
    doctype: '#ff7b72'
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
}

/**
 * 转义 HTML 特殊字符
 * @param {string} html - 需要转义的 HTML 字符串
 * @returns {string} 转义后的字符串
 */
export const escapeHtml = (html) => {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * HTML 语法高亮
 * @param {string} html - HTML 字符串
 * @param {string} theme - 主题名称 ('dark' | 'light')
 * @returns {string} 高亮后的 HTML
 */
export const highlightHtml = (html, theme = 'dark') => {
  if (!html) {
    return '<div class="html-placeholder">生成的HTML代码将在这里显示...</div>'
  }

  const colors = highlightThemes[theme] || highlightThemes.dark
  
  // 转义HTML以防止执行
  let escaped = escapeHtml(html)

  // 应用语法高亮
  return escaped
    // DOCTYPE 声明
    .replace(/(&lt;!DOCTYPE[^&gt;]*&gt;)/gi, `<span style="color: ${colors.doctype};">$1</span>`)
    
    // HTML 注释
    .replace(/(&lt;!--[\s\S]*?--&gt;)/g, `<span style="color: ${colors.comment}; font-style: italic;">$1</span>`)
    
    // 自闭合标签
    .replace(/(&lt;)(\w+)([^&gt;]*)(\/&gt;)/g, 
      `<span style="color: ${colors.tag};">$1</span><span style="color: ${colors.tagName};">$2</span>$3<span style="color: ${colors.tag};">$4</span>`)
    
    // 开始标签
    .replace(/(&lt;)(\w+)([^&gt;]*&gt;)/g, 
      `<span style="color: ${colors.tag};">$1</span><span style="color: ${colors.tagName};">$2</span>$3<span style="color: ${colors.tag};">&gt;</span>`)
    
    // 结束标签
    .replace(/(&lt;\/)(\w+)(&gt;)/g, 
      `<span style="color: ${colors.tag};">$1</span><span style="color: ${colors.tagName};">$2</span><span style="color: ${colors.tag};">$3</span>`)
    
    // 属性名
    .replace(/(\s)(\w+)(?==)/g, `$1<span style="color: ${colors.attribute};">$2</span>`)
    
    // 属性值
    .replace(/=(&quot;[^&quot;]*&quot;|&#39;[^&#39;]*&#39;)/g, 
      `=<span style="color: ${colors.attributeValue};">$1</span>`)
    
    // CSS 样式属性特殊处理
    .replace(/(style=)(&quot;[^&quot;]*&quot;)/g, 
      `<span style="color: ${colors.attribute};">$1</span><span style="color: ${colors.attributeValue};">$2</span>`)
}



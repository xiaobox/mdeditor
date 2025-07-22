import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

// 创建markdown-it实例
const md = new MarkdownIt({
  html: true,         // 启用HTML标签
  xhtmlOut: true,     // 使用 '/' 来闭合单标签
  breaks: false,      // 不转换换行符为 <br>，避免微信中出现额外换行
  linkify: true,      // 自动识别链接
  typographer: true,  // 启用语言中立的替换 + 引号美化
  highlight: function (str, lang) {
    // 代码高亮 - 使用现代化的语法高亮样式
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
        // 返回带有语言标识的代码块，但不显示语言标签
        return `<pre class="hljs language-${lang}"><code class="hljs language-${lang}">${highlighted}</code></pre>`
      } catch (error) {
        console.warn('代码高亮失败:', error)
      }
    }
    // 无语言标识或高亮失败时的回退
    return `<pre class="hljs"><code class="hljs">${md.utils.escapeHtml(str)}</code></pre>`
  }
})

// 自定义渲染规则
const defaultRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options)
}

// 为链接添加target="_blank"和样式
md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  const aIndex = tokens[idx].attrIndex('target')

  if (aIndex < 0) {
    tokens[idx].attrPush(['target', '_blank'])
  } else {
    tokens[idx].attrs[aIndex][1] = '_blank'
  }

  // 添加样式
  const styleIndex = tokens[idx].attrIndex('style')
  if (styleIndex < 0) {
    tokens[idx].attrPush(['style', 'color: #576b95; text-decoration: none;'])
  }

  return defaultRender(tokens, idx, options, env, self)
}

// 自定义图片渲染
md.renderer.rules.image = function (tokens, idx, options, env, self) {
  const token = tokens[idx]
  const srcIndex = token.attrIndex('src')
  const src = token.attrs[srcIndex][1]
  const alt = token.content || ''

  return `<img src="${src}" alt="${alt}" style="max-width: 100%; height: auto; display: block; margin: 16px auto;" />`
}

// 自定义标题渲染
md.renderer.rules.heading_open = function (tokens, idx) {
  const token = tokens[idx]
  const level = token.tag.slice(1) // h1 -> 1, h2 -> 2, etc.

  switch (level) {
    case '1':
      return '<h1 style="font-size: 26px; font-weight: bold; color: #000; margin: 28px 0 20px 0; line-height: 1.4; text-align: center;">'
    case '2':
      return '<h2 style="font-size: 22px; font-weight: bold; color: #000; margin: 24px 0 16px 0; line-height: 1.2; padding-left: 18px; position: relative; display: flex; align-items: center; min-height: 32px; padding-top: 2px;"><span style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 28px; background: linear-gradient(180deg, rgba(0, 168, 107, 0.2) 0%, rgba(0, 168, 107, 0.9) 20%, rgba(0, 168, 107, 1) 50%, rgba(0, 168, 107, 0.9) 80%, rgba(0, 168, 107, 0.2) 100%); border-radius: 2px; box-shadow: 0 0 8px rgba(0, 168, 107, 0.15);"></span>'
    case '3':
      return '<h3 style="font-size: 18px; font-weight: bold; color: #000; margin: 20px 0 12px 0; line-height: 1.4;">'
    default:
      return `<${token.tag} style="font-weight: bold; color: #333; margin: 16px 0 8px 0;">`
  }
}

// 自定义表格渲染
md.renderer.rules.table_open = function () {
  return '<table style="border-collapse: collapse; width: 100%; margin: 16px 0;">\n'
}

md.renderer.rules.thead_open = function () {
  return '<thead style="background-color: #f8f9fa;">\n'
}

md.renderer.rules.th_open = function () {
  return '<th style="border: 1px solid #dee2e6; padding: 8px 12px; text-align: left; font-weight: 600;">'
}

// 微信公众号兼容的列表渲染 - 基于设计文档的实现
// 使用简化的 HTML 结构 + 视觉缩进

// 用于跟踪嵌套层级和状态
let nestingLevel = 0
let orderedListCounters = []
let listTypeStack = [] // 跟踪列表类型 ('ol' 或 'ul')

// 重置列表状态的函数
function resetListState() {
  nestingLevel = 0
  orderedListCounters = []
  listTypeStack = []
}

// 有序列表开始
md.renderer.rules.ordered_list_open = function () {
  nestingLevel++
  listTypeStack.push('ol')
  
  // 初始化当前嵌套层级的计数器
  if (!orderedListCounters[nestingLevel - 1]) {
    orderedListCounters[nestingLevel - 1] = 0
  }
  
  // 根据嵌套层级调整样式
  // 一级列表使用较大的外边距，嵌套列表使用较小的外边距
  const margin = nestingLevel === 1 ? '16px 0' : '4px 0'
  
  // 微信公众号兼容的样式
  // 为了确保嵌套列表在微信中正确显示，我们需要为所有层级设置相同的padding-left
  // 实际的缩进将通过列表项的padding-left来控制
  return `<ol style="margin: ${margin}; padding-left: 0; list-style: none; box-sizing: border-box; text-indent: 0;">`
}

// 有序列表结束
md.renderer.rules.ordered_list_close = function () {
  nestingLevel--
  listTypeStack.pop()
  return '</ol>\n'
}

// 无序列表开始
md.renderer.rules.bullet_list_open = function () {
  nestingLevel++
  listTypeStack.push('ul')
  
  // 根据嵌套层级调整样式
  // 一级列表使用较大的外边距，嵌套列表使用较小的外边距
  const margin = nestingLevel === 1 ? '16px 0' : '4px 0'
  
  // 微信公众号兼容的样式
  // 为了确保嵌套列表在微信中正确显示，我们需要为所有层级设置相同的padding-left
  // 实际的缩进将通过列表项的padding-left来控制
  return `<ul style="margin: ${margin}; padding-left: 0; list-style: none; box-sizing: border-box; text-indent: 0;">`
}

// 无序列表结束
md.renderer.rules.bullet_list_close = function () {
  nestingLevel--
  listTypeStack.pop()
  return '</ul>\n'
}

/**
 * 检测列表项是属于有序列表还是无序列表
 * @param {Array} tokens - markdown-it 的 tokens 数组
 * @param {number} idx - 当前 token 的索引
 * @returns {boolean} - 如果是有序列表项则返回 true，否则返回 false
 */
function isOrderedListItem(tokens, idx) {
  // 首先尝试使用列表类型栈
  if (listTypeStack.length > 0) {
    return listTypeStack[listTypeStack.length - 1] === 'ol';
  }
  
  // 如果列表类型栈为空，则通过向前查找最近的列表开始标记来确定
  for (let i = idx - 1; i >= 0; i--) {
    if (tokens[i].type === 'ordered_list_open') {
      return true;
    } else if (tokens[i].type === 'bullet_list_open') {
      return false;
    }
  }
  
  // 默认为无序列表项
  return false;
}

// 列表项开始
md.renderer.rules.list_item_open = function (tokens, idx) {
  // 使用列表类型检测函数确定当前列表项的类型
  const isOrderedList = isOrderedListItem(tokens, idx);
  
  // 计算当前项的嵌套深度
  const depth = nestingLevel - 1;
  
  // 根据嵌套深度计算缩进值 - 使用更大的缩进差异确保层级清晰
  // 微信公众号兼容的缩进值
  // 一级列表项使用24px的缩进，每增加一级增加28px
  const paddingLeft = depth === 0 ? '24px' : `${24 + depth * 28}px`;
  
  // 计算标记符号的左侧位置
  // 一级列表项的标记位于0位置，每增加一级增加28px
  const markerLeft = depth === 0 ? '0' : `${depth * 28}px`;
  
  if (isOrderedList) {
    // 有序列表项 - 为每个嵌套层级维护独立的计数器
    if (typeof orderedListCounters[depth] !== 'number') {
      orderedListCounters[depth] = 0;
    }
    orderedListCounters[depth]++;
    
    // 为不同层级使用不同的颜色 - 微信公众号兼容的颜色
    // 使用更鲜明的颜色对比，确保在微信中可见
    const colors = ['#07C160', '#10A0FF', '#FA5151'];
    const color = colors[Math.min(depth, colors.length - 1)];
    
    // 微信公众号兼容的定位样式
    // 使用固定宽度的标记容器，确保对齐一致
    // 增加 text-indent: 0 确保微信不会添加额外的缩进
    return `<li style="margin: 8px 0; line-height: 1.8; position: relative; padding-left: ${paddingLeft}; box-sizing: border-box; text-indent: 0;">
      <span style="color: ${color}; font-weight: 600; position: absolute; left: ${markerLeft}; top: 0; display: inline-block; width: 20px; text-align: center;">${orderedListCounters[depth]}.</span>`;
  } else {
    // 无序列表项
    // 为不同层级使用不同的颜色和符号 - 微信公众号兼容的颜色
    // 使用更鲜明的颜色对比，确保在微信中可见
    const colors = ['#07C160', '#10A0FF', '#FA5151'];
    // 使用微信公众号兼容的符号 - 确保在微信中正确显示
    const symbols = ['●', '○', '■'];
    const color = colors[Math.min(depth, colors.length - 1)];
    const symbol = symbols[Math.min(depth, symbols.length - 1)];
    
    // 微信公众号兼容的定位样式
    // 使用固定宽度的标记容器，确保对齐一致
    // 增加 text-indent: 0 确保微信不会添加额外的缩进
    return `<li style="margin: 8px 0; line-height: 1.8; position: relative; padding-left: ${paddingLeft}; box-sizing: border-box; text-indent: 0;">
      <span style="color: ${color}; font-weight: 600; position: absolute; left: ${markerLeft}; top: 0; display: inline-block; width: 20px; text-align: center;">${symbol}</span>`;
  }
}

// 列表项结束
md.renderer.rules.list_item_close = function () {
  return '</li>\n'
}

// 自定义段落渲染，避免空段落
md.renderer.rules.paragraph_open = function () {
  return '<p style="margin: 16px 0; line-height: 1.8;">'
}

// 自定义强调渲染
md.renderer.rules.strong_open = function () {
  return '<strong style="font-weight: bold; color: #000;">'
}

// 自定义斜体渲染
md.renderer.rules.em_open = function () {
  return '<em style="font-style: italic;">'
}





// 自定义引用块渲染
md.renderer.rules.blockquote_open = function () {
  return '<blockquote style="margin: 16px 0; padding-left: 10px; border-left: 3px solid #07c160; color: #666;">'
}

// 自定义行内代码渲染
md.renderer.rules.code_inline = function (tokens, idx) {
  const token = tokens[idx]
  return `<code style="padding: 3px 6px; font-size: 13px; color: #e36209; font-family: 'SF Mono', 'Monaco', 'Consolas', monospace; border: 1px solid rgba(227, 98, 9, 0.15); border-radius: 6px; background: linear-gradient(135deg, rgba(227, 98, 9, 0.08) 0%, rgba(227, 98, 9, 0.12) 100%); font-weight: 500; box-shadow: 0 1px 3px rgba(227, 98, 9, 0.1);">${md.utils.escapeHtml(token.content)}</code>`
}

// 自定义代码块渲染，添加Mac风格红绿灯（微信公众号兼容版本）
md.renderer.rules.fence = function (tokens, idx, options, env, self) {
  const token = tokens[idx]
  const info = token.info ? md.utils.unescapeAll(token.info).trim() : ''
  let langName = ''

  if (info) {
    langName = info.split(/\s+/g)[0]
  }

  let highlighted = ''
  if (langName && hljs.getLanguage(langName)) {
    try {
      highlighted = hljs.highlight(token.content, { language: langName, ignoreIllegals: true }).value
    } catch (error) {
      console.warn('代码高亮失败:', error)
      highlighted = md.utils.escapeHtml(token.content)
    }
  } else {
    highlighted = md.utils.escapeHtml(token.content)
  }

  // 使用简单的文本符号作为Mac红绿灯，确保微信公众号兼容 - 调整间距更紧凑
  const macTrafficLights = `<span style="position: absolute; top: 13px; left: 16px; font-size: 22px; line-height: 1; z-index: 2; letter-spacing: 4px;"><span style="color: #ff5f56;">●</span><span style="color: #ffbd2e;">●</span><span style="color: #27ca3f;">●</span></span>`

  return `<pre style="background: #1e1e1e; border-radius: 12px; padding: 48px 24px 24px 24px; position: relative; color: #f8f8f2; font-family: 'SF Mono', Monaco, 'Inconsolata', 'Fira Code', 'Consolas', 'Liberation Mono', 'Courier New', monospace; margin: 32px 0; overflow-x: auto; border: none;">${macTrafficLights}<code class="hljs language-${langName}">${highlighted}</code></pre>`
}

// 自定义链接颜色
md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  const aIndex = tokens[idx].attrIndex('target')

  if (aIndex < 0) {
    tokens[idx].attrPush(['target', '_blank'])
  } else {
    tokens[idx].attrs[aIndex][1] = '_blank'
  }

  // 添加样式
  const styleIndex = tokens[idx].attrIndex('style')
  if (styleIndex < 0) {
    tokens[idx].attrPush(['style', 'color: #576b95; text-decoration: none;'])
  }

  return self.renderToken(tokens, idx, options)
}

/**
 * 解析Markdown文本为HTML
 * @param {string} markdown - Markdown文本
 * @returns {string} - 渲染后的HTML
 */
export function parseMarkdown(markdown) {
  if (!markdown || typeof markdown !== 'string') {
    return ''
  }

  try {
    // 重置列表状态变量，避免状态污染
    resetListState()
    
    // 记录开始解析
    console.log('开始解析Markdown，列表状态已重置')
    
    const result = md.render(markdown)
    
    // 记录解析完成
    console.log('Markdown解析完成，嵌套层级:', nestingLevel, '计数器:', orderedListCounters)
    
    return result
  } catch (error) {
    console.error('Markdown解析错误:', error)
    return '<div class="error">Markdown解析错误，请检查语法</div>'
  }
}

/**
 * 提取纯文本内容
 * @param {string} html - HTML内容
 * @returns {string} - 纯文本
 */
export function extractTextContent(html) {
  if (!html) return ''

  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

/**
 * 生成目录（TOC）
 * @param {string} markdown - Markdown文本
 * @returns {Array} - 目录数组
 */
export function generateToc(markdown) {
  if (!markdown) return []

  const toc = []
  const lines = markdown.split('\n')

  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const title = match[2].trim()
      const id = `heading-${index}-${title.replace(/\s+/g, '-').toLowerCase()}`

      toc.push({
        level,
        title,
        id,
        line: index + 1
      })
    }
  })

  return toc
}

/**
 * 验证Markdown语法
 * @param {string} markdown - Markdown文本
 * @returns {Object} - 验证结果
 */
export function validateMarkdown(markdown) {
  if (!markdown) {
    return { valid: true, errors: [] }
  }

  const errors = []

  try {
    // 尝试解析
    md.render(markdown)

    // 检查常见问题
    const lines = markdown.split('\n')
    lines.forEach((line, index) => {
      // 检查未闭合的代码块
      const codeBlockMatches = line.match(/```/g)
      if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
        const nextLines = lines.slice(index + 1)
        const hasClosing = nextLines.some(nextLine => nextLine.includes('```'))
        if (!hasClosing) {
          errors.push({
            line: index + 1,
            message: '代码块未正确闭合',
            type: 'warning'
          })
        }
      }

      // 检查链接格式
      const linkMatches = line.match(/\[([^\]]*)\]\(([^)]*)\)/g)
      if (linkMatches) {
        linkMatches.forEach(match => {
          const urlMatch = match.match(/\[([^\]]*)\]\(([^)]*)\)/)
          if (urlMatch && urlMatch[2] && !urlMatch[2].startsWith('http') && !urlMatch[2].startsWith('/')) {
            errors.push({
              line: index + 1,
              message: `可能的链接格式问题: ${match}`,
              type: 'info'
            })
          }
        })
      }
    })

    return {
      valid: errors.length === 0,
      errors
    }
  } catch (error) {
    return {
      valid: false,
      errors: [{
        line: 0,
        message: error.message,
        type: 'error'
      }]
    }
  }
}

/**
 * 获取Markdown统计信息
 * @param {string} markdown - Markdown文本
 * @returns {Object} - 统计信息
 */
export function getMarkdownStats(markdown) {
  if (!markdown) {
    return {
      characters: 0,
      words: 0,
      lines: 0,
      paragraphs: 0,
      headings: 0,
      links: 0,
      images: 0,
      codeBlocks: 0
    }
  }

  const lines = markdown.split('\n')
  const text = extractTextContent(parseMarkdown(markdown))

  return {
    characters: markdown.length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    lines: lines.length,
    paragraphs: lines.filter(line => line.trim() && !line.match(/^#{1,6}\s|^```|^[-*+]\s|^\d+\.\s/)).length,
    headings: (markdown.match(/^#{1,6}\s/gm) || []).length,
    links: (markdown.match(/\[([^\]]*)\]\(([^)]*)\)/g) || []).length,
    images: (markdown.match(/!\[([^\]]*)\]\(([^)]*)\)/g) || []).length,
    codeBlocks: (markdown.match(/```/g) || []).length / 2
  }
} 
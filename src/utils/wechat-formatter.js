/**
 * 微信公众号格式化器
 * 直接从 Markdown 文本生成微信兼容的 HTML
 * 支持主题切换的统一格式化解决方案
 */

import { getColorTheme, defaultColorTheme } from '../config/themes/color-themes.js'
import { getCodeStyle } from '../config/themes/code-styles.js'
import { getThemeSystem } from '../config/themes/theme-systems.js'

/**
 * 格式化为微信公众号兼容HTML
 * @param {string} markdownText - Markdown文本
 * @param {string|Object} theme - 主题ID或主题对象
 * @param {Object} codeTheme - 代码主题对象
 * @param {string} themeSystem - 主题系统ID
 * @returns {string} - 格式化后的HTML
 */
export function formatForWechat(markdownText, theme = defaultColorTheme, codeTheme = null, themeSystem = 'wechat') {
  if (!markdownText || typeof markdownText !== 'string') {
    return ''
  }

  // 处理主题参数
  const currentTheme = typeof theme === 'string' ? getColorTheme(theme) : theme
  const currentThemeSystem = getThemeSystem(themeSystem)

  // 预处理：移除引用式链接和图片引用（微信不兼容）
  const cleanedText = cleanReferenceLinks(markdownText)

  const lines = cleanedText.split('\n')
  let result = ''
  let inCodeBlock = false
  let codeBlockContent = ''
  let codeBlockLanguage = ''
  let inTable = false
  let tableRows = []
  let inBlockquote = false
  let blockquoteContent = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()

    // 处理代码块
    if (trimmedLine.startsWith('```')) {
      if (!inCodeBlock) {
        // 开始代码块
        inCodeBlock = true
        codeBlockLanguage = trimmedLine.replace('```', '').trim()
        codeBlockContent = ''
      } else {
        // 结束代码块
        inCodeBlock = false
        result += formatCodeBlock(codeBlockContent, codeBlockLanguage, currentTheme, codeTheme)
        codeBlockContent = ''
        codeBlockLanguage = ''
      }
      continue
    }

    if (inCodeBlock) {
      codeBlockContent += line + '\n'
      continue
    }

    // 处理引用块的结束
    if (inBlockquote && !trimmedLine.startsWith('>')) {
      // 结束当前引用块
      if (blockquoteContent.length > 0) {
        result += formatBlockquote(blockquoteContent, currentTheme)
        blockquoteContent = []
      }
      inBlockquote = false
    }

    if (!trimmedLine) {
      // 空行可能在引用块内部，需要保留
      if (inBlockquote) {
        blockquoteContent.push('')
      }
      continue
    }

    // 处理分割线 - 使用主题颜色的渐变 (支持 ---, ***, ___)
    if (/^(\s*[-*_]\s*){3,}\s*$/.test(trimmedLine)) {
      result += `<hr style="height: 2px; background: linear-gradient(to right, transparent, ${currentTheme.primary}, transparent); border: none; margin: 32px 0;">`;
      continue;
    }

    // 处理表格
    if (trimmedLine.includes('|') && !trimmedLine.match(/^\|?[-\s|:]+\|?$/)) { // Catches header and data rows
      if (!inTable) {
        // A table must have a separator line. Let's check ahead.
        let nextLineIndex = i + 1;
        while(nextLineIndex < lines.length && lines[nextLineIndex].trim() === '') nextLineIndex++;
        if (nextLineIndex < lines.length && lines[nextLineIndex].trim().match(/^\|?[-\s|:]+\|?$/)) {
          inTable = true
          tableRows = []
        }
      }
      if (inTable) {
        tableRows.push(line)
        continue
      }
    } else if (trimmedLine.match(/^\|?[-\s|:]+\|?$/)) { // Catches alignment row
      if (inTable) {
        tableRows.push(line)
      }
      continue
    } else if (inTable) { // Catches line after table (doesn't include '|' )
      result += formatTable(tableRows, currentTheme)
      inTable = false
      tableRows = []
      // 重新处理当前行
      i--
      continue
    }

    // 处理引用块 - 收集多行引用内容，保留嵌套结构
    if (trimmedLine.startsWith('>')) {
      if (!inBlockquote) {
        inBlockquote = true
        blockquoteContent = []
      }
      // 保留完整的引用行，包括嵌套的 > 符号
      blockquoteContent.push(trimmedLine)
      continue
    }

    // 处理标题 - 精确匹配GitHub CSS + 你的自定义样式
    if (trimmedLine.startsWith('#')) {
      const level = trimmedLine.match(/^#+/)[0].length
      const text = trimmedLine.replace(/^#+\s*/, '')
      const formattedText = formatInlineText(text, currentTheme)

      // H1特殊样式 - 根据主题系统选择样式
      if (level === 1) {
        if (themeSystem === 'jetbrains') {
          // JetBrains Darcula风格的H1
          const h1Style = `
            font-size: 32px;
            font-weight: 700;
            color: #9876AA;
            background: #2B2B2B;
            margin: 32px 0 24px 0;
            padding: 16px 20px 12px 20px;
            position: relative;
            line-height: 1.2;
            text-align: left;
            border-radius: 6px;
            border-bottom: 2px solid #555555;
          `.replace(/\s+/g, ' ').trim()

          const underlineStyle = `display: block; position: absolute; bottom: -2px; left: 20px; width: 60px; height: 2px; background: #9876AA; border-radius: 1px;`
          result += `<h1 style="${h1Style}">${formattedText}<span style="${underlineStyle}"></span></h1>`
        } else {
          // 微信风格的H1（原有样式）
          const h1Style = `
            margin: 0.67em 0;
            font-weight: 600;
            padding-bottom: 16px;
            font-size: 1.5em;
            border-bottom: none;
            position: relative;
            color: ${currentTheme.textPrimary};
            line-height: 1.25;
            text-align: center;
          `.replace(/\s+/g, ' ').trim()

          const underlineStyle = `display: block; position: absolute; bottom: 2px; left: 3%; right: 3%; height: 3px; background: linear-gradient(90deg, transparent 0%, ${currentTheme.primary}4D 10%, ${currentTheme.primary}CC 30%, ${currentTheme.primary} 50%, ${currentTheme.primary}CC 70%, ${currentTheme.primary}4D 90%, transparent 100%); border-radius: 2px; box-shadow: 0 0 6px ${currentTheme.primary}33;`
          result += `<h1 style="${h1Style}">${formattedText}<span style="${underlineStyle}"></span></h1>`
        }
      }
      // H2特殊样式 - 根据主题系统选择样式
      else if (level === 2) {
        if (themeSystem === 'jetbrains') {
          // JetBrains Darcula风格的H2
          const h2Style = `
            font-size: 26px;
            font-weight: 600;
            color: #6897BB;
            background: #2B2B2B;
            margin: 28px 0 20px 0;
            padding: 12px 20px 12px 36px;
            line-height: 1.3;
            position: relative;
            border-radius: 6px;
          `.replace(/\s+/g, ' ').trim()

          const borderStyle = `position: absolute; left: 20px; top: 50%; transform: translateY(-50%); width: 4px; height: 24px; background: #6897BB; border-radius: 2px;`
          result += `<h2 style="${h2Style}"><span style="${borderStyle}"></span>${formattedText}</h2>`
        } else {
          // 微信风格的H2（原有样式）
          const h2Style = `
            margin-top: 1.5rem;
            margin-bottom: 1rem;
            font-weight: 600;
            padding-left: 1.2em;
            font-size: 1.2em;
            color: ${currentTheme.textPrimary};
            line-height: 1.25;
            position: relative;
          `.replace(/\s+/g, ' ').trim()

          const borderStyle = `position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 1.4em; background: linear-gradient(180deg, ${currentTheme.primary}4D 0%, ${currentTheme.primary} 30%, ${currentTheme.primary} 70%, ${currentTheme.primary}4D 100%); border-radius: 2px; box-shadow: 0 0 4px ${currentTheme.primary}4D;`
          result += `<h2 style="${h2Style}"><span style="${borderStyle}"></span>${formattedText}</h2>`
        }
      }
      // 其他标题 - 使用主题样式
      else {
        const fontSizes = {
          3: '1.1em',   // 约17.6px
          4: '1.05em',  // 约16.8px
          5: '1em',     // 约16px
          6: '0.95em'   // 约15.2px
        }
        const fontSize = fontSizes[level] || '1em'

        const titleStyle = `
          font-size: ${fontSize};
          color: ${currentTheme.textPrimary};
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          line-height: 1.25;
        `.replace(/\s+/g, ' ').trim()

        result += `<h${level} style="${titleStyle}">${formattedText}</h${level}>`
      }
      continue
    }

    // 处理列表项（包括任务列表）
    const listMatch = line.match(/^(\s*)([*\-+]|\d+\.)\s+(.+)$/)
    if (listMatch) {
      const [, indent, marker, content] = listMatch
      const depth = Math.floor(indent.length / 2) // 每2个空格为一级
      const isOrdered = /^\d+\./.test(marker)

      // 检查是否为任务列表
      const taskMatch = content.match(/^\[([ x])\]\s+(.+)$/)
      if (taskMatch) {
        const [, checked, taskText] = taskMatch
        const isChecked = checked === 'x'
        const formattedTaskText = formatInlineText(taskText, currentTheme)
        const marginLeft = depth * 20

        // 创建更美观的checkbox样式，使用微信兼容的方法和主题颜色
        let checkboxHtml
        if (isChecked) {
          // 已完成任务 - 使用主题色背景的勾选符号，更兼容微信
          checkboxHtml = `<span style="display: inline-block; width: 18px; height: 18px; background-color: ${currentTheme.primary}; border-radius: 3px; margin-right: 8px; text-align: center; line-height: 18px; color: white; font-size: 12px; font-weight: bold; vertical-align: middle;">✓</span>`
        } else {
          // 未完成任务 - 空的方框，使用主题边框色
          checkboxHtml = `<span style="display: inline-block; width: 18px; height: 18px; background-color: #ffffff; border: 2px solid ${currentTheme.borderMedium}; border-radius: 3px; margin-right: 8px; vertical-align: middle;"></span>`
        }

        const textStyle = isChecked ? 'text-decoration: line-through; color: #656d76; opacity: 0.8;' : 'color: #24292f;'
        result += `<p style="margin-left: ${marginLeft}px; margin-top: 8px; margin-bottom: 8px; font-size: 16px; line-height: 1.6; display: flex; align-items: center;">${checkboxHtml}<span style="${textStyle}">${formattedTaskText}</span></p>`
        continue
      }

      // 普通列表项
      let displayMarker
      if (isOrdered) {
        const num = marker.replace('.', '')
        displayMarker = `${num}.`
      } else {
        const symbols = ['●', '○', '■', '▪']
        displayMarker = symbols[Math.min(depth, symbols.length - 1)]
      }

      const colors = currentTheme.listColors
      const color = colors[Math.min(depth, colors.length - 1)]
      const marginLeft = depth * 20
      const formattedContent = formatInlineText(content, currentTheme)

      result += `<p style="margin-left: ${marginLeft}px; margin-top: 8px; margin-bottom: 8px; font-size: 16px; line-height: 1.6;"><span style="color: ${color}; font-weight: 600;">${displayMarker}</span> ${formattedContent}</p>`
      continue
    }

    // 处理普通段落 - 微信公众号适配字体大小
    if (trimmedLine) {
      const formattedText = formatInlineText(trimmedLine, currentTheme)
      result += `<p style="margin: 12px 0; line-height: 1.6; font-size: 16px;">${formattedText}</p>`
    }
  }

  // 处理未结束的表格
  if (inTable && tableRows.length > 0) {
    result += formatTable(tableRows, currentTheme)
  }

  // 处理未结束的引用块
  if (inBlockquote && blockquoteContent.length > 0) {
    result += formatBlockquote(blockquoteContent, currentTheme)
  }

  return result
}

/**
 * 格式化内联文本（粗体、斜体、链接等）
 * @param {string} text - 文本内容
 * @param {Object} theme - 主题对象
 * @returns {string} - 格式化后的文本
 */
function formatInlineText(text, theme = defaultTheme) {
  return text
    // 首先处理转义字符 - 必须在其他处理之前
    .replace(/\\`/g, '&#96;')        // 转义反引号
    .replace(/\\\*/g, '&#42;')       // 转义星号
    .replace(/\\_/g, '&#95;')        // 转义下划线
    .replace(/\\~/g, '&#126;')       // 转义波浪号
    .replace(/\\\[/g, '&#91;')       // 转义左方括号
    .replace(/\\\]/g, '&#93;')       // 转义右方括号
    .replace(/\\\(/g, '&#40;')       // 转义左圆括号
    .replace(/\\\)/g, '&#41;')       // 转义右圆括号
    .replace(/\\\\/g, '&#92;')       // 转义反斜杠本身
    // 图片（必须在链接之前处理）
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8px; margin: 12px 0; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">')
    // 时尚链接 - 使用主题色
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" style="color: ${theme.primary}; text-decoration: none; position: relative; transition: all 0.2s ease; border-bottom: 2px solid transparent; padding-bottom: 1px;">$1</a>`)
    // 粗体 - 增强样式
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #1f2328; font-weight: 600;">$1</strong>')
    .replace(/__(.*?)__/g, '<strong style="color: #1f2328; font-weight: 600;">$1</strong>')
    // 斜体 - 优雅样式
    .replace(/\*(.*?)\*/g, '<em style="color: #656d76; font-style: italic;">$1</em>')
    .replace(/_(.*?)_/g, '<em style="color: #656d76; font-style: italic;">$1</em>')
    // 删除线 - 精美样式
    .replace(/~~(.*?)~~/g, '<del style="color: #656d76; text-decoration: line-through; opacity: 0.8;">$1</del>')
    // 精美行内代码 - 使用主题色
    .replace(/`(.*?)`/g, `<code style="background: ${theme.inlineCodeBg}; color: ${theme.inlineCodeText}; padding: 3px 6px; border-radius: 6px; font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Consolas', 'Liberation Mono', 'Courier New', monospace; font-size: 14px; border: 1px solid ${theme.inlineCodeBorder}; box-shadow: 0 1px 3px ${theme.primary}1A, inset 0 1px 0 rgba(255, 255, 255, 0.8); font-weight: 500;">$1</code>`)
    // 精美键盘按键样式
    .replace(/<kbd>/g, '<kbd style="background-color: #f6f8fa; border: 1px solid #d0d7de; border-bottom-color: #afb8c1; border-radius: 6px; box-shadow: inset 0 -1px 0 #afb8c1; color: #24292f; display: inline-block; font-size: 11px; line-height: 10px; padding: 3px 5px; vertical-align: middle; font-family: \'SF Mono\', monospace;">')
}

/**
 * 格式化代码块 - 支持多种代码主题
 * @param {string} content - 代码内容
 * @param {string} language - 编程语言
 * @param {Object} theme - 主题对象
 * @param {Object} codeTheme - 代码主题对象
 * @returns {string} - 格式化后的HTML
 */
function formatCodeBlock(content, language, theme = defaultTheme, codeTheme = null) {
  const trimmedContent = content.trim()

  // 如果没有提供代码样式，获取默认样式
  if (!codeTheme) {
    codeTheme = getCodeStyle('mac')
  }

  // 使用代码主题
  const highlightedContent = applyCodeThemeSyntaxHighlight(trimmedContent, language, codeTheme)

  // 生成容器样式
  const preStyle = `
    background: ${codeTheme.background};
    border-radius: ${codeTheme.borderRadius};
    padding: ${codeTheme.padding};
    overflow-x: auto;
    overflow-y: visible;
    font-size: ${codeTheme.fontSize};
    line-height: ${codeTheme.lineHeight};
    border: ${codeTheme.border};
    position: relative;
    font-family: ${codeTheme.fontFamily};
    margin: ${codeTheme.margin};
    font-weight: ${codeTheme.fontWeight};
    color: ${codeTheme.color};
    ${codeTheme.boxShadow !== 'none' ? `box-shadow: ${codeTheme.boxShadow};` : ''}
    ${codeTheme.hasGlow && codeTheme.glowColor ? `box-shadow: ${codeTheme.boxShadow}, 0 0 30px ${codeTheme.glowColor};` : ''}
  `.replace(/\s+/g, ' ').trim()

  // 移除不必要的contentStyle复杂性

  const codeStyle = `
    color: inherit;
    background: transparent;
    border: none;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    ${codeTheme.hasHeader ? 'margin-top: 40px;' : ''}
    display: block;
    white-space: pre;
    word-wrap: break-word;
  `.replace(/\s+/g, ' ').trim()

  // 生成装饰元素
  let decorations = ''

  // Mac 红绿灯
  if (codeTheme.hasTrafficLights) {
    decorations += `
      <span style="${codeTheme.trafficLightsStyle}">
        <span style="color: #ff5f56;">●</span><span style="color: #ffbd2e;">●</span><span style="color: #27ca3f;">●</span>
      </span>
    `.replace(/\s+/g, ' ').trim()
  }

  // 头部标题栏
  if (codeTheme.hasHeader) {
    const headerContent = codeTheme.headerContent.replace('代码', language || '代码')
    decorations += `
      <div style="${codeTheme.headerStyle}">
        ${headerContent}
      </div>
    `.replace(/\s+/g, ' ').trim()
  }

  // 使用简化的结构
  return `<pre style="${preStyle}">${decorations}<code style="${codeStyle}">${highlightedContent}</code></pre>`
}

/**
 * 应用代码主题的语法高亮 - 安全版本
 * @param {string} code - 代码内容
 * @param {string} language - 编程语言
 * @param {Object} codeTheme - 代码主题对象
 * @returns {string} - 高亮后的代码
 */
function applyCodeThemeSyntaxHighlight(code, language, codeTheme) {
  const highlight = codeTheme.syntaxHighlight

  if (!highlight || Object.keys(highlight).length === 0) {
    // 只转义必要的HTML字符
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  // 先转义HTML字符
  let result = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // 使用更安全的语法高亮方法 - 避免重复匹配
  // 创建一个标记数组来跟踪已处理的字符
  const chars = result.split('')
  const processed = new Array(chars.length).fill(false)
  const highlights = []

  // 收集所有需要高亮的片段
  const rules = [
    // 1. 注释 - 最高优先级
    { pattern: /\/\/.*$/gm, color: highlight.comment },
    { pattern: /\/\*[\s\S]*?\*\//g, color: highlight.comment },

    // 2. 字符串
    { pattern: /(["'`])[^"'`]*?\1/g, color: highlight.string },

    // 3. 关键字
    { pattern: /\b(function|const|let|var|if|else|for|while|return|class|import|export|from|default|async|await|try|catch|finally|public|private|protected|static|void|int|string|boolean|true|false|null|undefined)\b/g, color: highlight.keyword },

    // 4. 数字
    { pattern: /\b\d+(?:\.\d+)?\b/g, color: highlight.number },

    // 5. 函数名
    { pattern: /\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\()/g, color: highlight.function }
  ]

  // 按优先级处理每个规则
  rules.forEach(rule => {
    let match
    rule.pattern.lastIndex = 0 // 重置正则表达式

    while ((match = rule.pattern.exec(result)) !== null) {
      const start = match.index
      const end = start + match[0].length

      // 检查是否与已处理区域重叠
      let canProcess = true
      for (let i = start; i < end; i++) {
        if (processed[i]) {
          canProcess = false
          break
        }
      }

      if (canProcess) {
        highlights.push({
          start,
          end,
          text: match[0],
          color: rule.color
        })

        // 标记为已处理
        for (let i = start; i < end; i++) {
          processed[i] = true
        }
      }
    }
  })

  // 按位置排序
  highlights.sort((a, b) => a.start - b.start)

  // 构建最终结果
  let finalResult = ''
  let lastIndex = 0

  highlights.forEach(highlight => {
    // 添加未处理的文本
    if (highlight.start > lastIndex) {
      finalResult += result.substring(lastIndex, highlight.start)
    }

    // 添加高亮的文本
    finalResult += `<span style="color: ${highlight.color}">${highlight.text}</span>`
    lastIndex = highlight.end
  })

  // 添加剩余文本
  if (lastIndex < result.length) {
    finalResult += result.substring(lastIndex)
  }

  return finalResult
}

/**
 * 应用语法高亮 - 简化版本，避免嵌套问题
 */
function applySyntaxHighlighting(code, language) {
  // 不转义引号，只转义必要的HTML字符
  let result = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // 如果不支持该语言，直接返回转义后的代码
  if (!language || !['javascript', 'python', 'html', 'css'].includes(language)) {
    return result
  }

  // 使用占位符方法避免嵌套
  const placeholders = []
  let placeholderIndex = 0

  // 定义语法高亮规则（按优先级排序，优先匹配字符串和注释）
  const rules = getHighlightRules(language)

  // 按优先级应用规则
  rules.forEach(rule => {
    result = result.replace(rule.pattern, (match) => {
      const placeholder = `__PLACEHOLDER_${placeholderIndex}__`
      placeholders[placeholderIndex] = `<span style="${rule.style}">${match}</span>`
      placeholderIndex++
      return placeholder
    })
  })

  // 替换回占位符
  placeholders.forEach((replacement, index) => {
    result = result.replace(`__PLACEHOLDER_${index}__`, replacement)
  })

  return result
}

/**
 * 获取语法高亮规则
 */
function getHighlightRules(language) {
  const rules = {
    javascript: [
      // 注释（优先级最高）
      { pattern: /\/\/.*$/gm, style: 'color: #7d8590;' },
      { pattern: /\/\*[\s\S]*?\*\//g, style: 'color: #7d8590;' },
      // 字符串
      { pattern: /"([^"\\]|\\.)*"/g, style: 'color: #a5d6ff;' },
      { pattern: /'([^'\\]|\\.)*'/g, style: 'color: #a5d6ff;' },
      { pattern: /`([^`\\]|\\.)*`/g, style: 'color: #a5d6ff;' },
      // 关键字
      { pattern: /\b(const|let|var|function|return|if|else|for|while|class|extends|import|export|from|default|async|await)\b/g, style: 'color: #ff7b72;' },
      // 字面量
      { pattern: /\b(true|false|null|undefined)\b/g, style: 'color: #79c0ff;' },
      // 数字
      { pattern: /\b\d+(\.\d+)?\b/g, style: 'color: #79c0ff;' }
    ],
    python: [
      // 注释
      { pattern: /#.*$/gm, style: 'color: #7d8590;' },
      // 字符串
      { pattern: /"""[\s\S]*?"""/g, style: 'color: #a5d6ff;' },
      { pattern: /"([^"\\]|\\.)*"/g, style: 'color: #a5d6ff;' },
      { pattern: /'([^'\\]|\\.)*'/g, style: 'color: #a5d6ff;' },
      // 关键字
      { pattern: /\b(def|class|if|elif|else|for|while|try|except|finally|with|import|from|as|return|yield|lambda|pass|break|continue|global|nonlocal)\b/g, style: 'color: #ff7b72;' },
      // 字面量
      { pattern: /\b(True|False|None)\b/g, style: 'color: #79c0ff;' },
      // 数字
      { pattern: /\b\d+(\.\d+)?\b/g, style: 'color: #79c0ff;' }
    ],
    html: [
      // 注释
      { pattern: /&lt;!--[\s\S]*?--&gt;/g, style: 'color: #7d8590;' },
      // 标签
      { pattern: /&lt;\/?\w+[^&gt;]*&gt;/g, style: 'color: #7ee787;' },
      // 属性值
      { pattern: /"([^"\\]|\\.)*"/g, style: 'color: #a5d6ff;' }
    ],
    css: [
      // 注释
      { pattern: /\/\*[\s\S]*?\*\//g, style: 'color: #7d8590;' },
      // 字符串
      { pattern: /"([^"\\]|\\.)*"/g, style: 'color: #a5d6ff;' },
      { pattern: /'([^'\\]|\\.)*'/g, style: 'color: #a5d6ff;' },
      // 选择器
      { pattern: /[.#]?[\w-]+(?=\s*{)/g, style: 'color: #7ee787;' },
      // 属性
      { pattern: /[\w-]+(?=\s*:)/g, style: 'color: #79c0ff;' }
    ]
  }

  return rules[language] || []
}

/**
 * 格式化引用块 - 保持嵌套结构和样式
 * @param {Array} contentLines - 引用块内容行
 * @param {Object} theme - 主题对象
 * @returns {string} - 格式化后的HTML
 */
function formatBlockquote(contentLines, theme = defaultTheme) {
  // 递归函数，用于构建嵌套的HTML
  function buildNestedQuotes(lines, level = 1) {
    if (!lines || lines.length === 0) {
      return '';
    }

    let html = '';
    let currentBlockLines = [];
    let childLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('>')) {
        // 移除一级的 '>'
        const strippedLine = trimmedLine.substring(1).trim();
        
        if (strippedLine.startsWith('>')) {
          // 这是下一层的嵌套
          if (currentBlockLines.length > 0) {
            // 先处理完当前层级的内容
            html += processParagraphs(currentBlockLines);
            currentBlockLines = [];
          }
          childLines.push(strippedLine);
        } else {
          // 这是当前层级的内容
          if (childLines.length > 0) {
            // 递归处理子层级
            html += buildNestedQuotes(childLines, level + 1);
            childLines = [];
          }
          currentBlockLines.push(strippedLine);
        }
      } else {
        // 非引用行，也属于当前块
        currentBlockLines.push(line);
      }
    }

    // 处理剩余的行
    if (currentBlockLines.length > 0) {
      html += processParagraphs(currentBlockLines);
    }
    if (childLines.length > 0) {
      html += buildNestedQuotes(childLines, level + 1);
    }

    // 根据层级应用不同的样式 - 保持微信兼容性，适度使用主题色
    let style = '';
    switch (level) {
      case 1:
        style = `border-left: 4px solid ${theme.primary}; background: linear-gradient(135deg, ${theme.primary}14 0%, ${theme.primary}0A 50%, ${theme.primary}14 100%); margin: 24px 0; padding: 18px 24px; border-radius: 6px; position: relative; box-shadow: 0 4px 16px ${theme.primary}1A; color: #1f2328; font-style: italic; line-height: 1.6; font-size: 16px;`;
        break;
      case 2:
        style = `border-left: 4px solid ${theme.primary}; background: linear-gradient(135deg, ${theme.primary}14 0%, ${theme.primary}0A 50%, ${theme.primary}14 100%); margin: 12px 0 12px 0px; padding: 12px 18px; border-radius: 6px; position: relative; box-shadow: 0 2px 8px ${theme.primary}14; color: #1f2328; font-style: italic; line-height: 1.6; font-size: 15px;`;
        break;
      case 3:
        style = `border-left: 4px solid ${theme.primary}; background: linear-gradient(135deg, ${theme.primary}14 0%, ${theme.primary}0A 50%, ${theme.primary}14 100%); margin: 8px 0 8px 0px; padding: 8px 12px; border-radius: 6px; position: relative; box-shadow: 0 1px 4px ${theme.primary}0F; color: #1f2328; font-style: italic; line-height: 1.6; font-size: 14px;`;
        break;
      default:
        style = `border-left: 4px solid ${theme.primary}; background: linear-gradient(135deg, ${theme.primary}14 0%, ${theme.primary}0A 50%, ${theme.primary}14 100%); margin: 6px 0 6px 0px; padding: 6px 10px; border-radius: 6px; position: relative; box-shadow: 0 1px 2px ${theme.primary}0A; color: #1f2328; font-style: italic; line-height: 1.6; font-size: 13px;`;
        break;
    }

    return `<blockquote style="${style}">${html}</blockquote>`;
  }

  // 将段落内容包装在 <p> 标签中
  function processParagraphs(lines) {
    let content = lines.join('\n').trim();
    if (!content) return '';

    // 按段落分割
    const paragraphs = content.split(/\n{2,}/);
    return paragraphs.map(p => {
      const formattedP = formatInlineText(p.replace(/\n/g, '<br>'), theme);
      return `<p style="margin: 8px 0; line-height: 1.6;">${formattedP}</p>`;
    }).join('');
  }

  return buildNestedQuotes(contentLines);
}

/**
 * 格式化表格 - 支持对齐
 * @param {Array} rows - 表格行数据
 * @param {Object} theme - 主题对象
 * @returns {string} - 格式化后的HTML
 */
function formatTable(rows, theme = defaultTheme) {
  if (rows.length < 2) return '' // 至少需要表头和分隔行

  const headerRow = rows[0];
  const alignmentRow = rows[1];
  const bodyRows = rows.slice(2);

  // 1. 解析对齐行
  const alignments = alignmentRow.split('|').map(cell => {
    const trimmed = cell.trim();
    if (trimmed.startsWith(':') && trimmed.endsWith(':')) {
      return 'center';
    } else if (trimmed.endsWith(':')) {
      return 'right';
    } else {
      return 'left';
    }
  }).slice(1, -1); // 移除首尾空字符串

  let tableHtml = '<table style="border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 16px;">'

  // 2. 格式化表头
  const headerCells = headerRow.split('|').map(cell => cell.trim()).slice(1, -1);
  if (headerCells.length > 0) {
    tableHtml += '<thead><tr style="background-color: #f6f8fa;">'
    headerCells.forEach((cell, index) => {
      const align = alignments[index] || 'left';
      const formattedCell = formatInlineText(cell, theme)
      tableHtml += `<th style="border: 1px solid #d0d7de; padding: 8px 12px; text-align: ${align}; font-weight: 600; color: #24292e;">${formattedCell}</th>`
    })
    tableHtml += '</tr></thead>'
  }

  // 3. 格式化表体
  tableHtml += '<tbody>'
  bodyRows.forEach(row => {
    const cells = row.split('|').map(cell => cell.trim()).slice(1, -1);
    if (cells.length > 0) {
      tableHtml += '<tr>'
      cells.forEach((cell, index) => {
        const align = alignments[index] || 'left';
        const formattedCell = formatInlineText(cell, theme)
        tableHtml += `<td style="border: 1px solid #d0d7de; padding: 8px 12px; text-align: ${align}; color: #24292e;">${formattedCell}</td>`
      })
      tableHtml += '</tr>'
    }
  });
  tableHtml += '</tbody></table>'

  return tableHtml
}

/**
 * 清理引用式链接和图片引用（微信不兼容）
 */
function cleanReferenceLinks(text) {
  return text
    // 移除引用式链接定义 [ref]: url "title"
    .replace(/^\s*\[([^\]]+)\]:\s*([^\s]+)(\s+"[^"]*")?\s*$/gm, '')
    // 将引用式链接转换为普通链接 [text][ref] -> [text](#)
    .replace(/\[([^\]]+)\]\[([^\]]+)\]/g, '[$1](#)')
    // 将引用式图片转换为占位符 ![alt][ref] -> ![alt](#)
    .replace(/!\[([^\]]*)\]\[([^\]]+)\]/g, '![图片]($1)')
    // 清理多余的空行
    .replace(/\n\s*\n\s*\n/g, '\n\n')
}

/**
 * HTML转义
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}




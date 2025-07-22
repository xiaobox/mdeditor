/**
 * 微信公众号格式化器 - 绿色主题版
 * 支持丰富的样式和特殊元素
 * 参考 mdnice、doocs/md 等优秀产品的最佳实践
 * 确保在微信公众号中完美显示
 */

/**
 * 主格式化函数
 */
export function formatForWechat(html) {
  if (!html || typeof html !== 'string') {
    return ''
  }

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const body = doc.body

    // 转换为微信兼容的HTML，保持样式一致性
    const formattedContent = convertToWechatFormat(body)

    // 包装在微信公众号兼容的容器中
    const wrappedContent = wrapForWechat(formattedContent)

    return wrappedContent
  } catch (error) {
    console.error('微信格式化失败:', error)
    return html
  }
}

/**
 * 转换为微信兼容格式
 */
function convertToWechatFormat(container) {
  let result = ''

  for (let node of container.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim()
      if (text) {
        result += `<p style="margin: 1em 0; color: #333; font-size: 16px; line-height: 1.7; text-align: left; word-wrap: break-word;">${text}</p>`
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const converted = convertElement(node)
      if (converted) {
        result += converted
      }
    }
  }

  return result
}

/**
 * 转换单个元素
 */
function convertElement(element) {
  const tagName = element.tagName.toLowerCase()
  const className = element.className || ''

  // 处理特殊类名
  if (className.includes('is-info')) {
    return `<section style="border-left: 4px solid #00A86B; background: #f0fdf4; padding: 0.8em 1em; border-radius: 4px; margin: 1em 0; font-size: 16px; line-height: 1.7;">${getInnerContent(element)}</section>`
  }

  if (className.includes('is-warning')) {
    return `<section style="border-left: 4px solid #faad14; background: #fffbe6; padding: 0.8em 1em; border-radius: 4px; margin: 1em 0; font-size: 16px; line-height: 1.7;">${getInnerContent(element)}</section>`
  }

  if (className.includes('is-error')) {
    return `<section style="border-left: 4px solid #ff4d4f; background: #fff2f0; padding: 0.8em 1em; border-radius: 4px; margin: 1em 0; font-size: 16px; line-height: 1.7;">${getInnerContent(element)}</section>`
  }

  if (className.includes('is-success')) {
    return `<section style="border-left: 4px solid #00A86B; background: #f0fdf4; padding: 0.8em 1em; border-radius: 4px; margin: 1em 0; font-size: 16px; line-height: 1.7;">${getInnerContent(element)}</section>`
  }

  if (className.includes('img-group')) {
    return convertImageGroup(element)
  }

  if (className.includes('text-center')) {
    return `<section style="text-align: center; margin: 1em 0;">${getInnerContent(element)}</section>`
  }

  if (className.includes('text-right')) {
    return `<section style="text-align: right; margin: 1em 0;">${getInnerContent(element)}</section>`
  }

  if (className.includes('highlight')) {
    return `<span style="background-color: #fff3cd; padding: 2px 4px; border-radius: 2px; color: #856404;">${element.textContent}</span>`
  }

  switch (tagName) {
    case 'h1':
      return `<h1 style="font-size: 1.8em; font-weight: 700; margin: 1.2em 0 0.8em; color: #333; text-align: center;">${getInnerContent(element)}</h1>`

    case 'h2':
      return `<h2 style="font-size: 1.5em; font-weight: 600; margin: 1.2em 0 0.8em; padding-left: 0.4em; border-left: 4px solid #00A86B; color: #333;">${getInnerContent(element)}</h2>`

    case 'h3':
      return `<h3 style="font-size: 1.3em; font-weight: 600; margin: 1em 0 0.6em; color: #00A86B;">${getInnerContent(element)}</h3>`

    case 'h4':
      return `<h4 style="font-size: 1.1em; font-weight: 600; margin: 1em 0 0.6em; color: #333;">${getInnerContent(element)}</h4>`

    case 'h5':
    case 'h6':
      return `<h5 style="font-size: 1em; font-weight: 600; margin: 1em 0 0.6em; color: #333;">${getInnerContent(element)}</h5>`

    case 'p':
      const content = getInnerContent(element)
      if (!content.trim()) {
        return ''
      }
      return `<p style="margin: 1em 0; color: #333; font-size: 16px; line-height: 1.7; text-align: left; word-wrap: break-word;">${content}</p>`

    case 'blockquote':
      const quoteContent = element.querySelectorAll('p')
      let quoteResult = ''
      quoteContent.forEach(p => {
        const text = getInnerContent(p)
        if (text.trim()) {
          quoteResult += `<section style="margin: 1.2em 0; padding: 0.8em 1em; border-left: 4px solid #00A86B; background-color: #f0fdf4; border-radius: 0 6px 6px 0; font-style: italic;"><p style="margin: 0; color: #666; font-size: 16px; line-height: 1.7;">${text}</p></section>`
        }
      })
      return quoteResult || `<section style="margin: 1.2em 0; padding: 0.8em 1em; border-left: 4px solid #00A86B; background-color: #f0fdf4; border-radius: 0 6px 6px 0; font-style: italic;"><p style="margin: 0; color: #666; font-size: 16px; line-height: 1.7;">${getInnerContent(element)}</p></section>`

    case 'pre':
      const code = element.querySelector('code')
      const text = code ? code.textContent : element.textContent
      const lines = text.split('\n')

      // 创建 Mac 终端样式的代码块
      let codeHtml = '<section style="background: #2c2c2c; border-radius: 8px; overflow: hidden; margin: 24px 0; border: 1px solid #1a1a1a; font-family: SF Mono, Monaco, Menlo, Consolas, monospace; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2); position: relative;">'

      // Mac 窗口标题栏
      codeHtml += '<div style="height: 36px; background: #3c3c3c; position: relative;">'

      // Mac 红绿灯按钮
      codeHtml += '<span style="position: absolute; top: 12px; left: 12px; width: 12px; height: 12px; border-radius: 50%; background: #ff5f56; display: inline-block;"></span>'
      codeHtml += '<span style="position: absolute; top: 12px; left: 32px; width: 12px; height: 12px; border-radius: 50%; background: #ffbd2e; display: inline-block;"></span>'
      codeHtml += '<span style="position: absolute; top: 12px; left: 52px; width: 12px; height: 12px; border-radius: 50%; background: #27ca3f; display: inline-block;"></span>'

      codeHtml += '</div>'

      // 代码内容区域
      codeHtml += '<div style="padding: 24px; overflow-x: auto;">'
      lines.forEach((line, index) => {
        if (index > 0) codeHtml += '<br/>'
        codeHtml += `<span style="font-family: SF Mono, Monaco, Menlo, Consolas, monospace; font-size: 13px; color: #e6e6e6; background: transparent; padding: 0; white-space: pre; line-height: 1.6;">${escapeHtml(line) || '\u00A0'}</span>`
      })
      codeHtml += '</div></section>'

      return codeHtml

    case 'ul':
      return convertList(element, false)

    case 'ol':
      return convertList(element, true)

    case 'a':
      return `<a href="${element.getAttribute('href') || '#'}" style="color: #00A86B; text-decoration: none; border-bottom: 1px solid transparent;">${element.textContent}</a>`

    case 'img':
      const src = element.getAttribute('src')
      const alt = element.getAttribute('alt') || ''
      return `<img src="${src}" alt="${alt}" style="max-width: 100%; height: auto; display: block; margin: 1em auto; border-radius: 4px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">`

    case 'strong':
    case 'b':
      return `<strong style="font-weight: 600; color: #333;">${getInnerContent(element)}</strong>`

    case 'em':
    case 'i':
      return `<em style="font-style: italic; color: #666;">${getInnerContent(element)}</em>`

    case 'code':
      if (element.parentElement.tagName.toLowerCase() !== 'pre') {
        return `<span style="background: linear-gradient(145deg, rgba(0, 168, 107, 0.08) 0%, rgba(0, 168, 107, 0.12) 100%); color: #00A86B; padding: 3px 6px; border-radius: 6px; font-family: SF Mono, Monaco, Consolas, monospace; font-size: 13px; border: 1px solid rgba(0, 168, 107, 0.15); font-weight: 500; box-shadow: 0 1px 3px rgba(0, 168, 107, 0.1);">${escapeHtml(element.textContent)}</span>`
      }
      return escapeHtml(element.textContent)

    case 'hr':
      return '<hr style="border: none; height: 1px; background: linear-gradient(to right, transparent, #e5e5e5, transparent); margin: 2em 0;">'

    case 'br':
      return '<br>'

    case 'table':
      return convertTable(element)

    case 'section':
    case 'div':
      // 处理容器元素
      if (className.includes('footnotes')) {
        return `<section style="margin: 2em 0; padding: 1em 0; border-top: 1px solid #e5e5e5;"><p style="font-weight: bold; color: #333; margin-bottom: 1em;">参考资料</p>${getInnerContent(element)}</section>`
      }
      return `<section style="margin: 1em 0;">${getInnerContent(element)}</section>`

    default:
      return getInnerContent(element)
  }
}

/**
 * 转换图片分组
 */
function convertImageGroup(element) {
  const images = element.querySelectorAll('img')
  if (images.length === 0) {
    return ''
  }

  let result = '<section style="display: flex; flex-wrap: wrap; gap: 8px; margin: 1em 0;">'
  images.forEach(img => {
    const src = img.getAttribute('src')
    const alt = img.getAttribute('alt') || ''
    const flexBasis = images.length <= 3 ? `calc(${100 / images.length}% - 8px)` : 'calc(50% - 4px)'
    result += `<img src="${src}" alt="${alt}" style="flex: 1 1 ${flexBasis}; max-width: 100%; height: auto; border-radius: 4px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">`
  })
  result += '</section>'
  return result
}

/**
 * 转换列表
 */
function convertList(element, isOrdered) {
  const items = element.querySelectorAll('li')
  let result = ''

  items.forEach((item, index) => {
    const prefix = isOrdered ? `${index + 1}.` : '•'
    const content = getInlineContent(item)
    result += `<p style="margin: 0.5em 0; padding-left: 1.2em; color: #333; font-size: 16px; line-height: 1.7; text-indent: -1.2em;"><span style="display: inline-block; width: 1.2em; text-indent: 0; color: #00A86B; font-weight: 600;">${prefix}</span><span style="display: inline;">${content}</span></p>`
  })

  return result
}

/**
 * 转换表格
 */
function convertTable(element) {
  const rows = element.querySelectorAll('tr')
  let result = '<section style="margin: 16px 0; border: 1px solid #e1e4e8; border-radius: 6px; overflow: hidden; background-color: #ffffff;">'

  rows.forEach((row, rowIndex) => {
    const cells = row.querySelectorAll('th, td')
    let rowHtml = '<section style="display: flex; border-bottom: 1px solid #e1e4e8;">'

    cells.forEach((cell, cellIndex) => {
      const content = getInnerContent(cell)
      const isHeader = cell.tagName.toLowerCase() === 'th'
      const cellStyle = isHeader
        ? 'flex: 1; padding: 12px 16px; font-size: 14px; line-height: 1.6; font-weight: 600; color: #333; background-color: #f6f8fa; border-right: 1px solid #e1e4e8; margin: 0;'
        : 'flex: 1; padding: 12px 16px; font-size: 14px; line-height: 1.6; color: #333; background-color: #ffffff; border-right: 1px solid #e1e4e8; margin: 0;'

      rowHtml += `<section style="${cellStyle}">${content}</section>`
    })

    rowHtml += '</section>'
    result += rowHtml
  })

  result += '</section>'
  return result
}

/**
 * 获取元素的内部内容
 */
function getInnerContent(element) {
  let result = ''

  for (let node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      result += convertElement(node)
    }
  }

  return result
}

/**
 * 获取内联内容
 */
function getInlineContent(element) {
  let result = ''

  for (let node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase()
      if (tagName === 'strong' || tagName === 'b') {
        result += `<strong style="font-weight: 600; color: #333;">${node.textContent}</strong>`
      } else if (tagName === 'em' || tagName === 'i') {
        result += `<em style="font-style: italic; color: #666;">${node.textContent}</em>`
      } else if (tagName === 'code') {
        result += `<span style="background: linear-gradient(145deg, rgba(0, 168, 107, 0.08) 0%, rgba(0, 168, 107, 0.12) 100%); color: #00A86B; padding: 3px 6px; border-radius: 6px; font-family: SF Mono, Monaco, Consolas, monospace; font-size: 13px; border: 1px solid rgba(0, 168, 107, 0.15); font-weight: 500; box-shadow: 0 1px 3px rgba(0, 168, 107, 0.1);">${escapeHtml(node.textContent)}</span>`
      } else if (tagName === 'a') {
        result += `<a href="${node.getAttribute('href') || '#'}" style="color: #00A86B; text-decoration: none;">${node.textContent}</a>`
      } else {
        result += node.textContent
      }
    }
  }

  return result
}

/**
 * 包装为微信公众号兼容格式
 */
function wrapForWechat(content) {
  return `<section style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; font-size: 16px; line-height: 1.6; color: #333; background-color: #ffffff; padding: 0; margin: 0; word-wrap: break-word; text-align: left;">
${content}
</section>`
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
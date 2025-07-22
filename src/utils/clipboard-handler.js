/**
 * 微信公众号复制工具 - 简化版
 */

/**
 * 复制到微信 - 核心函数
 */
export async function copyToWechatClean(html) {
  if (!html) {
    throw new Error('没有内容可复制')
  }

  try {
    // 创建一个临时容器
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.left = '0'
    container.style.top = '0'
    container.style.width = '1px'
    container.style.height = '1px'
    container.style.overflow = 'hidden'
    container.style.opacity = '0.01'
    container.style.zIndex = '-1000'
    
    // 设置内容
    container.innerHTML = html
    document.body.appendChild(container)
    
    // 选择并复制
    const range = document.createRange()
    range.selectNodeContents(container)
    
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
    
    // 执行复制
    const success = document.execCommand('copy')
    
    // 清理
    selection.removeAllRanges()
    document.body.removeChild(container)
    
    if (!success) {
      throw new Error('复制失败')
    }
    
    return true
  } catch (error) {
    console.error('复制失败:', error)
    throw error
  }
}

/**
 * 另一种方法：使用纯文本选择
 */
export function copyAsRichText(element) {
  try {
    // 创建选择范围
    const range = document.createRange()
    range.selectNode(element)
    
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
    
    // 复制
    const success = document.execCommand('copy')
    
    // 清理选择
    selection.removeAllRanges()
    
    return success
  } catch (error) {
    console.error('复制失败:', error)
    return false
  }
}

/**
 * 重建HTML为微信公众号格式
 */
export function rebuildHtmlForWechat(html) {
  // 直接返回HTML，因为我们已经在markdown-parser中处理好了所有样式
  return html
}

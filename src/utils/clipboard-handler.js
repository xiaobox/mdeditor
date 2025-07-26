/**
 * 微信公众号复制工具 - 简化版
 */

/**
 * 复制到微信 - 核心函数（优化版，支持大内容）
 */
export async function copyToWechatClean(html) {
  if (!html) {
    throw new Error('没有内容可复制')
  }

  // 检查内容大小
  const sizeKB = (html.length / 1024).toFixed(1)
  console.log(`准备复制内容，大小: ${sizeKB}KB`)

  try {
    // 对于超大内容，使用分段处理
    if (html.length > 100000) { // 100KB以上
      console.warn('内容较大，可能影响复制性能')
    }

    // 使用优化的富文本容器
    const container = createRichTextContainer(html)

    // 设置临时容器样式
    container.style.position = 'fixed'
    container.style.left = '-9999px'
    container.style.top = '0'
    container.style.width = 'auto'
    container.style.height = 'auto'
    container.style.opacity = '1'
    container.style.zIndex = '-1000'

    document.body.appendChild(container)

    // 添加超时控制
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('复制操作超时')), 10000) // 10秒超时
    })

    const copyPromise = (async () => {
      // 选择并复制
      const range = document.createRange()
      range.selectNodeContents(container)

      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)

      let success = false
      let lastError = null

      // 方法1：尝试使用现代 Clipboard API
      try {
        console.log('尝试使用 Clipboard API...')
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([container.outerHTML], { type: 'text/html' }),
            'text/plain': new Blob([container.textContent], { type: 'text/plain' })
          })
        ])
        success = true
        console.log('Clipboard API 复制成功')
      } catch (modernError) {
        console.log('Clipboard API 失败:', modernError.message)
        lastError = modernError

        // 方法2：降级到传统 execCommand
        try {
          console.log('尝试使用 execCommand...')
          success = document.execCommand('copy')
          if (success) {
            console.log('execCommand 复制成功')
          } else {
            console.log('execCommand 复制失败')
          }
        } catch (execError) {
          console.log('execCommand 失败:', execError.message)
          lastError = execError
        }
      }

      // 清理
      selection.removeAllRanges()
      document.body.removeChild(container)

      if (!success) {
        throw lastError || new Error('所有复制方法都失败了')
      }

      return true
    })()

    // 使用 Promise.race 实现超时控制
    const result = await Promise.race([copyPromise, timeoutPromise])
    console.log(`复制完成，内容大小: ${sizeKB}KB`)
    return result

  } catch (error) {
    console.error('复制失败:', error)

    // 提供更详细的错误信息
    if (error.message.includes('超时')) {
      throw new Error(`复制超时：内容过大(${sizeKB}KB)，请尝试减少内容`)
    } else if (error.name === 'NotAllowedError') {
      throw new Error('浏览器不允许访问剪贴板，请检查权限设置')
    } else if (error.message.includes('ClipboardItem')) {
      throw new Error('浏览器不支持富文本复制，请使用较新的浏览器')
    } else {
      throw new Error(`复制失败(${sizeKB}KB): ${error.message}`)
    }
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
  // 直接返回HTML，因为我们已经使用了超简化的格式化器
  return html
}

/**
 * 创建富文本复制容器
 * 专门为微信公众号优化
 */
export function createRichTextContainer(html) {
  const container = document.createElement('div')

  // 设置容器样式，确保微信能正确识别
  container.style.cssText = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    color: #333;
    background-color: #ffffff;
    padding: 0;
    margin: 0;
    word-wrap: break-word;
    text-align: left;
  `

  container.innerHTML = html
  return container
}

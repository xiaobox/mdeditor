/**
 * @file tests/composables/useContentState.test.js
 * @description useContentState composable 测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock window.confirm
const mockConfirm = vi.fn()
global.confirm = mockConfirm

describe('useContentState', () => {
  beforeEach(() => {
    localStorage.clear()
    mockConfirm.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('应该有初始内容', async () => {
    const { useContentState } = await import('@/composables/useContentState.js')
    const { markdownContent } = useContentState()

    expect(markdownContent.value).toBeDefined()
    expect(markdownContent.value.length).toBeGreaterThan(0)
    expect(markdownContent.value).toContain('# Markdown')
  })

  it('应该能够更新 Markdown 内容', async () => {
    const { useContentState } = await import('@/composables/useContentState.js')
    const { markdownContent, updateMarkdownContent } = useContentState()

    updateMarkdownContent('# 新内容')
    expect(markdownContent.value).toBe('# 新内容')
  })

  it('应该能够更新 HTML 内容', async () => {
    const { useContentState } = await import('@/composables/useContentState.js')
    const { htmlContent, updateHtmlContent } = useContentState()

    updateHtmlContent('<h1>标题</h1>')
    expect(htmlContent.value).toBe('<h1>标题</h1>')
  })

  it('应该正确计算 hasContent', async () => {
    const { useContentState } = await import('@/composables/useContentState.js')
    const { hasContent, updateMarkdownContent } = useContentState()

    // 初始有内容
    expect(hasContent.value).toBe(true)

    // 清空内容
    updateMarkdownContent('')
    expect(hasContent.value).toBe(false)

    // 只有空白字符
    updateMarkdownContent('   \n\t  ')
    expect(hasContent.value).toBe(false)

    // 有实际内容
    updateMarkdownContent('# 标题')
    expect(hasContent.value).toBe(true)
  })

  it('应该正确计算 isHtmlReady', async () => {
    const { useContentState } = await import('@/composables/useContentState.js')
    const { isHtmlReady, updateHtmlContent } = useContentState()

    // 初始为空
    expect(isHtmlReady.value).toBe(false)

    // 设置 HTML 内容
    updateHtmlContent('<p>内容</p>')
    expect(isHtmlReady.value).toBe(true)
  })

  it('应该正确计算字符数', async () => {
    const { useContentState } = await import('@/composables/useContentState.js')
    const { characterCount, updateMarkdownContent } = useContentState()

    updateMarkdownContent('12345')
    expect(characterCount.value).toBe(5)

    updateMarkdownContent('你好世界')
    expect(characterCount.value).toBe(4)
  })

  it('应该正确计算行数', async () => {
    const { useContentState } = await import('@/composables/useContentState.js')
    const { lineCount, updateMarkdownContent } = useContentState()

    updateMarkdownContent('第一行\n第二行\n第三行')
    expect(lineCount.value).toBe(3)

    updateMarkdownContent('单行内容')
    expect(lineCount.value).toBe(1)
  })

  it('应该正确计算字数（中英文混合）', async () => {
    const { useContentState } = await import('@/composables/useContentState.js')
    const { wordCount, updateMarkdownContent } = useContentState()

    // 纯中文
    updateMarkdownContent('你好世界')
    expect(wordCount.value).toBe(4) // 4 个中文字符

    // 纯英文
    updateMarkdownContent('hello world test')
    expect(wordCount.value).toBe(3) // 3 个英文单词

    // 中英混合
    updateMarkdownContent('你好 hello 世界 world')
    expect(wordCount.value).toBe(6) // 2 中文 + 2 英文单词 + 2 中文
  })

  it('应该正确计算预计阅读时间', async () => {
    const { useContentState } = await import('@/composables/useContentState.js')
    const { estimatedReadTime, updateMarkdownContent } = useContentState()

    // 少量内容，最少1分钟
    updateMarkdownContent('你好')
    expect(estimatedReadTime.value).toBe(1)

    // 200字约1分钟
    updateMarkdownContent('字'.repeat(200))
    expect(estimatedReadTime.value).toBe(1)

    // 400字约2分钟
    updateMarkdownContent('字'.repeat(400))
    expect(estimatedReadTime.value).toBe(2)
  })

  it('应该能够清空内容', async () => {
    const { useContentState } = await import('@/composables/useContentState.js')
    const notifyFn = vi.fn()
    const { markdownContent, htmlContent, clearContent, updateHtmlContent } = useContentState({
      onNotify: notifyFn
    })

    updateHtmlContent('<p>测试</p>')
    clearContent()

    expect(markdownContent.value).toBe('')
    expect(htmlContent.value).toBe('')
    expect(notifyFn).toHaveBeenCalledWith('内容已清空', 'info')
  })

  it('应该能够加载示例内容（用户确认）', async () => {
    const { useContentState } = await import('@/composables/useContentState.js')
    const notifyFn = vi.fn()
    mockConfirm.mockReturnValue(true)

    const { markdownContent, updateMarkdownContent, loadSample } = useContentState({
      onNotify: notifyFn
    })

    // 先清空内容
    updateMarkdownContent('')

    // 加载示例
    loadSample()

    expect(mockConfirm).toHaveBeenCalled()
    expect(markdownContent.value).toContain('# Markdown')
    expect(notifyFn).toHaveBeenCalledWith('示例内容已加载', 'success')
  })

  it('应该在用户取消时不加载示例内容', async () => {
    const { useContentState } = await import('@/composables/useContentState.js')
    const notifyFn = vi.fn()
    mockConfirm.mockReturnValue(false)

    const { markdownContent, updateMarkdownContent, loadSample } = useContentState({
      onNotify: notifyFn
    })

    // 先设置自定义内容
    updateMarkdownContent('# 我的内容')

    // 尝试加载示例（用户取消）
    loadSample()

    expect(mockConfirm).toHaveBeenCalled()
    expect(markdownContent.value).toBe('# 我的内容')
    expect(notifyFn).not.toHaveBeenCalled()
  })

  it('空内容时 lineCount 应该为 0', async () => {
    const { useContentState } = await import('@/composables/useContentState.js')
    const { lineCount, updateMarkdownContent } = useContentState()

    updateMarkdownContent('')
    expect(lineCount.value).toBe(0)
  })

  it('空内容时 wordCount 应该为 0', async () => {
    const { useContentState } = await import('@/composables/useContentState.js')
    const { wordCount, updateMarkdownContent } = useContentState()

    updateMarkdownContent('')
    expect(wordCount.value).toBe(0)

    updateMarkdownContent('   ')
    expect(wordCount.value).toBe(0)
  })
})

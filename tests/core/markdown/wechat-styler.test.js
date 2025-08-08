/**
 * @file tests/core/markdown/wechat-styler.test.js
 * @description 微信样式后处理器（WeChatStyler）测试
 */

import { describe, it, expect } from 'vitest'
import { wrapWithFontStyles, WeChatStyler } from '../../../src/core/markdown/post-processors/wechat-styler.js'

describe('WeChatStyler', () => {
  const html = '<p>段落</p><h2>标题</h2>'
  const fontSettings = { fontFamily: 'microsoft-yahei', fontSize: 16, lineHeight: 1.6, letterSpacing: 0 }

  it('wrapWithFontStyles 应返回包含外层 section 的 HTML', () => {
    const out = wrapWithFontStyles(html, fontSettings)
    expect(out).toContain('data-role="outer"')
    expect(out).toContain('line-height: 1.6')
  })

  it('process 在非预览模式且有字体设置时应包裹样式', () => {
    const out = WeChatStyler.process(html, { fontSettings, isPreview: false })
    expect(out).toContain('data-role="outer"')
  })

  it('process 在预览模式下返回原始 HTML', () => {
    const out = WeChatStyler.process(html, { fontSettings, isPreview: true })
    expect(out).toBe(html)
  })
})



import { describe, it, expect } from 'vitest'
import { FontProcessor } from '../../../src/core/markdown/parser/processors/FontProcessor.js'

const html = `
<h1>标题</h1>
<h2 style="color: red">副标题</h2>
<p>段落</p>
<ul><li>项1</li></ul>
<blockquote>q</blockquote>
`

describe('FontProcessor - typography normalization', () => {
  it('should add missing font-size/line-height without overriding existing styles', () => {
    const out = FontProcessor.process(html, { fontSettings: { fontSize: 16, lineHeight: 1.6, letterSpacing: 0 } })
    // h1 默认补齐
    expect(out).toMatch(/<h1[^>]*style="[^"]*font-size: 16px;[^"]*line-height: 1.3em !important;[^"]*"/)
    // h2 已有 color，不应被移除，同时补齐字号/行高
    expect(out).toMatch(/<h2[^>]*style="[^"]*color: red;[^"]*font-size: 24px;[^"]*line-height: 1.4em !important;[^"]*"/)
    // p 补齐字号/行高
    expect(out).toMatch(/<p[^>]*style="[^"]*font-size: 16px;[^"]*line-height: 1.6 !important;[^"]*"/)
    // li 补齐字号/行高
    expect(out).toMatch(/<li[^>]*style="[^"]*font-size: 16px;[^"]*line-height: 1.6 !important;[^"]*"/)
    // blockquote 补齐字号/行高，不覆盖主题
    expect(out).toMatch(/<blockquote[^>]*style="[^"]*font-size: 16px;[^"]*line-height: 1.6 !important;[^"]*"/)
  })

  it('should be idempotent (running twice gives same result)', () => {
    const out1 = FontProcessor.process(html, { fontSettings: { fontSize: 18, letterSpacing: 1 } })
    const out2 = FontProcessor.process(out1, { fontSettings: { fontSize: 18, letterSpacing: 1 } })
    expect(out2).toBe(out1)
  })
})


/**
 * @file tests/core/markdown/formatters.test.js
 * @description Markdown 格式化函数基础测试（内联文本、代码块、引用块）
 */

import { describe, it, expect } from 'vitest'
import { defaultColorTheme } from '../../../src/core/theme/presets/color-themes.js'
import { getCodeStyle } from '../../../src/core/theme/presets/code-styles.js'
import { processAllInlineFormats } from '../../../src/core/markdown/formatters/text.js'
import { formatCodeBlock, formatBlockquote } from '../../../src/core/markdown/formatters/legacy.js'

describe('Markdown 格式化基础', () => {
  it('内联格式应生成正确的 HTML（粗体/斜体/高亮/内联代码）', () => {
    const input = '这是 **粗体** 和 *斜体*，以及 ==高亮== 和 `code` 链接 https://a.com'
    const html = processAllInlineFormats(input, defaultColorTheme, true, 16)
    expect(html).toMatch(/<strong[^>]*>粗体<\/strong>/)
    expect(html).toMatch(/<em[^>]*>斜体<\/em>/)
    expect(html).toMatch(/<mark[^>]*>/)
    expect(html).toMatch(/<code[^>]*>code<\/code>/)
    // 链接可能保持纯文本或转换为 <a>，此处仅验证文本存在
    expect(html).toContain('https://a.com')
  })

  it('代码块应采用代码样式并包含代码内容', () => {
    const code = 'console.log(123)'
    const mac = getCodeStyle('mac')
    const html = formatCodeBlock(code, 'javascript', defaultColorTheme, mac, false, 16)
    expect(html).toContain('<pre')
    expect(html).toContain('<code')
    expect(html).toContain('console')
  })

  it('引用块应包含主题主色的边框', () => {
    const lines = ['> 第一行', '> 第二行']
    const html = formatBlockquote(lines, defaultColorTheme, 16)
    expect(html).toContain('border-left: 4px solid')
  })
})



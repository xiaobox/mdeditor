/**
 * Ensure underscores in image URLs are not treated as italic markers
 * across the full inline formatting pipeline.
 */
import { describe, it, expect } from 'vitest'
import { defaultColorTheme } from '../../src/core/theme/presets/color-themes.js'
import { processAllInlineFormats } from '../../src/core/markdown/formatters/text.js'
import { parseMarkdown } from '../../src/core/markdown/parser/coordinator.js'

const theme = defaultColorTheme

const url = 'https://xiaobox-public-images.oss-cn-beijing.aliyuncs.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20250828173500_1138_15.jpg'

describe('Underscore italic should not corrupt image URLs', () => {
  it('processAllInlineFormats keeps <img src> intact and contains no <em> markup', () => {
    const md = `![](${url})`
    const out = processAllInlineFormats(md, theme, true, 16)
    expect(out).toContain(`<img src="${url}"`)
    // 提取 src 并精确比对
    const m = out.match(/<img[^>]+src="([^"]+)"/)
    expect(m && m[1]).toBe(url)
    // 不应出现 <em> 标签
    expect(out).not.toMatch(/<em/i)
    // 不应出现将 <em> 百分号编码进 URL 的情况
    expect(out).not.toMatch(/%3Cem/i)
  })

  it('parseMarkdown pipeline keeps URL intact', () => {
    const md = `![](${url})`
    const html = parseMarkdown(md, { isPreview: true })
    expect(html).toMatch(`<img src="${url}"`)
    const m = html.match(/<img[^>]+src="([^"]+)"/)
    expect(m && m[1]).toBe(url)
    expect(html).not.toMatch(/<em/i)
    expect(html).not.toMatch(/%3Cem/i)
  })
})


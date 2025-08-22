import { describe, it, expect } from 'vitest'
import { MarkdownParser } from '../../../src/core/markdown/parser/core/MarkdownParser.js'
import { parseMarkdown } from '../../../src/core/markdown/parser/coordinator.js'

const mdSample = `# 标题一\n\n- 列表项\n\n| A | B |\n|---|---|\n| 1 | 2 |\n\n> 引用一行`;

describe('MarkdownParser.parse 输出一致性', () => {
  it('应与 parseMarkdown 对同一输入输出一致（非预览）', () => {
    const parser = new MarkdownParser()
    const a = parser.parse(mdSample, { isPreview: false })
    const b = parseMarkdown(mdSample, { isPreview: false })
    expect(a).toBe(b)
  })

  it('应与 parseMarkdown 对同一输入输出一致（预览）', () => {
    const parser = new MarkdownParser()
    const a = parser.parse(mdSample, { isPreview: true })
    const b = parseMarkdown(mdSample, { isPreview: true })
    expect(a).toBe(b)
  })
})


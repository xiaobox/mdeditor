/**
 * @file tests/core/editor/copy-formats.test.js
 * @description 复制格式逻辑（公众号/Markdown/选项列表）测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { copySocialFormat, copyMarkdownFormat, getCopyFormatOptions } from '../../../src/core/editor/copy-formats.js'

// 模拟 parseMarkdown 输出与剪贴板行为
vi.mock('../../../src/core/markdown/parser/index.js', () => ({
  parseMarkdown: vi.fn(() => '<p>HTML</p>')
}))

vi.mock('../../../src/core/editor/clipboard.js', () => ({
  copyToSocialClean: vi.fn(async () => true)
}))

describe('copySocialFormat', () => {
  it('空内容应返回失败', async () => {
    const r = await copySocialFormat('   ')
    expect(r.success).toBe(false)
  })

  it('应调用解析并复制富文本', async () => {
    const r = await copySocialFormat('# hi', { fontSettings: { fontSize: 16 } })
    expect(r.success).toBe(true)
    expect(r.message).toContain('复制')
  })
})

describe('copyMarkdownFormat', () => {
  beforeEach(() => {
    // 模拟 navigator.clipboard
    Object.assign(global, {
      navigator: { clipboard: { writeText: vi.fn(async () => true) } }
    })
  })

  it('空内容应返回失败', async () => {
    const r = await copyMarkdownFormat('   ')
    expect(r.success).toBe(false)
  })

  it('应调用系统剪贴板写入', async () => {
    const r = await copyMarkdownFormat('hello')
    expect(r.success).toBe(true)
  })
})

describe('getCopyFormatOptions', () => {
  it('应返回包含 social 与 markdown 两项', () => {
    const opts = getCopyFormatOptions()
    expect(opts.find(o => o.value === 'social')).toBeTruthy()
    expect(opts.find(o => o.value === 'markdown')).toBeTruthy()
  })
})


import { describe, it, expect } from 'vitest'
import { ThemeProcessor } from '../../../src/core/markdown/parser/processors/ThemeProcessor.js'

const htmlTable = `
<table style="border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 16px; line-height: 1.6;">
  <thead><tr style="background-color: #f6f8fa;"><th style="border: 1px solid #d0d7de; padding: 8px 12px; text-align: left; font-weight: 600; color: #24292e; font-size: 16px;">A</th><th style="border: 1px solid #d0d7de; padding: 8px 12px; text-align: left; font-weight: 600; color: #24292e; font-size: 16px;">B</th></tr></thead>
  <tbody>
    <tr><td style="border: 1px solid #d0d7de; padding: 8px 12px; text-align: left; color: #24292e; font-size: 16px;">1</td><td style="border: 1px solid #d0d7de; padding: 8px 12px; text-align: left; color: #24292e; font-size: 16px;">2</td></tr>
  </tbody>
</table>`

const opts = { colorTheme: { primary: '#5865F2' }, isPreview: false }

describe('ThemeProcessor - table normalization', () => {
  it('should be idempotent and keep table/cell styles intact', () => {
    const once = ThemeProcessor.process(htmlTable, opts)
    const twice = ThemeProcessor.process(once, opts)
    expect(twice).toBe(once)
  })

  it('should not remove existing font-size/line-height from table or cells', () => {
    const out = ThemeProcessor.process(htmlTable, opts)
    expect(out).toContain('font-size: 16px')
    expect(out).toContain('line-height: 1.6')
  })
})


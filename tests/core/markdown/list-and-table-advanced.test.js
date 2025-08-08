/**
 * @file tests/core/markdown/list-and-table-advanced.test.js
 * @description 复杂列表/表格边界用例
 */

import { describe, it, expect } from 'vitest'
import { parseMarkdown } from '../../../src/core/markdown/parser/coordinator.js'

describe('复杂列表与表格', () => {
  it('支持两层嵌套的无序列表与任务列表混排', () => {
    const md = [
      '- 一级项',
      '  - 二级项A',
      '  - [x] 二级任务',
      '    - 三级项（应视作第二层渲染，因处理器以行渲染为主）',
    ].join('\n')

    const html = parseMarkdown(md, { isPreview: false })
    expect(html).toContain('二级项A')
    expect(html).toContain('二级任务')
  })

  it('表格对齐：左/中/右 三列混合对齐', () => {
    const md = [
      '| 左 | 中 | 右 |',
      '|:---|:--:|---:|',
      '| a  |  b |   c|',
    ].join('\n')

    const html = parseMarkdown(md, { isPreview: false })
    expect(html).toMatch(/<th[^>]*text-align: left/)
    expect(html).toMatch(/<th[^>]*text-align: center/)
    expect(html).toMatch(/<th[^>]*text-align: right/)
    expect(html).toContain('<td')
  })
})



/**
 * @file tests/core/markdown/list-and-table.test.js
 * @description 列表与表格处理器基础测试
 */

import { describe, it, expect } from 'vitest'
import { defaultColorTheme } from '../../../src/core/theme/presets/color-themes.js'
import { ListProcessor } from '../../../src/core/markdown/processors/list.js'
import { TableProcessor } from '../../../src/core/markdown/processors/table.js'

describe('列表处理器', () => {
  it('应正确识别与格式化无序列表', () => {
    const lp = new ListProcessor()
    const line = '* 项目A'
    const { isListItem, result } = lp.processListLine(line, defaultColorTheme)
    expect(isListItem).toBe(true)
    expect(result).toContain('<p')
    expect(result).toContain('项目A')
  })

  it('应正确识别与格式化任务列表（勾选/未勾选）', () => {
    const lp = new ListProcessor()
    const checked = '- [x] 完成任务'
    const unchecked = '- [ ] 待办任务'
    const r1 = lp.processListLine(checked, defaultColorTheme)
    const r2 = lp.processListLine(unchecked, defaultColorTheme)
    expect(r1.isListItem).toBe(true)
    expect(r1.result).toContain('完成任务')
    expect(r2.result).toContain('待办任务')
  })
})

describe('表格处理器', () => {
  it('应识别简单表格并生成表格 HTML', () => {
    const tp = new TableProcessor()
    const lines = [
      '| 列1 | 列2 |',
      '| --- | --- |',
      '| a   | b   |'
    ]

    // 模拟逐行处理
    let html = ''
    let i = 0
    while (i < lines.length) {
      const line = lines[i]
      const r = tp.processTableRow(line, line.trim(), lines, i, defaultColorTheme)
      if (!r.shouldContinue && r.result) {
        html += r.result
      }
      if (r.reprocessLine) continue
      i++
    }

    // 末尾完成
    if (tp.isProcessingTable()) {
      html += tp.completeTable(defaultColorTheme)
    }

    expect(html).toContain('<table')
    expect(html).toContain('<thead>')
    expect(html).toContain('<tbody>')
  })
})



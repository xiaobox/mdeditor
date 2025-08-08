/**
 * @file tests/core/markdown/highlight-code.test.js
 * @description 代码高亮基础测试（通用规则）
 */

import { describe, it, expect } from 'vitest'
import { getCodeStyle } from '../../../src/core/theme/presets/code-styles.js'
import { highlightCode } from '../../../src/core/markdown/formatters/code.js'

describe('highlightCode', () => {
  it('无语法配置时输出转义文本并保护空格', () => {
    const out = highlightCode('a < b', 'javascript', null)
    expect(out).toContain('&lt;')
  })

  it('有语法配置时对关键字/字符串/数字做高亮包装', () => {
    const code = 'const s = "hi"; // k\n123'
    const mac = getCodeStyle('mac')
    const out = highlightCode(code, 'javascript', mac)
    expect(out).toContain('syntax-keyword')
    expect(out).toContain('syntax-string')
    expect(out).toContain('syntax-number')
  })
})



/**
 * @file tests/shared/utils/text.test.js
 * @description TextUtils 与导出便捷函数测试
 */

import { describe, it, expect } from 'vitest'
import { TextUtils, cleanUrl, sanitizeAttribute } from '../../../src/shared/utils/text.js'

describe('TextUtils.escapeHtml/unescapeHtml', () => {
  it('escapeHtml 应转义常见字符', () => {
    expect(TextUtils.escapeHtml('<div>"\'/&</div>')).toBe('&lt;div&gt;&quot;&#39;&#x2F;&amp;&lt;&#x2F;div&gt;')
  })

  it('unescapeHtml 应反转义常见实体', () => {
    const s = '&lt;span&gt;&quot;&#39;&amp;&lt;/span&gt;'
    expect(TextUtils.unescapeHtml(s)).toBe('<span>"\'&</span>')
  })
})

describe('TextUtils.cleanText', () => {
  it('应统一换行、转换制表符、清理行尾空白并限制连续空行', () => {
    const src = 'a\r\nb\r c\t\n\n\n  ' // CRLF+CR、tab、多空行与行末空格
    const out = TextUtils.cleanText(src, { tabSize: 2 })
    expect(out).toBe('a\nb\n c\n\n')
  })
})

describe('TextUtils.cleanUrl + 便捷导出', () => {
  it('无协议时应补 https:// 并校验协议', () => {
    expect(cleanUrl('example.com')).toBe('https://example.com/')
  })
  it('非法协议应返回空字符串', () => {
    expect(cleanUrl('javascript:alert(1)')).toBe('')
  })
})

describe('TextUtils.sanitizeAttribute', () => {
  it('应转义引号和尖括号并替换换行', () => {
    expect(sanitizeAttribute('"\'<>\n')).toBe('&quot;&#39;&lt;&gt; ')
  })
})


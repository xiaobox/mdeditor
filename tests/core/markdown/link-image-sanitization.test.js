/**
 * @file tests/core/markdown/link-image-sanitization.test.js
 */

import { describe, it, expect } from 'vitest'
import { defaultColorTheme } from '../../../src/core/theme/presets/color-themes.js'
import { processLinks, processImages } from '../../../src/core/markdown/formatters/link.js'

const theme = defaultColorTheme

describe('URL sanitization in links/images', () => {
  it('sanitizes link href using shared cleanUrl and strips unsafe', () => {
    const md = '[x]( javascript:alert(1) ) and [ok](example.com)'
    const out = processLinks(md, theme)
    expect(out).not.toMatch(/javascript:/)
    // unsafe link should not create an anchor tag for the malicious part
    expect(out).not.toMatch(/>\s*x\s*<\/a>/)
    expect(out).toMatch(/\bx\s*\)\s*and/) // leftover ")" from URL inner paren
    expect(out).toContain('<a href="https://example.com/"')
  })

  it('sanitizes image src and replaces unsafe image with placeholder', () => {
    const md = '![alt](javascript:alert(1)) and ![ok](example.com/p.png)'
    const out = processImages(md, theme)
    expect(out).not.toMatch(/javascript:/)
    // unsafe image becomes placeholder span
    expect(out).toContain('<span class="md-image-placeholder">alt</span>')
    expect(out).toMatch(/<img src="https:\/\/example.com\/p.png/)
  })

  it('escapes alt text in placeholder', () => {
    const md = '![<b>x</b>](javascript:1)'
    const out = processImages(md, theme)
    // our escapeHtml maps closing tag slash to &#x2F;
    expect(out).toContain('<span class="md-image-placeholder">&lt;b&gt;x&lt;&#x2F;b&gt;</span>')
  })
})


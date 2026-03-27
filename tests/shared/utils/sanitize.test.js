/**
 * @file tests/shared/utils/sanitize.test.js
 * @description sanitizeHtml() XSS 防护与渲染保真度测试
 */

import { describe, it, expect } from 'vitest'
import { sanitizeHtml } from '@utils/sanitize.js'

describe('sanitizeHtml', () => {
  describe('XSS payload removal', () => {
    it('removes script tags and their content', () => {
      expect(sanitizeHtml('<script>alert(1)</script>')).toBe('')
    })

    it('removes img onerror event handler', () => {
      const result = sanitizeHtml('<img src=x onerror=alert(1)>')
      expect(result).not.toContain('onerror')
    })

    it('removes javascript: URI from anchor href', () => {
      const result = sanitizeHtml('<a href="javascript:alert(1)">click</a>')
      expect(result).not.toContain('javascript:')
    })

    it('removes iframe tags', () => {
      expect(sanitizeHtml('<iframe src="evil.com"></iframe>')).toBe('')
    })

    it('removes object tags', () => {
      expect(sanitizeHtml('<object data="evil.swf"></object>')).toBe('')
    })

    it('removes embed tags', () => {
      expect(sanitizeHtml('<embed src="evil.swf">')).toBe('')
    })

    it('removes form, input, and textarea tags', () => {
      expect(sanitizeHtml('<form action="evil"><input type="text"><textarea></textarea></form>')).toBe('')
    })

    it('removes onmouseover event handler from div', () => {
      const result = sanitizeHtml('<div onmouseover="alert(1)">hover</div>')
      expect(result).not.toContain('onmouseover')
    })

    it('removes onload event handler from SVG', () => {
      const result = sanitizeHtml('<svg onload="alert(1)"><rect/></svg>')
      expect(result).not.toContain('onload')
    })
  })

  describe('legitimate HTML preserved', () => {
    it('preserves inline style attributes', () => {
      const input = '<p style="color: red; font-size: 16px;">text</p>'
      const result = sanitizeHtml(input)
      expect(result).toContain('style=')
    })

    it('preserves CSS class attributes', () => {
      const input = '<div class="markdown-body theme-breeze">content</div>'
      const result = sanitizeHtml(input)
      expect(result).toContain('class=')
    })

    it('preserves heading with style', () => {
      const input = '<h1 style="font-weight: bold;">Title</h1>'
      const result = sanitizeHtml(input)
      expect(result).toContain('<h1')
      expect(result).toContain('style=')
    })

    it('preserves anchor href with https', () => {
      const input = '<a href="https://example.com">link</a>'
      const result = sanitizeHtml(input)
      expect(result).toContain('href=')
    })

    it('preserves pre/code blocks with class', () => {
      const input = '<pre><code class="language-js">code</code></pre>'
      const result = sanitizeHtml(input)
      expect(result).toContain('<pre>')
      expect(result).toContain('<code')
      expect(result).toContain('class=')
    })
  })

  describe('SVG content preserved', () => {
    it('preserves full Mermaid-like SVG with path, fill, stroke', () => {
      const input = '<svg class="mermaid-svg" viewBox="0 0 100 100"><g><path d="M0,0 L100,100" fill="none" stroke="#333"></path></g></svg>'
      const result = sanitizeHtml(input)
      expect(result).toContain('<svg')
      expect(result).toContain('mermaid-svg')
      expect(result).toContain('viewBox')
      expect(result).toContain('<path')
      expect(result).toContain('d=')
      expect(result).toContain('fill=')
      expect(result).toContain('stroke=')
    })

    it('preserves rect with position and size attributes', () => {
      const input = '<svg><rect x="10" y="20" width="100" height="50" rx="5" ry="5"></rect></svg>'
      const result = sanitizeHtml(input)
      expect(result).toContain('<rect')
      expect(result).toContain('x=')
      expect(result).toContain('y=')
      expect(result).toContain('width=')
      expect(result).toContain('height=')
    })

    it('preserves text element with text-anchor and font-size', () => {
      const input = '<svg><text text-anchor="middle" font-size="14">label</text></svg>'
      const result = sanitizeHtml(input)
      expect(result).toContain('<text')
      expect(result).toContain('text-anchor')
    })

    it('preserves defs and marker elements', () => {
      const input = '<svg><defs><marker id="arrow"></marker></defs></svg>'
      const result = sanitizeHtml(input)
      expect(result).toContain('<defs')
      expect(result).toContain('<marker')
    })

    it('preserves circle with cx, cy, r attributes', () => {
      const input = '<svg><circle cx="50" cy="50" r="25"></circle></svg>'
      const result = sanitizeHtml(input)
      expect(result).toContain('<circle')
      expect(result).toContain('cx=')
      expect(result).toContain('cy=')
      expect(result).toContain('r=')
    })
  })

  describe('MathML content preserved', () => {
    it('preserves basic math expression with mrow, mi, mo, mn', () => {
      const input = '<math><mrow><mi>x</mi><mo>=</mo><mn>2</mn></mrow></math>'
      const result = sanitizeHtml(input)
      expect(result).toContain('<math')
      expect(result).toContain('<mrow')
      expect(result).toContain('<mi')
      expect(result).toContain('<mo')
      expect(result).toContain('<mn')
    })

    it('preserves mfrac element', () => {
      const input = '<math><mfrac><mn>1</mn><mn>2</mn></mfrac></math>'
      const result = sanitizeHtml(input)
      expect(result).toContain('<mfrac')
    })

    it('preserves msqrt element', () => {
      const input = '<math><msqrt><mn>2</mn></msqrt></math>'
      const result = sanitizeHtml(input)
      expect(result).toContain('<msqrt')
    })
  })

  describe('data-* attributes stripped', () => {
    it('strips data-formula attribute', () => {
      const input = '<span data-formula="E=mc^2">content</span>'
      const result = sanitizeHtml(input)
      expect(result).not.toContain('data-formula')
    })

    it('strips data-tool attribute', () => {
      const input = '<div data-tool="mathjax">math</div>'
      const result = sanitizeHtml(input)
      expect(result).not.toContain('data-tool')
    })
  })

  describe('edge cases', () => {
    it('returns empty string for empty input', () => {
      expect(sanitizeHtml('')).toBe('')
    })

    it('returns empty string for null input', () => {
      expect(sanitizeHtml(null)).toBe('')
    })

    it('returns empty string for undefined input', () => {
      expect(sanitizeHtml(undefined)).toBe('')
    })

    it('returns plain text unchanged', () => {
      expect(sanitizeHtml('plain text')).toBe('plain text')
    })
  })
})

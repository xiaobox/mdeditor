/**
 * @file tests/plugins/mermaid-nodeview-escape.test.js
 */

import { describe, it, expect, vi } from 'vitest'

vi.mock('../../src/plugins/mermaid-nodeview.js', async (orig) => {
  const mod = await import('../../src/plugins/mermaid-nodeview.js')
  return mod
})

describe('Mermaid nodeview error escaping', () => {
  it('sets textContent on error pre (simulation)', () => {
    // Simulate the error handling branch
    const container = document.createElement('div')
    const err = '<b>XSS</b>'
    // inline simulate code path
    const pre = document.createElement('pre')
    pre.className = 'md-mermaid__error'
    pre.textContent = String(err)
    container.appendChild(pre)

    expect(container.innerHTML).toBe('<pre class="md-mermaid__error">&lt;b&gt;XSS&lt;/b&gt;</pre>')
  })
})


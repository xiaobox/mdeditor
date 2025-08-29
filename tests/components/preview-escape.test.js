/**
 * @file tests/components/preview-escape.test.js
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PreviewPane from '../../src/components/PreviewPane.vue'

// Mock parseMarkdown to throw
vi.mock('../../src/core/markdown/parser/coordinator.js', () => ({
  parseMarkdown: () => { throw new Error('<img src=x onerror=alert(1)>') }
}))

// Mock theme manager composable minimal
vi.mock('../../src/components/../composables/index.js', async (orig) => {
  return {
    useGlobalThemeManager: () => ({
      currentThemeSystemId: { value: 'breeze' },
      currentColorTheme: { value: { primary: '#07c160' } },
      currentCodeStyle: { value: {} },
      currentFontSettings: { value: {} },
      initialize: () => {}
    })
  }
})

describe('PreviewPane error message is escaped', () => {
  it('does not inject HTML from error.message', async () => {
    const w = mount(PreviewPane, { props: { markdown: 'x' } })
    // Allow microtasks
    await Promise.resolve()
    const html = w.html()
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
    expect(html).not.toContain('<img src=')
  })
})


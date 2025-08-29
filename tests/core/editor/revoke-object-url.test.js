/**
 * @file tests/core/editor/revoke-object-url.test.js
 */

import { describe, it, expect, vi } from 'vitest'

import { copySocialFormat } from '../../../src/core/editor/copy-formats.js'

// Provide DOM APIs used in the function
beforeEach(() => {
  // minimal DOM stubs
  Object.defineProperty(document, 'body', { value: document.body, configurable: true })
})

describe('URL.revokeObjectURL guard', () => {
  it('does not call revokeObjectURL for data: URLs', async () => {
    // Some environments (jsdom) may not implement revokeObjectURL; add a stub
    const orig = URL.revokeObjectURL
    if (!orig) URL.revokeObjectURL = () => {}
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL')
    // Mock internals to force rasterize path with data: URL
    vi.doMock('../../../src/core/markdown/parser/index.js', () => ({
      parseMarkdown: () => '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="red"/></svg>'
    }))
    vi.doMock('../../../src/core/editor/clipboard.js', () => ({ copyToSocialClean: vi.fn(async () => true) }))

    const res = await copySocialFormat('```mermaid\nA-->B\n```')
    expect(res.success).toBeTypeOf('boolean')
    expect(revokeSpy).not.toHaveBeenCalled()
    revokeSpy.mockRestore()
    if (!orig) delete URL.revokeObjectURL
  })
})


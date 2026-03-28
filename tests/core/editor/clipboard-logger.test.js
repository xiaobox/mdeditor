/**
 * @file tests/core/editor/clipboard-logger.test.js
 * @description clipboard.js catch block logger integration test
 *
 * Verifies that the empty catch at clipboard.js:138 (inside the onCopy handler
 * of copyWithExecCommandViaListener) now produces a structured warn-level log.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('clipboard.js logger instrumentation', () => {
  const origClipboard = global.navigator?.clipboard
  const origClipboardItem = global.ClipboardItem
  const origExec = document.execCommand
  const origGetSel = window.getSelection

  let warnSpy

  beforeEach(() => {
    vi.restoreAllMocks()
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    // Restore globals
    if (origClipboard) {
      global.navigator.clipboard = origClipboard
    } else if (global.navigator) {
      delete global.navigator.clipboard
    }
    if (typeof origClipboardItem !== 'undefined') {
      global.ClipboardItem = origClipboardItem
    } else {
      delete global.ClipboardItem
    }
    document.execCommand = origExec
    window.getSelection = origGetSel
  })

  it('logs warn with [Clipboard] prefix and Error when clipboardData.setData throws', async () => {
    const { copyToSocialClean } = await import('../../../src/core/editor/clipboard.js')

    // Disable Clipboard API so code falls through to copyWithExecCommandViaListener
    global.navigator = { ...(global.navigator || {}), clipboard: undefined }

    // Mock execCommand to dispatch a copy event with poisoned clipboardData
    document.execCommand = vi.fn((cmd) => {
      if (cmd === 'copy') {
        const event = new Event('copy', { bubbles: true, cancelable: true })
        // Provide a clipboardData mock where setData throws
        event.clipboardData = {
          setData: () => { throw new Error('setData failed') }
        }
        document.dispatchEvent(event)
        return true // execCommand "succeeds"
      }
      return false
    })

    // Provide getSelection for the ghost element selection
    window.getSelection = () => ({
      removeAllRanges: vi.fn(),
      addRange: vi.fn()
    })

    await copyToSocialClean('<p>test</p>')

    // Assert console.warn was called with [Clipboard] prefix
    expect(warnSpy).toHaveBeenCalled()
    const calls = warnSpy.mock.calls
    const loggerCall = calls.find(
      args => typeof args[0] === 'string' && args[0].includes('[Clipboard]')
    )
    expect(loggerCall).toBeDefined()
    // arg[1] should describe the operation
    expect(typeof loggerCall[1]).toBe('string')
    expect(loggerCall[1]).toContain('clipboardData.setData')
    // Last arg should be an Error
    expect(loggerCall[loggerCall.length - 1]).toBeInstanceOf(Error)
  })
})

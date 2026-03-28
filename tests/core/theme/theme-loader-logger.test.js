/**
 * @file tests/core/theme/theme-loader-logger.test.js
 * @description loader.js catch block logger integration test
 *
 * Verifies that the empty catch at loader.js:62 (inside applyTheme when
 * parsing malformed custom theme JSON) now produces a structured debug-level log.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('theme-loader logger instrumentation', () => {
  let debugSpy

  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('style')
    vi.restoreAllMocks()
    vi.resetModules()
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
  })

  it('logs debug with [ThemeLoader] prefix and Error when custom theme JSON is malformed', async () => {
    // Set invalid JSON in localStorage before importing (triggers loadThemeEarly)
    localStorage.setItem('temp-custom-theme', 'INVALID JSON{{{')

    await import('../../../src/core/theme/loader.js')

    // Assert console.debug was called with [ThemeLoader] prefix
    expect(debugSpy).toHaveBeenCalled()
    const calls = debugSpy.mock.calls
    const loggerCall = calls.find(
      args => typeof args[0] === 'string' && args[0].includes('[ThemeLoader]')
    )
    expect(loggerCall).toBeDefined()
    // arg[1] should describe the parse failure
    expect(typeof loggerCall[1]).toBe('string')
    // Last arg should be an Error (SyntaxError from JSON.parse)
    expect(loggerCall[loggerCall.length - 1]).toBeInstanceOf(Error)
  })
})

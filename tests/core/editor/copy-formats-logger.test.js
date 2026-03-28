/**
 * @file tests/core/editor/copy-formats-logger.test.js
 * @description copy-formats.js catch block logger integration tests
 *
 * Verifies that 5 empty catch blocks in rasterizeMermaidSvgs now produce
 * structured debug-level log output via createModuleLogger('CopyFormats').
 *
 * Catch blocks tested:
 * 1. Line 176 - SVG element getBBox measurement (per child element)
 * 2. Line 196 - SVG root getBBox measurement
 * 3. Line 237 - Image decode optional step
 * 4. Line 266 - URL.revokeObjectURL cleanup (unreachable with data: URLs)
 * 5. Line 318 - SVG DOM removal in fallback path
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock mermaid module (not needed for rasterizeMermaidSvgs but imported at module top)
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn()
  }
}))

// Mock the math image converter (imported at module top)
vi.mock('../../../src/core/markdown/math/image-converter.js', () => ({
  solveMathForWeChat: vi.fn()
}))

// Mock parseMarkdown (imported at module top)
vi.mock('../../../src/core/markdown/index.js', () => ({
  parseMarkdown: vi.fn(() => '<p>HTML</p>')
}))

// Mock clipboard (imported at module top)
vi.mock('../../../src/core/editor/clipboard.js', () => ({
  copyToSocialClean: vi.fn(async () => true)
}))

describe('copy-formats.js logger instrumentation', () => {
  let debugSpy
  let rasterizeMermaidSvgs

  beforeEach(async () => {
    vi.restoreAllMocks()
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    // Also suppress console.warn from the outer catch (line 291)
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    const mod = await import('../../../src/core/editor/copy-formats.js')
    rasterizeMermaidSvgs = mod.rasterizeMermaidSvgs
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  /**
   * Helper: create a container with a mock SVG element.
   * jsdom does not implement getBBox on SVG elements, so it will naturally throw.
   */
  function createContainerWithSvg(svgAttrs = {}) {
    const container = document.createElement('div')
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

    // Set basic attributes so the fallback dimension code can work
    svg.setAttribute('width', '100')
    svg.setAttribute('height', '100')
    svg.setAttribute('viewBox', '0 0 100 100')

    // Add a child element (rect) so the inner getBBox loop runs
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('x', '10')
    rect.setAttribute('y', '10')
    rect.setAttribute('width', '80')
    rect.setAttribute('height', '80')
    svg.appendChild(rect)

    for (const [key, value] of Object.entries(svgAttrs)) {
      svg.setAttribute(key, value)
    }

    container.appendChild(svg)
    return { container, svg, rect }
  }

  it('logs debug with [CopyFormats] when SVG element getBBox measurement fails (line 176)', async () => {
    const { container } = createContainerWithSvg()

    // In jsdom, getBBox is not implemented on SVG elements -- it will throw TypeError.
    // This naturally triggers the catch at line 176.

    // Mock Image to resolve load and prevent further errors
    const origImage = global.Image
    global.Image = class MockImage {
      set src(v) { if (this.onload) setTimeout(() => this.onload(), 0) }
      get naturalWidth() { return 100 }
      get naturalHeight() { return 100 }
      decode() { return Promise.resolve() }
    }

    try {
      await rasterizeMermaidSvgs(container, 2)
    } catch {
      // May throw due to jsdom canvas limitations -- that's OK
    }

    global.Image = origImage

    // Check that debug was called with [CopyFormats] prefix
    const loggerCalls = debugSpy.mock.calls.filter(
      args => typeof args[0] === 'string' && args[0].includes('[CopyFormats]')
    )
    expect(loggerCalls.length).toBeGreaterThanOrEqual(1)

    // Find the getBBox element measurement call
    const getBBoxCall = loggerCalls.find(
      args => typeof args[1] === 'string' && args[1].toLowerCase().includes('svg element')
    )
    expect(getBBoxCall).toBeDefined()
    expect(getBBoxCall[getBBoxCall.length - 1]).toBeInstanceOf(Error)
  })

  it('logs debug with [CopyFormats] when SVG root getBBox measurement fails (line 196)', async () => {
    const { container } = createContainerWithSvg()

    // In jsdom, svg.getBBox() is not implemented -- naturally throws.
    // This triggers the catch at line 196.

    const origImage = global.Image
    global.Image = class MockImage {
      set src(v) { if (this.onload) setTimeout(() => this.onload(), 0) }
      get naturalWidth() { return 100 }
      get naturalHeight() { return 100 }
      decode() { return Promise.resolve() }
    }

    try {
      await rasterizeMermaidSvgs(container, 2)
    } catch {
      // May throw due to jsdom canvas limitations
    }

    global.Image = origImage

    const loggerCalls = debugSpy.mock.calls.filter(
      args => typeof args[0] === 'string' && args[0].includes('[CopyFormats]')
    )
    expect(loggerCalls.length).toBeGreaterThanOrEqual(1)

    // Find the root getBBox measurement call
    const rootBBoxCall = loggerCalls.find(
      args => typeof args[1] === 'string' && args[1].toLowerCase().includes('svg root')
    )
    expect(rootBBoxCall).toBeDefined()
    expect(rootBBoxCall[rootBBoxCall.length - 1]).toBeInstanceOf(Error)
  })

  it('logs debug with [CopyFormats] when img.decode() rejects (line 237)', async () => {
    const { container } = createContainerWithSvg()

    const origImage = global.Image
    global.Image = class MockImage {
      set src(v) { if (this.onload) setTimeout(() => this.onload(), 0) }
      get naturalWidth() { return 100 }
      get naturalHeight() { return 100 }
      decode() { return Promise.reject(new Error('decode failed')) }
    }

    try {
      await rasterizeMermaidSvgs(container, 2)
    } catch {
      // May throw due to jsdom canvas limitations
    }

    global.Image = origImage

    const loggerCalls = debugSpy.mock.calls.filter(
      args => typeof args[0] === 'string' && args[0].includes('[CopyFormats]')
    )

    // Find the decode-related call
    const decodeCall = loggerCalls.find(
      args => typeof args[1] === 'string' && args[1].toLowerCase().includes('decode')
    )
    expect(decodeCall).toBeDefined()
    expect(decodeCall[decodeCall.length - 1]).toBeInstanceOf(Error)
  })

  // Test 4: Line 266 (URL.revokeObjectURL) is unreachable with current data: URL generation.
  // The code guard `url.startsWith('blob:')` prevents execution since url is always 'data:image/svg+xml...'.
  // Verification of instrumentation is done via grep (acceptance criteria in PLAN.md).

  it('logs debug with [CopyFormats] when svg.remove() DOM cleanup fails in fallback (line 318)', async () => {
    const { container, svg } = createContainerWithSvg()

    // Make the Image load fail (onerror path) to reach the outer catch at line 288,
    // then make the fallback canvas fail too, reaching the inner catch at line 316.
    const origImage = global.Image
    global.Image = class MockImage {
      set src(v) { if (this.onerror) setTimeout(() => this.onerror(new Error('load failed')), 0) }
      get naturalWidth() { return 0 }
      get naturalHeight() { return 0 }
    }

    // Make svg.remove throw to trigger the catch at line 318
    const origRemove = svg.remove
    svg.remove = () => { throw new Error('remove failed') }

    // Also make svg.replaceWith throw to ensure we reach the fallback path
    svg.replaceWith = () => { throw new Error('replaceWith failed') }

    // Make the fallback canvas path fail (line 292-315) to reach the innermost catch
    const origCreateElement = document.createElement
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'canvas') {
        throw new Error('canvas creation failed')
      }
      return origCreateElement.call(document, tag)
    })

    try {
      await rasterizeMermaidSvgs(container, 2)
    } catch {
      // Expected to throw
    }

    global.Image = origImage
    createElementSpy.mockRestore()

    const loggerCalls = debugSpy.mock.calls.filter(
      args => typeof args[0] === 'string' && args[0].includes('[CopyFormats]')
    )

    // Find the svg.remove cleanup call
    const removeCall = loggerCalls.find(
      args => typeof args[1] === 'string' && args[1].toLowerCase().includes('svg')
        && args[1].toLowerCase().includes('removal')
    )
    expect(removeCall).toBeDefined()
    expect(removeCall[removeCall.length - 1]).toBeInstanceOf(Error)
  })
})

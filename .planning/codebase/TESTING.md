# Testing Patterns

**Analysis Date:** 2026-03-27

## Test Framework

**Runner:**
- Vitest 1.6.x
- Config: `vitest.config.js`

**Assertion Library:**
- Vitest built-in (`expect`, `describe`, `it`)
- `@vue/test-utils` v2.4.6 for Vue component mounting

**Environment:**
- jsdom (`environment: 'jsdom'` in config)
- Globals enabled (`globals: true`) -- `describe`, `it`, `expect` available without import, though most tests explicitly import them

**Run Commands:**
```bash
npm run test              # Watch mode (vitest)
npm run test:run          # Single run for CI (vitest run)
npm run test:coverage     # Coverage with V8 provider
npm run test:ui           # Vitest UI dashboard
npm run test:watch        # Explicit watch mode
```

**Run a single test file:**
```bash
npm run test:run -- tests/core/markdown/markdown-parser.test.js
```

## Test File Organization

**Location:** Separate `tests/` directory that mirrors `src/` structure:
```
tests/
├── bugs/                          # Regression tests for fixed bugs
│   ├── code-placeholder-collision.test.js
│   ├── continuous-blockquote-copy-format.test.js
│   └── url-underscore-italic-order.test.js
├── components/                    # Vue component tests
│   └── preview-escape.test.js
├── composables/                   # Composable tests
│   ├── editor/
│   │   └── indent-undo.test.js
│   ├── useClipboard.test.js
│   ├── useContentState.test.js
│   ├── useExport.test.js
│   ├── useNotification.test.js
│   ├── useOutline.test.js
│   ├── useThemeManager.test.js
│   └── useUIState.test.js
├── config/                        # Configuration tests
│   └── formatting-regex.test.js
├── core/                          # Core business logic tests
│   ├── editor/
│   │   ├── clipboard.test.js
│   │   ├── copy-formats.test.js
│   │   ├── export-formats.test.js
│   │   ├── operations.test.js
│   │   └── revoke-object-url.test.js
│   ├── markdown/
│   │   ├── breeze-styler.test.js
│   │   ├── formatters.test.js
│   │   ├── highlight-code.test.js
│   │   ├── link-image-sanitization.test.js
│   │   ├── list-and-table-advanced.test.js
│   │   ├── list-and-table.test.js
│   │   ├── markdown-parser.test.js
│   │   ├── math-integration.test.js
│   │   ├── math/
│   │   │   ├── detector.test.js
│   │   │   └── renderer.test.js
│   │   └── post-processors.test.js
│   └── theme/
│       ├── storage.test.js
│       ├── theme-loader.test.js
│       ├── theme-storage.test.js
│       └── variables.test.js
├── electron/                      # Electron IPC tests
│   └── ipcManager.test.js
├── parser/                        # Empty directory (legacy)
├── plugins/                       # Plugin tests
│   └── mermaid-nodeview-escape.test.js
├── shared/                        # Shared utility tests
│   ├── composables/
│   │   └── useTimerManager.test.js
│   └── utils/
│       ├── color.test.js
│       ├── dom.test.js
│       ├── error.test.js
│       ├── performance.test.js
│       ├── storage.test.js
│       └── text.test.js
└── setup.js                       # Global test setup
```

**Naming convention:** `{module-name}.test.js` -- always `.test.js`, never `.spec.js`

**Total test files:** 42

## Test Setup

**Global setup file:** `tests/setup.js`

Provides browser API polyfills for jsdom:
- `window.scrollTo` mock
- `requestAnimationFrame` / `cancelAnimationFrame` polyfill
- `Range.getClientRects` / `Range.getBoundingClientRect` polyfill (required by CodeMirror)
- `localStorage.clear()` in `beforeAll` and `afterAll`

## Test Structure

**Suite organization pattern:**
```javascript
/**
 * @file tests/composables/useExport.test.js
 * @description useExport 导出流程与选项控制测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mocks at top of file, before imports of the module under test
vi.mock('../../src/composables/index.js', () => ({ ... }))
vi.mock('../../src/core/editor/export-formats.js', () => ({ ... }))

// Import module under test AFTER mocks
import { useExport } from '../../src/composables/useExport.js'

describe('useExport', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('空内容时应提示请先编辑内容', async () => {
    // Arrange
    const notify = vi.fn()
    const { handleExportFormatSelect } = useExport({
      onNotify: notify,
      getContent: () => '   '
    })
    // Act
    await handleExportFormatSelect({ value: 'image' })
    await vi.runAllTimersAsync()
    // Assert
    expect(notify).toHaveBeenCalledWith('请先编辑内容', 'warning')
  })
})
```

**Test description language:** Chinese, matching the codebase's primary comment language. Regression tests in `tests/bugs/` use English descriptions.

**Lifecycle hooks pattern:**
```javascript
beforeEach(() => {
  vi.useFakeTimers()        // Fake timers for async tests
  localStorage.clear()      // Clean storage state
  vi.clearAllMocks()        // Reset mock call counts
})

afterEach(() => {
  vi.clearAllTimers()       // Clean up pending timers
  vi.useRealTimers()        // Restore real timers
  vi.restoreAllMocks()      // Restore original implementations
})
```

## Mocking

**Framework:** Vitest's built-in `vi.mock()` and `vi.fn()`

**Module mocking pattern (top-level, before imports):**
```javascript
vi.mock('../../src/core/markdown/index.js', () => ({
  parseMarkdown: vi.fn(() => '<p>HTML</p>')
}))

vi.mock('../../src/core/editor/clipboard.js', () => ({
  copyToSocialClean: vi.fn(async () => true)
}))
```

**Vue lifecycle mocking (for composables that use `onUnmounted`):**
```javascript
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    onUnmounted: vi.fn()  // Suppress lifecycle errors outside component context
  }
})
```

**Composable theme manager mocking:**
```javascript
vi.mock('../../src/composables/index.js', () => ({
  useGlobalThemeManager: () => ({
    currentColorTheme: { value: { primary: '#a0522d', background: '#fff' } },
    currentCodeStyle: { value: { name: 'github' } },
    currentThemeSystem: { value: { mode: 'light' } },
    currentFontSettings: { value: { fontSize: 16, lineHeight: '1.6' } }
  })
}))
```

**Browser API mocking:**
```javascript
// Clipboard API
global.ClipboardItem = class ClipboardItem { constructor(items) { this.items = items } }
global.navigator = { clipboard: { write: vi.fn(async () => true) } }

// window.confirm
const mockConfirm = vi.fn()
global.confirm = mockConfirm
```

**What to mock:**
- External services and APIs (clipboard, navigator)
- Dependent modules that have side effects (theme manager, markdown parser)
- Vue lifecycle hooks when testing composables outside component context
- Browser globals not available in jsdom (`ClipboardItem`, `execCommand`)

**What NOT to mock:**
- The module under test itself
- Pure utility functions (test them directly)
- Vue reactivity (`ref`, `computed`, `watch`)

## Fixtures and Factories

**Inline test data (most common pattern):**
```javascript
const mdSample = `# 标题一\n\n- 列表项\n\n| A | B |\n|---|---|\n| 1 | 2 |`

const theme = defaultColorTheme
const codeStyle = getCodeStyle('mac')
const fontSettings = {
  fontFamily: 'microsoft-yahei',
  fontSize: 16,
  lineHeight: 1.6,
  letterSpacing: 0
}
```

**Fake editor factory (for CodeMirror operation tests):**
```javascript
function createFakeEditor(initialText = '', from = 0, to = 0) {
  let text = initialText
  const view = {
    state: {
      doc: {
        length: initialText.length,
        sliceString: (s, e) => text.slice(s, e)
      },
      selection: { main: { from, to } }
    },
    dispatch(tr) {
      const before = text.slice(0, tr.changes.from)
      const after = text.slice(tr.changes.to)
      text = before + tr.changes.insert + after
      this.state.selection.main = { from: tr.selection.anchor, to: tr.selection.head }
      this.state.doc.length = text.length
    },
    focus() {},
    getText() { return text },
    getSelection() { return this.state.selection.main }
  }
  return view
}
```

**Electron mock factory (for IPC tests):**
```javascript
const mockApp = {
  getPath: vi.fn((name) => {
    const paths = {
      documents: '/Users/test/Documents',
      desktop: '/Users/test/Desktop',
      downloads: '/Users/test/Downloads',
      home: '/Users/test'
    }
    return paths[name] || `/Users/test/${name}`
  })
}
```

**No shared fixture files.** All test data is defined inline within each test file.

## Coverage

**Provider:** V8 (`@vitest/coverage-v8`)

**Thresholds (enforced in `vitest.config.js`):**
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

**Reporters:** `text`, `json`, `html`

**Excluded from coverage:**
- `node_modules/`
- `tests/`
- `dist/`
- `**/*.config.js`
- `**/*.config.ts`

**View coverage:**
```bash
npm run test:coverage     # Generates text + html + json reports
# HTML report output: coverage/ directory
```

## Test Types

**Unit Tests (majority):**
- Pure function testing: `tests/shared/utils/error.test.js`, `tests/shared/utils/text.test.js`
- Composable testing: `tests/composables/useContentState.test.js`, `tests/composables/useUIState.test.js`
- Core logic testing: `tests/core/editor/operations.test.js`, `tests/core/markdown/markdown-parser.test.js`

**Integration Tests (some):**
- Markdown pipeline end-to-end: `tests/core/markdown/math-integration.test.js`
- Copy format pipeline: `tests/core/editor/copy-formats.test.js`
- Export pipeline: `tests/composables/useExport.test.js`

**Component Tests (minimal):**
- `tests/components/preview-escape.test.js` - mount with `@vue/test-utils`, verify XSS escaping

**Regression Tests (`tests/bugs/`):**
- `code-placeholder-collision.test.js` - unique ID collision in code formatters
- `continuous-blockquote-copy-format.test.js` - malformed `<b>` tags from `<br>` in blockquotes
- `url-underscore-italic-order.test.js` - underscores in image URLs treated as italic markers

**E2E Tests:** Not present. No Cypress, Playwright, or similar framework.

**Security Tests:**
- `tests/electron/ipcManager.test.js` - path traversal attack prevention
- `tests/core/markdown/link-image-sanitization.test.js` - XSS in links/images
- `tests/components/preview-escape.test.js` - error message HTML escaping

## Common Patterns

**Async testing with fake timers:**
```javascript
it('should auto-remove notification after timeout', async () => {
  const { showNotification, notifications } = useNotification()
  showNotification('message', 'success', 1000)
  expect(notifications.value.length).toBe(1)

  vi.advanceTimersByTime(1100)
  expect(notifications.value[0].isRemoving).toBe(true)

  vi.advanceTimersByTime(500)
  expect(notifications.value.length).toBe(0)
})
```

**Dynamic import for composable isolation:**
```javascript
it('should have initial content', async () => {
  // Dynamic import ensures fresh module state per test
  const { useContentState } = await import('@/composables/useContentState.js')
  const { markdownContent } = useContentState()
  expect(markdownContent.value).toContain('# Markdown')
})
```

**Error testing:**
```javascript
it('empty content should throw AppError', async () => {
  await expect(copyToSocialClean('')).rejects.toBeInstanceOf(AppError)
})

it('retry should throw after max attempts', async () => {
  await expect(
    ErrorHandler.retry(async () => { throw new Error('boom') }, { maxAttempts: 2, delay: 0 })
  ).rejects.toBeInstanceOf(AppError)
})
```

**DOM assertion after parsing:**
```javascript
it('keeps <br> tags instead of turning them into malformed <b> tags', () => {
  const html = parseMarkdown(continuousBlockquote, { fontSettings })

  expect(html).toContain('<br>')
  expect(html).not.toMatch(/<b style="[^"]*"r>/i)

  const container = document.createElement('div')
  container.innerHTML = html

  const quoteParagraphs = container.querySelectorAll('blockquote p')
  expect(quoteParagraphs).toHaveLength(2)
})
```

**Component mounting with mocks:**
```javascript
it('does not inject HTML from error.message', async () => {
  const w = mount(PreviewPane, { props: { markdown: 'x' } })
  await Promise.resolve()
  const html = w.html()
  expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
  expect(html).not.toContain('<img src=')
})
```

**Console spy pattern:**
```javascript
it('should log at error level', () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  ErrorHandler.log(new AppError('test error'))
  expect(spy).toHaveBeenCalled()
  spy.mockRestore()
})
```

## Configuration Details

**Timeout settings (in `vitest.config.js`):**
- Test timeout: 10000ms
- Hook timeout: 10000ms

**Threading:**
- Enabled (`threads: true`)
- Max threads: 4
- Min threads: 1

**Watch mode:** Disabled by default (`watch: false`), can be activated with `npm run test:watch`

**Reporters:** `verbose` + `json`

**Global define:** `__TEST__: true` available in source code for test-specific branches

## Regression Testing Protocol

When fixing a bug, add a regression test to `tests/bugs/`:
1. Name the file descriptively: `{symptom-description}.test.js`
2. Include a file-level JSDoc comment explaining the bug background
3. Test the specific scenario that caused the bug
4. Verify the fix doesn't regress adjacent behavior

Example from `tests/bugs/code-placeholder-collision.test.js`:
```javascript
/**
 * @file tests/bugs/code-placeholder-collision.test.js
 * @description 回归测试：确保代码占位符使用唯一 ID 避免碰撞
 *
 * 背景：
 * - 旧实现使用全局数组 CODE_PLACEHOLDERS 和简单计数器 __TAG_0__
 * - 当快速连续调用或嵌套处理时，占位符可能碰撞导致渲染错误
 * - 新实现使用唯一 ID（时间戳+随机数）确保每次处理的占位符互不干扰
 */
```

---

*Testing analysis: 2026-03-27*

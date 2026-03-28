# Phase 3: Error Observability - Research

**Researched:** 2026-03-28
**Domain:** Module logging instrumentation for silent catch blocks
**Confidence:** HIGH

## Summary

Phase 3 replaces 7 specifically-identified empty catch blocks across 3 source files with structured `createModuleLogger()` calls. The existing logger infrastructure in `src/shared/utils/logger.js` is complete and production-ready -- it provides `createModuleLogger(moduleName)` returning `{ debug, info, warn, error, group, groupEnd }`, is dev-only (all methods become `noop` in production), and formats output with timestamps and module prefixes. No logger was previously instantiated anywhere in application code; this phase will be the first real consumer of `createModuleLogger`.

The implementation is straightforward: add an import + logger instance at each file's top, then replace each `catch (_) {}` with the appropriate `log.warn(...)` or `log.debug(...)` call. Testing leverages `vi.spyOn(console, 'warn')` / `vi.spyOn(console, 'debug')` since the logger delegates directly to `console.*` methods in dev/test mode (`import.meta.env.DEV` is `true` in Vitest by default).

**Primary recommendation:** Implement as a single plan with 3 file-scoped tasks (clipboard.js, loader.js, copy-formats.js), each following: add import, create logger instance, replace catch bodies, add tests. Tests should spy on console methods since `createModuleLogger` delegates directly to them.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Recoverable failure uses `warn` level -- only clipboard.js:138 (clipboardData.setData failure, affects user operation)
- **D-02:** Cleanup/fallback operations use `debug` level -- remaining 6 catch blocks:
  - `loader.js:62` -- localStorage JSON.parse failure, falls back to default theme (debug)
  - `copy-formats.js:176` -- SVG element getBoundingClientRect failure, has fallback calculation (debug)
  - `copy-formats.js:196` -- SVG root getBBox failure, has fallback sizing logic (debug)
  - `copy-formats.js:237` -- img.decode() failure, optional enhancement, rendering continues (debug)
  - `copy-formats.js:266` -- URL.revokeObjectURL cleanup failure, non-critical (debug)
  - `copy-formats.js:318` -- svg.remove() DOM cleanup failure, non-critical (debug)
- **D-03:** Each logger call includes: operation description string + error object; logger itself provides module name prefix
- **D-04:** Operation descriptions follow the language of existing code comments (Chinese or English); focus on describing "what was being done when failure occurred"
- **D-05:** Each file creates one `createModuleLogger()` instance at top (e.g., `const log = createModuleLogger('Clipboard')`)
- **D-06:** Module names use PascalCase: 'Clipboard', 'ThemeLoader', 'CopyFormats'
- **D-07:** All 7 empty catch blocks must be instrumented (no skipping cleanup catch blocks)
- **D-08:** Tests use `vi.spyOn` to monitor console.warn/console.debug, verifying logger is called with structured context on error paths
- **D-09:** Tests grouped by file -- clipboard logger tests, loader logger tests, copy-formats logger tests

### Claude's Discretion
- Specific operation description wording
- How errors are triggered in tests (throw, mock, etc.)
- Whether copy-formats.js's 5 catch blocks share a single describe block

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| OBS-01 | 7 empty catch blocks all instrumented with `createModuleLogger()`, using warn/debug by severity | Logger infrastructure verified complete; all 7 catch locations confirmed at exact line numbers; import pattern and module name convention documented |
| OBS-02 | Catch blocks include structured context (module name, operation description, error object) | `createModuleLogger` auto-provides `[timestamp] [ModuleName]` prefix; each call needs operation string + error object as arguments |
| TST-02 | Logger integration tests verifying logger.warn/debug called with context | `import.meta.env.DEV` is `true` in Vitest; console.warn/debug are real; `vi.spyOn(console, 'warn')` captures calls; existing test patterns for these 3 files documented |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `src/shared/utils/logger.js` | N/A (internal) | Module logging with `createModuleLogger()` | Already exists, dev-only with noop in production, zero new dependencies |
| Vitest | 1.6.1 | Test runner with spy/mock capabilities | Already configured project-wide |

### Supporting
No additional libraries needed. The existing `createModuleLogger` factory is the complete solution.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `createModuleLogger` | Direct `console.warn` calls | Loses module prefix, timestamp, and prod-mode silencing |
| `vi.spyOn(console, *)` | Mock the logger module | Spying on console is simpler and tests the full integration path including the logger's formatting |

**Installation:**
```bash
# No installation needed -- all infrastructure exists
```

## Architecture Patterns

### Logger Integration Pattern (per file)

**What:** Each file adds a logger import and instance at top; each catch block body is replaced with a log call.

**Pattern:**
```javascript
// At file top, after existing imports:
import { createModuleLogger } from '../../shared/utils/logger.js'

const log = createModuleLogger('ModuleName')

// In each catch block:
// BEFORE:
try { /* ... */ } catch (_) {}

// AFTER (debug level -- cleanup/fallback):
try { /* ... */ } catch (err) {
  log.debug('SVG getBoundingClientRect failed during rasterization', err)
}

// AFTER (warn level -- recoverable failure affecting user):
try { /* ... */ } catch (err) {
  log.warn('clipboardData.setData failed in copy event listener', err)
}
```

**Key details:**
- The parameter name changes from `_` to `err` (or `e`) since it is now used
- The logger format string describes "what was being done" when the error occurred
- The error object is passed as the second argument for stack trace access
- No return value changes -- the catch block's control flow remains identical

### Logger Output Format (automatic)

The `createModuleLogger('Clipboard')` produces output like:
```
[14:32:05] [Clipboard] WARN clipboardData.setData failed in copy event listener Error: ...
```

This is handled internally by `createLogger` in `logger.js` -- no custom formatting needed in catch blocks.

### Test Pattern (per file)

**What:** Spy on `console.warn` or `console.debug`, trigger the error path, assert the spy was called.

**Pattern:**
```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Clipboard logger integration', () => {
  let warnSpy

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // or debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('logs warn when clipboardData.setData fails', () => {
    // Trigger the error path with a mock that throws
    // Assert: expect(warnSpy).toHaveBeenCalled()
    // Assert: expect(warnSpy.mock.calls[0]).toEqual(expect.arrayContaining([
    //   expect.stringContaining('[Clipboard]'),
    //   expect.any(Error)
    // ]))
  })
})
```

**Why `mockImplementation(() => {})`:** Suppresses actual console output during test runs while still capturing calls.

### Anti-Patterns to Avoid
- **Changing catch block control flow:** The catch blocks must remain silent to callers -- do NOT add `throw`, `return`, or different fallback behavior. Only ADD the log statement.
- **Using `log.error` for non-errors:** Cleanup failures (revokeObjectURL, svg.remove) are `debug`, not `error`. Only genuinely broken user-facing operations get `warn`.
- **Mocking the logger module in tests:** Spy on `console.*` instead -- this tests the full path through `createModuleLogger`.
- **Forgetting to pass the error object:** `log.debug('message')` without the error object loses the stack trace. Always pass `err` as the second argument.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Module-scoped logger | Custom logging wrapper | `createModuleLogger()` from `logger.js` | Already handles timestamp, prefix, prod-mode noop, consistent format |
| Console spy assertions | Custom assertion helpers | `vi.spyOn(console, 'warn')` + Vitest matchers | Standard Vitest pattern, well-documented, no overhead |

## Common Pitfalls

### Pitfall 1: loader.js Independence Constraint
**What goes wrong:** `loader.js` is documented as "independent, no external module dependencies" for fast execution. Adding an import may seem to violate this design intent.
**Why it happens:** The file header comment says "此脚本是独立的，不依赖任何外部模块，以确保最快的执行速度。"
**How to avoid:** The independence comment refers to not depending on Vue, theme manager, or heavy libraries. Importing the lightweight `logger.js` (6 lines of dev-only code, noop in production) does not materially affect load time. The import is at module scope, and in production the logger is a noop -- zero runtime cost.
**Warning signs:** If someone raises concerns about loader.js deps, check that the import adds no transitive dependencies and is zero-cost in production.

### Pitfall 2: Vitest Environment and import.meta.env.DEV
**What goes wrong:** Tests fail to capture logger output because `isDev` evaluates to `false`.
**Why it happens:** If the test environment doesn't set `import.meta.env.DEV = true`, the logger returns noop functions.
**How to avoid:** Vitest with Vite plugin automatically sets `import.meta.env.DEV = true` in test mode. Verified: the project's `vitest.config.js` uses `defineConfig` from `vitest/config` which ensures this. No manual configuration needed.
**Warning signs:** If `console.warn` spy is never called, check `import.meta.env.DEV` value.

### Pitfall 3: copy-formats.js Has Nested Try-Catch Blocks
**What goes wrong:** Confusion about which catch block to instrument. `copy-formats.js` has deeply nested try-catch inside the `rasterizeMermaidSvgs` function loop.
**Why it happens:** The 5 target catch blocks are at different nesting levels within a `for...of` loop over SVGs.
**How to avoid:** Map each catch to its exact line number per CONTEXT.md canonical refs. The structure is:
  - Line 176: inside `targets.forEach` callback (per-element getBBox)
  - Line 196: inside `for (const svg of svgs)` (root SVG getBBox)
  - Line 237: after image load promise (img.decode)
  - Line 266: after canvas draw (revokeObjectURL)
  - Line 318: inside inner fallback catch (svg.remove -- last resort)
**Warning signs:** A catch block at line 316 wraps the svg.remove at line 318. Both are separate targets. Line 316 is the "catch for the fallback PNG logic" which already has `console.warn`. Line 318 is the innermost `try { svg.remove() } catch (_) {}`.

### Pitfall 4: Variable Name Collision with `_` to `err`
**What goes wrong:** Two catch blocks in the same scope both use `err`.
**Why it happens:** `copy-formats.js:316` and `copy-formats.js:318` are nested -- the outer catch already has `_` which should become `err`, and the inner catch also has `_`.
**How to avoid:** Use different variable names: outer catch can be `err`, inner catch can be `removeErr` or `cleanupErr`. Alternatively, keep the inner one as `e` since it's the narrower scope.

### Pitfall 5: Test Isolation for Module-Level Side Effects
**What goes wrong:** `loader.js` calls `loadThemeEarly()` as a module-level side effect (line 109). Importing it in a test immediately triggers execution.
**Why it happens:** The file exports the function AND calls it immediately.
**How to avoid:** The existing `theme-loader.test.js` already handles this with `vi.resetModules()` in `beforeEach` and dynamic `await import(...)`. New logger tests for `loader.js` should follow the same pattern -- use dynamic imports after setting up localStorage state and console spies.

## Code Examples

### Example 1: clipboard.js Instrumentation

```javascript
// File: src/core/editor/clipboard.js
// ADD at top after existing imports:
import { createModuleLogger } from '../../shared/utils/logger.js'

const log = createModuleLogger('Clipboard')

// CHANGE line 138 from:
//   } catch (_) {}
// TO:
//   } catch (err) {
//     log.warn('clipboardData.setData failed in copy event listener', err)
//   }
```

### Example 2: loader.js Instrumentation

```javascript
// File: src/core/theme/loader.js
// ADD at top (before the function):
import { createModuleLogger } from '../../shared/utils/logger.js'

const log = createModuleLogger('ThemeLoader')

// Inside loadThemeEarly(), CHANGE line 62 from:
//   } catch (_) {}
// TO:
//   } catch (err) {
//     log.debug('Failed to parse custom theme from localStorage', err)
//   }
```

### Example 3: copy-formats.js Instrumentation (5 catch blocks)

```javascript
// File: src/core/editor/copy-formats.js
// ADD at top after existing imports:
import { createModuleLogger } from '../../shared/utils/logger.js'

const log = createModuleLogger('CopyFormats')

// Line 176: getBoundingClientRect per element
} catch (err) {
  log.debug('SVG element getBBox measurement failed', err)
}

// Line 196: root SVG getBBox
} catch (err) {
  log.debug('SVG root getBBox measurement failed', err)
}

// Line 237: img.decode()
if (img.decode) { try { await img.decode() } catch (err) { log.debug('Image decode optional step failed', err) } }

// Line 266: revokeObjectURL
try { URL.revokeObjectURL(url) } catch (err) { log.debug('URL.revokeObjectURL cleanup failed', err) }

// Line 318: svg.remove() (innermost fallback)
try { svg.remove() } catch (removeErr) { log.debug('SVG DOM removal cleanup failed', removeErr) }
```

### Example 4: Test Pattern for clipboard.js Logger

```javascript
// File: tests/core/editor/clipboard-logger.test.js (or added to existing test file)
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Clipboard error logging', () => {
  let warnSpy

  beforeEach(() => {
    vi.restoreAllMocks()
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('logs warn when clipboardData.setData throws', () => {
    // Setup: create a copy event where clipboardData.setData throws
    // Trigger: dispatch copy event with poisoned clipboardData
    // Assert: warnSpy called with args matching [Clipboard] prefix and Error object
  })
})
```

### Example 5: Test Pattern for loader.js Logger (dynamic import)

```javascript
// Must use dynamic import because loader.js has module-level side effects
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('ThemeLoader error logging', () => {
  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
    document.documentElement.removeAttribute('style')
  })

  it('logs debug when custom theme JSON is malformed', async () => {
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    localStorage.setItem('temp-custom-theme', 'INVALID JSON{{{')

    await import('../../../src/core/theme/loader.js')

    expect(debugSpy).toHaveBeenCalled()
    const call = debugSpy.mock.calls.find(c =>
      c.some(arg => typeof arg === 'string' && arg.includes('[ThemeLoader]'))
    )
    expect(call).toBeTruthy()
    // Verify error object is passed
    expect(call.some(arg => arg instanceof Error)).toBe(true)

    debugSpy.mockRestore()
  })
})
```

## Detailed Catch Block Inventory

All 7 target catch blocks with exact analysis:

| # | File | Line | Current Code | Context | Level | Error Trigger in Tests |
|---|------|------|-------------|---------|-------|----------------------|
| 1 | clipboard.js | 138 | `catch (_) {}` | `clipboardData.setData` throws | warn | Mock `e.clipboardData.setData` to throw |
| 2 | loader.js | 62 | `catch (_) {}` | `JSON.parse(savedCustom)` on malformed data | debug | Set malformed JSON in localStorage key `temp-custom-theme` |
| 3 | copy-formats.js | 176 | `catch (_) {}` | `el.getBBox()` or `getComputedStyle` throws | debug | Mock SVG element's getBBox to throw |
| 4 | copy-formats.js | 196 | `catch (_) {}` | `svg.getBBox()` root-level throws | debug | Mock root SVG getBBox to throw |
| 5 | copy-formats.js | 237 | `catch (_) {}` | `img.decode()` rejects | debug | Mock Image.decode to reject |
| 6 | copy-formats.js | 266 | `catch (_) {}` | `URL.revokeObjectURL` throws | debug | Mock URL.revokeObjectURL to throw |
| 7 | copy-formats.js | 318 | `catch (_) {}` | `svg.remove()` throws | debug | Mock SVG element's remove to throw |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Empty catch blocks (`catch (_) {}`) | Structured logger calls with context | This phase | Silent failures become diagnosable in dev mode |
| No `createModuleLogger` consumers | First real usage of the factory | This phase | Establishes the pattern for future OBS-V2-01 work |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 1.6.1 |
| Config file | `vitest.config.js` |
| Quick run command | `npm run test:run -- tests/core/editor/clipboard-logger.test.js tests/core/theme/theme-loader-logger.test.js tests/core/editor/copy-formats-logger.test.js` |
| Full suite command | `npm run test:run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| OBS-01 | All 7 catch blocks produce log output | unit | `npm run test:run -- tests/core/editor/clipboard-logger.test.js tests/core/theme/theme-loader-logger.test.js tests/core/editor/copy-formats-logger.test.js` | Wave 0 |
| OBS-02 | Log output includes module name + operation + error object | unit | Same as above -- assertions check argument structure | Wave 0 |
| TST-02 | Logger integration tests exist and pass | unit | Same as above | Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run test:run -- <relevant-test-file>`
- **Per wave merge:** `npm run test:run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/core/editor/clipboard-logger.test.js` -- covers OBS-01/OBS-02 for clipboard.js:138 (warn level)
- [ ] `tests/core/theme/theme-loader-logger.test.js` -- covers OBS-01/OBS-02 for loader.js:62 (debug level)
- [ ] `tests/core/editor/copy-formats-logger.test.js` -- covers OBS-01/OBS-02 for copy-formats.js 5 catch blocks (debug level)

Note: Alternatively, logger tests could be added to the existing test files (`clipboard.test.js`, `theme-loader.test.js`, `copy-formats.test.js`) as new `describe` blocks rather than separate files. This is at Claude's discretion per CONTEXT.md.

## Project Constraints (from CLAUDE.md)

- **No TypeScript** -- all code is plain JavaScript with JSDoc annotations
- **Dependencies:** Only DOMPurify was approved as a new dependency. No new deps for this phase (logger is internal).
- **Testing:** Vitest + jsdom, 80% coverage threshold, tests mirror `src/` structure
- **Naming:** camelCase functions, PascalCase classes/module names, kebab-case file names
- **Imports:** Use explicit `.js` extension, use `@` path aliases in tests
- **Code style:** 2-space indentation, single quotes, inconsistent semicolons (follow file's existing style)
- **Commit format:** Conventional Commits (`feat:`, `fix:`, `test:`, etc.)
- **Strangler Fig Pattern:** Each change independently rollback-safe
- **GSD Workflow:** Use GSD commands for execution

## Sources

### Primary (HIGH confidence)
- `src/shared/utils/logger.js` -- complete source read, verified `createModuleLogger` API
- `src/core/editor/clipboard.js` -- full source read, confirmed catch block at line 138
- `src/core/theme/loader.js` -- full source read, confirmed catch block at line 62
- `src/core/editor/copy-formats.js` -- full source read, confirmed 5 catch blocks at lines 176, 196, 237, 266, 318
- `vitest.config.js` -- verified jsdom environment, coverage thresholds, setup file
- Existing test files -- verified patterns for all 3 target files

### Secondary (MEDIUM confidence)
- Vitest documentation (training data) -- `import.meta.env.DEV` is `true` in test mode by default

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- `createModuleLogger` source code verified, API is trivial
- Architecture: HIGH -- 7 catch blocks fully inventoried with exact line numbers
- Pitfalls: HIGH -- all pitfalls derived from direct source code analysis (loader.js side effects, nested catch naming, test isolation patterns)

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (stable internal infrastructure, no external dependency risk)

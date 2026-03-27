# Phase 2: XSS Prevention - Research

**Researched:** 2026-03-27
**Domain:** HTML sanitization / XSS prevention via DOMPurify
**Confidence:** HIGH

## Summary

DOMPurify 3.3.3 is the standard, battle-tested library for client-side HTML sanitization. It natively supports HTML, SVG, and MathML by default -- meaning the project's existing Markdown output (inline styles, CSS classes, Mermaid SVG diagrams, MathJax SVG formulas, and KaTeX MathML) will pass through sanitization unmodified. The only required configuration is `FORBID_TAGS` to explicitly block dangerous elements (script, iframe, object, embed, form) as defense-in-depth on top of DOMPurify's built-in protections.

The integration surface is small and well-bounded: exactly 3 v-html injection sites exist in the codebase (PreviewPane.vue:43, MarkdownGuide.vue:272, MarkdownGuide.vue:283). The social copy and PDF/image export pipelines do NOT use v-html and must remain untouched. DOMPurify exports a pre-initialized singleton that auto-detects the global `window` object, so it works identically in browser, Electron, and jsdom (Vitest) environments with a simple `import DOMPurify from 'dompurify'`.

**Primary recommendation:** Use DOMPurify 3.3.3 with minimal configuration: default allow-lists (HTML + SVG + MathML + style + class already included) plus explicit FORBID_TAGS for dangerous elements. Create a thin `sanitize.js` wrapper that centralizes this config and exports `sanitizeHtml()`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Use permissive whitelist config -- ADD_TAGS for SVG family tags (svg, g, path, circle, rect, line, polyline, polygon, text, tspan, defs, marker, use, clipPath, foreignObject etc.) and MathML family tags (math, mi, mo, mn, mrow, mfrac, msqrt, msub, msup, munder, mover, mtable, mtr, mtd, mtext, annotation etc.)
- **D-02:** ADD_ATTR to preserve style, class, d, viewBox, xmlns, fill, stroke, transform, width, height, x, y, cx, cy, r, rx, ry, points, marker-end, font-size, text-anchor and other SVG/MathML required attributes
- **D-03:** FORBID_TAGS explicitly blocks script, iframe, object, embed, form, input, textarea -- even with permissive whitelist, these are always removed
- **D-04:** Keep ALLOW_DATA_ATTR: false (default value) -- data-* attributes only opened for Mermaid if needed
- **D-05:** Create `src/shared/utils/sanitize.js` centralizing DOMPurify config, export `sanitizeHtml(html)` (fulfills SEC-03)
- **D-06:** PreviewPane.vue calls `sanitizeHtml(renderedHtml)` before v-html binding (fulfills SEC-01)
- **D-07:** MarkdownGuide.vue math demo v-html also sanitized via `sanitizeHtml()` (fulfills SEC-04, defense-in-depth)
- **D-08:** Do NOT use vue-dompurify-html directive -- direct function call is more transparent and testable
- **D-09:** Social copy (copySocialFormat) and PDF/image export pipelines do NOT go through DOMPurify -- they have independent sanitization and do not use v-html. Keep existing behavior unchanged (fulfills SC-4)
- **D-10:** Unit tests cover three scenarios: XSS payloads removed (script/onerror/javascript: URI), legitimate styled HTML preserved (inline style/class), Mermaid SVG class preserved (fulfills TST-01)
- **D-11:** Regression tests verify preview output unchanged after sanitization -- use typical Markdown content (code blocks, tables, math formulas, Mermaid diagrams) comparing pre/post sanitization output

### Claude's Discretion
- DOMPurify specific version -- use latest stable (3.3.3)
- Whether sanitizeHtml() caches DOMPurify instance -- performance optimization detail
- Specific XSS payload test cases -- cover OWASP common vectors
- Whether DOMPurify hooks (beforeSanitizeElements etc.) are needed -- only if whitelist insufficient

### Deferred Ideas (OUT OF SCOPE)
- None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SEC-01 | PreviewPane renders through DOMPurify sanitization before v-html, blocking XSS injection | DOMPurify 3.3.3 default config blocks script/event handlers/javascript: URIs. Integration point identified at PreviewPane.vue:43 (line 272 `renderedHtml.value = previewFormatted`). Wrap with sanitizeHtml() in computed or inline. |
| SEC-03 | Create `src/shared/utils/sanitize.js` centralizing DOMPurify config, exporting `sanitizeHtml()` | Fits existing `src/shared/utils/` module pattern. Re-export from `src/shared/utils/index.js`. DOMPurify ES module import works directly. |
| SEC-04 | MarkdownGuide.vue v-html also sanitized via sanitize.js (defense-in-depth) | Two v-html sites at lines 272 and 283. Content is KaTeX output (span + class + MathML) -- all in DOMPurify default allow-list. Sanitize in computed properties wrapping renderInlineMath/renderBlockMath. |
| SEC-05 | DOMPurify config preserves style, class attributes and SVG/MathML tags without breaking preview | **Research finding:** DOMPurify defaults ALREADY include HTML + SVG + MathML tags and style/class/SVG attributes. No ADD_TAGS or ADD_ATTR needed -- only FORBID_TAGS for explicit blocking. See "Critical Default Behavior" section. |
| TST-01 | DOMPurify sanitization unit tests (XSS removed, styled HTML preserved, Mermaid class preserved) | Test file: `tests/shared/utils/sanitize.test.js`. Framework: Vitest + jsdom (DOMPurify auto-detects jsdom window). No extra setup needed. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| dompurify | 3.3.3 | HTML/SVG/MathML sanitization | Industry standard XSS sanitizer, 14K+ GitHub stars, used by Google, Mozilla, Salesforce. Actively maintained by cure53. |

### Supporting
No additional libraries needed. DOMPurify is the only new dependency (aligned with CLAUDE.md constraint: "only add DOMPurify").

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| dompurify | sanitize-html | sanitize-html is server-focused, no native SVG/MathML support, heavier |
| dompurify | vue-dompurify-html | Adds directive abstraction layer; less transparent, harder to test (explicitly excluded by D-08) |
| dompurify | isomorphic-dompurify | Wrapper for SSR; unnecessary since this is a client-side app with jsdom test env |

**Installation:**
```bash
npm install dompurify
```

**Version verification:** `npm view dompurify version` returns `3.3.3` (verified 2026-03-27). Published as stable release with ES module support via `dist/purify.es.mjs`.

## Architecture Patterns

### Recommended Integration Structure
```
src/shared/utils/
  sanitize.js          # NEW: DOMPurify wrapper, exports sanitizeHtml()
  index.js             # ADD: re-export from sanitize.js

src/components/
  PreviewPane.vue      # MODIFY: wrap renderedHtml with sanitizeHtml()
  MarkdownGuide.vue    # MODIFY: wrap renderInlineMath/renderBlockMath with sanitizeHtml()

tests/shared/utils/
  sanitize.test.js     # NEW: unit tests for sanitization
```

### Pattern 1: Centralized Sanitization Module

**What:** A single-file module that imports DOMPurify, configures it once, and exports a `sanitizeHtml()` function.

**When to use:** Any v-html binding that renders user-generated or dynamically-created HTML.

**Example:**
```javascript
// src/shared/utils/sanitize.js
import DOMPurify from 'dompurify'

/**
 * DOMPurify configuration for the preview pipeline.
 *
 * Default allow-list already includes:
 *   - HTML tags (div, span, p, h1-h6, a, img, table, etc.)
 *   - SVG tags (svg, g, path, circle, rect, line, text, defs, etc.)
 *   - MathML tags (math, mi, mo, mn, mrow, mfrac, msqrt, etc.)
 *   - Attributes: style, class, d, viewBox, xmlns, fill, stroke, etc.
 *
 * We only need FORBID_TAGS for defense-in-depth.
 */
const SANITIZE_CONFIG = Object.freeze({
  // Explicitly block dangerous elements (defense-in-depth)
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea'],
  // Disable data-* attributes (not needed for preview rendering)
  ALLOW_DATA_ATTR: false,
})

/**
 * Sanitize HTML for safe v-html rendering.
 * @param {string} html - raw HTML string
 * @returns {string} sanitized HTML string
 */
export function sanitizeHtml(html) {
  if (!html) return ''
  return DOMPurify.sanitize(html, SANITIZE_CONFIG)
}
```

### Pattern 2: PreviewPane Integration (Computed Property)

**What:** Wrap `renderedHtml` with sanitization in a computed property or direct call.

**When to use:** The PreviewPane v-html binding.

**Example:**
```javascript
// In PreviewPane.vue setup()
import { sanitizeHtml } from '../shared/utils/sanitize.js'

// Option A: Sanitize at assignment point (simpler, fewer reactive dependencies)
renderedHtml.value = sanitizeHtml(previewFormatted)

// Option B: Computed (adds reactive layer)
const sanitizedHtml = computed(() => sanitizeHtml(renderedHtml.value))
// Then use v-html="sanitizedHtml"
```

**Recommendation:** Option A (sanitize at assignment) is simpler and avoids double-reactive overhead. The renderedHtml ref is already re-computed on every markdown/theme change.

### Pattern 3: MarkdownGuide Integration (Method Wrapping)

**What:** Wrap KaTeX renderToString output with sanitizeHtml before returning from methods.

**Example:**
```javascript
// In MarkdownGuide.vue methods
import { sanitizeHtml } from '../shared/utils/sanitize.js'

renderInlineMath(latex) {
  try {
    const html = katex.renderToString(latex, {
      displayMode: false,
      throwOnError: false,
      output: 'html'
    })
    return sanitizeHtml(html)
  } catch (e) {
    return latex
  }
}
```

### Anti-Patterns to Avoid
- **Sanitizing in the Markdown parser pipeline:** The parser generates both preview HTML and social copy HTML. Sanitizing inside the parser would break social copy output (D-09 violation).
- **Using DOMPurify.setConfig() globally:** Global config is shared state; if future code calls DOMPurify with different needs, it would conflict. Always pass config per-call.
- **Sanitizing after Mermaid rendering in PreviewPane:** Mermaid renders into DOM elements directly (not through v-html). Sanitizing the v-html string before Mermaid runs is correct because Mermaid replaces its placeholders post-render.
- **Creating a new DOMPurify instance per call:** DOMPurify's default export is a singleton. `DOMPurify.sanitize(html, config)` reuses internal state efficiently. No need for `DOMPurify(window)` factory calls.

## Critical Default Behavior (Research Finding)

**This finding simplifies the CONTEXT.md decisions D-01 and D-02 significantly.**

DOMPurify 3.3.3 default behavior (verified from source code at `dist/purify.es.mjs`):

| Feature | Default | Implication |
|---------|---------|-------------|
| HTML tags allowed | Yes (div, span, p, h1-h6, a, img, table, ul, ol, li, pre, code, blockquote, etc.) | Markdown parser output passes through |
| SVG tags allowed | Yes (svg, g, path, circle, rect, line, polyline, polygon, text, tspan, defs, marker, use, clipPath, foreignObject, etc.) | Mermaid SVG output passes through |
| MathML tags allowed | Yes (math, mi, mo, mn, mrow, mfrac, msqrt, msub, msup, munder, mover, mtable, mtr, mtd, mtext, annotation, semantics, etc.) | KaTeX MathML output passes through |
| `style` attribute | Allowed by default | Inline styles from theme system preserved |
| `class` attribute | Allowed by default | CSS classes (mermaid, katex, theme classes) preserved |
| SVG attributes (d, viewBox, fill, stroke, transform, x, y, width, height, etc.) | Allowed by default | SVG rendering unaffected |
| `data-*` attributes | Allowed by default (`ALLOW_DATA_ATTR: true`) | Must explicitly set to `false` per D-04 |
| script, iframe, etc. | Blocked by default | FORBID_TAGS adds defense-in-depth |

**Conclusion:** D-01 (ADD_TAGS) and D-02 (ADD_ATTR) are unnecessary because DOMPurify's defaults already include all required SVG and MathML tags and attributes. The implementation should use the defaults and only add FORBID_TAGS (D-03) and ALLOW_DATA_ATTR: false (D-04). This is simpler and less error-prone than maintaining explicit allow-lists.

**Impact on D-04:** The CONTEXT says "ALLOW_DATA_ATTR: false (default value)" but the actual default is `true`. The implementation must explicitly set `ALLOW_DATA_ATTR: false` to match the user's intent. The math renderer uses `data-formula` and `data-tool` attributes -- these will be stripped. This is acceptable because:
1. `data-formula` is only used for display purposes in the social copy pipeline (not in preview)
2. `data-tool` is a branding attribute with no functional impact on preview rendering
3. If data attributes are needed later, they can be selectively re-enabled

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTML sanitization | Custom regex/string replacement | DOMPurify | mXSS attacks, DOM clobbering, SVG/MathML namespace edge cases -- hundreds of bypass vectors exist |
| XSS payload detection | Custom blacklist matching | DOMPurify's built-in rules | Attackers use encoding tricks (HTML entities, unicode, case variants) that regex cannot reliably catch |
| SVG sanitization | Custom SVG tag stripping | DOMPurify's native SVG support | SVG has complex namespace rules and cross-namespace injection vectors |

**Key insight:** HTML sanitization is a security-critical domain where custom solutions invariably miss edge cases. DOMPurify has been audited by multiple security firms and handles mXSS (mutation XSS), DOM clobbering, and namespace confusion attacks that no hand-rolled solution would catch.

## Common Pitfalls

### Pitfall 1: Sanitizing Inside the Markdown Parser
**What goes wrong:** Social copy and PDF export output gets corrupted because DOMPurify strips elements needed for those pipelines.
**Why it happens:** The parser generates HTML for both preview and social copy. Sanitizing at the parser level affects all consumers.
**How to avoid:** Sanitize only at the v-html boundary (in the Vue component), NOT in the parser pipeline. This is explicitly required by D-09.
**Warning signs:** Social copy output looks different after the change; PDF exports missing styles.

### Pitfall 2: ALLOW_DATA_ATTR Default Assumption
**What goes wrong:** Assuming `ALLOW_DATA_ATTR` defaults to `false` when it actually defaults to `true`.
**Why it happens:** CONTEXT.md D-04 says "ALLOW_DATA_ATTR: false (default value)" but DOMPurify's actual default is `true`.
**How to avoid:** Explicitly set `ALLOW_DATA_ATTR: false` in the config object. Verify with a test that `data-*` attributes are stripped.
**Warning signs:** `data-formula` attributes appearing in sanitized output when they shouldn't.

### Pitfall 3: Over-Restricting with USE_PROFILES
**What goes wrong:** Using `USE_PROFILES: {html: true, svg: true, mathMl: true}` resets ALLOWED_TAGS and ALLOWED_ATTR to empty first, then only adds profile-specific tags. This can strip legitimate HTML attributes.
**Why it happens:** USE_PROFILES overrides ALLOWED_TAGS/ALLOWED_ATTR, conflicting with ADD_TAGS/ADD_ATTR.
**How to avoid:** Do NOT use USE_PROFILES. Rely on the default allow-list (which already includes HTML + SVG + MathML) and only use FORBID_TAGS for blocking.
**Warning signs:** Styled HTML losing attributes after sanitization.

### Pitfall 4: Sanitizing Mermaid Post-Render DOM
**What goes wrong:** Trying to sanitize the Mermaid SVG after it's been rendered into the DOM breaks the diagram.
**Why it happens:** Mermaid renders by replacing `.mermaid` elements with SVG using DOM APIs (not v-html). The sanitization boundary is the initial v-html string, not the post-render DOM.
**How to avoid:** Sanitize `renderedHtml` before it's bound to v-html. Mermaid then processes its placeholders in the sanitized DOM. The Mermaid SVG placeholders (`<div class="mermaid">...</div>`) pass through DOMPurify fine.
**Warning signs:** Mermaid diagrams not rendering after sanitization is added.

### Pitfall 5: Testing DOMPurify in happy-dom
**What goes wrong:** DOMPurify + happy-dom has known XSS bypass vulnerabilities.
**Why it happens:** happy-dom's DOM implementation has bugs that DOMPurify relies on being correct.
**How to avoid:** The project already uses jsdom (verified in vitest.config.js). Do NOT switch to happy-dom. DOMPurify's CI tests against jsdom.
**Warning signs:** Tests pass but actual browser behavior differs.

## Code Examples

### Complete sanitize.js Module
```javascript
// Source: DOMPurify 3.3.3 official API
// src/shared/utils/sanitize.js

import DOMPurify from 'dompurify'

const SANITIZE_CONFIG = Object.freeze({
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea'],
  ALLOW_DATA_ATTR: false,
})

export function sanitizeHtml(html) {
  if (!html) return ''
  return DOMPurify.sanitize(html, SANITIZE_CONFIG)
}
```

### XSS Payload Test Cases (OWASP Common Vectors)
```javascript
// Source: OWASP XSS Filter Evasion Cheat Sheet
// tests/shared/utils/sanitize.test.js

import { describe, it, expect } from 'vitest'
import { sanitizeHtml } from '@utils/sanitize.js'

describe('sanitizeHtml', () => {
  describe('XSS payloads removed', () => {
    it('removes script tags', () => {
      expect(sanitizeHtml('<script>alert(1)</script>')).toBe('')
    })

    it('removes event handlers', () => {
      const input = '<img src=x onerror=alert(1)>'
      const result = sanitizeHtml(input)
      expect(result).not.toContain('onerror')
    })

    it('removes javascript: URIs', () => {
      const input = '<a href="javascript:alert(1)">click</a>'
      const result = sanitizeHtml(input)
      expect(result).not.toContain('javascript:')
    })

    it('removes iframe tags', () => {
      expect(sanitizeHtml('<iframe src="evil.com"></iframe>')).toBe('')
    })

    it('removes embedded objects', () => {
      expect(sanitizeHtml('<object data="evil.swf"></object>')).toBe('')
      expect(sanitizeHtml('<embed src="evil.swf">')).toBe('')
    })

    it('removes form elements', () => {
      expect(sanitizeHtml('<form action="evil"><input type="text"></form>')).toBe('')
    })
  })

  describe('legitimate HTML preserved', () => {
    it('preserves inline styles', () => {
      const input = '<p style="color: red; font-size: 16px;">text</p>'
      expect(sanitizeHtml(input)).toContain('style=')
    })

    it('preserves CSS classes', () => {
      const input = '<div class="markdown-body theme-breeze">content</div>'
      expect(sanitizeHtml(input)).toContain('class=')
    })

    it('preserves styled heading', () => {
      const input = '<h1 style="font-weight: bold; color: #333;">Title</h1>'
      const result = sanitizeHtml(input)
      expect(result).toContain('<h1')
      expect(result).toContain('style=')
    })
  })

  describe('SVG content preserved', () => {
    it('preserves Mermaid SVG with classes', () => {
      const input = '<svg class="mermaid-svg" viewBox="0 0 100 100"><g><path d="M0,0 L100,100" fill="none" stroke="#333"></path></g></svg>'
      const result = sanitizeHtml(input)
      expect(result).toContain('<svg')
      expect(result).toContain('mermaid-svg')
      expect(result).toContain('viewBox')
    })
  })

  describe('data attributes stripped', () => {
    it('strips data-* attributes', () => {
      const input = '<span data-formula="E=mc^2">content</span>'
      const result = sanitizeHtml(input)
      expect(result).not.toContain('data-formula')
    })
  })
})
```

### PreviewPane Integration
```javascript
// Source: Existing PreviewPane.vue processMarkdown() method
// Modification point: line 272

import { sanitizeHtml } from '../shared/utils/sanitize.js'

// Inside processMarkdown():
const previewFormatted = parseMarkdown(props.markdown, { /* ... */ })
renderedHtml.value = sanitizeHtml(previewFormatted)
// Note: socialHtml.value = socialFormatted  (NOT sanitized, per D-09)
```

### MarkdownGuide Integration
```javascript
// Source: Existing MarkdownGuide.vue methods
import { sanitizeHtml } from '../shared/utils/sanitize.js'

renderInlineMath(latex) {
  try {
    return sanitizeHtml(katex.renderToString(latex, {
      displayMode: false,
      throwOnError: false,
      output: 'html'
    }))
  } catch (e) {
    return latex
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| DOMPurify 2.x | DOMPurify 3.x | 2023 | ES module support, removed SAFE_FOR_JQUERY, dropped IE support |
| Manual regex sanitization | DOMPurify library | N/A | Regex cannot handle mXSS, DOM clobbering, namespace attacks |
| Server-side sanitization | Client-side DOMPurify | N/A | Pure client-side app; DOMPurify runs in browser/Electron DOM |

**Deprecated/outdated:**
- `SAFE_FOR_JQUERY` option: removed in DOMPurify 3.0 (no jQuery in this project)
- `isomorphic-dompurify`: unnecessary wrapper when jsdom provides global window (as in this project's Vitest setup)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 1.6.1 |
| Config file | `vitest.config.js` |
| Quick run command | `npm run test:run -- tests/shared/utils/sanitize.test.js` |
| Full suite command | `npm run test:run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SEC-01 | XSS payloads stripped from preview HTML | unit | `npm run test:run -- tests/shared/utils/sanitize.test.js` | Wave 0 |
| SEC-03 | sanitize.js exports sanitizeHtml() | unit | `npm run test:run -- tests/shared/utils/sanitize.test.js` | Wave 0 |
| SEC-04 | MarkdownGuide v-html sanitized | unit | `npm run test:run -- tests/shared/utils/sanitize.test.js` | Wave 0 |
| SEC-05 | style/class/SVG/MathML preserved after sanitization | unit | `npm run test:run -- tests/shared/utils/sanitize.test.js` | Wave 0 |
| TST-01 | DOMPurify unit tests (XSS removed, styled HTML preserved, SVG classes preserved) | unit | `npm run test:run -- tests/shared/utils/sanitize.test.js` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run test:run -- tests/shared/utils/sanitize.test.js`
- **Per wave merge:** `npm run test:run`
- **Phase gate:** Full suite green (394+ tests) before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/shared/utils/sanitize.test.js` -- covers SEC-01, SEC-03, SEC-04, SEC-05, TST-01
- Framework install: `npm install dompurify` -- new dependency

## Open Questions

1. **data-* attribute stripping impact on math rendering in preview**
   - What we know: `data-formula` and `data-tool` attributes are generated by the math renderer. DOMPurify with `ALLOW_DATA_ATTR: false` will strip them.
   - What's unclear: Whether any CSS selector or JavaScript in the preview pane depends on `data-formula` for styling or behavior.
   - Recommendation: Test thoroughly. If data attributes are needed for preview, selectively re-enable with `ADD_ATTR: ['data-formula']` rather than setting `ALLOW_DATA_ATTR: true`.

2. **Mermaid SVG id attributes**
   - What we know: Mermaid generates unique `id` attributes on SVG elements for internal cross-referencing (markers, clip-paths, gradients).
   - What's unclear: Whether DOMPurify's default configuration preserves all Mermaid-generated id patterns.
   - Recommendation: DOMPurify allows `id` by default. However, note that `SANITIZE_NAMED_PROPS` (not enabled) would prefix ids with `user-content-`. Do NOT enable this option.

## Project Constraints (from CLAUDE.md)

- **Dependency policy:** Only DOMPurify may be added (CLAUDE.md: "only add DOMPurify")
- **No TypeScript:** All code is plain JavaScript with JSDoc annotations
- **Naming:** camelCase functions (`sanitizeHtml`), kebab-case files (`sanitize.js`)
- **Exports:** Named exports preferred (follow text.js pattern)
- **Tests:** Mirror src structure (`tests/shared/utils/sanitize.test.js`)
- **Coverage:** Must maintain >= 80% threshold
- **Imports:** Use explicit `.js` extension, path aliases (`@utils/sanitize.js`)
- **Commit style:** Conventional Commits (`feat:`, `fix:`, `test:`)
- **Semicolons:** Inconsistent in codebase; follow the majority pattern in shared/utils (omit semicolons based on neighboring files)
- **GSD workflow:** All changes through GSD commands

## Sources

### Primary (HIGH confidence)
- DOMPurify 3.3.3 source code (`dist/purify.es.mjs`) - verified default export is pre-initialized singleton with auto window detection
- DOMPurify 3.3.3 `package.json` - verified ES module entry point at `dist/purify.es.mjs`
- npm registry - verified version 3.3.3 is latest stable (2026-03-27)
- [DOMPurify GitHub](https://github.com/cure53/DOMPurify) - README configuration documentation
- Existing codebase: PreviewPane.vue, MarkdownGuide.vue, text.js, sanitize patterns
- [DOMPurify official site](https://cure53.de/purify) - v3.3.3 "Vocalion"

### Secondary (MEDIUM confidence)
- [DOMPurify wiki: Default allow/block lists](https://github.com/cure53/DOMPurify/wiki/Default-TAGs-ATTRIBUTEs-allow-list-&-blocklist) - confirmed default forbidden tags
- [KaTeX API docs](https://katex.org/docs/api) - renderToString output structure
- [DOMPurify npm page](https://www.npmjs.com/package/dompurify) - jsdom compatibility notes

### Tertiary (LOW confidence)
- WebSearch results for Mermaid SVG output structure - verified against codebase Mermaid rendering code

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - DOMPurify is the uncontested standard for client-side HTML sanitization
- Architecture: HIGH - Integration points identified from source code review, pattern follows existing codebase conventions
- Pitfalls: HIGH - Verified from DOMPurify source code and official documentation
- Default behavior: HIGH - Verified by reading DOMPurify's `purify.es.mjs` source that HTML+SVG+MathML+style+class are all default-allowed

**Research date:** 2026-03-27
**Valid until:** 2026-04-27 (DOMPurify is stable; minor version bumps unlikely to change API)

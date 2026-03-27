# Technology Stack: Security Hardening

**Project:** MDEditor Security Hardening Milestone
**Researched:** 2026-03-27
**Overall Confidence:** HIGH

## Recommended Stack

### HTML Sanitization

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| DOMPurify | ^3.3.3 | XSS prevention on `v-html` injection points | 14.8M weekly downloads, DOM-only sanitizer by Cure53 (security firm), native SVG + MathML support critical for Mermaid diagrams and MathJax output. Only dependency the PROJECT.md explicitly approves adding. | HIGH |

**Critical detail: zero additional bundle size.** DOMPurify 3.3.3 is already installed as a transitive dependency via both `mermaid@11.9.0` and `jspdf@4.2.1` (verified: `npm ls dompurify` shows a single deduped copy). Adding it as a direct dependency with `npm install dompurify@3.3.3` simply hoists the existing package -- no new bytes in `node_modules` or the output bundle.

**Do NOT use** `vue-dompurify-html` (the Vue directive wrapper). Rationale: This project has exactly 3 `v-html` injection points (PreviewPane.vue:43, MarkdownGuide.vue:272, MarkdownGuide.vue:283). A thin wrapper function calling `DOMPurify.sanitize()` directly is simpler, more testable, and avoids adding a second dependency for no gain. The directive abstraction adds indirection without reducing complexity in a codebase with so few injection sites.

**Do NOT use** `isomorphic-dompurify`. Rationale: This project runs in browser (Vite dev/prod) and Electron (Chromium renderer). Both environments have native DOM. The isomorphic wrapper bundles jsdom unnecessarily for SSR use cases that don't apply here.

### DOMPurify Configuration for This Project

The editor renders Markdown-to-HTML that includes:
- Standard HTML (paragraphs, headings, lists, tables, code blocks)
- Inline styles (the social copy pipeline applies inline CSS via FontProcessor and ThemeProcessor)
- SVG content (Mermaid diagrams rendered as SVG)
- MathML output (MathJax renders to MathML/SVG)
- `data-*` attributes (used by Prism.js syntax highlighting: `data-language`, `data-line`, etc.)
- `class` attributes (CSS theme system and Mermaid block identification via `class="mermaid"`)

Recommended default config:

```javascript
// src/shared/utils/sanitize.js
import DOMPurify from 'dompurify'

const DEFAULT_CONFIG = {
  // Allow HTML + SVG + MathML content profiles (all three needed for this editor)
  // WARNING: USE_PROFILES silently overrides ALLOWED_TAGS -- never use both together
  USE_PROFILES: { html: true, svg: true, mathMl: true, svgFilters: true },

  // Preserve data-* attributes (Prism.js, Mermaid) and ARIA (accessibility)
  ALLOW_DATA_ATTR: true,
  ALLOW_ARIA_ATTR: true,

  // Mermaid SVGs use <foreignObject> for text labels inside diagrams
  ADD_TAGS: ['foreignObject'],

  // Preserve attributes needed by the rendering pipeline
  ADD_ATTR: [
    'target', 'rel',             // Link attributes
    'viewBox', 'xmlns',          // SVG namespace attributes
    'fill', 'stroke', 'd',      // SVG drawing attributes
    'transform',                 // SVG transforms
    'data-formula', 'data-mml-node'  // MathJax-specific attributes
  ],

  // Explicitly forbid dangerous elements even within SVG/MathML namespaces
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],

  // Do NOT enable SAFE_FOR_TEMPLATES -- it strips {{ }}, which breaks
  // Vue template syntax in MarkdownGuide.vue examples
  // Do NOT add 'style' to FORBID_ATTR -- inline styles are required for
  // the theme system and social copy format
}

/**
 * Sanitize HTML for safe DOM insertion via v-html.
 * @param {string} dirty - Raw HTML string from markdown pipeline
 * @param {Object} [overrides] - Optional DOMPurify config overrides
 * @returns {string} Sanitized HTML safe for v-html binding
 */
export function sanitizeHtml(dirty, overrides = {}) {
  if (!dirty) return ''
  return DOMPurify.sanitize(dirty, { ...DEFAULT_CONFIG, ...overrides })
}
```

### Vulnerability Fixes

| Technology | Current | Target | Purpose | Why | Confidence |
|------------|---------|--------|---------|-----|------------|
| svgo | 4.0.0 | ^4.0.1 | Fix CVE-2026-29074 Billion Laughs DoS | High severity (CVSS 7.5). Direct dependency, simple semver bump. 811-byte malicious SVG can crash Node.js process via exponential entity expansion. | HIGH |

**svgo upgrade path:** This is a direct dependency in `package.json` with `"svgo": "^4.0.0"`. The fix is a patch version (4.0.0 -> 4.0.1) with no API changes. The `^4.0.0` constraint already allows 4.0.1, so running `npm update svgo` is sufficient. Alternatively, change to `"^4.0.1"` in package.json to make the minimum fixed version explicit.

### npm audit Triage

Total vulnerabilities found: 46 (32 high, 12 moderate, 2 low, 0 critical)

**Actionable fixes (direct dependencies):**

| Package | Severity | Fix | Action |
|---------|----------|-----|--------|
| svgo | High (CVE-2026-29074) | 4.0.0 -> 4.0.1 | `npm update svgo` -- direct dep, patch version |
| mermaid | Moderate (transitive via chevrotain/langium) | 11.9.0 -> latest | Out of scope per PROJECT.md |

**Not actionable (transitive / devDependencies only):**

| Package | Severity | Why Not Actionable |
|---------|----------|-------------------|
| @electron-forge/* (16 vulns) | High | All transitive via electron-forge. `fixAvailable: false`. Electron Forge upstream must release a fix. These only affect the build/package pipeline, not the runtime app. |
| vite / esbuild | Moderate | Dev server only. The esbuild vuln (GHSA-67mh) affects dev server, not production builds. Vite 5.4.19 is the latest 5.x; fix requires Vite 6.x which is a major upgrade, out of scope. |
| electron | Moderate (ASAR integrity bypass) | GHSA-vmqv. Electron 37.3.0 is current; fix requires newer Electron major. Low practical risk since ASAR integrity is not currently configured in this project. |
| brace-expansion / minimatch | Moderate/High | All transitive through devDependencies (electron-forge, cacache, glob, test-exclude). Not in production bundle. |
| axios | High (DoS) | Transitive via devDependencies only. Not a direct dep, not in production bundle. |

**Recommended npm audit workflow for this project:**

```bash
# 1. Fix the one actionable production vulnerability
npm update svgo

# 2. Verify no regressions
npm run test:run

# 3. Verify the fix
npm ls svgo  # Should show 4.0.1+

# 4. Check production-only vulnerabilities (ignore devDeps noise)
npm audit --omit=dev

# 5. Document remaining as accepted risk in commit message
```

**Do NOT use** `npm audit fix` (without qualification) or `npm audit fix --force`. Rationale: The 32 high-severity electron-forge vulns have no fix available. `--force` attempts major version bumps that break Electron packaging (`npm run make:mac` etc.). Fix only the specific direct dependency (svgo) manually.

### Error Logging (No New Dependencies)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Existing `logger.js` | N/A (project utility) | Structured error logging in catch blocks | PROJECT.md constraint: "空 catch 块接入现有 logger 而非 Sentry". The existing `createModuleLogger()` pattern is well-designed: dev-mode timestamped logging with production silence (noop). No new dependency needed. | HIGH |

The existing logger at `src/shared/utils/logger.js` provides:
- `createModuleLogger(moduleName)` -- creates a prefixed logger instance
- `.error()`, `.warn()`, `.info()`, `.debug()` methods
- Production: all methods become `noop` via `isDev` check (zero runtime overhead)
- Dev: timestamped console output with module prefix: `[14:23:01] [Clipboard] WARN ...`

**Pattern for replacing empty catch blocks:**

```javascript
// BEFORE (7 instances across 3 files)
try { /* operation */ } catch (_) {}

// AFTER
import { createModuleLogger } from '@utils/logger'
const logger = createModuleLogger('Clipboard')

try { /* operation */ } catch (err) {
  logger.warn('Clipboard setData failed:', err.message)
}
```

The 7 empty catch blocks categorized by appropriate log level:

**`logger.warn()` -- recoverable failures worth debugging:**
1. `src/core/editor/clipboard.js:138` -- clipboard `setData()` failure in copy event
2. `src/core/editor/copy-formats.js:176` -- SVG `getBBox()` per-element measurement failure
3. `src/core/editor/copy-formats.js:196` -- SVG root `getBBox()` for viewBox calculation
4. `src/core/theme/loader.js:62` -- `JSON.parse(localStorage)` custom theme load failure

**`logger.debug()` -- cleanup/best-effort ops where failure is expected/harmless:**
5. `src/core/editor/copy-formats.js:237` -- `img.decode()` optional enhancement (not all browsers)
6. `src/core/editor/copy-formats.js:266` -- `URL.revokeObjectURL()` blob cleanup
7. `src/core/editor/copy-formats.js:318` -- `svg.remove()` DOM cleanup in finally block

**Known limitation:** The logger silences ALL output in production (`isDev` gate). This means production errors in these catch blocks remain invisible. This is accepted for this milestone per PROJECT.md scope. Future milestone: external error reporting (Sentry) for production visibility.

### Build Optimization (No New Dependencies)

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Vite `rollupOptions.output.manualChunks` | Built into Vite 5 / Rollup 4 | Split 4.8MB monolith bundle into cacheable vendor chunks | No dependency needed. Vite's built-in Rollup configuration. Current single `index.js` is 4,787 kB (1,552 kB gzip). Mermaid's dynamic imports already produce ~25 diagram chunks, but all other vendor code is in one file. | HIGH |

**Recommended manualChunks configuration:**

```javascript
// vite.config.js -- add to build.rollupOptions.output
manualChunks(id) {
  if (!id.includes('node_modules')) return

  // CodeMirror ecosystem (~300 kB)
  if (id.includes('@codemirror') || id.includes('codemirror')) {
    return 'vendor-codemirror'
  }
  // Milkdown WYSIWYG editor + prosemirror deps (~150 kB)
  if (id.includes('@milkdown') || id.includes('prosemirror')) {
    return 'vendor-milkdown'
  }
  // Mermaid core -- but NOT diagram-specific dynamic chunks
  // Mermaid's internal lazy imports for diagram types are preserved by Rollup
  if (id.includes('mermaid') && !id.includes('@mermaid-js/parser')) {
    return 'vendor-mermaid'
  }
  // MathJax full (~800 kB, only needed for math formulas)
  if (id.includes('mathjax')) {
    return 'vendor-mathjax'
  }
  // Vue ecosystem (vue, vue-i18n, @vue/*)
  if (id.includes('vue') || id.includes('@vue')) {
    return 'vendor-vue'
  }
  // PDF/image export (only used on explicit user action)
  if (id.includes('jspdf') || id.includes('html2canvas')) {
    return 'vendor-export'
  }
  // Syntax highlighting
  if (id.includes('prismjs')) {
    return 'vendor-prism'
  }
  // All remaining vendor code
  return 'vendor-misc'
}
```

**Why this grouping strategy (domain-based, not per-package):**
- Groups by **functional domain** (editor, renderer, formatter) not individual npm packages
- CodeMirror + Milkdown have internal cross-package dependencies that must stay grouped
- Prosemirror is grouped with Milkdown (Milkdown is built on prosemirror)
- Mermaid core is separated but its diagram-type lazy imports are preserved (Rollup prioritizes dynamic import boundaries over manualChunks for dynamically imported modules)
- Export libs (jspdf + html2canvas) are isolated -- only needed on explicit user action
- Result: 7-8 vendor chunks, each independently cacheable across deploys

**Expected result after chunking:**

```
BEFORE:  index.js (4,788 KB / 1,552 KB gzip) -- single monolith
         + ~25 mermaid diagram chunks (already code-split)

AFTER:   index.js          (~800 KB)   -- app code + small deps
         vendor-vue.js     (~200 KB)   -- vue + vue-i18n
         vendor-codemirror.js (~300 KB) -- all @codemirror/*
         vendor-milkdown.js (~150 KB)   -- @milkdown/* + prosemirror
         vendor-mermaid.js  (~1.5 MB)   -- mermaid core
         vendor-mathjax.js  (~800 KB)   -- mathjax-full
         vendor-export.js   (~500 KB)   -- html2canvas + jspdf
         vendor-prism.js    (~100 KB)   -- prismjs
         vendor-misc.js     (~100 KB)   -- remaining small deps
         + ~25 mermaid diagram chunks   -- unchanged
```

**Do NOT use** per-package splitting (one chunk per npm package). Rationale: This project has 30+ production dependencies. Per-package splitting generates excessive HTTP requests on initial load and complicates debugging. Domain-based grouping (7-8 chunks) balances caching with request count.

**Do NOT use** dynamic `import()` for the main editor components at this stage. Rationale: PROJECT.md explicitly states "最小改动，不改变加载行为". `manualChunks` splits the bundle at build time without changing runtime behavior or component loading patterns.

## Complete Installation

```bash
# Only new dependency (zero additional bundle size -- already exists as transitive dep)
npm install dompurify@3.3.3

# Vulnerability fix (existing dependency, patch version)
npm update svgo

# Verify
npm ls dompurify  # Should show single deduped 3.3.3
npm ls svgo       # Should show 4.0.1
npm run test:run  # All 394 tests pass
```

Total new runtime dependencies: **1** (DOMPurify -- already present as transitive dep, ~8 kB gzipped, zero additional bundle cost)

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| HTML sanitization | DOMPurify 3.3.3 | sanitize-html | sanitize-html is 4x larger, designed for server-side, no native SVG/MathML profile support. Does not handle the Mermaid SVG + MathJax MathML output this editor produces. |
| HTML sanitization | DOMPurify 3.3.3 | vue-dompurify-html | Unnecessary wrapper for 3 v-html sites. Adds a dependency and directive indirection for no gain. Direct `DOMPurify.sanitize()` in a utility function is more transparent and testable. |
| HTML sanitization | DOMPurify 3.3.3 | Trusted Types API | Browser-native but requires CSP headers, Electron CSP configuration, and doesn't work in all environments. Can layer on top of DOMPurify later as defense-in-depth. |
| HTML sanitization | DOMPurify 3.3.3 | Built-in `escapeHtml()` only | The project already has `escapeHtml()` and `cleanUrl()` in the pipeline. These are necessary but not sufficient -- they handle specific escaping, not full DOM sanitization. DOMPurify is defense-in-depth. |
| Error logging | Existing logger.js | Sentry / LogRocket | Out of scope per PROJECT.md. No external error monitoring infrastructure. Existing logger is sufficient for making empty catches visible in dev. |
| Error logging | Existing logger.js | winston / pino | Server-side Node.js loggers. Not appropriate for browser/Electron renderer context. The existing logger.js is already well-designed for frontend use. |
| Bundle splitting | manualChunks function | manualChunks object | Object form (`{ 'vendor-vue': ['vue'] }`) cannot handle scoped packages or complex matching. Function form is needed for patterns like `@codemirror/*`. |
| Bundle splitting | Domain-based chunks | Per-package chunks | Too many HTTP requests (30+ packages). Domain grouping (7-8 chunks) balances caching with HTTP overhead. |
| Bundle splitting | manualChunks | Dynamic import() | Changes runtime loading behavior, which PROJECT.md explicitly avoids ("不改变加载行为"). manualChunks is build-time only. |
| SVG security | svgo 4.0.1 | Remove svgo entirely | svgo is a direct dependency used for SVG optimization. Removing it breaks functionality. The patch version 4.0.1 fixes the vulnerability with zero API changes. |

## Version Verification

| Package | Claimed Version | Verification Method | Verified Date |
|---------|----------------|---------------------|---------------|
| DOMPurify | 3.3.3 (latest) | `npm view dompurify version` returns 3.3.3; GitHub releases confirm March 2025; already installed as transitive dep via mermaid + jspdf | 2026-03-27 |
| svgo | 4.0.1 (fix target) | `npm view svgo versions` shows 4.0.1 available; CVE-2026-29074 advisory confirms 4.0.1 as fix | 2026-03-27 |
| Vite | 5.4.19 (current in project) | `npm ls vite` in project; latest 5.x | 2026-03-27 |

## Sources

- [DOMPurify GitHub - cure53/DOMPurify](https://github.com/cure53/DOMPurify) -- API reference, configuration options, version info (HIGH confidence)
- [DOMPurify Releases](https://github.com/cure53/DOMPurify/releases) -- v3.3.3 release notes, March 2025 (HIGH confidence)
- [CVE-2026-29074 - SVGO Billion Laughs DoS](https://github.com/svg/svgo/security/advisories/GHSA-xpqw-6gx7-v673) -- Vulnerability details, fixed in 2.8.1/3.3.3/4.0.1 (HIGH confidence)
- [Vite manualChunks caching guide](https://soledadpenades.com/posts/2025/use-manual-chunks-with-vite-to-facilitate-dependency-caching/) -- manualChunks function pattern (MEDIUM confidence)
- [Taming Large Chunks in Vite](https://www.mykolaaleksandrov.dev/posts/2025/11/taming-large-chunks-vite-react/) -- Chunk splitting strategies (MEDIUM confidence)
- [vue-dompurify-html](https://github.com/LeSuisse/vue-dompurify-html) -- Evaluated and rejected for this project (MEDIUM confidence)
- [npm audit documentation](https://docs.npmjs.com/cli/audit) -- npm audit workflow reference (HIGH confidence)
- [npm audit: broken by design](https://overreacted.io/npm-audit-broken-by-design/) -- Context for audit triage approach (MEDIUM confidence)
- Codebase analysis: `npm ls dompurify`, `npm ls svgo`, `npm audit`, `npm run build`, `grep v-html src/`, direct file inspection of PreviewPane.vue, copy-formats.js, clipboard.js, loader.js, logger.js, vite.config.js, package.json (HIGH confidence)

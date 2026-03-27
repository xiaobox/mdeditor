# Architecture Patterns: Security Hardening Integration

**Domain:** Frontend security hardening for Vue 3 + Vite Markdown editor
**Researched:** 2026-03-27

## Recommended Architecture

Security hardening touches four distinct integration surfaces in the existing codebase. Each change is scoped to a single boundary, enabling independent implementation and rollback per the project's Strangler Fig constraint.

```
                    +-----------------------+
                    |   vite.config.js      |  <--- manualChunks (build-time)
                    +-----------+-----------+
                                |
               +----------------+----------------+
               |                                 |
     +---------v----------+           +----------v---------+
     | vendor-codemirror   |           | vendor-milkdown    |
     | vendor-mermaid      |           | vendor-mathjax     |
     | vendor-core (vue,   |           | vendor-export      |
     |   html2canvas, etc) |           |  (html2canvas,     |
     +--------------------+           |   jspdf)           |
                                      +--------------------+

  +-----------------------------------------------------------------+
  |                        Runtime Layer                             |
  +-----------------------------------------------------------------+
  |                                                                 |
  |  +------------------+     +------------------+                  |
  |  | PreviewPane.vue  |     | WysiwygPane.vue  |                  |
  |  |                  |     | (Milkdown owns   |                  |
  |  | v-html="..."  ---+---->  its own DOM,     |                  |
  |  |                  |     |  out of scope)   |                  |
  |  +--------+---------+     +------------------+                  |
  |           |                                                     |
  |  +--------v---------+                                           |
  |  | sanitize.js      |  <--- DOMPurify wrapper (NEW)             |
  |  | (src/shared/      |                                          |
  |  |  utils/sanitize)  |                                          |
  |  +--------+---------+                                           |
  |           |                                                     |
  |  +--------v---------+     +------------------+                  |
  |  | Markdown Pipeline |     | copy-formats.js  |                  |
  |  | parser.js         |     | clipboard.js     |                  |
  |  | inline-formatter  |     | export-formats   |                  |
  |  +------------------+     +--------+---------+                  |
  |                                    |                            |
  |                           +--------v---------+                  |
  |                           | logger.js        |  <--- catch      |
  |                           | (existing, wire  |      blocks      |
  |                           |  into empty      |      instrumented|
  |                           |  catch blocks)   |                  |
  |                           +------------------+                  |
  +-----------------------------------------------------------------+
```

### Component Boundaries

| Component | Responsibility | Communicates With | Security Role |
|-----------|---------------|-------------------|---------------|
| `vite.config.js` | Build configuration, chunk splitting | Rollup/Vite internals | Reduces single-chunk attack surface; enables granular caching |
| `src/shared/utils/sanitize.js` (NEW) | Thin DOMPurify wrapper with project-specific config | PreviewPane.vue, any future v-html consumer | Defense-in-depth HTML sanitization |
| `PreviewPane.vue` | Renders parsed Markdown as HTML via `v-html` | sanitize.js, markdown pipeline | Primary XSS injection point -- the only component that renders user-controlled HTML via `v-html` to the visible DOM |
| `src/shared/utils/logger.js` (EXISTING) | Module-scoped logging with dev/prod gating | copy-formats.js, clipboard.js, loader.js | Replaces silent error swallowing; makes failures observable |
| `src/core/editor/copy-formats.js` | Social format copy with Mermaid rasterization | clipboard.js, markdown pipeline | Contains 4 empty catch blocks to instrument |
| `src/core/editor/clipboard.js` | Rich text clipboard operations | copy-formats.js, DOM APIs | Contains 1 empty catch block to instrument |
| `src/core/theme/loader.js` | Pre-Vue theme injection to prevent FOUC | localStorage, document.documentElement | Contains 1 empty catch block to instrument |
| `package.json` / `node_modules` | Dependency manifest | npm registry | svgo 4.0.0 has CVE-2026-29074 (Billion Laughs DoS, CVSS 7.5) |

### Data Flow

#### 1. Markdown Preview Pipeline (DOMPurify integration point)

```
User types Markdown
    |
    v
MarkdownEditor (CodeMirror) --[props.markdown]--> PreviewPane.vue
    |
    v
parseMarkdown(text, options)   <-- core/markdown/parser.js
    |                               (strategy-based parser)
    v
renderedHtml (ref)             <-- raw HTML string with inline styles
    |
    v
DOMPurify.sanitize(html, cfg) <-- NEW: sanitize.js wrapper
    |
    v
v-html="sanitizedHtml"        <-- PreviewPane template, line 43
    |
    v
Visible DOM (user sees preview)
```

**Key insight:** The `v-html` binding on PreviewPane.vue line 43 is the single most critical XSS vector. The markdown parser generates trusted HTML, but it processes user input that could contain crafted payloads. DOMPurify acts as the last line of defense before DOM injection.

**What DOMPurify must NOT strip:**
- Inline `style` attributes (the entire social/preview formatting depends on these)
- `<svg>` elements (Mermaid diagrams render as SVG before rasterization)
- `<code>`, `<pre>` blocks with class attributes (syntax highlighting)
- MathML elements (math formula rendering via MathJax)
- `class` attributes (theme system uses CSS classes extensively)
- `data-*` attributes (allowed by DOMPurify default, used by Mermaid)

**What DOMPurify must strip:**
- `<script>` tags (default behavior)
- `javascript:` URLs (default behavior)
- Event handler attributes (`onclick`, `onerror`, etc.) (default behavior)
- `<iframe>`, `<object>`, `<embed>` (default behavior)

#### 2. Copy/Export Pipeline (no DOMPurify needed here)

```
copySocialFormat(markdown, options)
    |
    v
generateSocialHtml(markdown, options)  <-- parser pipeline (same as preview)
    |
    v
DOMUtils.createOffscreenContainer()    <-- temporary DOM element
    |
    v
renderMermaidInContainer()             <-- Mermaid SVG rendering
    |
    v
rasterizeMermaidSvgs()                 <-- SVG -> PNG conversion
    |
    v
copyToSocialClean(finalHtml)           <-- Clipboard API / execCommand
```

**Key insight:** The copy/export pipeline uses `innerHTML` to inject HTML into offscreen containers that are never visible to the user and are immediately destroyed. DOMPurify is not needed here because: (a) the HTML is generated by our own parser, not directly from user input, (b) the containers are ephemeral and offscreen, (c) adding DOMPurify here would risk stripping the inline styles that social platforms require. The PROJECT.md decision "DOMPurify only wraps preview panel" is architecturally correct.

#### 3. Error Logging Flow (catch block instrumentation)

```
BEFORE (current state):
    try { riskyOperation() } catch (_) {}    <-- silent failure

AFTER (target state):
    import { createModuleLogger } from '@shared/utils/logger.js'
    const logger = createModuleLogger('CopyFormats')

    try { riskyOperation() } catch (err) {
      logger.warn('Operation context description', err)
    }
```

**Specific catch blocks to instrument (7 total):**

| File | Line | Context | Severity |
|------|------|---------|----------|
| `clipboard.js` | 138 | `clipboardData.setData` in copy event listener | Low -- fallback path, failure handled by outer try |
| `copy-formats.js` | 176 | `getBBox()` on SVG child elements | Low -- per-element metric gathering, failure is tolerable |
| `copy-formats.js` | 196 | `getBBox()` on root SVG for viewBox calc | Low -- has fallback path below |
| `copy-formats.js` | 237 | `img.decode()` Promise rejection | Low -- decode is optional enhancement |
| `copy-formats.js` | 266 | `URL.revokeObjectURL()` on blob URL | Low -- cleanup failure, non-critical |
| `copy-formats.js` | 318 | `svg.remove()` last-resort fallback | Low -- ultimate fallback, nothing else to do |
| `loader.js` | 62 | `JSON.parse(localStorage)` for custom theme | Medium -- theme load failure should be visible for debugging |

**Logger module already exists** at `src/shared/utils/logger.js` with `createModuleLogger(name)` pattern. Each file gets its own logger instance with a module prefix. Production builds auto-silence all output via the `isDev` gate.

#### 4. Build Chunk Splitting (manualChunks)

Current state: Single `index-*.js` chunk of 4.8 MB (1.55 MB gzipped) contains ALL vendor code plus application code.

```
BEFORE:  index.js (4,788 KB)
         + mermaid diagram chunks (already code-split by mermaid itself)

AFTER:   index.js         (~800 KB)  <-- app code + small deps
         vendor-vue.js    (~200 KB)  <-- vue + vue-i18n
         vendor-codemirror.js (~300 KB) <-- all @codemirror/* packages
         vendor-milkdown.js  (~150 KB) <-- all @milkdown/* packages
         vendor-mermaid.js   (~1.5 MB) <-- mermaid core
         vendor-mathjax.js   (~800 KB) <-- mathjax-full
         vendor-export.js    (~500 KB) <-- html2canvas + jspdf
         vendor-prism.js     (~100 KB) <-- prismjs
```

**Implementation location:** `vite.config.js` > `build.rollupOptions.output.manualChunks`

```javascript
// vite.config.js - manualChunks configuration
build: {
  outDir: 'dist',
  assetsDir: 'assets',
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (!id.includes('node_modules')) return;

        if (id.includes('@codemirror') || id.includes('codemirror')) {
          return 'vendor-codemirror';
        }
        if (id.includes('@milkdown')) {
          return 'vendor-milkdown';
        }
        if (id.includes('mermaid') && !id.includes('@mermaid-js/parser')) {
          return 'vendor-mermaid';
        }
        if (id.includes('mathjax-full')) {
          return 'vendor-mathjax';
        }
        if (id.includes('html2canvas') || id.includes('jspdf')) {
          return 'vendor-export';
        }
        if (id.includes('prismjs')) {
          return 'vendor-prism';
        }
        if (id.includes('vue') || id.includes('vue-i18n')) {
          return 'vendor-vue';
        }
      }
    }
  }
}
```

**Rationale for chunk boundaries:**
- **CodeMirror**: Changes rarely, large enough to benefit from independent caching (~300 KB)
- **Milkdown**: WYSIWYG editor, separate update cadence from CodeMirror
- **Mermaid**: Largest single dependency (~1.5 MB), already has its own dynamic imports for diagram types
- **MathJax**: Heavy, only needed for math formulas
- **Export (html2canvas + jspdf)**: Only needed for PDF/image export, not for core editing
- **Prism**: Syntax highlighting, stable
- **Vue core**: Framework, most stable of all

**Caution:** Mermaid has complex internal dynamic imports for its diagram types (which are already chunked by Vite as seen in the build output: `flowDiagram-*.js`, `sequenceDiagram-*.js`, etc.). The `manualChunks` function should only capture the mermaid core, not interfere with its existing diagram-level code splitting. The `@mermaid-js/parser` exclusion prevents pulling the Langium parser into the mermaid core chunk when it is already dynamically loaded.

## Patterns to Follow

### Pattern 1: Thin Sanitization Wrapper

**What:** Create a single `sanitize.js` module that wraps DOMPurify with project-specific defaults, so configuration lives in one place.

**When:** Any component needs to render user-influenced HTML via `v-html` or `innerHTML` into the visible DOM.

**Example:**

```javascript
// src/shared/utils/sanitize.js
import DOMPurify from 'dompurify';

/**
 * Project-wide DOMPurify configuration.
 * Allows inline styles (required for social format rendering),
 * SVG (Mermaid diagrams), and MathML (math formulas).
 */
const DEFAULT_CONFIG = {
  // Allow HTML + SVG + MathML content profiles
  USE_PROFILES: { html: true, svg: true, mathMl: true },
  // Preserve inline styles (critical for theme system and social copy)
  ALLOW_UNKNOWN_PROTOCOLS: false,
  // Add Mermaid-specific elements if needed
  ADD_TAGS: ['foreignObject'],
  ADD_ATTR: ['target', 'rel', 'class', 'style', 'viewBox', 'xmlns',
             'fill', 'stroke', 'd', 'transform', 'data-formula',
             'data-mml-node'],
  // Forbid dangerous patterns explicitly
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input'],
  FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover']
};

/**
 * Sanitize HTML for safe DOM insertion.
 * @param {string} dirty - Raw HTML string
 * @param {Object} overrides - Optional DOMPurify config overrides
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(dirty, overrides = {}) {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, { ...DEFAULT_CONFIG, ...overrides });
}
```

**Usage in PreviewPane.vue:**

```javascript
import { sanitizeHtml } from '../shared/utils/sanitize.js'

// In processMarkdown():
renderedHtml.value = sanitizeHtml(previewFormatted)
```

### Pattern 2: Module Logger for Catch Blocks

**What:** Use existing `createModuleLogger()` to replace empty catch blocks with structured, context-aware logging.

**When:** Any catch block that currently swallows errors silently.

**Example:**

```javascript
// At top of copy-formats.js:
import { createModuleLogger } from '../../shared/utils/logger.js'
const logger = createModuleLogger('CopyFormats')

// Replace: } catch (_) {}
// With:
} catch (err) {
  logger.warn('SVG element getBBox failed, using fallback dimensions', err)
}
```

**Key properties:**
- Module name in log prefix enables filtering (`[CopyFormats]`)
- `warn` level (not `error`) for non-critical fallback paths
- Short context string explains WHAT failed, error object provides details
- Production builds auto-silence via `isDev` check in logger.js -- zero runtime cost

### Pattern 3: Defensive manualChunks

**What:** Use a function-based `manualChunks` that matches by `node_modules` path substring, with explicit boundaries per vendor group.

**When:** Configuring Vite build output to split the monolithic vendor bundle.

**Why function over object:** The function form can inspect the full module path, handling scoped packages (`@codemirror/*`) and preventing transitive dependencies from leaking into wrong chunks.

## Anti-Patterns to Avoid

### Anti-Pattern 1: DOMPurify in the Copy/Export Pipeline

**What:** Wrapping `generateSocialHtml()` output with DOMPurify before clipboard or export operations.

**Why bad:** DOMPurify would strip or mangle the carefully crafted inline styles that WeChat and other social platforms require. The copy/export pipeline operates on ephemeral offscreen containers that are never user-visible, so XSS risk is negligible. The existing `sanitizeSvgForRasterize()` function in copy-formats.js already handles SVG-specific cleaning for canvas operations.

**Instead:** Apply DOMPurify only at the `v-html` boundary in PreviewPane.vue.

### Anti-Pattern 2: Global DOMPurify Plugin (vue-dompurify-html)

**What:** Installing `vue-dompurify-html` as a Vue plugin and replacing all `v-html` directives with `v-dompurify-html`.

**Why bad:** This project has exactly ONE `v-html` usage that needs protection (PreviewPane.vue line 43). A global plugin adds configuration complexity, another dependency, and implicit magic. The other `v-html` usages (MarkdownGuide.vue math demos) render trusted, developer-authored content.

**Instead:** Import DOMPurify directly in the sanitize.js wrapper. Call it explicitly in PreviewPane before assigning to `renderedHtml`.

### Anti-Pattern 3: Replacing ALL console.* with logger

**What:** Doing a project-wide find-and-replace of `console.warn`/`console.error` with logger calls.

**Why bad:** Out of scope per PROJECT.md. Many existing `console.warn` calls (e.g., Mermaid rendering failures in PreviewPane.vue) already provide context. The scope is specifically the 7 empty catch blocks that currently silently swallow errors.

**Instead:** Instrument only the identified empty catch blocks. Leave existing `console.*` calls untouched.

### Anti-Pattern 4: Over-Splitting Chunks

**What:** Creating a separate chunk for every `node_modules` package.

**Why bad:** HTTP/2 multiplexing has limits. Too many small chunks create overhead from request setup, parsing, and module evaluation. Packages that are always loaded together (e.g., `vue` + `@vue/runtime-dom`) should stay in the same chunk.

**Instead:** Group by update cadence and usage pattern: CodeMirror packages together, Milkdown packages together, etc.

### Anti-Pattern 5: Using `USE_PROFILES` with `ALLOWED_TAGS` Together

**What:** Setting both `USE_PROFILES: {html: true}` and `ALLOWED_TAGS: [...]` in DOMPurify config.

**Why bad:** DOMPurify documentation explicitly states that `USE_PROFILES` overrides `ALLOWED_TAGS`. Using both leads to unexpected tag filtering where your `ALLOWED_TAGS` list is silently ignored.

**Instead:** Use `USE_PROFILES` for broad content type selection (html + svg + mathMl), then use `ADD_TAGS` and `ADD_ATTR` for additions, and `FORBID_TAGS`/`FORBID_ATTR` for explicit exclusions.

## Scalability Considerations

| Concern | Current (1 user) | At 10K users | At 1M users |
|---------|-------------------|--------------|-------------|
| DOMPurify performance | Sub-ms for typical Markdown output | Same (client-side) | Same (client-side) |
| Bundle size impact | +8 KB (DOMPurify minified+gzipped) | Negligible per-user | CDN caching eliminates repeat cost |
| Chunk caching | No benefit (single chunk) | Major: vendor chunks cached across deploys | Same |
| Error visibility | Silent failures | logger.js captures in dev, silent in prod | Would need external logging (Sentry) for production visibility -- out of scope |

## Suggested Build Order (Dependencies Between Changes)

```
Phase 1: npm audit fix (svgo 4.0.0 -> 4.0.1)
    |     Zero code changes, pure dependency update.
    |     Must come first: establishes known-good dependency baseline.
    |     All 394 existing tests should pass unchanged.
    |
Phase 2: DOMPurify integration
    |     Adds new dependency + sanitize.js wrapper + PreviewPane change.
    |     Independent of logging and chunk splitting.
    |     Requires new tests for sanitize.js + PreviewPane integration.
    |
Phase 3: Empty catch block instrumentation
    |     Uses existing logger.js, modifies 3 files (7 catch blocks).
    |     Independent of DOMPurify and chunk splitting.
    |     Requires tests to verify logging happens on error paths.
    |
Phase 4: Vite manualChunks
          Modifies only vite.config.js.
          Must come last: ensures DOMPurify is properly chunked too.
          Verified by build output inspection + full test suite.
```

**Why this order:**
1. **svgo first**: Fixes the only high-severity CVE. No code risk.
2. **DOMPurify second**: Highest security value. Introduces the new dependency early so Phase 4 can account for it in chunking.
3. **Logging third**: Improves observability, which helps debug any issues from the DOMPurify change.
4. **Chunks last**: Build optimization is best done after all runtime changes are finalized. If DOMPurify or logging changes cause issues, they are easier to diagnose in the monolithic bundle.

## Sources

- [DOMPurify GitHub - cure53/DOMPurify](https://github.com/cure53/DOMPurify) -- API reference, v3.3.3 (HIGH confidence)
- [DOMPurify Default Tags/Attrs Wiki](https://github.com/cure53/DOMPurify/wiki/Default-TAGs-ATTRIBUTEs-allow-list-&-blocklist) -- Allow/block list details (HIGH confidence)
- [vue-dompurify-html](https://github.com/LeSuisse/vue-dompurify-html) -- Vue plugin alternative, evaluated and rejected (MEDIUM confidence)
- [CVE-2026-29074 - SVGO Billion Laughs](https://github.com/advisories/GHSA-xpqw-6gx7-v673) -- Fix in svgo 4.0.1 (HIGH confidence)
- [Vite Build Options - rollupOptions](https://v5.vite.dev/config/build-options.html) -- manualChunks via Rollup (HIGH confidence)
- [Vite manualChunks caching guide](https://soledadpenades.com/posts/2025/use-manual-chunks-with-vite-to-facilitate-dependency-caching/) -- Practical patterns (MEDIUM confidence)
- [Taming Large Chunks in Vite](https://www.mykolaaleksandrov.dev/posts/2025/11/taming-large-chunks-vite-react/) -- Chunk splitting strategy (MEDIUM confidence)
- Codebase analysis: PreviewPane.vue, copy-formats.js, clipboard.js, loader.js, logger.js, vite.config.js, package.json (HIGH confidence -- direct source inspection)

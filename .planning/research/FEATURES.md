# Feature Research: Frontend Security Hardening for MDEditor

**Domain:** Frontend security hardening for a Vue 3 Markdown editor that renders HTML via `v-html`
**Researched:** 2026-03-27
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

These are the features that any security hardening milestone must deliver. Skipping any of these means the hardening effort is incomplete and the application remains vulnerable.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **DOMPurify sanitization on PreviewPane v-html** | PreviewPane renders user-authored Markdown as raw HTML via `v-html="renderedHtml"` (line 43 of PreviewPane.vue). This is the single largest XSS surface in the app. Any Markdown editor that renders HTML without sanitization is fundamentally insecure. | MEDIUM | DOMPurify must be configured to preserve inline styles (`style` attribute) because the markdown pipeline generates inline-styled HTML for social platform compatibility. Use `ADD_ATTR: ['style']` and `ALLOW_DATA_ATTR: true`. Must NOT break Mermaid SVG rendering (SVGs are already replaced post-render, so sanitization happens on the initial HTML before Mermaid runs). |
| **Fix svgo Billion Laughs DoS (CVE-2026-29074)** | svgo 4.0.0 is a direct dependency with a HIGH severity vulnerability (CVSS 7.5). A sub-1KB malicious SVG can crash the Node.js process via entity expansion. The fix is a simple version bump to 4.0.1. | LOW | `npm install svgo@^4.0.1` -- trivial fix, fixAvailable: true per npm audit. The vulnerability affects server-side SVG processing; in this app svgo is used client-side for SVG optimization, but the fix is still essential for hygiene and audit compliance. |
| **Eliminate silent catch blocks** | 7 empty `catch (_) {}` blocks across clipboard.js (1), copy-formats.js (5), and loader.js (1) swallow errors silently. This is a well-documented anti-pattern that hides bugs, makes debugging impossible, and can mask security-relevant failures. The project already has `createModuleLogger()` in `src/shared/utils/logger.js`. | LOW | Each empty catch should call the module logger's `.warn()` or `.error()` method. Some catches are legitimately "best-effort" (e.g., `img.decode()`, `URL.revokeObjectURL()`), but they still deserve a debug-level log. The logger already silences output in production (`isDev` check), so there is zero runtime cost. |
| **Vite manualChunks vendor splitting** | The main bundle is 4,788 KB (1,552 KB gzip) -- a single monolithic chunk containing Vue, CodeMirror, Milkdown, MathJax, Mermaid, PrismJS, html2canvas, jsPDF, and all application code. Vite itself warns about this. Splitting vendors into separate chunks improves cache efficiency across deployments and reduces initial load time. | MEDIUM | Split into logical groups: (1) vue-core (vue, vue-i18n), (2) codemirror (all @codemirror/* + codemirror), (3) milkdown (all @milkdown/*), (4) mermaid, (5) mathjax (mathjax-full), (6) export-tools (html2canvas, jspdf), (7) remaining vendor. Mermaid already has its own dynamic chunks via lazy loading; the key win is separating the other large libraries. |
| **Unit tests for every change** | PROJECT.md explicitly requires "every change point has matching unit tests, all 394 existing tests pass." Security hardening without tests is unverifiable. | MEDIUM | Test DOMPurify integration (malicious input stripped, valid styled HTML preserved), test logger integration in catch blocks (logger.warn called with error context), verify svgo version in a dependency test or package.json assertion, test that manualChunks configuration produces expected chunk structure. |

### Differentiators (Competitive Advantage)

These go beyond the minimum scope. They are not required for this milestone but would elevate the security posture significantly.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **DOMPurify on MarkdownGuide v-html** | MarkdownGuide.vue has 2 additional `v-html` usages for KaTeX math rendering. While the input is hardcoded (not user-supplied), defense-in-depth says sanitize all `v-html` sites. A consistent pattern makes future v-html usages safe by default. | LOW | The math rendering uses `katex.renderToString()` which produces trusted HTML, but wrapping in DOMPurify is cheap insurance and establishes the pattern that ALL v-html goes through sanitization. |
| **Centralized sanitization utility** | Create a `src/shared/utils/sanitize.js` that wraps DOMPurify with the project's standard config (allowed tags, allowed attributes including `style`). Every `v-html` site imports from this single module. Prevents config drift and makes auditing trivial. | LOW | Export `sanitizeHtml(dirty)` and `sanitizeForPreview(dirty)` (with more permissive config for styled preview HTML). One import, one config source. |
| **DOMPurify hook for Mermaid class preservation** | DOMPurify strips `class` attributes by default. The Mermaid code blocks use `class="mermaid"` for post-render identification. A DOMPurify `afterSanitizeAttributes` hook can whitelist specific class values on code blocks. | LOW | Without this, the Mermaid rendering pipeline in PreviewPane would break because DOMPurify strips the `mermaid` class from `<code>` elements. This is effectively required if DOMPurify is added. Implementation: `ADD_ATTR: ['class']` with a hook that strips non-whitelisted class values, or simply `ADD_ATTR: ['class', 'style']` since class itself is not a vector. |
| **Structured error context in catch blocks** | Beyond just calling `logger.warn(error)`, include structured context: module name, operation being attempted, and the error. Pattern: `logger.warn('Operation failed', { module: 'clipboard', op: 'revokeObjectURL', error })`. | LOW | Improves debugging significantly. The existing `createModuleLogger(moduleName)` already prefixes with module name, so the structured context is partially built-in. Add operation context for each catch site. |
| **npm audit CI gate** | Add `npm audit --audit-level=high` to the test/CI pipeline so future HIGH/CRITICAL vulnerabilities block deployment. | LOW | Single line in CI config or package.json scripts. The Electron Forge vulnerabilities (32 high) currently have no fix available, so the gate would need `--production` flag or explicit allowlist to avoid false failures from devDependencies. |
| **Subresource Integrity for CDN assets** | If any external resources are loaded via CDN (currently none detected), add SRI hashes. | LOW | Not immediately applicable -- the app bundles everything. But worth documenting as a policy for future changes. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good for security hardening but create problems in this specific context.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Replace all `console.*` with logger** | Seems like a natural extension of the "eliminate silent catches" work. | PROJECT.md explicitly puts this out of scope: "only handle empty catch blocks, global console replacement is a separate effort." Scope creep risk is high -- there are likely dozens of console.warn/error calls throughout the codebase. | Stick to the 7 identified empty catch blocks only. The existing `console.warn` and `console.error` calls (e.g., in PreviewPane's Mermaid error handling) are already logging -- they just lack the structured logger format. That is a separate improvement. |
| **vue-dompurify-html directive** | Community wrapper that replaces `v-html` with `v-dompurify-html` directive. Seems cleaner. | Adds another dependency (PROJECT.md constraint: "only add DOMPurify, no other new deps"). The wrapper adds indirection that makes configuration harder to audit. Direct DOMPurify usage in a computed property or utility function is more transparent and testable. | Use DOMPurify directly via a centralized utility. A computed property in PreviewPane calls `sanitizeHtml(renderedHtml)` before passing to `v-html`. |
| **Content Security Policy headers** | CSP is a standard defense-in-depth measure against XSS. | The app runs in two contexts: (1) Vercel-hosted SPA where CSP headers would need `unsafe-inline` for the inline styles the markdown pipeline generates, and `unsafe-eval` is potentially needed for Mermaid/MathJax; (2) Electron where CSP is configured differently and the app already has nodeIntegration:false + contextIsolation:true. Adding CSP that actually works without breaking functionality requires significant testing across both environments. | Defer to a dedicated CSP milestone. The DOMPurify sanitization provides the immediate XSS protection. CSP is defense-in-depth that should be done properly, not rushed. |
| **Server-side HTML sanitization** | Best practice says sanitize server-side too. | This is a purely client-side application. There is no server processing user content. The Markdown-to-HTML pipeline runs entirely in the browser. Server-side sanitization is inapplicable. | Client-side DOMPurify is the correct and only necessary sanitization layer for this architecture. |
| **Replace html2canvas** | html2canvas is unmaintained. | PROJECT.md explicitly marks this out of scope: "html2canvas is unmaintained but functional, not a security issue." Replacing it is a feature change, not security hardening. | Leave as-is for this milestone. |
| **TypeScript migration for type safety** | TypeScript catches classes of bugs at compile time. | PROJECT.md explicitly puts this out of scope: "scope too large, separate milestone." Adding types to 95 files and 19,478 lines is not security hardening. | Defer entirely. |
| **Dynamic imports for route-level splitting** | Would reduce initial load even further. | manualChunks is the minimal change that achieves the goal (break up the 4.8MB monolith) without changing loading behavior. Dynamic imports change component loading semantics, add Suspense/loading states, and risk regressions. | Use manualChunks only. It splits vendor code into cache-friendly chunks without changing any import statements or loading behavior in the application code. |
| **E2E security testing** | Automated XSS payload testing against the live editor. | PROJECT.md puts E2E out of scope. Unit tests covering DOMPurify integration are sufficient for this milestone -- they can test that known XSS payloads are stripped from output. | Write thorough unit tests with real XSS payloads (script tags, event handlers, javascript: URLs) against the sanitization utility. |

## Feature Dependencies

```
[DOMPurify sanitization on PreviewPane]
    |
    +--requires--> [DOMPurify npm package installed]
    |
    +--requires--> [DOMPurify config that preserves inline styles + class attributes]
    |                  |
    |                  +--enhances--> [Centralized sanitization utility]
    |
    +--requires--> [Mermaid class preservation (hook or ADD_ATTR)]
    |
    +--tested-by--> [Unit tests for sanitization]

[Fix svgo CVE-2026-29074]
    |
    +--independent (no dependencies, simple version bump)
    |
    +--tested-by--> [Verify version in package.json or lock file]

[Eliminate silent catch blocks]
    |
    +--requires--> [Existing logger.js - already available]
    |
    +--tested-by--> [Unit tests verifying logger.warn called]

[Vite manualChunks]
    |
    +--independent (build config only, no runtime changes)
    |
    +--tested-by--> [Build output verification - chunk count/size]

[Unit tests for every change]
    |
    +--depends-on--> [All four features above being implemented]
```

### Dependency Notes

- **DOMPurify sanitization requires careful config:** The markdown pipeline generates HTML with inline `style` attributes for social platform compatibility (WeChat). DOMPurify must be configured to allow `style` and `class` attributes, or the preview and copy-to-social features break.
- **Mermaid class preservation is effectively mandatory with DOMPurify:** Without preserving `class="mermaid"` on code blocks, the Mermaid rendering pipeline in PreviewPane cannot identify blocks to render. This is not optional.
- **Silent catch elimination and svgo fix are fully independent:** Can be done in any order, in parallel, with no interaction.
- **manualChunks is independent of all security changes:** Pure build configuration, zero runtime impact. Can be done first, last, or in parallel.
- **Tests depend on implementation:** Tests for each feature must be written alongside or immediately after the feature implementation.

## MVP Definition

### Launch With (v1 - This Milestone)

The minimum set that fulfills the PROJECT.md "Active" requirements:

- [x] **DOMPurify on PreviewPane v-html** -- eliminates the primary XSS vector
- [x] **svgo bump to 4.0.1** -- eliminates the HIGH severity DoS vulnerability
- [x] **Empty catch blocks wired to logger** -- eliminates silent error swallowing in 7 locations
- [x] **Vite manualChunks** -- splits the 4.8MB monolith into cache-friendly vendor chunks
- [x] **Unit tests for all changes** -- verifiable security, maintains 80% coverage threshold

### Add After Validation (v1.x)

Features to add once core hardening is verified working:

- [ ] **Centralized sanitization utility** -- if more v-html sites appear, or during next refactoring pass
- [ ] **DOMPurify on MarkdownGuide math rendering** -- defense-in-depth, low urgency since input is hardcoded
- [ ] **npm audit CI gate** -- after resolving the Electron Forge audit noise (32 unfixable high-severity reports from devDependencies)

### Future Consideration (v2+)

Features to defer until after this milestone:

- [ ] **Content Security Policy** -- requires cross-environment testing (Vercel + Electron), potential Mermaid/MathJax compatibility work
- [ ] **Global console.* replacement with logger** -- explicit out-of-scope per PROJECT.md
- [ ] **Dynamic import code splitting** -- beyond manualChunks, would require loading state changes

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| DOMPurify on PreviewPane | HIGH (prevents XSS) | MEDIUM (config tuning for styles/classes) | P1 |
| Fix svgo CVE-2026-29074 | HIGH (eliminates DoS) | LOW (version bump) | P1 |
| Eliminate silent catch blocks | MEDIUM (debuggability) | LOW (7 localized changes) | P1 |
| Vite manualChunks | MEDIUM (perf + caching) | MEDIUM (dependency grouping logic) | P1 |
| Unit tests for all changes | HIGH (verifiability) | MEDIUM (XSS payload tests, mock logger) | P1 |
| Centralized sanitize utility | MEDIUM (maintainability) | LOW (wrapper module) | P2 |
| DOMPurify on MarkdownGuide | LOW (hardcoded input) | LOW (same pattern) | P2 |
| npm audit CI gate | MEDIUM (prevention) | LOW (script addition) | P2 |
| CSP headers | MEDIUM (defense-in-depth) | HIGH (cross-env testing) | P3 |

**Priority key:**
- P1: Must have for this milestone (all 5 items from PROJECT.md "Active" list)
- P2: Should have, add when the milestone allows or in a follow-up
- P3: Future milestone, requires dedicated effort

## Competitor Feature Analysis

| Security Feature | Typora | StackEdit | Dillinger | MDEditor (Our Plan) |
|---------|--------|-----------|-----------|---------------------|
| HTML sanitization | Built into renderer (no raw v-html) | Uses markdown-it with sanitize option | Server-side sanitization | DOMPurify on client-side v-html |
| XSS prevention | Desktop-only, no web attack surface | CSP headers + sanitization | CSP + server-side | DOMPurify (CSP deferred) |
| Dependency auditing | Closed-source | Unknown | Unknown | npm audit fix for svgo, CI gate planned |
| Error logging | Proprietary | console-based | Server-side logging | Module logger replacing empty catches |
| Bundle optimization | Desktop app (N/A) | Webpack splitting | Server-rendered | Vite manualChunks vendor splitting |

## Sources

- [Vue.js Security Best Practices](https://vuejs.org/guide/best-practices/security) -- Official Vue docs on v-html risks
- [DOMPurify GitHub](https://github.com/cure53/DOMPurify) -- Configuration options, default allowlists
- [DOMPurify Default TAGs/ATTRIBUTEs](https://github.com/cure53/DOMPurify/wiki/Default-TAGs-ATTRIBUTEs-allow-list-&-blocklist) -- What DOMPurify allows/blocks by default
- [CVE-2026-29074: SVGO Billion Laughs](https://github.com/advisories/GHSA-xpqw-6gx7-v673) -- svgo DoS vulnerability details, fixed in 4.0.1
- [Vite Building for Production - Chunking Strategy](https://runebook.dev/en/articles/vite/guide/build/chunking-strategy) -- manualChunks best practices
- [Markdown XSS Vulnerability](https://github.com/showdownjs/showdown/wiki/Markdown's-XSS-Vulnerability-(and-how-to-mitigate-it)) -- Why markdown-to-HTML needs sanitization
- [Error Hiding Anti-Pattern](https://en.wikipedia.org/wiki/Error_hiding) -- Why silent catches are dangerous
- [Electron Security Docs](https://www.electronjs.org/docs/latest/tutorial/security) -- CSP and security in Electron apps

---
*Feature research for: Frontend security hardening of MDEditor*
*Researched: 2026-03-27*

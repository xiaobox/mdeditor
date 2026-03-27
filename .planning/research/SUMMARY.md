# Project Research Summary

**Project:** MDEditor Security Hardening Milestone
**Domain:** Frontend security hardening for a Vue 3 + Vite Markdown editor
**Researched:** 2026-03-27
**Confidence:** HIGH

## Executive Summary

MDEditor is a client-side Markdown editor with a complex rendering pipeline that outputs inline-styled HTML for social platform compatibility. Security hardening for this type of application centers on four distinct surfaces: XSS prevention at the HTML rendering boundary, dependency vulnerability remediation, error observability in swallowed catch blocks, and bundle optimization for caching efficiency. All four surfaces have well-established solutions, and crucially, the existing codebase already contains the infrastructure needed to address them with minimal new code — DOMPurify is already a transitive dep, and a module logger utility already exists.

The recommended approach is a staged, independent fix sequence: patch the one actionable CVE first (svgo 4.0.1), then integrate DOMPurify at the single critical v-html injection point (PreviewPane.vue:43), then wire up the existing logger.js into 7 empty catch blocks, then add Vite manualChunks to break the 4.8MB monolithic bundle. Each stage is fully independent and rollback-safe. The entire milestone introduces exactly one new direct dependency (DOMPurify, which adds zero bundle bytes since it is already a transitive dep via mermaid and jspdf) and modifies code in four files.

The primary risk is misconfiguring DOMPurify so it strips the inline styles and SVG attributes that the social copy and export pipelines require. This is avoided by sanitizing exclusively at the v-html consumption point in PreviewPane.vue rather than inside parseMarkdown(), and by configuring DOMPurify with `USE_PROFILES: {html: true, svg: true, mathMl: true}` plus explicit allowances for `style`, `class`, and Mermaid-specific attributes. A secondary risk is running `npm audit fix --force`, which would cascade major-version upgrades across Electron Forge and Vite, breaking the build entirely. The only actionable production fix is the svgo patch version bump.

## Key Findings

### Recommended Stack

The hardening milestone adds one direct runtime dependency and modifies build configuration. DOMPurify 3.3.3 is the only appropriate HTML sanitizer for this project: it is the industry standard (14.8M weekly downloads, authored by Cure53), handles SVG and MathML natively (required for Mermaid and MathJax output), and is already installed as a transitive dep. Promoting it to a direct dependency adds zero bundle bytes. No Vue wrapper directive (vue-dompurify-html) is warranted for a project with exactly three v-html sites. All other hardening uses existing infrastructure: the project's logger.js for catch blocks, and Vite's built-in Rollup manualChunks for bundle splitting.

**Core technologies:**
- **DOMPurify 3.3.3**: XSS sanitization at v-html boundary — only browser-native sanitizer with full SVG/MathML profile support; already a transitive dep, zero additional bundle cost
- **svgo 4.0.1**: Direct dep patch upgrade — fixes CVE-2026-29074 (Billion Laughs DoS, CVSS 7.5) with no API changes; `^4.0.0` constraint already permits it
- **Existing `logger.js`** (`createModuleLogger`): Error observability — dev/prod gated logging already in the codebase; no new dependency needed
- **Vite `manualChunks`** (built-in Rollup): Bundle splitting — breaks the 4.8MB monolith into 7-8 domain-based vendor chunks; no new dependency needed

**Critical version detail:** Never mix `USE_PROFILES` with `ALLOWED_TAGS` in DOMPurify config — `USE_PROFILES` silently overrides `ALLOWED_TAGS`. Use `ADD_TAGS` and `FORBID_TAGS` alongside profiles instead.

### Expected Features

The milestone scope is narrowly defined by PROJECT.md. All five deliverables are P1 (must-have). No scope expansion belongs in this milestone.

**Must have (table stakes):**
- **DOMPurify on PreviewPane v-html** — eliminates the primary XSS attack surface; the markdown pipeline processes user input and renders raw HTML via v-html without any sanitization today
- **svgo 4.0.1 patch** — fixes the only HIGH-severity direct production dependency CVE; a sub-1KB malicious SVG can crash the process via entity expansion
- **Empty catch block instrumentation (7 locations)** — eliminates silent error swallowing in clipboard.js (1), copy-formats.js (5), and loader.js (1); the existing `createModuleLogger` pattern is already available
- **Vite manualChunks vendor splitting** — Vite itself warns about the 4.8MB chunk; splitting into cache-friendly domain groups is standard practice for SPAs of this size
- **Unit tests for all changes** — PROJECT.md explicitly requires tests for every change; maintaining the 80% coverage threshold and all 394 existing tests passing

**Should have (post-milestone v1.x):**
- Centralized `src/shared/utils/sanitize.js` utility — single config source for future v-html consumers
- DOMPurify on MarkdownGuide v-html sites (math rendering) — defense-in-depth; input is developer-authored so urgency is low
- npm audit CI gate (`npm audit --omit=dev --audit-level=high`) — prevents future HIGH CVEs from shipping undetected

**Defer (v2+):**
- Content Security Policy headers — requires cross-environment testing (Vercel SPA + Electron), inline-style exemptions for social format pipeline, potential Mermaid/MathJax `unsafe-eval` conflicts
- Global `console.*` to logger migration — explicitly out of scope per PROJECT.md; scope covers only the 7 identified empty catch blocks
- Dynamic import code splitting beyond manualChunks — changes loading semantics; PROJECT.md prohibits loading behavior changes in this milestone

### Architecture Approach

The hardening changes touch four independent integration surfaces with no cross-dependencies between them. The key architectural decision is WHERE to apply DOMPurify: at the v-html consumption boundary in PreviewPane.vue, not inside parseMarkdown(). This preserves three distinct output paths (preview, social copy, PDF/image export) that each require different HTML fidelity. The copy and export paths use ephemeral offscreen containers that are never shown to the user; sanitizing them would strip the inline styles WeChat requires. The logger instrumentation is purely additive: a module logger instance per file, empty catch replaced with `catch (err) { logger.warn(...) }`. The manualChunks change is build-time only and touches a single function in vite.config.js.

**Major components:**
1. **`src/shared/utils/sanitize.js`** (new) — thin DOMPurify wrapper with project-specific config; all v-html consumers import from here for consistent sanitization
2. **`PreviewPane.vue`** — sole consumer of sanitize.js for v-html; sanitization inserted after `parseMarkdown()`, before the renderedHtml ref assignment, and before Mermaid post-render
3. **`logger.js`** (existing, `createModuleLogger`) — wired into clipboard.js (1 catch), copy-formats.js (5 catches), and loader.js (1 catch)
4. **`vite.config.js`** — `manualChunks` function added to `build.rollupOptions.output`; groups by functional domain (codemirror, milkdown/prosemirror, mermaid, mathjax, export, vue, prism)
5. **`package.json`** — svgo promoted to `^4.0.1`, dompurify added as explicit direct dep at `3.3.3`

**Data flow for preview (post-hardening):**
```
User types Markdown
  -> parseMarkdown(text, options)         [existing pipeline unchanged]
  -> sanitizeHtml(renderedHtml)           [NEW: DOMPurify wrapper]
  -> v-html binding in PreviewPane.vue    [safe DOM insertion]
  -> Mermaid post-render (nextTick)       [unchanged, runs after v-html]
```

### Critical Pitfalls

1. **DOMPurify strips inline styles, breaking social copy and export** — placing sanitization inside `parseMarkdown()` or using `FORBID_ATTR: ['style']` destroys the WeChat-compatible social format. Sanitize only at PreviewPane v-html; the copy and export pipelines use offscreen containers and must not be sanitized.

2. **DOMPurify runs after Mermaid renders, breaking SVG diagrams** — sanitization must happen on the HTML string before it enters v-html, which is before Mermaid's post-nextTick DOM render. The recommended architecture already produces the correct order. Do not invert this by sanitizing the live DOM after Mermaid renders.

3. **`npm audit fix --force` causes cascading breakage** — 32 high-severity Electron Forge vulnerabilities have no fix available. `--force` attempts major version bumps breaking `npm run make:mac/win/linux`. Fix only svgo manually: `npm install svgo@4.0.1`.

4. **manualChunks destroys Mermaid's dynamic import code splitting** — Mermaid 11.x already lazy-loads ~25 diagram-type chunks. A naive `id.includes('mermaid')` match pulls all of them into a single vendor chunk, making initial load worse. Match only the Mermaid core path; exclude diagram submodules.

5. **Indiscriminate catch block log level floods dev console** — 6 of 7 catches are Category A (intentionally silent fallback paths inside loops or cleanup operations). Only `loader.js:62` (custom theme JSON parse failure) is Category B (a genuine bug to surface). Use `logger.debug()` for cleanup ops, `logger.warn()` for recoverable failures, and never re-throw inside SVG measurement loops.

## Implications for Roadmap

Based on combined research, four phases in dependency order. All four are independent at the code level, but sequencing matters for debuggability and clean baselines.

### Phase 1: Dependency Vulnerability Patch

**Rationale:** Zero code changes. Establishes a known-good dependency baseline before any runtime modifications. Fixes the only directly actionable production CVE. Must come first to avoid conflating any future test failures with pre-existing vulnerability state.
**Delivers:** svgo upgraded to 4.0.1; `npm audit --omit=dev` shows no HIGH-severity production vulnerabilities; all 394 existing tests pass unchanged.
**Addresses:** "Fix svgo CVE-2026-29074" (P1 feature)
**Avoids:** Pitfall 4 (npm audit fix --force) — fix ONLY `svgo@4.0.1`, document remaining 45 transitive vulns as accepted risk in the commit message

### Phase 2: XSS Prevention (DOMPurify Integration)

**Rationale:** Highest security value of the milestone. Introduced second so Phase 4 can account for DOMPurify in chunk grouping. The new `sanitize.js` utility and PreviewPane change are the architectural centerpiece; all other phases are supportive.
**Delivers:** `src/shared/utils/sanitize.js` with project-specific DOMPurify config; PreviewPane renders sanitized HTML; unit tests verify XSS payloads are stripped and inline-styled HTML is preserved; Mermaid diagrams and social copy output confirmed unchanged.
**Uses:** DOMPurify 3.3.3 with `USE_PROFILES + ADD_ATTR` config (not `ALLOWED_TAGS`)
**Implements:** sanitize.js wrapper + PreviewPane consumer
**Avoids:** Pitfall 1 (inline style stripping), Pitfall 2 (Mermaid SVG breakage via wrong placement), Pitfall 3 (double-sanitization across pipelines), Pitfall 9 (duplicate DOMPurify versions — verify with `npm ls dompurify` before installing)

### Phase 3: Error Observability (Catch Block Instrumentation)

**Rationale:** Purely additive change to three existing files. Improves debuggability of the Phase 2 changes: if DOMPurify configuration causes unexpected failures in the copy-formats pipeline, the newly instrumented catch blocks surface them in dev mode immediately.
**Delivers:** 7 empty catch blocks replaced with module-logger calls; `createModuleLogger` instances in clipboard.js, copy-formats.js, and loader.js; unit tests verify logger.warn/debug called on error paths.
**Uses:** Existing `logger.js` — no new dependency
**Avoids:** Pitfall 5 (indiscriminate error level) — each catch block analyzed individually; Pitfall 10 (logger no-op in production) — document as known limitation, do not change logger scope in this milestone

### Phase 4: Bundle Optimization (Vite manualChunks)

**Rationale:** Build configuration change only; modifies vite.config.js and zero runtime code. Done last so all runtime dependencies (including newly added DOMPurify) are finalized before chunk groupings are defined. Requires `npm run preview` full feature verification, not just build success.
**Delivers:** 4.8MB monolithic `index.js` split into 7-8 domain-based vendor chunks; Mermaid's ~25 diagram dynamic import chunks preserved as separate files; `npm run build` + `npm run preview` full feature verification passes.
**Uses:** Vite function-form `manualChunks`; domain-based grouping (codemirror, milkdown+prosemirror, mermaid core only, mathjax, export libs, vue, prism)
**Avoids:** Pitfall 6 (circular chunk dependencies — group CodeMirror packages together, Milkdown+prosemirror together, Mermaid+d3+cytoscape together); Pitfall 7 (Mermaid dynamic import destruction — exclude diagram submodules from the mermaid core match)

### Phase Ordering Rationale

- svgo first: pure dependency update, zero code risk, establishes clean baseline
- DOMPurify second: highest security value; finalized early so Phase 4 chunk config can place it in the right vendor group
- Logging third: additive and observability-improving; any DOMPurify edge cases in clipboard or copy-formats operations will be surfaced by newly instrumented catches
- manualChunks last: build-time-only change; should reflect final state of all runtime dependencies

### Research Flags

Phases with standard patterns (research-phase not needed during planning):

- **Phase 1 (svgo patch):** Trivially well-documented; single version bump with no design decisions
- **Phase 3 (catch blocks):** Mechanical instrumentation of identified locations; each catch block already analyzed and categorized in PITFALLS.md and ARCHITECTURE.md
- **Phase 4 (manualChunks):** Vite documentation is comprehensive; chunk groupings fully specified; verify by comparing pre/post build output file listing

Phases needing implementation-time verification:

- **Phase 2 (DOMPurify):** The config that simultaneously preserves inline styles, Mermaid SVG attributes, MathML, and class attributes while stripping XSS vectors should be tested against actual theme output (all 8 color themes) and all Mermaid diagram types before the phase is considered complete. The config is fully specified in STACK.md but runtime integration with PreviewPane's processMarkdown flow needs explicit verification.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | DOMPurify version verified against npm registry and confirmed as existing transitive dep; svgo CVE advisory confirms 4.0.1 as fix; Vite manualChunks config based on official Rollup docs and verified against actual build output |
| Features | HIGH | Scope derived directly from PROJECT.md "Active" items; all 5 P1 features have direct codebase evidence — specific files and line numbers identified through source inspection |
| Architecture | HIGH | Based on direct inspection of the actual files to be modified (PreviewPane.vue:43, copy-formats.js lines 176/196/237/266/318, clipboard.js:138, loader.js:62, vite.config.js); no inferences from general patterns |
| Pitfalls | HIGH | Critical pitfalls grounded in filed GitHub issues (DOMPurify/mermaid foreignObject regression, Vite circular deps), direct npm audit output inspection, and verified codebase analysis |

**Overall confidence:** HIGH

### Gaps to Address

- **DOMPurify config validation against full theme matrix:** The recommended config is derived from documentation analysis. CSS values produced by the project's ThemeProcessor and FontProcessor (rgba(), custom CSS variable references, letter-spacing) should be explicitly tested against DOMPurify output in Phase 2 implementation to confirm none are stripped unexpectedly.

- **Mermaid diagram type coverage in testing:** Unit tests and manual verification should cover all diagram types (flowchart, sequence, gantt, class, state, pie at minimum) after DOMPurify integration to confirm no SVG attributes required by specific diagram types are stripped.

- **manualChunks actual chunk sizes:** Projected chunk sizes in STACK.md are estimates based on known library sizes. After Phase 4, verify no single chunk exceeds 2MB uncompressed and confirm Mermaid's ~25 diagram chunks still exist as separate files in `dist/assets/`.

- **Production error visibility gap:** The existing logger.js silences all output in production via the `isDev` gate. The 7 catch blocks instrumented in Phase 3 will be invisible in production deployments. Accepted per PROJECT.md scope, but should be documented as a known gap for a future Sentry/external error monitoring milestone.

## Sources

### Primary (HIGH confidence)
- [DOMPurify GitHub - cure53/DOMPurify](https://github.com/cure53/DOMPurify) — API reference, v3.3.3 release notes, USE_PROFILES configuration
- [CVE-2026-29074 / GHSA-xpqw-6gx7-v673](https://github.com/advisories/GHSA-xpqw-6gx7-v673) — svgo Billion Laughs DoS, fixed in 4.0.1
- [Vite Build Options - rollupOptions](https://v5.vite.dev/config/build-options.html) — manualChunks function form documentation
- [Vite circular dependency issue #20202](https://github.com/vitejs/vite/issues/20202) — chunk circular dependency runtime behavior
- [DOMPurify #1002 - Mermaid foreignObject breakage](https://github.com/cure53/DOMPurify/issues/1002) — version pinning rationale (pin >= 3.2.0)
- [DOMPurify Default TAGs/ATTRIBUTEs wiki](https://github.com/cure53/DOMPurify/wiki/Default-TAGs-ATTRIBUTEs-allow-list-&-blocklist) — default allowlist and USE_PROFILES interaction
- Codebase inspection: PreviewPane.vue, copy-formats.js, clipboard.js, loader.js, logger.js, vite.config.js, package.json — all file paths and line numbers verified through direct source reading

### Secondary (MEDIUM confidence)
- [Vite manualChunks caching guide](https://soledadpenades.com/posts/2025/use-manual-chunks-with-vite-to-facilitate-dependency-caching/) — domain-based grouping patterns
- [Taming Large Chunks in Vite](https://www.mykolaaleksandrov.dev/posts/2025/11/taming-large-chunks-vite-react/) — chunk splitting strategy rationale
- [npm audit broken by design (Dan Abramov)](https://overreacted.io/npm-audit-broken-by-design/) — triage approach for audit noise from transitive devDependencies
- [vue-dompurify-html](https://github.com/LeSuisse/vue-dompurify-html) — Vue directive wrapper evaluated and rejected for this project

### Tertiary (MEDIUM confidence — opinion/community)
- [Why npm audit fix --force is a terrible idea](https://medium.com/@instatunnel/why-npm-audit-fix-force-is-a-terrible-idea-052ac56a3ae2) — corroborates Pitfall 4 prevention strategy
- [Using manualChunks breaks code-splitting (Vite #12209)](https://github.com/vitejs/vite/issues/12209) — Mermaid dynamic import preservation concern

---
*Research completed: 2026-03-27*
*Ready for roadmap: yes*

# Domain Pitfalls: Frontend Security Hardening

**Domain:** Security hardening for a Vue 3 Markdown editor with inline-styled HTML output
**Researched:** 2026-03-27
**Confidence:** HIGH (findings verified against codebase inspection, official docs, and multiple sources)

---

## Critical Pitfalls

Mistakes that cause broken features, security regressions, or require partial rewrites.

### Pitfall 1: DOMPurify Strips Inline Styles Required by the Social Copy Pipeline

**What goes wrong:** The entire Markdown rendering pipeline produces HTML with inline `style` attributes (font-size, color, line-height, letter-spacing, background-color, etc.) because WeChat/social platforms strip `<style>` tags and only honor inline styles. DOMPurify's default config allows `style` attributes, but CSS properties containing `url()`, `expression()`, or `var()` are stripped or neutralized. If the sanitizer is placed at the wrong point in the pipeline -- or configured too aggressively -- it destroys the inline styles that make the social copy feature work.

**Why it happens:** Developers assume DOMPurify only removes tags like `<script>` and event handlers. In reality, it also sanitizes CSS values inside `style` attributes. Properties like `background: url(...)` or CSS expressions get removed. The project's theme system generates inline styles with `rgba()` values and CSS variable references that could be affected.

**Consequences:**
- Social copy output loses all styling (appears as plain text in WeChat editor)
- Preview pane renders unstyled HTML
- PDF/image export produces blank or broken output (the export pipeline reuses the same social HTML)

**Prevention:**
1. Sanitize ONLY at the `v-html` injection point in `PreviewPane.vue` (line 43), not in the shared `parseMarkdown()` function. The copy and export pipelines have their own separate containers and do not need double-sanitization.
2. Test with the project's actual theme output: render markdown with each of the 8 color themes, sanitize, then verify inline styles survive. A simple `DOMPurify.sanitize(html)` default config should preserve standard `style` attributes, but verify this with the actual HTML output.
3. Never use `FORBID_ATTR: ['style']` or a restrictive `ALLOWED_ATTR` list that excludes `style`.

**Detection:** After integrating DOMPurify, the "copy to WeChat" button produces unstyled content. Preview pane loses colors/fonts. Export PDF has no formatting.

**Phase relevance:** DOMPurify integration phase -- this is the single most likely regression.

---

### Pitfall 2: DOMPurify Breaks Mermaid SVG Rendering in Preview

**What goes wrong:** Mermaid generates complex SVG with `<foreignObject>`, custom `data-*` attributes, inline `<style>` blocks inside SVG, and `class` attributes. DOMPurify historically had a breaking change in v3.1.7 that emptied `<foreignObject>` content, breaking all Mermaid text labels. Even in v3.3.3, aggressive configuration (e.g., `FORBID_TAGS: ['style']` or namespace restrictions) strips SVG-internal styles, leaving diagrams visually broken.

**Why it happens:** DOMPurify processes HTML + SVG together. SVG elements use different namespaces and attributes than HTML. The Mermaid rendering flow in `PreviewPane.vue` works in two stages: (1) `parseMarkdown()` generates HTML with `.mermaid` code blocks, (2) after DOM update, `mermaid.render()` replaces them with SVG. If DOMPurify sanitizes the final `renderedHtml` ref AFTER Mermaid has already rendered inline (which it does not in this codebase -- Mermaid renders post-nextTick into the live DOM), there is no conflict. But if someone refactors to sanitize the Mermaid SVG output string, it will break.

**Consequences:**
- Mermaid diagrams render as empty boxes or garbled shapes
- Text labels inside flowcharts/sequence diagrams disappear
- SVG `<style>` blocks that control arrow markers and fonts get stripped

**Prevention:**
1. Sanitize the HTML string BEFORE it hits `v-html`, which is BEFORE Mermaid's post-mount rendering. In the current architecture, `renderedHtml` contains `.mermaid` divs with raw text content (not SVG). Mermaid renders into the live DOM after `nextTick()`. This ordering naturally avoids the conflict -- DOMPurify never sees Mermaid SVG.
2. Do NOT move DOMPurify sanitization to after the Mermaid render loop. The current architecture is: `renderedHtml = sanitize(parseMarkdown(...))` then `v-html` then Mermaid post-render. Keep this order.
3. If future refactoring requires sanitizing SVG output, use `DOMPurify.sanitize(svg, { ADD_TAGS: ['foreignObject'], USE_PROFILES: { svg: true, svgFilters: true } })`.
4. Pin DOMPurify to >= 3.2.0 to avoid the v3.1.7 foreignObject regression.

**Detection:** Mermaid diagrams in preview show empty rectangles or no text. Check the DOM for emptied `<foreignObject>` elements.

**Phase relevance:** DOMPurify integration phase -- architecture-level decision about WHERE to sanitize.

---

### Pitfall 3: DOMPurify Double-Sanitization Across Copy/Export/Preview Pipelines

**What goes wrong:** The codebase has THREE distinct HTML output paths that share the same `parseMarkdown()` function:
1. **Preview pane** (`PreviewPane.vue` line 43: `v-html="renderedHtml"`)
2. **Social copy** (`copy-formats.js`: `generateSocialHtml()` -> offscreen container -> clipboard)
3. **PDF/Image export** (`export-formats.js`: `generateSocialHtml()` -> offscreen container -> html2canvas)

A developer adds DOMPurify inside `parseMarkdown()` thinking "sanitize at the source." This means the copy and export pipelines -- which create offscreen DOM containers from the sanitized HTML and then further manipulate them (Mermaid rendering, SVG rasterization, math formula processing) -- now receive pre-sanitized HTML. If any of those post-processing steps inject HTML that DOMPurify would have caught, the defense is bypassed. Conversely, if DOMPurify strips something the copy pipeline needs (like SVG elements for rasterization), the feature breaks.

**Why it happens:** Desire for "sanitize once at the source" conflicts with the reality that each pipeline has different security requirements. The copy pipeline ultimately serializes to `container.innerHTML` for clipboard -- it needs SVG temporarily. The export pipeline needs visible DOM for html2canvas.

**Consequences:**
- Copy pipeline breaks: Mermaid SVGs stripped before rasterization step
- OR: False sense of security because sanitization happens before post-processing that re-introduces unsanitized content
- Export pipeline fails: html2canvas receives stripped HTML

**Prevention:**
1. Sanitize at the CONSUMPTION point, not the PRODUCTION point. Add DOMPurify only where untrusted HTML enters the DOM via `v-html`. The copy and export paths create temporary offscreen containers that are never displayed to the user and are immediately removed.
2. Document this decision in a code comment: "DOMPurify sanitizes at v-html injection only. Copy/export paths use ephemeral offscreen containers with controlled lifecycle."
3. The `MarkdownGuide.vue` component also uses `v-html` (lines 272, 283) for math rendering -- but these are hardcoded LaTeX strings (`'E = mc^2'`), not user input. Sanitizing them is unnecessary but harmless; decide based on consistency.

**Detection:** After adding DOMPurify, test all three paths: (1) preview renders correctly, (2) copy to WeChat preserves Mermaid diagrams as PNG, (3) PDF export includes all content.

**Phase relevance:** DOMPurify integration phase -- must establish architecture decision BEFORE writing code.

---

### Pitfall 4: `npm audit fix --force` Causes Cascading Breakage

**What goes wrong:** The current `npm audit` reports vulnerabilities in svgo, electron, esbuild/vite, axios, lodash, flatted, brace-expansion, and glob. Running `npm audit fix --force` upgrades packages across major versions, breaking the build. Electron 37 -> 38+ could break the entire desktop app. Vite 5 -> 6+ changes the build config API. The fix for one vulnerability cascades into dozens of package updates.

**Why it happens:** Many vulnerabilities are in TRANSITIVE dependencies (brace-expansion via minimatch via glob) or in dev-only tools (esbuild, electron-forge). `npm audit fix --force` cannot distinguish between "upgrade the direct dependency" and "this is a nested dev dependency that doesn't affect production." It aggressively bumps major versions.

**Consequences:**
- Electron desktop app stops building or launching
- Vite config syntax becomes invalid after major version bump
- Vitest/coverage tooling breaks
- Unrelated functionality regresses with no clear cause

**Prevention:**
1. Fix ONLY the svgo vulnerability manually: `npm install svgo@4.0.1` (the patched version for CVE-2026-29074). This is the only HIGH-severity direct production dependency.
2. For the remaining audit findings, assess each one individually:
   - **axios** (high, DoS): If used only by a dev dependency, skip. Check `npm ls axios` to determine.
   - **electron** (moderate, ASAR bypass): Desktop-specific, fix in a separate Electron update milestone.
   - **esbuild/vite** (moderate, dev server): Only affects `npm run dev`, not production. Fix when upgrading Vite.
   - **brace-expansion, lodash, flatted, glob**: All transitive, mostly in dev tools. Low real-world risk.
3. Use `npm audit --omit=dev` to see only production vulnerabilities.
4. Never use `--force`. Instead: `npm install <package>@<specific-version>`.

**Detection:** After any `npm audit fix`, run the full test suite (`npm run test:run`), build (`npm run build`), AND Electron build (`npm run make:mac`). If any fail, revert `package.json` and `package-lock.json`.

**Phase relevance:** npm vulnerability fix phase -- must be addressed FIRST because it is purely a version bump with no code changes.

---

## Moderate Pitfalls

Mistakes that cause bugs, wasted time, or subtle regressions.

### Pitfall 5: Empty Catch Block Replacement Changes Error Propagation Behavior

**What goes wrong:** The 7 identified empty catch blocks fall into two categories that require DIFFERENT treatments:

**Category A -- Intentionally Silent (keep as warning-level logging):**
- `copy-formats.js:176` -- `getBBox()` throws for hidden/zero-size SVG elements. This is expected in the SVG measurement loop. Adding `throw` here would abort the entire rasterization.
- `copy-formats.js:196` -- Root SVG `getBBox()` fallback. Same rationale.
- `copy-formats.js:237` -- `img.decode()` optional enhancement. Not all browsers support it.
- `copy-formats.js:266` -- `URL.revokeObjectURL()` cleanup. Failure is harmless.
- `copy-formats.js:318` -- `svg.remove()` final fallback. Already in a nested catch.
- `clipboard.js:138` -- `e.clipboardData.setData()` inside event handler. Failure falls through to the `succeeded` boolean check.

**Category B -- Actually Hiding Bugs (must add meaningful logging):**
- `loader.js:62` -- `JSON.parse(localStorage)` for custom theme. If this fails silently, the user's custom theme is lost without explanation.

A developer replaces ALL empty catches with `logger.error(...)` indiscriminately. This floods the console with noise from Category A operations that fail routinely. Worse, if someone adds `throw` after logging, the copy/rasterization pipeline crashes on every SVG measurement edge case.

**Why it happens:** "Replace empty catch blocks" is treated as a mechanical find-and-replace task without understanding why each catch exists.

**Prevention:**
1. For each catch block, answer: "What happens to the surrounding code if this throws?" If the catch is inside a loop that must continue (SVG measurement), use `logger.debug()` or `logger.warn()` but never re-throw.
2. For `loader.js:62`, use `logger.warn()` and let the fallback to default theme proceed -- this is the correct behavior, just needs visibility.
3. For `clipboard.js:138`, the existing comment "succeeded = true" pattern means failure is already handled by the boolean. Add `logger.debug()` at most.
4. Create a `createModuleLogger('clipboard')`, `createModuleLogger('copy-formats')`, and `createModuleLogger('theme-loader')` for each file to get prefixed output.

**Detection:** After replacement, run the social copy workflow with a document containing Mermaid diagrams. If the console floods with errors that did not appear before, the logging level is too aggressive.

**Phase relevance:** Error handling phase -- requires per-catch-block analysis, not bulk replacement.

---

### Pitfall 6: Vite manualChunks Creates Circular Dependencies Between Chunks

**What goes wrong:** An aggressive manualChunks configuration tries to split the 4.8MB index chunk into fine-grained vendor chunks (vue, codemirror, milkdown, mermaid, mathjax, prismjs, etc.). But some of these libraries have shared transitive dependencies. When manualChunks forces two modules into different chunks that both depend on a third module, Rollup may create circular chunk imports. The build succeeds but produces broken runtime execution order -- components fail to mount, or `undefined` errors appear on page load.

**Why it happens:** The `node_modules` dependency graph is not a clean tree. For example:
- Milkdown depends on prosemirror packages
- Mermaid depends on d3 subpackages AND cytoscape AND elkjs
- CodeMirror packages have cross-dependencies (@codemirror/state, @codemirror/view, @codemirror/language)

Splitting `@codemirror/view` into one chunk and `@codemirror/state` into another creates a circular import because they reference each other.

**Consequences:**
- Runtime error: `Cannot access 'X' before initialization`
- White screen on production deploy
- Build succeeds but app crashes -- very hard to diagnose

**Prevention:**
1. Use a CONSERVATIVE chunking strategy. Group related libraries into the SAME chunk:
   ```js
   manualChunks(id) {
     if (id.includes('node_modules')) {
       if (id.includes('vue') || id.includes('@vue')) return 'vendor-vue'
       if (id.includes('@codemirror') || id.includes('codemirror')) return 'vendor-codemirror'
       if (id.includes('@milkdown') || id.includes('prosemirror')) return 'vendor-milkdown'
       if (id.includes('mermaid') || id.includes('d3') || id.includes('cytoscape') || id.includes('elkjs')) return 'vendor-mermaid'
       if (id.includes('mathjax')) return 'vendor-mathjax'
       // Everything else stays in the default chunk
     }
   }
   ```
2. After configuring, run `npx vite build 2>&1 | grep -i circular` to check for circular warnings.
3. Verify the built app works by running `npm run preview` and testing all features.
4. Do NOT split every `node_modules` package into its own chunk. The goal is to separate the 4.8MB monolith into 3-5 cacheable chunks, not 50+ micro-chunks.

**Detection:** Build completes without error, but `npm run preview` shows white screen or console errors about undefined modules. Check the Network tab -- if chunks load in a dependency cycle, the execution order is wrong.

**Phase relevance:** Vite manualChunks phase -- must be tested with a full feature verification, not just build success.

---

### Pitfall 7: manualChunks Breaks Mermaid's Dynamic Import-Based Code Splitting

**What goes wrong:** Mermaid 11.x already uses dynamic imports internally to lazy-load diagram types (flowchart, sequence, gantt, etc.). The current build output confirms this -- there are ~20 separate mermaid diagram chunk files (`flowDiagram-*.js`, `sequenceDiagram-*.js`, etc.). If manualChunks incorrectly captures these dynamic-import chunks by matching `node_modules/mermaid`, it forces them into a single `vendor-mermaid` chunk, destroying Mermaid's built-in code splitting and INCREASING the initial bundle size.

**Why it happens:** A naive `id.includes('mermaid')` check matches both the Mermaid core AND its lazily-loaded diagram modules. The manualChunks function runs on ALL modules, including those from dynamic imports.

**Consequences:**
- The mermaid vendor chunk balloons to 1-2MB (all diagram types bundled together)
- Initial page load becomes slower, not faster
- Defeats the purpose of the optimization

**Prevention:**
1. In the manualChunks function, only match the Mermaid CORE package, not its diagram submodules:
   ```js
   // Match mermaid core but NOT diagram-specific dynamic chunks
   if (id.includes('node_modules/mermaid/') && !id.includes('Diagram')) return 'vendor-mermaid'
   ```
2. Alternatively, check if the module is a dynamic import entry point using the `getModuleInfo` API available in the function form.
3. After building, compare the chunk file listing before and after. If the ~20 mermaid diagram files disappeared and a single large mermaid chunk appeared, the config is wrong.

**Detection:** After `npm run build`, run `ls -la dist/assets/*mermaid* dist/assets/*Diagram*`. The individual diagram chunks should still exist as separate files.

**Phase relevance:** Vite manualChunks phase -- easy to overlook because the build "works."

---

### Pitfall 8: svgo Upgrade Breaks Build-Time SVG Processing

**What goes wrong:** The project has `svgo@4.0.0` as a direct dependency. The fix for CVE-2026-29074 is `svgo@4.0.1`. However, if someone accidentally upgrades to svgo@5.x (which may exist by the time this is executed), the API could change. Even within 4.x, developers might over-react and try to replace svgo entirely, breaking any SVG optimization that depends on it.

**Why it happens:** The CVE description ("Billion Laughs DoS") sounds alarming, causing panic upgrades. The fix is actually a single patch version bump.

**Consequences:**
- If upgraded to wrong version: SVG processing API changes break the build
- If svgo is removed entirely: Any SVG optimization step breaks

**Prevention:**
1. Check current version: `npm ls svgo` shows `4.0.0`. The fix is `npm install svgo@4.0.1`.
2. Run `npm run test:run` after upgrade to confirm no breakage.
3. Note: svgo is listed as a direct dependency in `package.json`. Verify where it is actually used in the codebase -- if it is only used at build time or by a dependency, the real-world risk is lower (the Billion Laughs attack requires processing untrusted SVG input).

**Detection:** After upgrading, `npm run build` and `npm run test:run` both pass. Check `npm ls svgo` confirms 4.0.1.

**Phase relevance:** npm vulnerability fix phase -- simplest fix, do this first.

---

## Minor Pitfalls

### Pitfall 9: DOMPurify Added as Duplicate Dependency

**What goes wrong:** DOMPurify 3.3.3 is already installed as a transitive dependency of both `mermaid@11.9.0` and `jspdf@4.2.1`. Adding it as a direct dependency with `npm install dompurify` may install a different version or create a duplicate in `node_modules`. If the versions diverge, the bundle includes two copies of DOMPurify.

**Prevention:**
1. Check current transitive version: `npm ls dompurify` shows 3.3.3.
2. Install as direct dependency with the SAME version: `npm install dompurify@3.3.3`.
3. After installation, verify deduplication: `npm ls dompurify` should show a single version with multiple dependents.
4. Add `@types/dompurify` as a dev dependency only if TypeScript is used (not applicable to this project).

**Detection:** `npm ls dompurify` shows multiple different versions. Bundle analyzer shows two DOMPurify copies.

**Phase relevance:** DOMPurify integration phase -- check before installing.

---

### Pitfall 10: Logger Becomes No-Op in Production, Hiding Real Errors

**What goes wrong:** The existing `logger.js` uses `import.meta.env?.DEV` to disable ALL logging in production. If empty catch blocks are replaced with `logger.error(...)`, those errors become invisible in production builds. A real runtime error (e.g., clipboard permission denied, localStorage quota exceeded) produces no diagnostic output.

**Prevention:**
1. Consider whether `logger.error()` should remain active in production. The current design silences everything. For this hardening milestone (which is scoped to "use existing logger"), this is acceptable -- but document it as a known limitation.
2. For the `loader.js` theme loading catch, `console.warn` already exists in the outer catch (line 104). Ensure the inner catch (line 62) also gets some form of persistent diagnostic (even if it is just `console.warn` directly, bypassing the logger).
3. Do NOT change the logger's production behavior in this milestone -- that is explicitly out of scope per PROJECT.md.

**Detection:** Deploy to production, trigger a localStorage error (e.g., private browsing mode), and check if any diagnostic appears in the console.

**Phase relevance:** Error handling phase -- document as known limitation, not a blocker.

---

### Pitfall 11: DOMPurify sanitization on every keystroke causes preview lag

**What goes wrong:** `PreviewPane.vue` watches `props.markdown` and calls `processMarkdown()` on every change. If DOMPurify.sanitize() is called inside this hot path, it adds overhead to every keystroke. For small documents this is negligible, but for large Markdown files (10,000+ characters with complex HTML output), the added parsing time could cause visible input lag.

**Prevention:**
1. DOMPurify is optimized for speed and benchmarks show it handles large documents efficiently. For typical Markdown editor content (< 50KB HTML), this should not be a problem.
2. If lag is observed, consider debouncing the sanitization or caching the sanitized result keyed by input hash.
3. Profile before optimizing: measure actual time spent in `DOMPurify.sanitize()` vs `parseMarkdown()` vs Mermaid rendering. Mermaid rendering is almost certainly the bottleneck, not sanitization.

**Detection:** Type rapidly in a large document and observe preview update latency. Use Chrome DevTools Performance tab to identify if DOMPurify is in the hot path.

**Phase relevance:** DOMPurify integration phase -- unlikely to be a real issue, but worth monitoring.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation | Severity |
|---|---|---|---|
| npm vulnerability fix (svgo) | Over-fixing with `npm audit fix --force` | Fix only svgo@4.0.1 manually | Critical |
| DOMPurify integration | Stripping inline styles needed for social copy | Sanitize at v-html only, not in parseMarkdown() | Critical |
| DOMPurify integration | Breaking Mermaid SVG rendering | Sanitize BEFORE Mermaid post-render, not after | Critical |
| DOMPurify integration | Double-sanitization across 3 pipelines | Establish sanitization point architecture first | Critical |
| DOMPurify integration | Duplicate dependency version | Check `npm ls dompurify` before install | Minor |
| DOMPurify integration | Performance on keystroke | Profile if lag observed, likely not an issue | Minor |
| Empty catch replacement | Indiscriminate error logging level | Analyze each catch individually, most are Category A | Moderate |
| Empty catch replacement | Logger no-op in production | Document limitation, do not change logger scope | Minor |
| Vite manualChunks | Circular chunk dependencies | Group related libraries in same chunk | Moderate |
| Vite manualChunks | Destroying Mermaid's dynamic imports | Exclude diagram submodules from manual chunking | Moderate |
| Vite manualChunks | Build success but runtime failure | Test with `npm run preview`, not just `npm run build` | Moderate |

---

## Sources

- [DOMPurify 3.1.7 breaks Mermaid diagrams (Issue #1002)](https://github.com/cure53/DOMPurify/issues/1002) -- HIGH confidence
- [DOMPurify configuration documentation](https://github.com/cure53/DOMPurify/blob/main/demos/README.md) -- HIGH confidence
- [CVE-2026-29074: SVGO Billion Laughs DoS](https://github.com/advisories/GHSA-xpqw-6gx7-v673) -- HIGH confidence, fix version 4.0.1 confirmed
- [svgo security advisory](https://github.com/svg/svgo/security/advisories/GHSA-xpqw-6gx7-v673) -- HIGH confidence
- [vue-dompurify-html: Safe v-html replacement](https://github.com/LeSuisse/vue-dompurify-html) -- MEDIUM confidence (alternative approach)
- [Vite manualChunks documentation](https://vite.dev/config/build-options) -- HIGH confidence
- [Vite circular dependency issue #20202](https://github.com/vitejs/vite/issues/20202) -- HIGH confidence
- [Using manualChunks breaks code-splitting (Issue #12209)](https://github.com/vitejs/vite/issues/12209) -- HIGH confidence
- [npm audit broken by design (Dan Abramov)](https://overreacted.io/npm-audit-broken-by-design/) -- MEDIUM confidence (opinion piece, but well-reasoned)
- [Why npm audit fix --force is a terrible idea](https://medium.com/@instatunnel/why-npm-audit-fix-force-is-a-terrible-idea-052ac56a3ae2) -- MEDIUM confidence
- [DOMPurify performance analysis](https://dompurify.com/what-impact-does-dompurify-have-on-performance-and-is-it-suitable-for-high-traffic-websites/) -- MEDIUM confidence
- [DOMPurify CSS sanitization hooks](https://github.com/cure53/DOMPurify/issues/902) -- MEDIUM confidence
- [Exploring DOMPurify misconfigurations](https://mizu.re/post/exploring-the-dompurify-library-hunting-for-misconfigurations) -- MEDIUM confidence
- Codebase inspection: `PreviewPane.vue`, `copy-formats.js`, `export-formats.js`, `clipboard.js`, `loader.js`, `logger.js`, `vite.config.js`, `package.json` -- HIGH confidence (direct observation)

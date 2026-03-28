# Phase 4: Bundle Optimization - Research

**Researched:** 2026-03-28
**Domain:** Vite 5 / Rollup 4 build configuration -- manualChunks vendor splitting
**Confidence:** HIGH

## Summary

The project's production build produces a single 4,788 kB monolith (`index-*.js`) containing all statically imported vendor code (Vue, CodeMirror, Milkdown, Mermaid core, MathJax, html2canvas, jsPDF, PrismJS, DOMPurify, d3, lodash-es, etc.). Mermaid's internal diagram sub-modules (~27 files) are already dynamically split by Rollup via `import()` calls inside `node_modules/mermaid/dist/mermaid.core.mjs`, along with shared utility chunks (cytoscape, dagre, d3 helpers, lodash helpers) and the mermaid-nodeview plugin chunk.

The task is to add a `manualChunks` function to `vite.config.js` that splits the monolith into 6 domain-based vendor chunks without disturbing the existing ~27 Mermaid dynamic chunks. The only file that needs modification is `vite.config.js`. No source code changes are required.

**Primary recommendation:** Add a function-form `build.rollupOptions.output.manualChunks` to `vite.config.js` that matches `node_modules/` paths by package scope, with explicit exclusion of mermaid's internal `chunks/` directory to preserve existing dynamic splitting.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Use Vite `build.rollupOptions.output.manualChunks` function form (not object form), checking module ID `node_modules/` paths
- **D-02:** Split into 6 vendor chunks: `vendor-vue`, `vendor-codemirror`, `vendor-milkdown`, `vendor-mermaid`, `vendor-mathjax`, `vendor-export`
- **D-03:** Non-grouped node_modules dependencies fall into default chunk (Vite/Rollup auto)
- **D-04:** manualChunks function only matches mermaid core package path (`node_modules/mermaid/`), not mermaid dynamic import diagram sub-modules
- **D-05:** Verify Mermaid dynamic chunk count matches pre-optimization (~25 independent chunks)
- **D-06:** `npm run build` succeeds with multiple vendor chunks instead of single 4.8MB file
- **D-07:** `npm run preview` loads with all features working (editing, preview, themes, export, social copy)
- **D-08:** No strict per-chunk size limits; goal is breaking monolith into cache-friendly files

### Claude's Discretion
- Path matching logic in manualChunks function (startsWith vs includes)
- Whether to group prismjs, github-markdown-css, and other small dependencies
- Vendor chunk naming with hash (Vite default behavior)

### Deferred Ideas (OUT OF SCOPE)
None
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BLD-01 | Vite manualChunks splits 4.8MB monolith into vendor groups (vue-core, codemirror, milkdown, mermaid, mathjax, export-tools) | Verified: current monolith is 4,788 kB; function-form manualChunks with id.includes() matching on node_modules paths will split it correctly. See Architecture Patterns and Code Examples sections. |
| BLD-02 | manualChunks does not interfere with Mermaid's existing dynamic import chunks | Verified: mermaid has 27 dynamic imports in its core.mjs entry; these resolve to files under `node_modules/mermaid/dist/chunks/`. The manualChunks function MUST exclude paths containing `/dist/chunks/` to avoid pulling diagram sub-modules into the mermaid vendor chunk. See Pitfall 1 for details. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **No new dependencies:** Only existing packages; this phase modifies one config file
- **Test coverage >= 80%:** Must not drop below threshold (no source changes, so no impact)
- **Conventional Commits:** `feat:` prefix for build optimization
- **Electron compatibility:** `build:electron` must also work (uses same vite.config.js with `ELECTRON=true`)
- **No TypeScript:** Config file remains plain JavaScript

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vite | 5.4.19 | Build tool with Rollup bundler | Already installed; manualChunks is a Rollup output option exposed via Vite |
| Rollup | 4.46.2 | Bundler (used internally by Vite 5) | Provides manualChunks API; function form gives full control over chunk assignment |

### Supporting
No additional libraries needed. This phase only modifies `vite.config.js`.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Function-form manualChunks | Object-form manualChunks | Object form requires listing exact package names; function form allows pattern matching on resolved IDs -- function form is locked per D-01 |
| Manual configuration | vite-plugin-chunk-split | Adds a dependency; manualChunks is built-in and sufficient for this use case |

## Architecture Patterns

### Current Build Output (Baseline)
```
dist/assets/
  index-*.js              4,788 kB  (monolith -- ALL statically imported vendors + app code)
  index-*.css               201 kB  (all CSS)
  index.es-*.js             150 kB  (prosemirror via @milkdown/prose -- auto-split)
  cytoscape.esm-*.js        442 kB  (mermaid dep -- auto-split)
  mermaid-nodeview-*.js       4 kB  (dynamic import from WysiwygPane)
  [27 mermaid diagram chunks]       (dynamic imports from mermaid core)
  [~20 shared utility chunks]       (d3, lodash-es helpers, dagre, etc.)
  Total JS files: 50
```

### Target Build Output (After Optimization)
```
dist/assets/
  index-*.js              ~XXX kB  (app code + ungrouped small deps)
  vendor-vue-*.js         ~XXX kB  (vue, @vue/*, vue-i18n)
  vendor-codemirror-*.js  ~XXX kB  (codemirror, @codemirror/*)
  vendor-milkdown-*.js    ~XXX kB  (@milkdown/* including prose/prosemirror)
  vendor-mermaid-*.js     ~XXX kB  (mermaid core only, NOT diagram sub-modules)
  vendor-mathjax-*.js     ~XXX kB  (mathjax-full)
  vendor-export-*.js      ~XXX kB  (html2canvas, jspdf)
  index-*.css               201 kB  (unchanged)
  [27 mermaid diagram chunks]       (preserved -- unchanged)
  [shared utility chunks]           (preserved -- unchanged)
```

### Pattern: manualChunks Function Form

**What:** A function that receives each resolved module ID and returns a chunk name string, or undefined to let Rollup decide.

**When to use:** When you need pattern-based matching on module paths rather than listing exact package names.

**Key behavior:** By default, when a module is assigned to a manual chunk, ALL of its static dependencies are also pulled into that chunk. This means assigning `node_modules/mermaid/dist/mermaid.core.mjs` to `vendor-mermaid` would also pull in d3, lodash-es, cytoscape, etc. -- unless those are already assigned to other chunks or are dynamically imported.

**Critical nuance for this project:** Mermaid's diagram sub-modules are loaded via dynamic `import()` inside `mermaid.core.mjs`. Rollup already splits these into separate chunks. If the manualChunks function matches paths under `node_modules/mermaid/dist/chunks/`, those dynamic chunks would be merged into `vendor-mermaid`, destroying the lazy-loading behavior. The function MUST exclude these paths.

### Anti-Patterns to Avoid

- **Matching too broadly on `node_modules/mermaid/`:** This captures mermaid's internal dynamic chunks. Must exclude `/dist/chunks/` paths.
- **Using object-form manualChunks:** Less flexible; cannot do conditional exclusions for mermaid sub-chunks.
- **Assigning all node_modules to vendor chunks:** Would pull mermaid's shared deps (d3, lodash-es, cytoscape) into `vendor-mermaid` by default dependency merging. Only match the specific package directories listed in D-02.
- **Forgetting Electron build:** The same `vite.config.js` is used for both web and Electron builds; the manualChunks config must work for both.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Chunk splitting | Custom Rollup plugin | `build.rollupOptions.output.manualChunks` function | Built-in Rollup feature; well-tested; direct Vite integration |
| Build analysis | Manual file size checks | `npm run build` output + file listing | Vite already prints chunk sizes; script-based verification is sufficient |

## Common Pitfalls

### Pitfall 1: Mermaid Dynamic Chunk Absorption (CRITICAL)

**What goes wrong:** The manualChunks function matches `id.includes('node_modules/mermaid/')` and assigns ALL mermaid files -- including the 27 diagram sub-modules under `node_modules/mermaid/dist/chunks/` -- into a single `vendor-mermaid` chunk.

**Why it happens:** Mermaid's resolved module IDs for diagram sub-modules look like:
```
/absolute/path/node_modules/mermaid/dist/chunks/mermaid.core/flowDiagram-KYDEHFYC.mjs
```
This path includes `node_modules/mermaid/` so a naive includes() check matches it.

**How to avoid:** The manualChunks function must check for the `chunks/` subdirectory and return `undefined` for those paths, letting Rollup handle them as dynamic chunks:
```javascript
// Match mermaid core, but NOT its internal dynamic chunks
if (id.includes('node_modules/mermaid/') && !id.includes('/dist/chunks/')) {
  return 'vendor-mermaid'
}
```

**Warning signs:** After build, if there are no longer ~27 separate diagram chunk files, or if `vendor-mermaid` is > 500 kB, the dynamic chunks were absorbed.

### Pitfall 2: Dependency Merging Inflating Chunk Sizes

**What goes wrong:** When a module is assigned to a manual chunk, Rollup's default behavior merges that module's static dependencies into the same chunk. This could cause `vendor-mermaid` to pull in d3, lodash-es, cytoscape, etc.

**Why it happens:** Rollup documentation states: "By default, the function form will also merge dependencies of the returned ids into the manualChunk."

**How to avoid:** Only match the specific scoped package paths for each group. Mermaid's transitive dependencies (d3, lodash-es, cytoscape, etc.) live under their own `node_modules/` paths and will NOT be matched by `id.includes('node_modules/mermaid/')` -- they'll fall through to the default handler (D-03). The dependency merging concern applies only if a dependency is exclusively used by one manual chunk AND is not matched by any other rule. In practice, most of mermaid's heavy dependencies (d3, cytoscape) are already auto-split by Rollup and won't be affected.

**Warning signs:** Any single vendor chunk exceeding ~2 MB likely absorbed transitive dependencies.

### Pitfall 3: @milkdown/prose Prosemirror Split

**What goes wrong:** Currently `index.es-*.js` (150 kB) is an auto-split prosemirror chunk from `@milkdown/prose`. When we add `vendor-milkdown` matching `@milkdown/*`, this chunk may get merged into `vendor-milkdown`.

**Why it happens:** `@milkdown/prose/` packages re-export prosemirror-view, prosemirror-state, etc. The manualChunks function matching `node_modules/@milkdown/` will capture these.

**How to avoid:** This is actually fine and expected behavior. The prosemirror code is a static dependency of milkdown, and grouping it into `vendor-milkdown` is correct per D-02. The chunk will be larger but all milkdown-related code is co-located for caching.

**Warning signs:** None -- this is acceptable.

### Pitfall 4: Circular Chunk Dependencies

**What goes wrong:** Manual chunks can create circular import dependencies between chunks, causing `Cannot read properties of undefined` errors at runtime.

**Why it happens:** If package A depends on package B, and they are assigned to different manual chunks, Rollup may create circular references between the chunks.

**How to avoid:** The 6 vendor groups are designed to minimize cross-dependencies:
- `vendor-vue` is foundational (no circular risk)
- `vendor-codemirror` depends on no other vendor group
- `vendor-milkdown` may import from vue (fine -- both are in separate initial chunks)
- `vendor-mermaid`, `vendor-mathjax`, `vendor-export` are leaf dependencies

**Warning signs:** Runtime errors in `npm run preview` about undefined imports.

### Pitfall 5: modulePreload Tag Explosion

**What goes wrong:** Vite adds `<link rel="modulepreload">` tags for chunks referenced by the entry point. With manual chunks, more preload tags may appear.

**Why it happens:** Vite's build plugin analyzes the import graph and generates preload hints for statically imported chunks.

**How to avoid:** This is expected and beneficial -- browser preloads vendor chunks in parallel. Currently the HTML has zero modulepreload tags (everything is in one monolith). After optimization, Vite may add preload tags for the vendor chunks that are statically imported. This is correct behavior. Dynamically imported mermaid-nodeview and its diagram chunks should NOT get preload tags.

**Warning signs:** If mermaid diagram chunks appear in modulepreload tags, something is wrong.

## Code Examples

### Recommended manualChunks Implementation

```javascript
// Source: Rollup docs output.manualChunks + project-specific patterns
// Location: vite.config.js build.rollupOptions.output.manualChunks

function manualChunks(id) {
  if (!id.includes('node_modules')) {
    return undefined
  }

  // vendor-vue: Vue core + ecosystem
  if (
    id.includes('node_modules/vue/') ||
    id.includes('node_modules/@vue/') ||
    id.includes('node_modules/vue-i18n/')
  ) {
    return 'vendor-vue'
  }

  // vendor-codemirror: CodeMirror 6 editor
  if (
    id.includes('node_modules/codemirror/') ||
    id.includes('node_modules/@codemirror/')
  ) {
    return 'vendor-codemirror'
  }

  // vendor-milkdown: Milkdown WYSIWYG + ProseMirror
  if (id.includes('node_modules/@milkdown/')) {
    return 'vendor-milkdown'
  }

  // vendor-mermaid: Mermaid core ONLY (not diagram sub-chunks)
  if (
    id.includes('node_modules/mermaid/') &&
    !id.includes('/dist/chunks/')
  ) {
    return 'vendor-mermaid'
  }

  // vendor-mathjax: MathJax rendering
  if (id.includes('node_modules/mathjax-full/')) {
    return 'vendor-mathjax'
  }

  // vendor-export: PDF/image export tools
  if (
    id.includes('node_modules/html2canvas/') ||
    id.includes('node_modules/jspdf/')
  ) {
    return 'vendor-export'
  }

  // All other node_modules: let Rollup decide (D-03)
  return undefined
}
```

### vite.config.js Integration Point

```javascript
// Add to the existing build section in vite.config.js
build: {
  outDir: 'dist',
  assetsDir: 'assets',
  rollupOptions: {
    output: {
      manualChunks,   // reference the function defined above
    }
  }
}
```

### Build Verification Script Pattern

```bash
# 1. Run build
npm run build

# 2. Verify vendor chunks exist
ls dist/assets/vendor-*.js
# Expected: vendor-vue-*.js, vendor-codemirror-*.js, vendor-milkdown-*.js,
#           vendor-mermaid-*.js, vendor-mathjax-*.js, vendor-export-*.js

# 3. Verify monolith is gone (main chunk should be much smaller)
# index-*.js should be << 4788 kB

# 4. Verify Mermaid dynamic chunks preserved
ls dist/assets/*Diagram*.js dist/assets/*diagram*.js | wc -l
# Expected: ~27 (same as baseline)

# 5. Functional verification
npm run preview
# Manual: test editing, preview, themes, export, social copy
```

## Current Baseline Measurements

Captured from `npm run build` on 2026-03-28:

| Metric | Value |
|--------|-------|
| Main monolith (`index-*.js`) | 4,788 kB (gzip: 1,552 kB) |
| Total JS files in dist/assets/ | 50 |
| Mermaid diagram dynamic chunks | 27 files |
| Auto-split shared chunks | ~21 files (cytoscape 442kB, index.es 150kB, d3/lodash helpers, etc.) |
| CSS | 201 kB (gzip: 31 kB) |
| Build time | ~18.6s |

### Static Imports in Monolith (packages that will be extracted)

| Package Group | Import Source Files |
|---------------|--------------------|
| vue, @vue/*, vue-i18n | 15+ files across components/composables |
| codemirror, @codemirror/* | useEditorTheme.js, useEditorLifecycle.js, OutlinePanel.vue |
| @milkdown/* | WysiwygPane.vue (12+ milkdown imports) |
| mermaid (core) | copy-formats.js (static), PreviewPane.vue (static) |
| mathjax-full | core/markdown/math/renderer.js (6 sub-module imports) |
| html2canvas, jspdf | core/editor/export-formats.js |

### Small Dependencies (will remain in default chunk per D-03)

| Package | Used By | Estimated Size |
|---------|---------|----------------|
| prismjs | plugins/prism-setup.js | ~30-50 kB |
| dompurify | shared/utils/sanitize.js | ~15-20 kB |
| katex | MarkdownGuide.vue (transitive via @milkdown/plugin-math) | ~100 kB |
| github-markdown-css | Imported as CSS, not JS | N/A |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `splitVendorChunkPlugin` (Vite 4) | `manualChunks` function (Vite 5) | Vite 5.0 (Nov 2023) | splitVendorChunk was deprecated; manualChunks is the official approach |
| Object-form manualChunks | Function-form manualChunks | Rollup 2.x+ | Function form gives conditional logic; object form cannot exclude sub-paths |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 1.6.1 |
| Config file | `vitest.config.js` |
| Quick run command | `npm run test:run` |
| Full suite command | `npm run test:coverage` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BLD-01 | Build produces multiple vendor chunks instead of monolith | smoke (build output verification) | `npm run build && ls dist/assets/vendor-*.js` | N/A -- build script verification, not unit test |
| BLD-02 | Mermaid dynamic chunks preserved after optimization | smoke (build output verification) | `npm run build && ls dist/assets/*Diagram*.js \| wc -l` | N/A -- build script verification, not unit test |

### Sampling Rate
- **Per task commit:** `npm run build` (verify chunks in output)
- **Per wave merge:** `npm run build && npm run test:run` (build + existing tests pass)
- **Phase gate:** `npm run build` + `npm run preview` manual smoke test + `npm run test:coverage` (all green, coverage >= 80%)

### Wave 0 Gaps
None -- this phase modifies only build configuration (`vite.config.js`). No new source code is written, so no new unit tests are needed. Verification is via build output inspection and manual functional smoke testing. The existing 394 tests validate that no runtime behavior changed.

## Open Questions

1. **Exact sizes of extracted vendor chunks**
   - What we know: The monolith is 4,788 kB. Each vendor group will be a subset.
   - What's unclear: Exact sizes depend on Rollup's dependency resolution and tree-shaking.
   - Recommendation: Build and measure. No action needed before implementation.

2. **Whether `@mermaid-js/parser` should be excluded from vendor-mermaid**
   - What we know: mermaid depends on `@mermaid-js/parser`. Its modules live under `node_modules/@mermaid-js/` (different prefix from `node_modules/mermaid/`).
   - What's unclear: Whether this package is large enough to matter, and whether it is statically or dynamically imported by mermaid core.
   - Recommendation: Let it fall to default chunk (D-03). It does not match `node_modules/mermaid/` so it will not enter `vendor-mermaid`.

3. **Electron build compatibility**
   - What we know: `build:electron` runs `ELECTRON=true vite build` using the same config. The `base` changes to `./` but rollupOptions should be unaffected.
   - What's unclear: Whether Electron's ASAR packaging handles multiple chunks correctly.
   - Recommendation: Verify with `npm run build:electron` after changes. Electron Forge with ASAR should handle multiple JS files in `dist/assets/` identically to a single file.

## Sources

### Primary (HIGH confidence)
- **Rollup docs** - `output.manualChunks` function signature, return value semantics, dependency merging behavior: https://rollupjs.org/configuration-options/#output-manualchunks
- **Vite 5 docs** - Build configuration, manualChunks integration: https://v5.vite.dev/guide/build
- **Local build output** - Baseline measurements from `npm run build` on this codebase (2026-03-28)
- **Local source analysis** - Grep of all external imports in `src/` to identify which packages are statically vs dynamically imported

### Secondary (MEDIUM confidence)
- **Vite GitHub Issues** - #5189 (manualChunks + modulepreload eager loading), #12209 (circular dependencies with manualChunks): verified patterns apply to our setup
- **Soledad Penades blog** - manualChunks caching strategy (2025): https://soledadpenades.com/posts/2025/use-manual-chunks-with-vite-to-facilitate-dependency-caching/

### Tertiary (LOW confidence)
- **Vite GitHub Discussion #20023** - "Can manual chunks still be dynamically imported?" -- unanswered discussion, but our mermaid case is different (mermaid core is statically imported; only its internal sub-modules are dynamic)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using built-in Vite/Rollup features, no new dependencies
- Architecture: HIGH - Verified current build output, traced all import paths, confirmed mermaid dynamic chunk mechanism
- Pitfalls: HIGH - Mermaid chunk absorption pitfall verified via source code analysis of mermaid's internal structure (`node_modules/mermaid/dist/chunks/`)
- Code examples: HIGH - Based on Rollup official docs + project-specific path analysis

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (stable -- Vite 5 and Rollup 4 APIs are mature)

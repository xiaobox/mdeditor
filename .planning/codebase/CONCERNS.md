# Codebase Concerns

**Analysis Date:** 2026-03-27

## Tech Debt

**`parser.js` is a 1205-line monolith:**
- Issue: `src/core/markdown/parser.js` contains the full Markdown-to-HTML pipeline in a single file: context management, code blocks, math blocks, blockquotes, lists (`ListProcessor` class), tables (`TableProcessor` class), headings, horizontal rules, paragraphs, and post-processing. The combined parsing pipeline across `parser.js` (1205), `inline-formatter.js` (472), `code-formatter.js` (447), and `social-adapters.js` (414) totals 2538 lines.
- Files: `src/core/markdown/parser.js`
- Impact: Hard to test individual parsing strategies in isolation; modifications to one block type risk regressions in others. The old architecture (documented in CLAUDE.md) described 9 separate strategy files under `core/markdown/parser/strategies/`, but these have been collapsed into the single file.
- Fix approach: Extract `ListProcessor` and `TableProcessor` into their own modules. Consider splitting `parseMarkdown()` into a coordinator that delegates to strategy modules, restoring the separation-of-concerns described in the project docs.

**`WysiwygPane.vue` is 1140 lines with mixed concerns:**
- Issue: Contains Milkdown editor setup, toolbar configuration, inline-code DOM mutation observer, markdown normalization/serialization, theme integration, and 400+ lines of CSS. Uses Options API `<script>` instead of the project-standard `<script setup>`.
- Files: `src/components/WysiwygPane.vue`
- Impact: Difficult to maintain; editor logic, DOM patching, and styling are tightly coupled. Not using `<script setup>` diverges from project conventions.
- Fix approach: Extract editor setup into a composable (e.g., `useMilkdownEditor`). Move the `normalizeWysiwygTables` MutationObserver logic to a plugin. Migrate to `<script setup>`. Extract styles to a scoped CSS file.

**`theme-presets.js` is a 983-line configuration blob:**
- Issue: All color themes, code styles, theme systems, and font settings are defined in a single file with 30 exports.
- Files: `src/config/theme-presets.js`
- Impact: Any theme addition requires editing this file. Risk of merge conflicts when multiple contributors work on themes.
- Fix approach: Split into `color-themes.js`, `code-styles.js`, `font-settings.js`, and `theme-systems.js` under `src/config/` (the extension point paths in CLAUDE.md reference these files but they do not exist as separate modules).

**`table-block/index.js` plugin is 906 lines:**
- Issue: Contains UI creation (DOM handles, toolbars), drag-and-drop logic, pointer tracking, command dispatch, and style management all in one ProseMirror plugin.
- Files: `src/plugins/table-block/index.js`
- Impact: Hard to maintain or debug table editing behavior. Mixes presentation (DOM creation) with interaction logic (drag/drop state machine).
- Fix approach: Separate DOM creation helpers, drag-drop handlers, and command dispatch into sub-modules.

**Duplicated `hexToRgb` implementations (4 copies):**
- Issue: The same hex-to-RGB conversion function is implemented independently in 4 locations with slightly different error handling.
- Files: `src/core/theme/manager.js:20`, `src/core/markdown/social-adapters.js:19`, `src/core/theme/loader.js:41`, `src/shared/utils/color.js:45`
- Impact: Bug fixes or behavior changes must be replicated across all copies. The canonical implementation in `src/shared/utils/color.js` exists but is not used by the other modules.
- Fix approach: Import from `src/shared/utils/color.js` everywhere. Remove the duplicate implementations.

**Logger exists but is not adopted:**
- Issue: A structured logger (`src/shared/utils/logger.js`) with dev-only output exists, but 37 `console.log/warn/error` calls in source code use raw `console` directly instead.
- Files: `src/shared/utils/logger.js` (logger), scattered across `src/components/PreviewPane.vue`, `src/core/editor/copy-formats.js`, `src/core/editor/clipboard.js`, `src/core/editor/export-formats.js`, `src/core/theme/storage.js`, `src/shared/utils/storage.js`, `src/composables/theme/useThemeManager.js`, `src/composables/useElectron.js`, `src/composables/settings/useColorSettings.js`
- Impact: Console output leaks into production builds. No structured log levels or filtering.
- Fix approach: Replace all raw `console.*` calls with the existing `createModuleLogger()` pattern.

**No-op watcher in WysiwygPane:**
- Issue: Line 303 has `watch([currentColorTheme, currentCodeStyle, currentFontSettings, currentLayoutId], () => {}, { deep: true })` -- a watcher that does nothing. The comment says "actual variables are applied globally" but the empty callback still triggers deep comparison on every theme change.
- Files: `src/components/WysiwygPane.vue:303`
- Impact: Unnecessary CPU work on every theme property change. Misleading code.
- Fix approach: Remove the watcher entirely, or replace it with a targeted side-effect if re-render triggering is actually needed.

**Global state via `window.__scrollSyncLock`:**
- Issue: Scroll synchronization between editor/preview panes uses a global `window.__scrollSyncLock` boolean, set and cleared via `setTimeout`.
- Files: `src/components/PreviewPane.vue:162-175`, `src/components/MarkdownEditor.vue:70-79`, `src/components/BackToTopFloat.vue:75-80`
- Impact: Race conditions between timeout-based lock release and rapid scroll events. Not testable. Breaks if multiple editor instances exist.
- Fix approach: Replace with a Vue reactive ref managed in `useAppState` or a dedicated `useScrollSync` composable. Pass it down via provide/inject instead of window globals.

## Known Bugs

**Silent catch blocks swallow errors:**
- Symptoms: 7 catch blocks with empty bodies `catch (_) {}` silently discard errors, making debugging impossible.
- Files: `src/core/editor/copy-formats.js:176,196,237,266,318`, `src/core/editor/clipboard.js:138`, `src/core/theme/loader.js:62`
- Trigger: Any error in Mermaid SVG processing, URL revocation, or theme loading is silently swallowed.
- Workaround: None. Failures in these paths are invisible.

## Security Considerations

**No DOMPurify for rendered HTML:**
- Risk: The preview pane uses `v-html="renderedHtml"` at `src/components/PreviewPane.vue:43` where `renderedHtml` is generated by the custom Markdown parser. While the parser has `escapeHtml()` for text content and `cleanUrl()` for links (blocking `javascript:` protocol), there is no defense-in-depth sanitization library (e.g., DOMPurify) applied to the final HTML before injection.
- Files: `src/components/PreviewPane.vue:43`, `src/core/editor/clipboard.js:110`, `src/core/editor/export-formats.js:93`, `src/core/editor/copy-formats.js:64,79`
- Current mitigation: `escapeHtml()` in `src/shared/utils/text.js:41` escapes `& < > " ' /`. `cleanUrl()` in `src/shared/utils/text.js:108` validates URLs against an allowlist of protocols (`http:`, `https:`, `mailto:`, `tel:`, `ftp:`). Mermaid is initialized with `securityLevel: 'strict'`. `sanitizeSvgForRasterize()` removes `<script>` tags from SVGs.
- Recommendations: Add DOMPurify as a final sanitization pass on rendered HTML. This is especially important since the parser uses complex regex-based transformations that could have edge cases allowing HTML injection.

**Mermaid rendering creates and appends DOM elements to `document.body`:**
- Risk: Both `src/components/PreviewPane.vue` and `src/core/editor/copy-formats.js` append sandbox containers to `document.body` for Mermaid rendering. If cleanup fails (exception before `finally` or missing error path), orphaned elements accumulate.
- Files: `src/components/PreviewPane.vue:312-318`, `src/core/editor/copy-formats.js:49-52`
- Current mitigation: `finally` blocks in both locations call `sandbox.remove()` or `DOMUtils.safeRemove(sandbox)`.
- Recommendations: Use a dedicated, persistent offscreen container rather than creating/destroying per render cycle.

**Electron security is well-configured:**
- `nodeIntegration: false`, `contextIsolation: true`, `enableRemoteModule: false` at `electron/modules/windowManager.cjs:17-19`. This follows Electron security best practices.

## Performance Concerns

**Main bundle is 4.8 MB (1.55 MB gzipped):**
- Problem: The production build produces a single `index-*.js` chunk of 4,787 KB. Vite reports a warning about chunks larger than 500 KB. The bundle includes mermaid (~443 KB cytoscape alone), MathJax, CodeMirror, Milkdown, and Prism.
- Files: `vite.config.js` (no `manualChunks` configuration)
- Cause: No code splitting configured. Mermaid (with its many diagram types), MathJax, and CodeMirror are all bundled into the main entry chunk.
- Improvement path: Configure `build.rollupOptions.output.manualChunks` in `vite.config.js` to split heavy dependencies (mermaid, mathjax-full, codemirror) into separate chunks. Mermaid diagram types are already lazy-loaded as separate chunks by mermaid itself (visible in the build output), but the core is still in the main bundle. Consider dynamic `import()` for the Milkdown WYSIWYG editor since it is not needed on initial page load.

**Synchronous Markdown parsing blocks the UI thread:**
- Problem: `parseMarkdown()` in `src/core/markdown/parser.js` is synchronous and processes the entire document on every keystroke (after debouncing). It includes regex-heavy inline formatting, Prism syntax highlighting, and MathJax rendering.
- Files: `src/core/markdown/parser.js` (the `parseMarkdown` function, ~200 lines of while-loop), `src/components/PreviewPane.vue:383` (watch on `props.markdown`)
- Cause: No Web Worker offloading. No incremental parsing. Full re-parse on every content change.
- Improvement path: Move parsing to a Web Worker for large documents. Alternatively, implement incremental parsing that only re-processes changed lines.

**html2canvas for export captures the entire document:**
- Problem: Export (PDF/image) uses `html2canvas` which renders an offscreen DOM container to a canvas. For long documents with many images, this can consume significant memory and block the main thread.
- Files: `src/core/editor/export-formats.js:13` (html2canvas import)
- Cause: `html2canvas` is inherently synchronous and memory-intensive.
- Improvement path: Consider using `OffscreenCanvas` in a Worker, or provide a progress indicator and chunk long documents for PDF export.

**`querySelectorAll('*')` in SVG sanitization and CSS fix:**
- Problem: `sanitizeSvgForRasterize()` and `fixUnsupportedCssForCapture()` both iterate every element in the container using `querySelectorAll('*')`.
- Files: `src/core/editor/copy-formats.js:123`, `src/core/editor/export-formats.js:60`
- Cause: No filtering by element type before iteration.
- Improvement path: Use more specific selectors (e.g., `[style*="url("]`, `[fill]`, `[stroke]`) to reduce iteration scope.

## Scalability

**localStorage as sole persistence layer:**
- Current capacity: Theme settings, custom themes, locale preferences, and temporary state all use `localStorage` via `SafeStorage` and `ThemeStorage` wrappers.
- Limit: `localStorage` has a ~5 MB limit per origin. Custom theme data (stored as JSON arrays) could approach this with many user-created themes.
- Scaling path: For the Electron desktop app, migrate to the file system via IPC. For the web app, consider IndexedDB for theme/document storage if custom theme count grows.

**No document persistence or auto-save:**
- Current capacity: Document content is held in Vue reactive state only. Closing the browser/app loses all work.
- Limit: Users lose content on page refresh, browser crash, or accidental navigation.
- Scaling path: Implement auto-save to `localStorage` or IndexedDB (web) and file system (Electron). The `useElectron.js` composable has file I/O capability but it requires explicit user action.

## Missing Infrastructure

**No ESLint or Prettier configuration:**
- Problem: No `.eslintrc*`, `.prettierrc*`, `eslint.config.*`, or `biome.json` files exist. Code style consistency relies entirely on developer discipline.
- Impact: Inconsistent formatting across files. No automated enforcement of coding conventions.
- Recommendation: Add ESLint with `eslint-plugin-vue` and Prettier. Configure in `package.json` scripts and CI.

**No CI test pipeline:**
- Problem: The `.github/workflows/` directory contains `docker-publish.yml`, `release.yml`, and `vercel-release-deploy.yml`, but none run tests. There is no workflow that executes `npm run test:run` or `npm run test:coverage` on pull requests.
- Files: `.github/workflows/docker-publish.yml`, `.github/workflows/release.yml`, `.github/workflows/vercel-release-deploy.yml`
- Impact: Test regressions can be merged without detection. The 80% coverage threshold exists in vitest config but is never enforced in CI.
- Recommendation: Add a CI workflow that runs `npm run test:coverage` on push/PR to main.

**No error monitoring or crash reporting:**
- Problem: The `ErrorHandler` class in `src/shared/utils/error.js` wraps errors but only logs to `console`. No external error tracking service (Sentry, Bugsnag, etc.) is integrated.
- Impact: Production errors are invisible. No way to know if users encounter issues.
- Recommendation: Integrate an error tracking service, at minimum for the production web deployment.

**Missing end-to-end (E2E) tests:**
- Problem: All 42 test files are unit/integration tests using Vitest + jsdom. No E2E tests exist (no Playwright, Cypress, or similar).
- Impact: Core user flows (type markdown -> see preview -> copy to clipboard -> paste retains formatting) are not tested in a real browser environment. jsdom-based tests cannot validate clipboard operations, Mermaid SVG rendering, or html2canvas export.
- Recommendation: Add Playwright E2E tests for critical flows: editing, preview rendering, social format copy, and PDF/image export.

## Dependency Risks

**`svgo` 4.0.0 - high severity vulnerability:**
- Risk: SVGO is vulnerable to DoS through entity expansion in DOCTYPE (Billion Laughs attack). This is a production dependency used for SVG optimization.
- Impact: Crafted SVG content in user Markdown could trigger DoS. Fix available via `npm audit fix`.
- Migration plan: Run `npm audit fix` to update to patched version.

**`mermaid` 11.9.0 - moderate severity (transitive via `@mermaid-js/parser` -> `langium` -> `chevrotain`):**
- Risk: Transitive dependency chain has prototype pollution vulnerability in `lodash-es` via `chevrotain`.
- Impact: Theoretical prototype pollution through mermaid's parser. Low practical risk since mermaid input is user-controlled text, not untrusted external data.
- Migration plan: Monitor for mermaid updates that bump the dependency chain. No immediate fix available.

**`html2canvas` 1.4.1 - unmaintained:**
- Risk: `html2canvas` has had no releases since Nov 2022. Known issues with CSS features (gradient text, modern layout), which the codebase already works around in `fixUnsupportedCssForCapture()`.
- Impact: Export quality may degrade as browsers adopt new CSS features. No security patches.
- Migration plan: Evaluate alternatives like `html-to-image` (modern, maintained) or `dom-to-image-more`. The export pipeline in `src/core/editor/export-formats.js` would need refactoring.

**`@milkdown/plugin-math` version mismatch:**
- Risk: `@milkdown/plugin-math` is pinned at `^7.5.9` while all other Milkdown packages are at `^7.15.3`. This version gap may cause compatibility issues.
- Impact: Math node rendering in WYSIWYG mode may behave differently from other Milkdown features.
- Migration plan: Upgrade `@milkdown/plugin-math` to `^7.15.3` to align with the rest of the Milkdown ecosystem.

**No TypeScript - all plain JavaScript:**
- Risk: The entire codebase (95 source files, 19,478 lines) is plain JavaScript with JSDoc annotations but no type checking. Complex data structures like theme objects, parser context, and font settings rely on convention rather than type contracts.
- Impact: Refactoring is risky. API contracts between modules are not enforced. IDE support is limited to JSDoc inference.
- Migration plan: Gradual adoption starting with `src/shared/utils/` (already well-documented with JSDoc). Add `tsconfig.json` with `allowJs: true` and `checkJs: true` as a first step to get type checking without rewriting files.

## Test Coverage Gaps

**Vue components are almost entirely untested:**
- What's not tested: 21 Vue components exist in `src/components/`, but only 1 test file exists at `tests/components/preview-escape.test.js` (and it tests HTML escaping logic, not component rendering).
- Files: `src/components/WysiwygPane.vue` (1140 lines), `src/components/PreviewPane.vue` (446 lines), `src/components/SettingsPanel.vue` (408 lines), `src/components/OutlinePanel.vue` (431 lines), `src/components/ColorPicker.vue` (473 lines), `src/components/DropdownMenu.vue` (437 lines), and 15 others.
- Risk: UI regressions go undetected. Component lifecycle, event handling, and template rendering logic are untested.
- Priority: High - the components contain significant logic (theme application, scroll sync, mermaid rendering, toolbar actions).

**Electron IPC has minimal testing:**
- What's not tested: Only `tests/electron/ipcManager.test.js` exists. No tests for `electron/modules/windowManager.cjs`, `electron/modules/menuManager.cjs`, `electron/modules/fileWatcher.cjs`, or `electron/preload.cjs`.
- Files: `electron/modules/windowManager.cjs`, `electron/modules/menuManager.cjs`, `electron/modules/fileWatcher.cjs`
- Risk: File watching, menu actions, and window management bugs are invisible to the test suite.
- Priority: Medium - Electron-specific code paths are not exercised by web users.

**Plugin layer has minimal testing:**
- What's not tested: `src/plugins/table-block/index.js` (906 lines), `src/plugins/table-toolbar.js` (278 lines), `src/plugins/math-nodeview.js` (278 lines). Only `tests/plugins/mermaid-nodeview-escape.test.js` exists for the plugin layer.
- Files: `src/plugins/table-block/index.js`, `src/plugins/table-toolbar.js`, `src/plugins/math-nodeview.js`
- Risk: Table editing (drag/drop, alignment, add/delete), math formula editing, and toolbar positioning can break silently.
- Priority: High - these plugins handle complex user interactions.

---

*Concerns audit: 2026-03-27*

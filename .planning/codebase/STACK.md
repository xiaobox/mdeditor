# Technology Stack

**Analysis Date:** 2026-03-27

## Languages

**Primary:**
- JavaScript (ES Modules) - All application code (`src/`, `electron/`)
- No TypeScript - the entire codebase uses plain JavaScript with JSDoc annotations

**Secondary:**
- CSS - Global styles and theme system (`src/styles/`)
- JSON - i18n locale files (`src/locales/zh-CN.json`, `src/locales/en.json`)
- CommonJS - Electron main process files (`electron/*.cjs`)

## Runtime

**Environment:**
- Node.js >= 18 (CI uses Node 20; local detected: v22.22.0)
- Browser (Chromium via Electron, or any modern browser for web deployment)

**Package Manager:**
- npm (local detected: v10.9.4)
- Lockfile: `package-lock.json` present
- Registry: npmmirror (Chinese mirror, based on lockfile resolved URLs)

**Module System:**
- `"type": "module"` in `package.json` - ES modules by default
- Electron main process uses `.cjs` extension for CommonJS compatibility

## Frameworks

**Core:**
- Vue 3.5.18 (`^3.3.8` declared) - Composition API with `<script setup>` syntax
- Milkdown 7.15.3 - WYSIWYG Markdown editor (ProseMirror-based)
- CodeMirror 6.0.2 - Source code editor for raw Markdown editing
- Electron 37.3.0 - Desktop application shell

**Testing:**
- Vitest 1.6.1 - Test runner (config: `vitest.config.js`)
- jsdom 23.2.0 - Browser environment simulation
- @vue/test-utils 2.4.6 - Vue component testing utilities
- @vitest/coverage-v8 1.6.1 - Code coverage (V8 provider, 80% threshold)
- @vitest/ui 1.6.1 - Visual test UI

**Build/Dev:**
- Vite 5.4.19 (`^5.0.0` declared) - Build tool and dev server (config: `vite.config.js`)
- @vitejs/plugin-vue 5.2.4 - Vue SFC compilation
- Electron Forge 7.8.3 - Electron packaging and distribution (config: `forge.config.cjs`)
- concurrently 9.2.0 - Parallel process runner (Vite + Electron dev)
- cross-env 7.0.3 - Cross-platform environment variables
- wait-on 8.0.4 - Wait for dev server before launching Electron

## Key Dependencies

**Critical (core editor functionality):**
- `@milkdown/core` 7.15.3 - WYSIWYG editor engine
- `@milkdown/preset-commonmark` 7.15.3 - CommonMark support
- `@milkdown/preset-gfm` 7.15.3 - GitHub Flavored Markdown (tables, strikethrough, etc.)
- `@milkdown/plugin-clipboard` 7.15.3 - Clipboard integration for Milkdown
- `@milkdown/plugin-history` 7.15.3 - Undo/redo
- `@milkdown/plugin-listener` 7.15.3 - Content change events
- `@milkdown/plugin-prism` 7.15.3 - Code syntax highlighting in WYSIWYG
- `@milkdown/plugin-math` 7.5.9 - LaTeX math formula support
- `@milkdown/utils` 7.15.3 - Utility functions for plugin development
- `vue-codemirror` 6.1.1 - Vue wrapper for CodeMirror
- `@codemirror/lang-markdown` 6.3.4 - Markdown language support for CodeMirror
- `@codemirror/commands` 6.8.1 - Editor commands
- `@codemirror/state` 6.5.2 - Editor state management
- `@codemirror/view` 6.38.1 - Editor view layer
- `@codemirror/language` 6.11.3 - Language infrastructure
- `@codemirror/theme-one-dark` 6.1.3 - Dark theme for code editor

**Rendering & Export:**
- `mermaid` 11.9.0 - Diagram rendering (lazy-loaded in `src/plugins/mermaid-nodeview.js`)
- `mathjax-full` 3.2.2 - LaTeX math rendering to SVG (`src/core/markdown/math/renderer.js`)
- `prismjs` 1.30.0 - Syntax highlighting (setup: `src/plugins/prism-setup.js`)
- `html2canvas` 1.4.1 - HTML-to-canvas capture for image/PDF export
- `jspdf` 4.2.1 - PDF generation from canvas (`src/core/editor/export-formats.js`)
- `svgo` 4.0.0 - SVG optimization (declared dependency, not directly imported in source)

**UI & Styling:**
- `github-markdown-css` 5.8.1 - Base Markdown preview styles
- `vue-i18n` 9.14.5 - Internationalization (zh-CN, en)

**Electron-specific:**
- `electron-squirrel-startup` 1.0.1 - Windows Squirrel installer integration
- `electron-reloader` 1.2.3 - Dev-mode hot reload (currently commented out in `electron/main.cjs`)

## Configuration

**Build Configuration:**
- `vite.config.js` - Vite build config (dev server port 3000, path aliases, conditional base for Electron)
- `vitest.config.js` - Test config (jsdom environment, 80% coverage thresholds, setup file)
- `forge.config.cjs` - Electron Forge packaging config (ASAR, Fuses security, multi-platform makers)

**Path Aliases (defined in both `vite.config.js` and `vitest.config.js`):**
- `@` -> `./src`
- `@shared` -> `./src/shared`
- `@config` -> `./src/config`
- `@utils` -> `./src/shared/utils`
- `@core` -> `./src/core`
- `@composables` -> `./src/composables`
- `@components` -> `./src/components`
- `@tests` -> `./tests`

**Environment Variables:**
- `ELECTRON=true` - Set during `build:electron` to switch Vite base path to `./`
- `NODE_ENV=development` - Set during `electron:dev` for Electron dev mode
- `ELECTRON_OPEN_DEVTOOLS=1` - Optional, opens DevTools in Electron dev mode

**No `.env` files detected** - Environment config is handled via CLI flags and constants.

## Platform Requirements

**Development:**
- Node.js >= 18, npm >= 9
- No TypeScript compilation step required
- Dev server: `npm run dev` (port 3000)

**Production (Web):**
- Static SPA output to `dist/` directory
- Served via Nginx (Docker) or Vercel (SPA rewrite configured in `vercel.json`)

**Production (Desktop):**
- Electron 37 (Chromium-based)
- Packaged via Electron Forge with ASAR archiving
- Security fuses enabled: no RunAsNode, cookie encryption, ASAR integrity validation
- Targets: macOS (DMG/ZIP, arm64 + x64), Windows (Squirrel/ZIP, x64), Linux (DEB/RPM, x64)

## Notable Technology Choices

1. **No TypeScript** - The entire codebase is plain JavaScript with extensive JSDoc comments for documentation. This simplifies the build pipeline but reduces type safety.

2. **Dual Editor Architecture** - CodeMirror 6 for raw Markdown source editing and Milkdown 7 (ProseMirror-based) for WYSIWYG editing, running side-by-side.

3. **MathJax over KaTeX for rendering** - Despite importing `katex/dist/katex.min.css` for styling in Milkdown's math plugin, the actual math rendering pipeline uses `mathjax-full` for SVG output (better WeChat compatibility). KaTeX CSS is used by Milkdown's `@milkdown/plugin-math` for WYSIWYG preview.

4. **Pure Frontend Export** - PDF and image export use `html2canvas` + `jsPDF` entirely in the browser, with no server-side rendering.

5. **Chinese npm Mirror** - `package-lock.json` resolves packages from `registry.npmmirror.com`.

---

*Stack analysis: 2026-03-27*

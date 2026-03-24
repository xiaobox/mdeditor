<p align="center">
  <a href="./public/logo.svg" target="_blank">
    <img src="./public/logo.svg" alt="Modern MD Editor Logo" width="120" />
  </a>
</p>

<h1 align="center">Modern MD Editor</h1>
<p align="center">Social‑platform‑friendly Markdown Editor</p>

<p align="center">
  <a href="https://vuejs.org/"><img src="https://img.shields.io/badge/Vue-3.x-42b883.svg" alt="Vue 3" /></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-5.x-646CFF.svg" alt="Vite 5" /></a>
  <a href="https://codemirror.net/6/"><img src="https://img.shields.io/badge/CodeMirror-6.x-0b87da.svg" alt="CodeMirror 6" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white" alt="node >=18" /></a>
  <a href="https://www.npmjs.com/"><img src="https://img.shields.io/badge/npm-%3E%3D9-CB3837?logo=npm&logoColor=white" alt="npm >=9" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="MIT License" /></a>
</p>

<p align="center">
  <a href="./README.en.md">English</a> · <a href="./README.md">简体中文</a>
</p>

> A modern Markdown editor designed for an exquisite writing experience and one-click HTML output tailored for WeChat Official Accounts and social platforms. Elegant UI, smooth interactions, WYSIWYG preview and copy — craft beautiful content efficiently.

## Introduction

- What it is: A modern Markdown editor with refined aesthetics and powerful preview. It can convert Markdown to HTML optimized for WeChat/social platforms in one click (auto inline styles, font/line-height/letter-spacing tuning, theme-based beautification).
- Why it exists: Pasting Markdown into WeChat/social editors often loses styling and looks inconsistent. This project provides a one-click copy flow to fix tedious formatting.
- What makes it different:
  - Elegant UI and smooth UX (viewport switch, synced scrolling, theme preloading to avoid FOUC).
  - Adjustable color theme / code style / typography system / fonts, letter spacing and line height.
  - Compatibility strategies tailored for social editors with smart fallbacks.

## Preview

### One-click WeChat format

![](https://xiaobox-public-images.oss-cn-beijing.aliyuncs.com/images20250810145119169.png)

### Split view: Edit + Preview

![](https://xiaobox-public-images.oss-cn-beijing.aliyuncs.com/images20250810144536506.png)

### Preview viewport (Desktop / Tablet / Mobile)

![](https://xiaobox-public-images.oss-cn-beijing.aliyuncs.com/images20250810144616512.png)

### Mermaid diagram support

![](https://xiaobox-public-images.oss-cn-beijing.aliyuncs.com/images20250814231133156.png)

### LaTeX math formula support

Supports inline formulas `$E=mc^2$` and block formulas `$$...$$`, rendered to SVG via MathJax 3, fully compatible with WeChat Official Accounts.

### Settings panel (Theme / Code style / Font / Spacing)

![](https://xiaobox-public-images.oss-cn-beijing.aliyuncs.com/images20250810144902477.png)
![](https://xiaobox-public-images.oss-cn-beijing.aliyuncs.com/images20250810144832875.png)
![](https://xiaobox-public-images.oss-cn-beijing.aliyuncs.com/images20250810144933681.png)
![](https://xiaobox-public-images.oss-cn-beijing.aliyuncs.com/images20250810144947233.png)
![](https://xiaobox-public-images.oss-cn-beijing.aliyuncs.com/images20250810145007195.png)
![](https://xiaobox-public-images.oss-cn-beijing.aliyuncs.com/images20250810145031310.png)

### Rich color themes
- ![](https://xiaobox-public-images.oss-cn-beijing.aliyuncs.com/images20250810144355636.png)

## Features

- WYSIWYG preview & editing
  - New editable mode: click the top view toggle button labeled "WYSIWYG (editable)" to enter rich-text editing; click again to switch back to "Editor" or "Edit + Preview".
  - Built on Milkdown (preset-commonmark + preset-gfm) with Prism highlighting, and kept bidirectionally in sync with the Markdown text.
  - Mermaid node view supported; table cells with backticks have targeted compatibility fixes for display and copy.
  - Unified with the theme/code-style/typography system.
  - One-click viewport switch: desktop / tablet / mobile.
- LaTeX math formula support
  - Inline formulas: wrap with single dollar sign `$E=mc^2$`.
  - Block formulas: wrap with double dollar signs `$$...$$`, supports multi-line.
  - Rendered to SVG via MathJax 3 for perfect WeChat compatibility.
  - Formulas are auto-styled when copying to WeChat — no extra adjustments needed.
- One-click copy as WeChat/social HTML
  - Automatic inline styles (font family/size, line height, letter spacing, palette).
  - Themed adaptations and detail polish (headings, lists, quotes, code, tables, etc.).
  - Modern Clipboard API first with graceful fallback for broader compatibility.
- Export & Download (PDF / Image)
  - Pure frontend solution — no backend required — powered by html2canvas + jsPDF.
  - Reuses the social HTML pipeline (inline styles + Mermaid rendering + formula processing) so exports match the preview.
  - Supports A4 auto-paginated PDF and high-resolution PNG long image.
- Powerful theme and typography system
  - Color themes with live preview and persistence.
  - Code styles (background/font/highlight tokens applied in one place).
  - Typography system via CSS variables (layout, spacing, radius, shadows, etc.).
- Adjustable reading experience
  - Font family, size, line height, letter spacing are all tunable in Settings.
- Modern frontend architecture
  - Vue 3 + Vite 5 + CodeMirror 6.
  - Theme preload (avoid FOUC), debounced performance, caching, modular design.

## Tech Stack & Architecture

- Core
  - Vue 3: SFC with <script setup> and Composition API for clear UI and state.
  - Vite 5: Fast dev server and build with official @vitejs/plugin-vue.
- Editor
  - CodeMirror 6: high-performance editing, shortcuts and scroll sync. Encapsulated in `src/composables/editor/`.
  - WYSIWYG (Milkdown): built with `@milkdown/core`, `preset-commonmark`, `preset-gfm`, `plugin-prism`, `plugin-history`, `plugin-clipboard`, plus a custom Mermaid NodeView; component: `src/components/WysiwygPane.vue`.
- Markdown rendering pipeline
  - `src/core/markdown/parser.js`: single-pass parser handling code blocks/lists/tables/quotes/headings/paragraphs; `PreviewPane.vue` calls `parseMarkdown` to generate preview and social HTML.
  - `src/core/markdown/inline-formatter.js`: inline syntax processing (bold/italic/links/images/escapes, etc.).
  - `src/core/markdown/code-formatter.js`: code block rendering and highlighting (including Mermaid special-case and copy styles).
  - `src/core/markdown/social-adapters.js`: social-platform adapters and inline style injection, with a registrable theme adapter API.
- Copy pipeline
  - `src/core/editor/copy-formats.js`: generate social/Markdown copy formats.
  - `src/core/editor/clipboard.js`: Clipboard API with fallback; simulate social containers and handle fonts/line height/letter spacing details.
- Theme system
  - `src/core/theme/manager.js`: central CSS variable management; `src/core/theme/loader.js` pre-injects on first paint; `src/styles/themes/*` provide style baselines, presets live in `src/config/theme-presets.js`.
- Style baseline
  - `github-markdown-css` for consistent preview typography combined with custom CSS variables and themes.
- Tests
  - Vitest + @vue/test-utils + jsdom; scripts: `test`, `test:ui`, `test:coverage`.
- Directory layout
  - `components/` (UI) · `composables/` (reusable logic) · `core/` (editor/parser/theme/copy) · `config/` (constants & toolbar) · `shared/` (utility functions) · `styles/` (global & component CSS).

## Requirements

- Node.js: >= 18 (recommend 18/20 LTS)
- Package manager: npm / pnpm / yarn
- Browser: modern Chrome/Edge/Safari/Firefox

## Desktop App Support

This project now ships with an Electron desktop app. You can:

- 🚀 Quick launch: `npm run electron:dev` — starts the Vite dev server and the desktop app together
- 📱 Native experience: full desktop UX with menus and shortcuts
- 💾 Local files: open, edit and save local files
- 🔧 Cross‑platform: macOS, Windows and Linux

### Desktop app features

- File operations: open files (.md, .markdown, .txt, etc.), save files
- Shortcuts: Cmd/Ctrl+O (open), Cmd/Ctrl+S (save)
- Menu bar: complete app menus (File, Edit, View, Help)
- Window management: resizing, fullscreen, etc.
- Logging: detailed logs to help debug and understand app state

### Quick start

```bash
# Dev mode (starts Vite server + Electron together)
npm run electron:dev

# Build the desktop app assets
npm run build:electron

# Package the app
npm run package

# Make an installer (macOS)
npm run make:mac
```

See the full guide in the Electron integration doc: [ELECTRON_README.md](./ELECTRON_README.md)

## Install & Run Locally

```bash
# Clone
git clone https://github.com/xiaobox/mdeditor.git
cd modern-md-editor

# Install deps (pick one)
npm install
# or
yarn
# or
pnpm install

# Dev server
npm run dev

# Production build
npm run build

# Preview built assets locally
npm run preview

# Tests (optional)
npm run test
npm run test:ui
npm run test:coverage
```

## Docker: One-liner Deploy

You can use our public image on Docker Hub (AMD64/ARM64):

- Option A: Docker (simplest)

```bash
# Pull and run (exposes to localhost:8080)
docker run -d --name mdeditor -p 8080:80 helongisno1/mdeditor:latest

# Open
open http://localhost:8080
```

- Option B: Docker Compose

```yaml
version: "3.9"
services:
  mdeditor:
    image: helongisno1/mdeditor:latest
    ports:
      - "8080:80"
    restart: unless-stopped
```

```bash
docker compose up -d
open http://localhost:8080
```

Tip (macOS + OrbStack): containers get a local domain like <container>.orb.local. If you didn't specify --name on first run, Docker assigns a random name (e.g., elegant_feynman), and you may see elegant_feynman.orb.local in the browser. This is a local dev domain only. For production, use your own domain behind a reverse proxy or your server IP:port.

To name the container explicitly (easier local domain via OrbStack):

```bash
docker run -d --name mdeditor -p 8080:80 helongisno1/mdeditor:latest
# Now you can also visit http://mdeditor.orb.local locally
```

## Quick Start (Using the App)

- The app launches fully-functional: left editor, right preview, toolbar on top, view controls, and "Settings" on the top-right for theme & typography.
- View toggle: click "WYSIWYG (editable)" to enter rich-text editing; click again to switch back to "Editor" or "Edit + Preview".
- "Copy" dropdown on the top:
  - Choose "WeChat Format" to copy rich HTML and paste into WeChat/social editors.
  - Choose "MD Format" to copy plain Markdown text.
- "Download" dropdown on the top:
  - Choose "Export PDF" to download the preview as an A4-paginated PDF file.
  - Choose "Export Image" to download the preview as a high-resolution PNG long image.

### Components/Modules & Extension Points

- Editor: `src/components/MarkdownEditor.vue`
- Preview: `src/components/PreviewPane.vue`
- WYSIWYG: `src/components/WysiwygPane.vue`
- Settings panel: `src/components/SettingsPanel.vue`
- Toolbar config: `src/config/toolbar.js` (data-driven; add/reorder easily)
- Copy features: `src/core/editor/copy-formats.js`, `src/core/editor/clipboard.js`
- Export/Download: `src/core/editor/export-formats.js` (PDF/image export via html2canvas + jsPDF)
- Markdown parsing & social styling:
  - Parser entry: `src/core/markdown/parser.js`
  - Inline formatting: `src/core/markdown/inline-formatter.js`
  - Code blocks: `src/core/markdown/code-formatter.js`
  - Social styling & adapters: `src/core/markdown/social-adapters.js`
- Theme system (CSS vars): `src/core/theme/manager.js`, `src/core/theme/loader.js`

### Copy/Formatting API (for integration)

- Copy as WeChat/social HTML

```js
import { copySocialFormat } from './src/core/editor/copy-formats.js'

const { success, message } = await copySocialFormat(markdownText, {
  // Theme / code style / typography system (optional; usually from Settings/global theme manager)
  theme: currentColorTheme,
  codeTheme: currentCodeStyle,
  themeSystem: currentThemeSystemId,

  // Font settings (optional: used to generate inline styles closer to social editors)
  fontSettings: {
    fontFamily: 'system-default',   // 'microsoft-yahei' | 'pingfang-sc' | 'hiragino-sans' | 'arial' | 'system-safe' | 'system-default'
    fontSize: 16,                   // px, recommend 12~24
    lineHeight: 1.6,                // number; auto if omitted
    letterSpacing: 0                // px
  }
})
```

- Copy as Markdown plain text

```js
import { copyMarkdownFormat } from './src/core/editor/copy-formats.js'

const { success, message } = await copyMarkdownFormat(markdownText)
```

- Export as PDF / Image

```js
import { exportAsPdf, exportAsImage } from './src/core/editor/export-formats.js'

// Export as A4 paginated PDF
const { success, message } = await exportAsPdf(markdownText, {
  theme: currentColorTheme,
  codeTheme: currentCodeStyle,
  themeSystem: currentThemeSystemId,
  fontSettings: { fontFamily: 'system-default', fontSize: 16, lineHeight: 1.6, letterSpacing: 0 }
})

// Export as PNG long image
const result = await exportAsImage(markdownText, options)
```

- Extend social theme adapters: add a new adapter in `src/core/markdown/social-adapters.js` and register it via `registerThemeCopyAdapter` to tweak headings, lists, quotes, images, tables, etc.

### Preview & Theme Notes

- Viewport modes: switch `desktop / tablet / mobile` on the top-right to preview responsive layout.
- Theme preload: `src/core/theme/loader.js` injects CSS variables on first paint to avoid flashes.
- CSS variable management: `src/core/theme/manager.js` writes color/code-style/typography/font variables, supporting batched updates for performance.

### Config & Defaults

- Default theme/code style/typography/fonts: `src/config/constants/defaults.js`
- Editor base config: `src/config/constants/editor.js`
- External links: `src/config/constants/links.js`

## Internationalization (i18n)

The app supports multiple UI languages; currently built-ins are: `zh-CN` and `en`.

- Switcher: top-right in the Header, indicated by a flag icon (🇨🇳 / 🇬🇧).
- Persistence: the selected language is stored in localStorage and applied on next launch.
- Default locale: prefers localStorage; otherwise defaults to `zh-CN`.
- Copy dropdown: the copy-format menu (Social/Markdown) is internationalized and will auto-refresh labels on locale change.
- Implementation: `vue-i18n@9`. Plugin at `src/plugins/i18n.js`, locale files under `src/locales/`.
- Add a new language:
  1. Add `<locale>.json` under `src/locales/`
  2. Import and register it in `src/plugins/i18n.js`
  3. Add an option in the Header’s `languageOptions`


## Contributing

- Contributions welcome: bug fixes, feature proposals, docs, examples.
- Flow:
  - Fork the repo and create a branch: `feat/xxx` or `fix/xxx`
  - Run locally and verify: `npm run dev`, `npm run test`
  - Open a PR with clear motivation and screenshots/GIFs

- Dev tips:
  - Add toolbar buttons via `src/config/toolbar.js`
  - Extend social styling via `src/core/markdown/social-adapters.js`
  - Add color themes/code styles under `src/config/theme-presets.js`

## License

- MIT by default.

## Contact & Thanks

- Source: `https://github.com/xiaobox/mdeditor`
- Inspirations & deps: Vue 3, Vite, CodeMirror 6, github-markdown-css, and more.

## Support Us
If this project helps you, you can support our ongoing development via:

<table style="margin: 0 auto">
  <tbody>
    <tr>
      <td align="center" style="width: 260px">
        <img
          src="https://xiaobox-public-images.oss-cn-beijing.aliyuncs.com/imagescc16a59f8b43da4a3ad3ce201f46fc9d.jpg"
          style="width: 200px"
        /><br />
      </td>
      <td align="center" style="width: 260px">
        <img
          src="https://xiaobox-public-images.oss-cn-beijing.aliyuncs.com/images2d585d78e23826f6698ddd4edec5d9c2.jpg"
          style="width: 200px"
        /><br />
      </td>
    </tr>
  </tbody>
</table>

---
If you find this project useful, please give it a Star ⭐️! Issues/PRs are welcome — let’s make it even better together.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=xiaobox/mdeditor&type=Date)](https://www.star-history.com/#xiaobox/mdeditor&Date)

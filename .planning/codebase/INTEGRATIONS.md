# External Integrations

**Analysis Date:** 2026-03-27

## APIs & External Services

**None.** This is a fully offline-capable application. There are no external API calls, no `fetch()` requests, no REST/GraphQL endpoints, and no third-party service SDKs in the application code.

All functionality (editing, rendering, exporting, theming) runs entirely in the browser or Electron renderer process.

## Data Storage

**Databases:**
- None. No database of any kind.

**Local Storage (Browser):**
- `localStorage` is the sole persistence mechanism for user preferences
- Theme settings: managed via `src/core/theme/storage.js` (ThemeStorage class)
- Color settings: managed via `src/composables/settings/useColorSettings.js`
- Locale preference: stored in `src/plugins/i18n.js` (key: `locale`)
- General safe wrapper: `src/shared/utils/storage.js` (SafeStorage class)
- Preview scroll position: stored in `src/components/PreviewPane.vue`
- Theme manager state: `src/composables/theme/useThemeManager.js`

**File Storage:**
- Web mode: No file system access (export via browser download, `URL.createObjectURL` + `<a>` click)
- Electron mode: Native file system via Node.js `fs` module in main process (`electron/modules/fileWatcher.cjs`, `electron/modules/ipcManager.cjs`)
- Allowed file extensions in Electron: `.md`, `.txt`, `.markdown`
- Path validation: `IpcManager.isPathSafe()` restricts to user directories (documents, desktop, downloads, home)

**Caching:**
- None (no service workers, no application cache)

## Authentication & Identity

**None.** No authentication, no user accounts, no login functionality. The application is a standalone editor.

## Monitoring & Observability

**Error Tracking:**
- None. No Sentry, DataDog, or similar.
- Custom error handling via `src/shared/utils/error.js` (ErrorHandler class with error types)
- Errors logged to `console.error` / `console.warn`

**Logs:**
- `console.log` / `console.error` throughout
- Electron main process uses console logging with emoji prefixes for window/load events

**Analytics:**
- None.

## CI/CD & Deployment

**Hosting (Web):**
- Vercel - SPA deployment
  - Config: `vercel.json` (SPA rewrite: all routes -> `index.html`)
  - Workflow: `.github/workflows/vercel-release-deploy.yml`
  - Triggered on: GitHub release published or manual dispatch
  - Method: Vercel Deploy Hook URL (stored as `VERCEL_DEPLOY_HOOK_URL` secret)

**Hosting (Docker):**
- Docker Hub - Container registry
  - Image: `helongisno1/mdeditor`
  - Config: `Dockerfile` (multi-stage: node:20-alpine build + nginx:alpine serve)
  - Compose: `docker-compose.yml` (maps port 8080:80)
  - Workflow: `.github/workflows/docker-publish.yml`
  - Triggered on: push to main/master, version tags (`v*.*.*`), manual dispatch
  - Platforms: `linux/amd64`, `linux/arm64`
  - Secrets: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`

**Desktop Distribution:**
- Electron Forge packaging via GitHub Actions
  - Workflow: `.github/workflows/release.yml`
  - Triggered on: GitHub release published or manual dispatch
  - Builds: Windows (x64), Linux (x64), macOS (x64 + arm64)
  - Artifacts uploaded to GitHub Releases via `softprops/action-gh-release@v2`
  - Formats: `.exe` (Squirrel), `.dmg`, `.deb`, `.rpm`, `.zip`
  - No code signing configured (uses ad-hoc signing on macOS CI: `CSC_IDENTITY_AUTO: false`)

**CI Pipeline:**
- GitHub Actions (3 workflows, all in `.github/workflows/`)
- Node.js 20 used across all workflows
- No dedicated test/lint CI workflow (tests not run automatically in CI)

## Browser/Platform APIs

**Clipboard API:**
- `navigator.clipboard.write()` - Modern async clipboard (preferred path in `src/core/editor/clipboard.js`)
- `document.execCommand('copy')` - Legacy fallback with two strategies:
  1. Copy event listener interception (`copyWithExecCommandViaListener`)
  2. DOM selection-based copy (`copyWithExecCommand`)
- `ClipboardItem` constructor - For multi-MIME-type clipboard writes (`text/html` + `text/plain`)

**DOM APIs:**
- `document.createRange()` / `window.getSelection()` - Rich text selection for clipboard
- `URL.createObjectURL()` / `URL.revokeObjectURL()` - File download triggers
- `requestAnimationFrame` - Mermaid SVG rendering scheduling
- `MutationObserver` pattern via ProseMirror NodeView (`ignoreMutation`, `stopEvent`)

**Canvas API:**
- `HTMLCanvasElement.toBlob()` - Image export (PNG)
- `HTMLCanvasElement.toDataURL()` - PDF page generation (JPEG)
- `CanvasRenderingContext2D.drawImage()` - Page slicing for multi-page PDF

**Storage API:**
- `localStorage.getItem()` / `localStorage.setItem()` - All user preferences

**Electron IPC (Desktop only):**
- Communication pattern: Renderer <-> Main process via `contextBridge` + `ipcRenderer`/`ipcMain`
- Preload script: `electron/preload.cjs` exposes `window.electronAPI`
- Available IPC channels:
  - `save-file` (invoke) - Save content to filesystem
  - `setup-file-watcher` (invoke) - Watch file for external changes
  - `file-content-updated` (on) - File changed externally notification
  - `menu-open-file` (on) - Menu "Open" action
  - `menu-save-file` (on) - Menu "Save" action
- Security: `contextIsolation: true`, `nodeIntegration: false`, `enableRemoteModule: false`

**Electron Main Process APIs:**
- `BrowserWindow` - Window management (`electron/modules/windowManager.cjs`)
- `dialog.showSaveDialog()` - Native save dialog (`electron/modules/ipcManager.cjs`)
- `shell.openExternal()` - Open URLs in system browser
- `fs.watch()` - File system watching (`electron/modules/fileWatcher.cjs`)
- `fs.readFileSync()` / `fs.promises.writeFile()` - File I/O
- `app.getPath()` - Safe directory resolution (documents, desktop, downloads, home)
- `Menu` - Application menu (implied by `electron/modules/menuManager.cjs`)

## Webhooks & Callbacks

**Incoming:**
- None (no server endpoints)

**Outgoing:**
- Vercel Deploy Hook - Triggered by CI workflow on release (`curl -X POST`)

## Environment Configuration

**Required secrets (GitHub Actions only):**
- `VERCEL_DEPLOY_HOOK_URL` - Vercel deployment trigger
- `DOCKERHUB_USERNAME` - Docker Hub authentication
- `DOCKERHUB_TOKEN` - Docker Hub authentication

**No application-level secrets.** The app has no API keys, no service credentials, and no `.env` files. All configuration is hardcoded in constants or stored in `localStorage`.

## Third-Party Library Integration Details

**Mermaid (diagram rendering):**
- Lazy-loaded via dynamic `import('mermaid')` in `src/plugins/mermaid-nodeview.js`
- Initialized with `securityLevel: 'strict'`, `startOnLoad: false`
- Integrated as ProseMirror NodeView for Milkdown WYSIWYG
- SVGs are rasterized to PNG for social platform export compatibility

**MathJax (formula rendering):**
- Synchronous initialization in `src/core/markdown/math/renderer.js`
- Uses `liteAdaptor` (server-side compatible, no DOM dependency)
- TeX input with `AllPackages`, SVG output with `fontCache: 'none'`
- Output post-processed for WeChat compatibility (SVG dimensions moved to inline styles)

**Prism.js (syntax highlighting):**
- Pre-imported languages in `src/plugins/prism-setup.js`:
  markup, markdown, css, clike, javascript, typescript, jsx, tsx, json, yaml, bash, shell-session, python, java, go, c, cpp, rust
- Used by Milkdown's `@milkdown/plugin-prism` for WYSIWYG code blocks
- Also used in the Markdown-to-HTML rendering pipeline for preview

**html2canvas + jsPDF (export pipeline):**
- Used together in `src/core/editor/export-formats.js`
- html2canvas captures offscreen DOM container at 2x scale
- jsPDF generates A4-paginated PDF from canvas slices
- Workaround: CSS `background-clip: text` replaced with solid color before capture (unsupported by html2canvas)

**vue-i18n (internationalization):**
- Configured in `src/plugins/i18n.js`
- Supported locales: `zh-CN` (default), `en`
- Locale detection: localStorage -> fallback to `zh-CN`
- Locale files: `src/locales/zh-CN.json`, `src/locales/en.json`

**GitHub Repository:**
- `https://github.com/xiaobox/mdeditor` (defined in `src/config/constants/links.js`)

---

*Integration audit: 2026-03-27*

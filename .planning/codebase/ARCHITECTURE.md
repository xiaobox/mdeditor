# Architecture

**Analysis Date:** 2026-03-27

## Pattern Overview

**Overall:** Component-based SPA with Composable state management (Vue 3 Composition API), no router, no Vuex/Pinia. State is managed via composable functions that return reactive refs and methods. The application runs as both a web app (Vite dev server / static deploy) and a desktop app (Electron).

**Key Characteristics:**
- Single-page application with no client-side routing -- the entire UI renders as one view
- State management via Vue 3 composables (no centralized store library)
- Custom Markdown-to-HTML processing pipeline (not using marked/remark/unified)
- Dual rendering: CodeMirror 6 for source editing, Milkdown 7 for WYSIWYG editing
- CSS variables drive theming; theme is applied before Vue mounts to prevent FOUC
- Social platform output focus: generates inline-styled HTML for copy-paste into WeChat

## Layers

**Presentation Layer (Components):**
- Purpose: Vue components that compose the UI
- Location: `src/components/`
- Contains: `.vue` SFCs using `<script setup>` or Options API
- Depends on: Composables layer, Core layer (directly for `PreviewPane`)
- Used by: `src/App.vue` root component

**Composables Layer (State + Logic Glue):**
- Purpose: Reactive state management, lifecycle hooks, and business logic orchestration
- Location: `src/composables/`
- Contains: Vue composable functions (`use*.js`)
- Depends on: Core layer, Config layer, Plugins layer
- Used by: Components layer, `src/App.vue`

**Core Layer (Business Logic):**
- Purpose: Framework-agnostic business logic -- Markdown parsing, theme computation, editor operations, clipboard/export
- Location: `src/core/`
- Contains: Pure functions and classes (no Vue dependency except imports of config)
- Depends on: Config layer, Shared layer, external libraries (mermaid, html2canvas, jsPDF, Prism)
- Used by: Composables layer, Components layer (PreviewPane directly imports parser)

**Config Layer (Constants + Presets):**
- Purpose: Application constants, theme preset definitions, toolbar configuration
- Location: `src/config/`
- Contains: Constants (`constants/`), theme presets (`theme-presets.js`), toolbar config (`toolbar.js`)
- Depends on: Plugins layer (i18n for toolbar labels)
- Used by: Core layer, Composables layer

**Shared Layer (Utilities):**
- Purpose: General-purpose utility functions shared across all layers
- Location: `src/shared/`
- Contains: `utils/` (text, dom, color, error, logger, storage, performance, theme, typography), `composables/` (useTimerManager)
- Depends on: Nothing (leaf layer)
- Used by: Core layer, Composables layer, Components layer

**Plugins Layer:**
- Purpose: Third-party integrations and editor plugins
- Location: `src/plugins/`
- Contains: i18n setup, Prism language registration, Mermaid node view, Math node view, table toolbar
- Depends on: External libraries (vue-i18n, mermaid, Milkdown, MathJax)
- Used by: Main entry point, Components layer (WysiwygPane)

**Styles Layer:**
- Purpose: Global CSS, component styles, theme CSS variables
- Location: `src/styles/`
- Contains: CSS files organized by component and theme
- Depends on: Nothing
- Used by: Main entry point, Components (via scoped styles and imports)

**Electron Layer:**
- Purpose: Desktop application shell -- window management, native menus, file I/O, IPC
- Location: `electron/`
- Contains: CJS modules for main process
- Depends on: Electron APIs
- Used by: Electron main process; renderer communicates via `window.electronAPI` (preload bridge)

## Data Flow

**Markdown Editing Flow (Source Mode):**

1. User types in CodeMirror editor (`src/components/MarkdownEditor.vue`)
2. `useMarkdownEditor` composable (`src/composables/editor/useEditor.js`) detects content change via CodeMirror update listener
3. Emits `update:model-value` event to `AppMain` -> `App.vue`
4. `App.vue` calls `updateMarkdownContent()` from `useAppState` -> `useContentState`
5. `markdownContent` ref updates, triggering `PreviewPane` watcher
6. `PreviewPane` (`src/components/PreviewPane.vue`) calls `parseMarkdown()` from `src/core/markdown/parser.js`
7. Parser generates HTML with inline styles (for social mode) or class-based HTML (for preview mode)
8. HTML is rendered via `v-html` into the preview panel
9. Mermaid diagrams are rendered post-mount via `mermaid.run()`

**Markdown Editing Flow (WYSIWYG Mode):**

1. User edits in Milkdown editor (`src/components/WysiwygPane.vue`)
2. Milkdown listener plugin detects markdown change
3. Emits `update:model-value` with serialized Markdown back to `App.vue`
4. Same content state update as above

**Copy to Social Platform Flow:**

1. User clicks copy button -> `handleCopyFormatSelect()` in `useClipboard` (`src/composables/useClipboard.js`)
2. Calls `copySocialFormat()` in `src/core/editor/copy-formats.js`
3. Generates inline-styled HTML via `parseMarkdown(text, { isPreview: false })`
4. Creates offscreen DOM container, renders Mermaid diagrams to SVG
5. Rasterizes SVG to PNG (for WeChat compatibility)
6. Processes math formulas via `solveMathForWeChat()`
7. Copies final HTML to clipboard via `copyToSocialClean()` (`src/core/editor/clipboard.js`)

**Export Flow (PDF/Image):**

1. User selects export format -> `handleExportFormatSelect()` in `useExport` (`src/composables/useExport.js`)
2. Calls `exportAsPdf()` or `exportAsImage()` in `src/core/editor/export-formats.js`
3. Reuses the social HTML pipeline: `generateSocialHtml()` + Mermaid render + rasterize + math processing
4. Creates offscreen container, captures with `html2canvas`
5. For PDF: slices canvas into A4 pages via `jsPDF`
6. Triggers browser download

**Theme Application Flow:**

1. On page load, `src/core/theme/loader.js` runs synchronously (imported in `src/main.js` before styles)
2. Reads theme ID from `localStorage`, applies CSS variables to `:root` immediately
3. Vue mounts, `useGlobalThemeManager()` called in `App.vue` initializes reactive state
4. `useThemeManager` (`src/composables/theme/useThemeManager.js`) maintains global `reactive` state singleton
5. Theme changes propagate via watchers to `cssManager` (`src/core/theme/manager.js`) which updates `:root` CSS variables
6. Components react to CSS variable changes automatically

**State Management:**

- No centralized store (Vuex/Pinia). State is managed via composable functions.
- `useAppState` (`src/composables/useAppState.js`) is the top-level orchestrator, composing:
  - `useContentState` -- markdown/HTML content, statistics
  - `useUIState` -- panel visibility, view mode, sync scroll
  - `useNotification` -- toast notifications
  - `useClipboard` -- copy format logic
  - `useExport` -- export format logic
- Theme state uses a module-level `reactive()` singleton in `src/composables/theme/useThemeManager.js`
- All state is passed down from `App.vue` via props; events bubble up via `$emit`

## Key Abstractions

**MarkdownParser (`src/core/markdown/parser.js`):**
- Purpose: Converts Markdown text to HTML with inline styles or CSS classes
- Pattern: Procedural line-by-line parser with context object tracking state (in code block, in blockquote, in math block, in list)
- Key classes: `ListProcessor` (handles nested ordered/unordered/task lists), `MarkdownParser` class (wraps the procedural `parseMarkdown` function)
- Does NOT use a standard Markdown AST library -- it is a custom implementation

**SocialStyler (`src/core/markdown/social-adapters.js`):**
- Purpose: Applies platform-specific inline styles to parsed HTML for social media compatibility
- Pattern: Strategy-like adapters registered per theme system (e.g., "breeze" adapter)

**CSSVariableManager (`src/core/theme/manager.js`):**
- Purpose: Manages dynamic CSS variable injection on `:root`
- Pattern: Singleton class with debounced DOM updates and caching

**ThemeStorage (`src/core/theme/storage.js`):**
- Purpose: Safe localStorage wrapper for theme persistence
- Pattern: Static utility class

**Editor Operations (`src/core/editor/operations.js`):**
- Purpose: Atomic CodeMirror editing operations (bold, italic, heading, list, etc.)
- Pattern: Pure functions accepting `EditorView` instance, dispatching transactions

## Entry Points

**Web Entry Point:**
- Location: `index.html` -> `src/main.js`
- Triggers: Browser navigation to app URL
- Responsibilities:
  1. Imports theme loader (`src/core/theme/loader.js`) -- runs synchronously to prevent FOUC
  2. Imports global CSS files
  3. Creates Vue app with `App` root component
  4. Installs `vue-i18n` plugin
  5. Mounts to `#app`

**Electron Entry Point:**
- Location: `electron/main.cjs`
- Triggers: Electron app launch
- Responsibilities:
  1. Creates `BrowserWindow` via `WindowManager` (`electron/modules/windowManager.cjs`)
  2. Sets up native menus via `MenuManager` (`electron/modules/menuManager.cjs`)
  3. Registers IPC handlers via `IpcManager` (`electron/modules/ipcManager.cjs`)
  4. Sets up file watching via `FileWatcher` (`electron/modules/fileWatcher.cjs`)

**Electron Preload:**
- Location: `electron/preload.cjs`
- Triggers: Before renderer process loads
- Responsibilities: Exposes `window.electronAPI` bridge with `saveFile`, `onMenuOpenFile`, `onMenuSaveFile`, `onFileContentUpdated`, `removeAllListeners`

## Error Handling

**Strategy:** Try-catch at composable boundaries with notification feedback to user. No global error boundary.

**Patterns:**
- Composables catch errors and call `onNotify()` callback with error messages (e.g., `useClipboard`, `useExport`)
- Core functions return `{ success: boolean, message: string }` result objects (e.g., `copySocialFormat`, `exportAsPdf`)
- `ErrorHandler` utility class in `src/shared/utils/error.js` provides structured error handling
- `console.warn` for non-critical failures (e.g., single Mermaid diagram render failure)
- Clipboard operations have timeout protection and graceful degradation (modern API -> `execCommand` fallback)
- Electron file operations wrapped in try-catch with IPC error propagation

## Cross-Cutting Concerns

**Logging:** `src/shared/utils/logger.js` provides structured logging utility. In practice, `console.warn`/`console.error` is used directly in most modules.

**Validation:** Input validation is minimal and inline. Theme preset factory functions (`createTheme`, `createCodeStyle`) apply default values for missing properties. Markdown parser handles malformed input gracefully by treating unrecognized lines as paragraphs.

**Authentication:** Not applicable -- this is a client-side editor with no user accounts or server communication.

**Internationalization:** `vue-i18n` with Composition API mode. Two locales: `zh-CN` (default) and `en`. Locale files at `src/locales/zh-CN.json` and `src/locales/en.json`. Language detection: localStorage `locale` key -> defaults to `zh-CN`. Toolbar labels, header text, notifications all use `$t()` / `i18n.global.t()`.

**Persistence:** All user preferences stored in `localStorage`:
- Theme settings: color theme ID, code style ID, theme system ID, font family, font size, letter spacing, line height
- Custom themes: serialized JSON
- Locale preference
- No server-side persistence

---

*Architecture analysis: 2026-03-27*

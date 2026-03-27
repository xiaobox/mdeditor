# Codebase Structure

**Analysis Date:** 2026-03-27

## Directory Layout

```
mdeditor/
├── electron/                # Electron main process (CJS modules)
│   ├── main.cjs             # Electron entry point
│   ├── preload.cjs           # Context bridge for renderer
│   └── modules/              # Modular Electron functionality
│       ├── fileWatcher.cjs   # File change watching
│       ├── ipcManager.cjs    # IPC handler registration
│       ├── menuManager.cjs   # Native menu setup
│       └── windowManager.cjs # BrowserWindow creation
├── public/                   # Static assets (favicon, logo, etc.)
├── src/                      # Application source code
│   ├── main.js               # Vue app entry point
│   ├── App.vue               # Root component
│   ├── components/           # Vue components
│   │   ├── layout/           # Layout shell components
│   │   ├── settings/         # Settings panel sub-components
│   │   └── *.vue             # Feature components
│   ├── composables/          # Vue composable functions (state + logic)
│   │   ├── editor/           # CodeMirror editor composables
│   │   ├── settings/         # Settings panel composables
│   │   ├── theme/            # Theme management composables
│   │   └── use*.js           # Top-level composables
│   ├── config/               # Configuration and constants
│   │   ├── constants/        # App-wide constant definitions
│   │   ├── theme-presets.js  # All theme preset definitions
│   │   └── toolbar.js        # Toolbar button configuration
│   ├── core/                 # Framework-agnostic business logic
│   │   ├── editor/           # Editor operations, clipboard, copy/export
│   │   ├── markdown/         # Markdown parser, formatters, math
│   │   └── theme/            # CSS variable manager, storage, loader
│   ├── locales/              # i18n translation files
│   │   ├── zh-CN.json        # Chinese (default)
│   │   └── en.json           # English
│   ├── plugins/              # Third-party integrations
│   │   ├── i18n.js           # vue-i18n setup
│   │   ├── prism-setup.js    # Prism.js language registration
│   │   ├── mermaid-nodeview.js # Milkdown Mermaid plugin
│   │   ├── math-nodeview.js  # Milkdown math plugin
│   │   ├── table-toolbar.js  # Milkdown table toolbar
│   │   └── table-block/      # Milkdown table block plugin
│   ├── shared/               # General-purpose utilities
│   │   ├── composables/      # Shared composables (useTimerManager)
│   │   └── utils/            # Utility functions (text, dom, color, etc.)
│   └── styles/               # Global and component CSS
│       ├── global.css        # Base styles and design tokens
│       ├── prism-variables.css # Code highlighting CSS variables
│       ├── components/       # Component-specific CSS files
│       │   ├── index.css     # CSS barrel file
│       │   ├── layout/       # Layout component styles
│       │   └── settings/     # Settings panel styles
│       └── themes/           # Theme system CSS
│           ├── theme-root.css           # Theme variable definitions
│           ├── theme-system-default.css # Default layout theme
│           └── theme-system-breeze.css  # Breeze layout theme
├── tests/                    # Test files (mirrors src/ structure)
│   ├── setup.js              # Test environment setup (browser API polyfills)
│   ├── bugs/                 # Regression tests for fixed bugs
│   ├── components/           # Component tests
│   ├── composables/          # Composable tests
│   ├── config/               # Config tests
│   ├── core/                 # Core logic tests
│   ├── electron/             # Electron module tests
│   ├── plugins/              # Plugin tests
│   └── shared/               # Shared utility tests
├── docs/                     # Documentation and assets
├── coverage/                 # Test coverage reports (generated)
├── dist/                     # Production build output (generated)
├── index.html                # HTML entry point
├── package.json              # Dependencies and scripts
├── vite.config.js            # Vite build configuration
├── vitest.config.js          # Vitest test configuration
├── forge.config.cjs          # Electron Forge packaging config
├── vercel.json               # Vercel deployment config
├── Dockerfile                # Docker build definition
└── docker-compose.yml        # Docker compose config
```

## Directory Purposes

**`src/components/`:**
- Purpose: All Vue single-file components
- Contains: `.vue` files organized by feature area
- Key files:
  - `MarkdownEditor.vue` -- CodeMirror 6 source editor with toolbar
  - `PreviewPane.vue` -- HTML preview with Mermaid rendering and viewport modes
  - `WysiwygPane.vue` -- Milkdown 7 WYSIWYG editor
  - `SettingsPanel.vue` -- Modal settings panel orchestrator
  - `OutlinePanel.vue` -- Document outline/TOC sidebar
  - `MarkdownGuide.vue` -- Markdown syntax reference modal
  - `DropdownMenu.vue` -- Reusable dropdown component
  - `ColorPicker.vue` -- Custom color picker for themes
  - `ToolbarButton.vue` -- Reusable toolbar button
  - `BackToTopFloat.vue` -- Floating scroll-to-top button

**`src/components/layout/`:**
- Purpose: Application shell layout components
- Contains:
  - `AppHeader.vue` -- Top bar with view toggle, settings, copy, export buttons
  - `AppMain.vue` -- Main content area with editor/preview split
  - `AppFooter.vue` -- Status bar with word count, line count, read time

**`src/components/settings/`:**
- Purpose: Settings panel section components (8 sections)
- Contains:
  - `SettingsHeader.vue` -- Settings panel title bar
  - `SettingsFooter.vue` -- Settings panel footer (language switch, reset)
  - `ThemeSystemSection.vue` -- Layout theme selection (default/breeze)
  - `ColorThemeSection.vue` -- Color theme selection + custom color
  - `CodeStyleSection.vue` -- Code highlighting theme selection
  - `FontSettingsSection.vue` -- Font family selection
  - `FontSizeSection.vue` -- Font size adjustment
  - `SpacingSettingsSection.vue` -- Letter spacing and line height

**`src/composables/`:**
- Purpose: Vue Composition API hooks for state management and logic
- Contains: `use*.js` files, each exporting a composable function
- Key files:
  - `useAppState.js` -- Top-level state orchestrator (composes all others)
  - `useContentState.js` -- Markdown content, HTML content, text statistics
  - `useUIState.js` -- Panel visibility, view mode, sync scroll
  - `useNotification.js` -- Toast notification system
  - `useClipboard.js` -- Copy format selection and execution
  - `useExport.js` -- Export format selection and execution
  - `useElectron.js` -- Electron environment detection and IPC
  - `useOutline.js` -- Heading extraction for document outline
  - `useScrollNavigation.js` -- Settings panel scroll-spy navigation
  - `useSettingsPanel.js` -- Settings panel business logic orchestrator

**`src/composables/editor/`:**
- Purpose: CodeMirror editor lifecycle and operations
- Contains:
  - `useEditor.js` -- Main editor composable (composes sub-composables)
  - `useEditorState.js` -- Editor content ref and instance tracking
  - `useEditorEvents.js` -- Content change and scroll event handling
  - `useEditorLifecycle.js` -- Mount/unmount CodeMirror instance
  - `useEditorOperations.js` -- Toolbar operation bindings
  - `useEditorTheme.js` -- CodeMirror theme switching

**`src/composables/theme/`:**
- Purpose: Global theme state management singleton
- Contains:
  - `useThemeManager.js` -- Reactive theme state, computed theme objects, setters with localStorage persistence. Uses module-level `reactive()` for global singleton.

**`src/composables/settings/`:**
- Purpose: Settings panel sub-logic
- Contains:
  - `useColorSettings.js` -- Color theme selection and custom color logic
  - `useFontSettings.js` -- Font family and size management
  - `useThemeSettings.js` -- Theme system and code style selection

**`src/config/`:**
- Purpose: Application configuration, constants, and preset definitions
- Contains:
  - `constants/` -- Organized constant modules:
    - `editor.js` -- Editor operation IDs, placeholder text, markdown syntax constants, regex patterns
    - `formatting.js` -- Social formatting constants
    - `timing.js` -- Timeout and debounce durations
    - `error-messages.js` -- Error message strings
    - `defaults.js` -- Theme defaults, storage keys
    - `links.js` -- External URLs (GitHub repo)
    - `index.js` -- Barrel re-export
  - `theme-presets.js` -- Factory functions and preset definitions for color themes, code styles, theme systems, font settings
  - `toolbar.js` -- Toolbar button configuration factory

**`src/core/`:**
- Purpose: Framework-agnostic business logic
- Contains: Three sub-modules (editor, markdown, theme)

**`src/core/editor/`:**
- Purpose: Editor operations and output formatting
- Contains:
  - `operations.js` -- Atomic CodeMirror editing operations (bold, italic, heading, list, link, image, code, table, etc.)
  - `clipboard.js` -- Rich text clipboard operations with fallback strategy
  - `copy-formats.js` -- Social format and Markdown format copy logic (Mermaid SVG->PNG, math processing)
  - `export-formats.js` -- PDF and image export via html2canvas + jsPDF

**`src/core/markdown/`:**
- Purpose: Custom Markdown-to-HTML processing pipeline
- Contains:
  - `parser.js` -- Main parser: line-by-line processing with context state (code blocks, blockquotes, math blocks, lists). Exports `parseMarkdown()` and `MarkdownParser` class.
  - `inline-formatter.js` -- Inline Markdown processing: bold, italic, strikethrough, links, images, inline code, highlights, subscript, superscript, keyboard, escape handling
  - `code-formatter.js` -- Code block syntax highlighting with language aliases and theme support
  - `social-adapters.js` -- `SocialStyler` class for platform-specific inline style injection; theme adapter registry
  - `math/` -- Math formula processing sub-module:
    - `detector.js` -- Detects and extracts `$...$` and `$$...$$` formulas
    - `renderer.js` -- Renders LaTeX to MathML/SVG via MathJax
    - `image-converter.js` -- Converts math SVGs for WeChat compatibility

**`src/core/theme/`:**
- Purpose: Theme system core logic
- Contains:
  - `manager.js` -- `CSSVariableManager` class (debounced `:root` style updates), `hexToRgb()`, `computeThemeVariables()`
  - `storage.js` -- `ThemeStorage` class (safe localStorage wrapper), storage keys and defaults
  - `loader.js` -- Theme pre-loader (runs before Vue mount to prevent FOUC). Self-executing on import.

**`src/plugins/`:**
- Purpose: Third-party library integrations
- Contains:
  - `i18n.js` -- vue-i18n configuration, locale detection, `setI18nLocale()` function
  - `prism-setup.js` -- Prism.js language registration for syntax highlighting
  - `mermaid-nodeview.js` -- Milkdown plugin for rendering Mermaid diagrams in WYSIWYG mode
  - `math-nodeview.js` -- Milkdown plugin for rendering math formulas in WYSIWYG mode
  - `table-toolbar.js` -- Milkdown table editing toolbar
  - `table-block/` -- Milkdown table block plugin (index.js, icons.js)

**`src/shared/`:**
- Purpose: General-purpose utilities with no domain-specific logic
- Contains:
  - `utils/text.js` -- `escapeHtml()`, `cleanUrl()`, `sanitizeAttribute()`, `TextUtils` class
  - `utils/dom.js` -- `DOMUtils` class (offscreen container creation, safe removal), `OFFSCREEN_STYLES`
  - `utils/color.js` -- Color manipulation utilities
  - `utils/error.js` -- `ErrorHandler` class, `ERROR_TYPES` enum
  - `utils/logger.js` -- Structured logging utility
  - `utils/storage.js` -- `SafeStorage` class, `TEMP_STORAGE_KEYS`
  - `utils/performance.js` -- `debounce()` and other performance utilities
  - `utils/theme.js` -- `getThemesSafe()` and theme-related helpers
  - `utils/typography.js` -- `calculateLineHeight()` and typography calculations
  - `composables/useTimerManager.js` -- Timer lifecycle management composable

**`src/styles/`:**
- Purpose: All CSS files for the application
- Contains:
  - `global.css` -- Base reset, design tokens (spacing, colors, typography)
  - `prism-variables.css` -- CSS variables for Prism syntax highlighting
  - `components/index.css` -- Barrel import for all component CSS
  - `components/layout/` -- Layout component CSS (app-header, app-footer, app-layout)
  - `components/settings/` -- Settings panel CSS (base, section, font, index)
  - `components/` -- Feature component CSS (markdown-editor, preview-pane, buttons, notifications, markdown-guide, outline-panel, math)
  - `themes/theme-root.css` -- Theme CSS variable root definitions
  - `themes/theme-system-default.css` -- Default theme system layout styles
  - `themes/theme-system-breeze.css` -- Breeze theme system layout styles

**`electron/`:**
- Purpose: Electron main process code (CommonJS)
- Contains:
  - `main.cjs` -- App initialization, window creation, module wiring
  - `preload.cjs` -- Context bridge exposing `electronAPI` to renderer
  - `modules/windowManager.cjs` -- `BrowserWindow` creation and management
  - `modules/menuManager.cjs` -- Native menu bar setup
  - `modules/ipcManager.cjs` -- IPC handler registration (file save, etc.)
  - `modules/fileWatcher.cjs` -- File system watching for external changes

## Key File Locations

**Entry Points:**
- `index.html`: HTML shell with `#app` mount point
- `src/main.js`: Vue app creation, plugin installation, CSS imports
- `electron/main.cjs`: Electron app initialization

**Configuration:**
- `vite.config.js`: Build config, path aliases, dev server
- `vitest.config.js`: Test config, coverage thresholds, path aliases
- `forge.config.cjs`: Electron Forge packaging config
- `vercel.json`: Vercel SPA routing
- `package.json`: Dependencies, scripts

**Core Logic:**
- `src/core/markdown/parser.js`: Markdown-to-HTML conversion (main pipeline)
- `src/core/editor/copy-formats.js`: Social platform copy with Mermaid/math processing
- `src/core/editor/export-formats.js`: PDF/image export
- `src/core/theme/manager.js`: CSS variable management

**State Management:**
- `src/composables/useAppState.js`: Top-level state orchestrator
- `src/composables/theme/useThemeManager.js`: Global theme singleton
- `src/composables/useContentState.js`: Content and statistics

**Testing:**
- `tests/setup.js`: Browser API polyfills for jsdom
- `tests/core/markdown/markdown-parser.test.js`: Parser test suite
- `tests/bugs/`: Regression tests for fixed issues

## Naming Conventions

**Files:**
- Vue components: `PascalCase.vue` (e.g., `PreviewPane.vue`, `AppHeader.vue`)
- Composables: `camelCase.js` prefixed with `use` (e.g., `useAppState.js`, `useEditor.js`)
- Core modules: `kebab-case.js` (e.g., `copy-formats.js`, `inline-formatter.js`, `social-adapters.js`)
- Constants: `kebab-case.js` (e.g., `error-messages.js`, `theme-presets.js`)
- Utility files: `kebab-case.js` (e.g., `text.js`, `dom.js`, `color.js`)
- CSS files: `kebab-case.css` (e.g., `app-header.css`, `preview-pane.css`)
- Electron modules: `camelCase.cjs` (e.g., `fileWatcher.cjs`, `ipcManager.cjs`)
- Test files: `kebab-case.test.js` matching the source file name (e.g., `markdown-parser.test.js`)

**Directories:**
- Feature groupings: `kebab-case` (e.g., `editor/`, `theme/`, `settings/`, `table-block/`)
- Layer groupings: `camelCase` for Electron modules dir only; rest is `kebab-case`

**Barrel Files:**
- Every directory with multiple exports has an `index.js` barrel file
- Barrel files use `export * from` or named re-exports

## Import Patterns

**Path Aliases (defined in `vite.config.js` and `vitest.config.js`):**
- `@` -> `./src`
- `@shared` -> `./src/shared`
- `@config` -> `./src/config`
- `@utils` -> `./src/shared/utils`
- `@core` -> `./src/core`
- `@composables` -> `./src/composables`
- `@components` -> `./src/components`
- `@tests` -> `./tests`

**Import Style:**
- Relative paths used predominantly within the same layer (e.g., `'./useContentState.js'`)
- Imports from other layers use relative paths (e.g., `'../../core/markdown/index.js'`), NOT path aliases in source code
- Path aliases are primarily used in test files (e.g., `import { parseMarkdown } from '@core/markdown/index.js'`)
- All imports use explicit `.js` extensions
- Barrel files (`index.js`) are the preferred import target for cross-module access

**Dependency Direction (enforced by convention, not tooling):**
```
Components -> Composables -> Core -> Config -> (nothing)
                                  -> Shared -> (nothing)
Components -> Core (direct: PreviewPane imports parser)
Components -> Plugins (direct: WysiwygPane imports Milkdown)
```

## Where to Add New Code

**New Vue Component:**
- Implementation: `src/components/YourComponent.vue`
- If it is a layout component: `src/components/layout/YourComponent.vue`
- If it is a settings section: `src/components/settings/YourSection.vue`
- Styles: Either scoped `<style scoped>` in the `.vue` file, or a separate CSS file at `src/styles/components/your-component.css` (add import to `src/styles/components/index.css`)
- Wire it into `src/App.vue` or the appropriate parent component

**New Composable:**
- Implementation: `src/composables/useYourFeature.js`
- If editor-related: `src/composables/editor/useYourFeature.js` (add export to `src/composables/editor/index.js`)
- If theme-related: `src/composables/theme/useYourFeature.js` (add export to `src/composables/theme/index.js`)
- If settings-related: `src/composables/settings/useYourFeature.js` (add export to `src/composables/settings/index.js`)
- Add export to `src/composables/index.js` barrel file
- Tests: `tests/composables/useYourFeature.test.js`

**New Core Logic Module:**
- If editor-related: `src/core/editor/your-module.js` (add export to `src/core/editor/index.js`)
- If markdown-related: `src/core/markdown/your-module.js` (add export to `src/core/markdown/index.js`)
- If theme-related: `src/core/theme/your-module.js` (add export to `src/core/theme/index.js`)
- Tests: `tests/core/{subdir}/your-module.test.js`

**New Markdown Parser Feature:**
- New inline format: Add processing function to `src/core/markdown/inline-formatter.js`
- New block-level element: Add handling to `src/core/markdown/parser.js` in the main `parseMarkdown` loop
- New social adapter: Add adapter to `src/core/markdown/social-adapters.js`
- Tests: `tests/core/markdown/` directory

**New Theme Preset:**
- Color theme: Add to `colorThemes` object in `src/config/theme-presets.js`
- Code style: Add to `codeStyles` object in `src/config/theme-presets.js`
- Theme system: Add to `themeSystems` object in `src/config/theme-presets.js`, create `src/styles/themes/theme-system-{name}.css`
- Font family: Add to `fontFamilyOptions` in `src/config/theme-presets.js`

**New Toolbar Button:**
- Add button config to the array in `src/config/toolbar.js` `createToolbarConfig()` function
- Add the operation function to `src/core/editor/operations.js` if it is a new editing operation

**New Constants:**
- Add to the appropriate file in `src/config/constants/` (editor.js, timing.js, formatting.js, etc.)
- Ensure it is re-exported via `src/config/constants/index.js`

**New Utility Function:**
- Add to the appropriate file in `src/shared/utils/` (text.js, dom.js, color.js, etc.)
- If it doesn't fit existing files, create a new `src/shared/utils/your-util.js` and add export to `src/shared/utils/index.js`
- Tests: `tests/shared/utils/your-util.test.js`

**New i18n Translation Key:**
- Add to both `src/locales/zh-CN.json` and `src/locales/en.json`

**New Milkdown Plugin:**
- Create `src/plugins/your-plugin.js`
- Import and register in `src/components/WysiwygPane.vue`

**Bug Fix Regression Test:**
- Add to `tests/bugs/descriptive-name.test.js`

## Special Directories

**`coverage/`:**
- Purpose: Test coverage HTML reports
- Generated: Yes (by `npm run test:coverage`)
- Committed: No (in `.gitignore`)

**`dist/`:**
- Purpose: Production build output
- Generated: Yes (by `npm run build`)
- Committed: No (in `.gitignore`)

**`node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes (by `npm install`)
- Committed: No (in `.gitignore`)

**`public/`:**
- Purpose: Static assets copied as-is to build output
- Generated: No
- Committed: Yes
- Contains: favicon.svg, logo.svg, sample files

**`.planning/`:**
- Purpose: Project planning and analysis documents
- Generated: By tooling
- Committed: Varies

**`.claude/`:**
- Purpose: Claude Code configuration
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-03-27*

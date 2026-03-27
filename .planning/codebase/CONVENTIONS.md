# Coding Conventions

**Analysis Date:** 2026-03-27

## Naming Patterns

**Files:**
- Vue components: PascalCase (e.g., `PreviewPane.vue`, `AppHeader.vue`, `ColorThemeSection.vue`)
- JavaScript modules: kebab-case (e.g., `copy-formats.js`, `inline-formatter.js`, `error-messages.js`)
- Test files: mirror source path with `.test.js` suffix (e.g., `tests/core/editor/clipboard.test.js`)
- Index/barrel files: `index.js` in every module directory

**Functions:**
- camelCase for all functions: `useAppState()`, `handleCopyFormatSelect()`, `createRichTextContainer()`
- Composables: `use` prefix, always (e.g., `useEditor`, `useContentState`, `useClipboard`)
- Factory functions: `create` prefix (e.g., `createToolbarConfig()`, `createModuleLogger()`, `createIsPathSafe()`)
- Boolean getters: `is`/`has` prefix (e.g., `isHtmlReady`, `hasContent`, `isCustomColorActive`)

**Variables:**
- camelCase for local variables and refs: `markdownContent`, `syncScrollEnabled`
- UPPER_SNAKE_CASE for constants: `EDITOR_CONFIG`, `PLACEHOLDER_TEXT`, `ERROR_TYPES`
- Constants use `Object.freeze()` for immutability

**Types/Classes:**
- PascalCase for classes: `AppError`, `ErrorHandler`, `TextUtils`, `SimpleCache`, `MarkdownParser`
- PascalCase for enums-as-objects: `ERROR_TYPES`

## Code Style

**Formatting:**
- No ESLint or Prettier configuration detected. Code style is enforced by convention only.
- Indentation: 2 spaces throughout JS and Vue files
- Semicolons: inconsistent -- some files use them (`src/core/editor/operations.js`), some omit them (`src/composables/useUIState.js`). The majority of composables and test files **omit** semicolons.
- Trailing commas: used in multiline objects and arrays
- Single quotes for strings

**Linting:**
- No automated linting tool configured (no `.eslintrc`, `.prettierrc`, `biome.json`)
- Code quality relies on manual review and consistent patterns

## Import Organization

**Order (observed across all source files):**
1. Framework imports: `vue`, `vue-i18n`
2. Third-party library imports: `mermaid`, `html2canvas`, `jspdf`, `prismjs`
3. Internal absolute imports using path aliases: `@/`, `@core/`, `@composables/`, etc.
4. Relative imports from sibling/parent modules

**Path Aliases (defined in `vite.config.js` and `vitest.config.js`):**
- `@` -> `./src`
- `@shared` -> `./src/shared`
- `@config` -> `./src/config`
- `@utils` -> `./src/shared/utils`
- `@core` -> `./src/core`
- `@composables` -> `./src/composables`
- `@components` -> `./src/components`
- `@tests` -> `./tests`

**Import style:**
- Use explicit `.js` extension on all internal imports: `import { useAppState } from './useAppState.js'`
- Named exports preferred; default exports only for Vue components using Options API

## Component Patterns

**Two API styles coexist:**

1. **`<script setup>` (17 components, preferred for new code):** Used by `App.vue`, all settings section components, layout components (`AppHeader.vue`, `AppMain.vue`, `AppFooter.vue`), `DropdownMenu.vue`, `SettingsPanel.vue`, `OutlinePanel.vue`, `BackToTopFloat.vue`, `ColorPicker.vue`

```vue
<script setup>
import { ref } from 'vue'
import { useAppState } from './composables/index.js'

const props = defineProps({
  characterCount: { type: Number, required: true }
})

const emit = defineEmits(['toggle-settings'])
</script>
```

2. **Options API with `setup()` function (5 components):** Used by `PreviewPane.vue`, `WysiwygPane.vue`, `MarkdownGuide.vue`, `MarkdownEditor.vue`, `ToolbarButton.vue`. These components explicitly declare `name` and use `export default`.

```vue
<script>
export default {
  name: 'PreviewPane',
  props: { ... },
  emits: ['html-generated'],
  setup(props, { emit }) { ... }
}
</script>
```

**Guideline for new components:** Use `<script setup>` syntax. Only use Options API if the component needs an explicit `name` property for devtools or recursive references.

**Props declaration:**
- Object syntax with type and default/required: `{ type: String, default: '' }`
- Props validated with `type`, `required`, and `default`

**Events:**
- Declared via `defineEmits()` in `<script setup>` or `emits: [...]` in Options API
- Kebab-case event names in templates: `@copy-format-select`, `@update:model-value`

**Styling:**
- `<style scoped>` on all components
- CSS imported from external files via `@import`: `@import '../../styles/components/layout/app-footer.css'`
- CSS variables for theming: `var(--theme-primary)`, `var(--theme-bg-secondary)`

## State Management

**No Vuex/Pinia.** State is managed entirely through composables:

**Pattern - Composable with dependency injection via options:**
```javascript
export function useClipboard(options = {}) {
  const { onNotify, getContent } = options
  // ...state and logic...
  return { copyFormatOptions, handleCopyFormatSelect }
}
```

**Facade composable - `useAppState()` at `src/composables/useAppState.js`:**
- Composes all domain composables (`useContentState`, `useUIState`, `useNotification`, `useClipboard`, `useExport`)
- Returns a flat object re-exporting all state and methods
- Used directly by `App.vue` as the single entry point

**Singleton pattern for theme manager:**
- `useGlobalThemeManager()` at `src/composables/theme/useThemeManager.js` returns a global singleton
- Shared across components without prop drilling

**Reactivity:**
- `ref()` for primitive and object state
- `computed()` for derived values
- No `reactive()` usage observed (prefer `ref()`)

## Barrel/Index Files

Every module directory has an `index.js` re-exporting its contents:
- `src/composables/index.js` - aggregates all composable exports
- `src/core/index.js` - aggregates editor, markdown, theme
- `src/core/editor/index.js` - exports operations and clipboard
- `src/shared/index.js` - exports utils
- `src/config/constants/index.js` - exports all constant groups

**Pattern:**
```javascript
export * from './operations.js';
export * from './clipboard.js';
```

**Backward-compatible aliases:**
```javascript
export { useEditor as useMarkdownEditor } from './editor/index.js';
```

## Constants & Configuration

**All magic numbers and strings are extracted to `src/config/constants/`:**
- `editor.js` - editor configuration (`EDITOR_CONFIG`, `EDITOR_OPERATIONS`, `PLACEHOLDER_TEXT`)
- `timing.js` - timeout and delay values
- `formatting.js` - regex patterns and markdown syntax constants
- `error-messages.js` - user-facing error strings
- `defaults.js` - default values
- `links.js` - external URLs

**Immutability:** Constants use `Object.freeze()` including nested objects:
```javascript
export const EDITOR_CONFIG = Object.freeze({
  FONT_SIZE: 14,
  LINE_HEIGHT: 1.6,
  TAB_SIZE: 2,
});
```

## Error Handling

**Custom error class `AppError` at `src/shared/utils/error.js`:**
```javascript
export class AppError extends Error {
  constructor(message, type = ERROR_TYPES.GENERIC, originalError = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}
```

**Error handler utilities:**
- `ErrorHandler.wrap(error, type, context)` - wraps any error into `AppError`
- `ErrorHandler.handleClipboardError(error, contentSize)` - clipboard-specific handling
- `ErrorHandler.handleNetworkError(error, url, statusCode)` - network-specific handling
- `ErrorHandler.retry(fn, { maxAttempts, delay })` - retry with exponential backoff
- `handleError(error, context, options)` - unified handler with `silent`, `fallback`, `rethrow` options
- `tryCatch(fn, context, fallback)` - sync/async wrapper returning fallback on error
- `tryCatchAsync(fn, context, fallback)` - explicit async version

**Pattern in composables:** Errors are caught, logged in dev, and surfaced to users via the notification system:
```javascript
try { ... } catch (error) {
  onNotify?.('导出失败: ' + error.message, 'error')
}
```

## Logging

**Framework:** Custom logger at `src/shared/utils/logger.js`
- Dev-only: all methods become `noop` in production
- `createModuleLogger(moduleName)` for prefixed logging
- Exported convenience methods: `debug`, `info`, `warn`, `error`

**Pattern:**
```javascript
import { createModuleLogger } from '../../shared/utils/logger.js'
const log = createModuleLogger('ThemeManager')
log.info('Theme initialized')
```

## Documentation / Comments

**JSDoc on every file:** Every `.js` file starts with a `@file` and `@description` block:
```javascript
/**
 * @file src/core/editor/clipboard.js
 * @description 剪贴板操作处理器
 *
 * 本文件封装了...
 */
```

**Function documentation:** Public functions have JSDoc with `@param` and `@returns`:
```javascript
/**
 * 创建一个用于富文本复制的临时 DOM 容器。
 * @param {string} html - 要放入容器的 HTML 内容。
 * @param {Object} fontSettings - 字体设置对象（可选）
 * @returns {HTMLDivElement} - 创建的 div 元素。
 */
```

**Inline comments:** Chinese comments throughout, explaining "why" not just "what":
```javascript
// 使用与coordinator.js一致的字体映射，微信公众号兼容版本
```

**Comment language:** Chinese (zh-CN) is the primary language for comments, JSDoc descriptions, and test descriptions. English is used for JSDoc parameter names and technical terms.

## Git Conventions

**Commit format:** Conventional Commits
- `feat:` - new features
- `fix:` - bug fixes
- `docs:` - documentation changes
- `test:` - test additions
- `refactor:` - code refactoring
- `chore:` - maintenance tasks

**Branch naming:** `feat/scope`, `fix/scope`

**Scope examples from recent commits:**
- `feat: add PDF and image export support`
- `fix(markdown): prevent malformed bold tags in copied blockquotes`
- `chore(issue): close #25 with root cause`

## Internationalization (i18n)

**Framework:** `vue-i18n` v9 with Composition API mode (`legacy: false`)
- Locale files: `src/locales/zh-CN.json`, `src/locales/en.json`
- Plugin setup: `src/plugins/i18n.js`
- Default locale: `zh-CN`, fallback: `en`
- Template usage: `{{ $t('header.settings') }}`
- Script usage: `i18n.global.t(key)`

---

*Convention analysis: 2026-03-27*

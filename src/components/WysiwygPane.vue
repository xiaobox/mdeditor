<template>
  <div class="wysiwyg-pane">
    <div class="preview-toolbar">
      <div class="preview-mode-selector">
        <label class="mode-label">所见即所得</label>
      </div>
      <div class="viewport-info"></div>
    </div>

    <div class="preview-container" :class="[`theme-system-${currentLayoutId}`]">
      <div
        ref="editorRoot"
        class="preview-rendered markdown-body modern-markdown wysiwyg-rendered"
        :class="getPreviewClasses()"
      ></div>
    </div>
  </div>
</template>

<script>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useGlobalThemeManager } from '../composables/index.js'

// Milkdown core & plugins
import { Editor, defaultValueCtx, rootCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'
import { diagram } from '@milkdown/plugin-diagram'
import { clipboard } from '@milkdown/plugin-clipboard'
import { history } from '@milkdown/plugin-history'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { replaceAll, getMarkdown } from '@milkdown/utils'

export default {
  name: 'WysiwygPane',
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const editorRoot = ref(null)
    const editorRef = ref(null)
    const isApplyingExternal = ref(false)
    const hasFocus = ref(false)
    const lastEmittedMarkdown = ref(props.modelValue || '')
    const lastEmittedNormalized = ref('')
    let emitTimer = null

    const toPlainMarkdown = (md = '') => {
      return (md || '')
        // Convert HTML <br> tags into newlines
        .replace(/<br\s*\/?>/gi, '\n')
        // In case of <br ...> with attributes (rare)
        .replace(/<br[^>]*>/gi, '\n')
        // Convert non-breaking spaces to normal spaces (named & numeric)
        .replace(/\u00a0|&nbsp;|&#xA0;|&#160;/gi, ' ')
        // Convert numeric space entities used by remark/stringify to preserve spaces
        .replace(/&#x20;|&#32;/gi, ' ')
    }

    const normalizeMarkdown = (md = '') => (md || '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')

    // Don't use BR placeholders - let Milkdown handle blank lines natively
    const markdownToEditorInput = (md = '') => {
      return toPlainMarkdown(md)
    }

    // init normalized cache
    lastEmittedNormalized.value = normalizeMarkdown(lastEmittedMarkdown.value)

    const themeManager = useGlobalThemeManager()
    const { currentThemeSystemId: currentLayoutId, currentColorTheme, currentCodeStyle, currentFontSettings, initialize } = themeManager

    const getPreviewClasses = () => {
      return {
        [`theme-system-${currentLayoutId.value}`]: true
      }
    }

    const createEditor = async () => {
      if (!editorRoot.value) return

      const editor = await Editor.make()
        .config((ctx) => {
          ctx.set(rootCtx, editorRoot.value)
          ctx.set(defaultValueCtx, markdownToEditorInput(props.modelValue || ''))
        })
        .use(commonmark)
        .use(gfm)
        .use(diagram)
        .use(history)
        .use(clipboard)
        .use(listener)
        .config((ctx) => {
          const l = ctx.get(listenerCtx)
          l.focus(() => { hasFocus.value = true })
          l.blur(() => { hasFocus.value = false })
          l.markdownUpdated((_, markdown) => {
            if (isApplyingExternal.value) return
            const plain = toPlainMarkdown(markdown)
            const normalized = normalizeMarkdown(plain)
            if (normalized === lastEmittedNormalized.value) return
            if (emitTimer) clearTimeout(emitTimer)
            emitTimer = setTimeout(() => {
              lastEmittedMarkdown.value = plain
              lastEmittedNormalized.value = normalized
              emit('update:modelValue', plain)
            }, 60)
          })
        })
        .create()

      editorRef.value = editor
    }

    // External markdown -> editor
    watch(
      () => props.modelValue,
      async (val, oldVal) => {
        if (val === oldVal) return
        const editor = editorRef.value
        if (!editor) return
        const incoming = normalizeMarkdown(val || '')
        if (incoming === lastEmittedNormalized.value) return
        try {
          const current = await editor.action(getMarkdown())
          const currentNorm = normalizeMarkdown(toPlainMarkdown(current || ''))
          const incomingPlain = markdownToEditorInput(val || '')
          const incomingNorm = normalizeMarkdown(incomingPlain)
          if (currentNorm !== incomingNorm) {
            isApplyingExternal.value = true
            await editor.action(replaceAll(incomingPlain))
            lastEmittedMarkdown.value = incomingPlain
            lastEmittedNormalized.value = incomingNorm
          }
        } finally {
          setTimeout(() => { isApplyingExternal.value = false }, 30)
        }
      }
    )

    // React to theme changes; actual variables are applied globally
    watch([currentColorTheme, currentCodeStyle, currentFontSettings, currentLayoutId], () => {}, { deep: true })

    onMounted(async () => {
      initialize()
      await createEditor()
    })

    onBeforeUnmount(() => {
      const editor = editorRef.value
      if (editor && typeof editor.destroy === 'function') {
        editor.destroy()
      }
      editorRef.value = null
    })

    return {
      editorRoot,
      currentLayoutId,
      getPreviewClasses
    }
  }
}
</script>

<style scoped>
/* Fill available height like PreviewPane */
.wysiwyg-pane,
.preview-container,
.wysiwyg-rendered {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Content area look & scroll */
.wysiwyg-rendered {
  padding: 16px;
  overflow: auto;
}

/* HR 分隔线（WYSIWYG 对齐预览页当前样式） */
.wysiwyg-rendered :deep(hr) {
  border: none !important;
  height: 2px !important;
  background: linear-gradient(to right, transparent, var(--theme-primary), transparent) !important;
  margin: 2rem 0 !important;
}

/* ProseMirror baseline; rely on markdown-body for tag styles */
:deep(.ProseMirror) {
  outline: none;
  white-space: pre-wrap;
  min-height: 100%;
}

/* Tables/blocks consistency */
:deep(table) {
  width: 100%;
  border-collapse: collapse;
}

/* 强调文本样式 - 与预览页面保持一致 */
.wysiwyg-rendered :deep(strong),
.wysiwyg-rendered :deep(b) {
  font-weight: 600;
  color: var(--theme-primary) !important;  /* 使用主题色 */
}

.wysiwyg-rendered :deep(em),
.wysiwyg-rendered :deep(i) {
  font-style: italic;
  color: var(--theme-text-secondary) !important;
}

/* 行内代码样式 - 与预览页面保持一致 */
.wysiwyg-rendered :deep(code:not(pre code)) {
  background-color: var(--theme-code-bg) !important;
  color: var(--theme-code-text) !important;
  padding: 0.2rem 0.4rem !important;
  border-radius: var(--radius-sm) !important;
  font-family: var(--theme-code-font-family) !important;
  font-size: 14px !important;
  border: 1px solid var(--theme-code-border) !important;
}

/* 代码块样式 */
.wysiwyg-rendered :deep(pre) {
  background-color: var(--theme-code-bg) !important;
  color: var(--theme-code-text) !important;
  padding: 1rem !important;
  border-radius: var(--radius-md) !important;
  overflow-x: auto !important;
  margin: 1.5rem 0 !important;
  border: 1px solid var(--theme-code-border) !important;
}

.wysiwyg-rendered :deep(pre code) {
  background: none !important;
  padding: 0 !important;
  border-radius: 0 !important;
  border: none !important;
  font-size: 14px !important;
}

/* 链接样式 - 与预览页面保持一致 */
.wysiwyg-rendered :deep(a) {
  color: var(--theme-primary) !important;
  text-decoration: none !important;
  border-bottom: 1px solid transparent !important;
  transition: border-bottom-color 0.2s ease !important;
}

.wysiwyg-rendered :deep(a:hover) {
  border-bottom-color: var(--theme-primary) !important;
}

/* 删除线样式 */
.wysiwyg-rendered :deep(del),
.wysiwyg-rendered :deep(s),
.wysiwyg-rendered :deep(strike) {
  text-decoration: line-through !important;
  color: var(--theme-text-tertiary) !important;
}

/* 列表基础样式 - LI-based Indentation */
.wysiwyg-rendered :deep(ul),
.wysiwyg-rendered :deep(ol) {
  margin: 1rem 0 !important;
  padding-left: 0.5rem !important; /* Indentation is handled by LI elements */
  list-style: none !important;
}

.wysiwyg-rendered :deep(li) {
  margin: 0.5rem 0 !important;
  padding-left: 2rem !important; /* Default indentation for regular lists */
  position: relative !important;
}

.wysiwyg-rendered :deep(li > p) {
    display: inline !important;
    margin: 0 !important;
}

/* 基础项目符号（所有非任务列表） */
.wysiwyg-rendered :deep(li:not([data-item-type='task']))::before {
  position: absolute !important;
  top: 0;
  left: 0; /* Position at the start of the LI's padding */
  width: 2rem; /* Occupy the full padding width */
  height: 1.7em; /* Match line-height */
  line-height: 1.7em; /* Align with text */
  font-weight: 600 !important;
  color: var(--theme-primary) !important;
  text-align: center;
}

/* 无序列表 - 排除任务列表 */
.wysiwyg-rendered :deep(ul > li:not([data-item-type='task']))::before {
  content: '●' !important;
  font-size: 0.9em !important;
}

.wysiwyg-rendered :deep(ul > li:not([data-item-type='task']) > ul > li)::before {
  content: '○' !important;
  font-size: 0.8em !important;
}

.wysiwyg-rendered :deep(ul > li:not([data-item-type='task']) > ul > li > ul > li)::before {
  content: '▪' !important;
  font-size: 0.9em !important;
}

/* 有序列表 */
.wysiwyg-rendered :deep(ol) {
  counter-reset: list-counter !important;
}

.wysiwyg-rendered :deep(ol > li:not([data-item-type='task'])) {
  counter-increment: list-counter !important;
}

.wysiwyg-rendered :deep(ol > li:not([data-item-type='task']))::before {
  content: counter(list-counter) '.' !important;
}

.wysiwyg-rendered :deep(ol > li > ol) {
  counter-reset: list-counter-2 !important;
}

.wysiwyg-rendered :deep(ol > li > ol > li:not([data-item-type='task'])) {
  counter-increment: list-counter-2 !important;
}

.wysiwyg-rendered :deep(ol > li > ol > li:not([data-item-type='task']))::before {
  content: counter(list-counter-2, lower-alpha) '.' !important;
  opacity: 0.8 !important;
}

.wysiwyg-rendered :deep(ol > li > ol > li > ol) {
  counter-reset: list-counter-3 !important;
}

.wysiwyg-rendered :deep(ol > li > ol > li > ol > li:not([data-item-type='task'])) {
  counter-increment: list-counter-3 !important;
}

.wysiwyg-rendered :deep(ol > li > ol > li > ol > li:not([data-item-type='task']))::before {
  content: '(' counter(list-counter-3) ')' !important;
  opacity: 0.6 !important;
}

/* 任务列表 - LI-based Indentation */
.wysiwyg-rendered :deep(li[data-item-type="task"]) {
  padding-left: 0.5rem !important; /* Specific, smaller indentation */
  display: flex !important;
  align-items: center !important;
  margin: 0.25em 0 !important;
}

.wysiwyg-rendered :deep(li[data-item-type="task"])::before {
  content: '' !important;
  display: inline-block !important;
  width: 0.9em !important;
  height: 0.9em !important;
  border: 1px solid var(--theme-border-medium) !important;
  border-radius: var(--radius-sm) !important;
  background-color: var(--theme-bg-primary) !important;
  margin-right: 0.5em;
  flex-shrink: 0;
  position: static !important; 
}

.wysiwyg-rendered :deep(li[data-item-type="task"][data-checked="true"])::before {
  background-color: var(--theme-primary) !important;
  border-color: var(--theme-primary) !important;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M12 5L7 10L4 7L3 8L7 12L13 6L12 5Z' fill='white'/%3e%3c/svg%3e") !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
}

.wysiwyg-rendered :deep(li[data-item-type="task"][data-checked="true"] > p) {
  text-decoration: line-through !important;
  color: var(--theme-text-secondary) !important;
  opacity: 0.7 !important;
}

/* 引用块样式 - 适配 Default 主题 */
.wysiwyg-rendered :deep(blockquote) {
  margin: 1.5rem 0 !important;
  padding: 1rem 1.5rem !important;
  border-left: 4px solid var(--theme-primary) !important;
  background-color: var(--theme-bg-secondary) !important;
  color: var(--theme-text-secondary) !important;
  font-style: italic !important;
  border-radius: 0 var(--radius-md) var(--radius-md) 0 !important;
}

.wysiwyg-rendered :deep(blockquote blockquote) {
  margin-top: 1rem !important;
  margin-bottom: 1rem !important;
  padding-left: 1.5rem !important;
  border-left-color: var(--theme-primary) !important;
  background-color: var(--theme-bg-primary) !important;
}

.wysiwyg-rendered :deep(blockquote p) {
  margin: 0.5rem 0 !important;
}

.wysiwyg-rendered :deep(blockquote p:first-child) {
  margin-top: 0 !important;
}

.wysiwyg-rendered :deep(blockquote p:last-child) {
  margin-bottom: 0 !important;
}

/* 标题样式补充 */
.wysiwyg-rendered :deep(h1),
.wysiwyg-rendered :deep(h2),
.wysiwyg-rendered :deep(h3),
.wysiwyg-rendered :deep(h4),
.wysiwyg-rendered :deep(h5),
.wysiwyg-rendered :deep(h6) {
  color: var(--theme-text-primary) !important;
  font-family: var(--markdown-font-family, var(--theme-font-family)) !important;
  line-height: var(--markdown-line-height, 1.6) !important;
  margin-top: 1.5rem !important;
  margin-bottom: 1rem !important;
}

.wysiwyg-rendered :deep(h1) {
  font-size: calc(var(--markdown-font-size, 16px) * 2) !important;
  font-weight: 700 !important;
}

.wysiwyg-rendered :deep(h2) {
  font-size: calc(var(--markdown-font-size, 16px) * 1.5) !important;
  font-weight: 600 !important;
}

.wysiwyg-rendered :deep(h3) {
  font-size: calc(var(--markdown-font-size, 16px) * 1.3) !important;
  font-weight: 600 !important;
}

.wysiwyg-rendered :deep(h4) {
  font-size: calc(var(--markdown-font-size, 16px) * 1.1) !important;
  font-weight: 600 !important;
}

.wysiwyg-rendered :deep(h5) {
  font-size: calc(var(--markdown-font-size, 16px) * 1) !important;
  font-weight: 600 !important;
}

.wysiwyg-rendered :deep(h6) {
  font-size: calc(var(--markdown-font-size, 16px) * 0.9) !important;
  font-weight: 600 !important;
}
</style>


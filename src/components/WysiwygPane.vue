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
  margin: 32px 0 !important;
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
</style>


<template>
  <div class="wysiwyg-pane">
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <template v-for="(group, groupIndex) in toolbarConfig" :key="groupIndex">
          <div v-if="group.type === 'group'" class="toolbar-group">
            <ToolbarButton
              v-for="item in group.items"
              :key="item.id"
              :title="item.title"
              :icon="item.icon"
              :width="item.width"
              :height="item.height"
              @click="item.action"
            />
          </div>
          <div v-else-if="group.type === 'divider'" class="toolbar-divider"></div>
          <ToolbarButton
            v-else
            :key="group.id"
            :title="group.title"
            :icon="group.icon"
            :width="group.width"
            :height="group.height"
            @click="group.action"
          />
        </template>
      </div>
      <div class="toolbar-right">
        <!-- 工具栏右侧预留 -->
      </div>
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
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useGlobalThemeManager } from '../composables/index.js'
import { createToolbarConfig } from '../config/toolbar.js'
import { EDITOR_OPERATIONS, PLACEHOLDER_TEXT } from '../config/constants/index.js'
import ToolbarButton from './ToolbarButton.vue'

// Milkdown core & plugins
import { Editor, commandsCtx, defaultValueCtx, editorViewCtx, rootCtx, schemaCtx } from '@milkdown/core'
import {
  commonmark,
  createCodeBlockCommand,
  insertHrCommand,
  insertImageCommand,
  toggleEmphasisCommand,
  toggleInlineCodeCommand,
  toggleLinkCommand,
  toggleStrongCommand,
  wrapInBlockquoteCommand,
  wrapInBulletListCommand,
  wrapInHeadingCommand,
  wrapInOrderedListCommand
} from '@milkdown/preset-commonmark'
import { gfm, insertTableCommand, toggleStrikethroughCommand } from '@milkdown/preset-gfm'
import { clipboard } from '@milkdown/plugin-clipboard'
import { history } from '@milkdown/plugin-history'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { replaceAll, getMarkdown } from '@milkdown/utils'
import { prism } from '@milkdown/plugin-prism'
import { math, katexOptionsCtx } from '@milkdown/plugin-math'
import { TextSelection } from '@milkdown/prose/state'
import '../plugins/prism-setup.js'
import { mathNodeViewPlugin } from '../plugins/math-nodeview.js'
import { tableBlockPlugin } from '../plugins/table-block/index.js'
import '../plugins/table-block/style.css'

export default {
  name: 'WysiwygPane',
  components: {
    ToolbarButton
  },
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
    const pendingMarkdown = ref(null) // 保存待发送的 Markdown，用于组件销毁时发送挂起的更新
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
        [`theme-system-${currentLayoutId.value}`]: true,
        [`code-style-${currentCodeStyle.value?.id || 'default'}`]: true
      }
    }

    const runCommand = (command, payload) => {
      const editor = editorRef.value
      if (!editor) return
      editor.action((ctx) => {
        const commands = ctx.get(commandsCtx)
        if (typeof payload === 'undefined') {
          commands.call(command.key)
        } else {
          commands.call(command.key, payload)
        }
        ctx.get(editorViewCtx).focus()
      })
    }

    const insertMathNode = (isBlock) => {
      const editor = editorRef.value
      if (!editor) return
      const formula = PLACEHOLDER_TEXT.FORMULA || '公式'
      editor.action((ctx) => {
        const view = ctx.get(editorViewCtx)
        const schema = ctx.get(schemaCtx)
        const nodeType = isBlock ? schema.nodes.math_block : schema.nodes.math_inline
        if (!nodeType) return
        const node = isBlock
          ? nodeType.create({ value: formula })
          : nodeType.create(null, schema.text(formula))
        if (!node) return
        const tr = view.state.tr.replaceSelectionWith(node)
        view.dispatch(tr.scrollIntoView())
        view.focus()
      })
    }

    const insertLink = () => {
      const editor = editorRef.value
      if (!editor) return
      const href = PLACEHOLDER_TEXT.LINK_URL || 'https://'
      const label = PLACEHOLDER_TEXT.LINK_TEXT || '链接文本'
      editor.action((ctx) => {
        const view = ctx.get(editorViewCtx)
        const { from, to, empty } = view.state.selection
        if (!empty) {
          ctx.get(commandsCtx).call(toggleLinkCommand.key, { href })
          view.focus()
          return
        }
        const schema = ctx.get(schemaCtx)
        const linkMark = schema.marks.link
        if (!linkMark) return
        const mark = linkMark.create({ href })
        let tr = view.state.tr.insertText(label, from, to)
        if (mark) {
          tr = tr.addMark(from, from + label.length, mark)
        }
        tr = tr.setSelection(TextSelection.create(tr.doc, from + label.length))
        view.dispatch(tr.scrollIntoView())
        view.focus()
      })
    }

    const wysiwygOperations = {
      heading: (level) => runCommand(wrapInHeadingCommand, level),
      bold: () => runCommand(toggleStrongCommand),
      italic: () => runCommand(toggleEmphasisCommand),
      strikethrough: () => runCommand(toggleStrikethroughCommand),
      code: () => runCommand(toggleInlineCodeCommand),
      codeBlock: () => runCommand(createCodeBlockCommand),
      quote: () => runCommand(wrapInBlockquoteCommand),
      list: () => runCommand(wrapInBulletListCommand),
      orderedList: () => runCommand(wrapInOrderedListCommand),
      link: insertLink,
      image: () => runCommand(insertImageCommand, {
        src: PLACEHOLDER_TEXT.IMAGE_URL || 'https://',
        alt: PLACEHOLDER_TEXT.IMAGE_ALT || '图片描述'
      }),
      table: () => runCommand(insertTableCommand, {
        row: EDITOR_OPERATIONS.TABLE_DEFAULTS.ROWS,
        col: EDITOR_OPERATIONS.TABLE_DEFAULTS.COLS
      }),
      horizontalRule: () => runCommand(insertHrCommand),
      inlineMath: () => insertMathNode(false),
      blockMath: () => insertMathNode(true)
    }

    const toolbarConfig = computed(() => createToolbarConfig(wysiwygOperations))

    const createEditor = async () => {
      if (!editorRoot.value) return

      const editor = await Editor.make()
        .config((ctx) => {
          ctx.set(rootCtx, editorRoot.value)
          ctx.set(defaultValueCtx, markdownToEditorInput(props.modelValue || ''))
        })
        .use(commonmark)
        .use(gfm)
        .use(prism)
        .use(history)
        .use(clipboard)
        .use(listener)
        // Math plugin for LaTeX formulas
        .use(math)
        .config((ctx) => {
          ctx.set(katexOptionsCtx.key, {
            throwOnError: false,
            displayMode: false,
            output: 'html'
          })
        })
        // Mermaid NodeView plugin
        .use((await import('../plugins/mermaid-nodeview.js')).mermaidNodeViewPlugin)
        // Math NodeView plugin for editable formulas
        .use(mathNodeViewPlugin)
        // Table block plugin for Milkdown-style table editing
        .use(tableBlockPlugin)
        .config((ctx) => {
          const l = ctx.get(listenerCtx)
          l.focus(() => { hasFocus.value = true })
          l.blur(() => { hasFocus.value = false })
          l.markdownUpdated((_, markdown) => {
            if (isApplyingExternal.value) return
            const plain = toPlainMarkdown(markdown)
            const normalized = normalizeMarkdown(plain)
            if (normalized === lastEmittedNormalized.value) return
            // 保存待发送的内容，以便组件销毁时可以立即发送
            pendingMarkdown.value = plain
            if (emitTimer) clearTimeout(emitTimer)
            emitTimer = setTimeout(() => {
              lastEmittedMarkdown.value = plain
              lastEmittedNormalized.value = normalized
              pendingMarkdown.value = null // 已发送，清除挂起状态
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

    onMounted(async () => {
      initialize()
      await createEditor()
      setupInlineCodeObserver()
    })

    onBeforeUnmount(() => {
      // 关键修复：如果有挂起的防抖更新，在组件销毁前立即发送
      // 这确保了用户在 WYSIWYG 中的修改（如表格编辑）不会因为防抖延迟而丢失
      if (emitTimer) {
        clearTimeout(emitTimer)
        emitTimer = null
        // 发送挂起的更新：使用 pendingMarkdown 而不是重新获取
        if (pendingMarkdown.value !== null && pendingMarkdown.value !== lastEmittedMarkdown.value) {
          emit('update:modelValue', pendingMarkdown.value)
        }
      }

      const editor = editorRef.value
      if (editor && typeof editor.destroy === 'function') {
        editor.destroy()
      }
      editorRef.value = null
      if (inlineCodeObserver) {
        inlineCodeObserver.disconnect()
        inlineCodeObserver = null
      }
    })



    // WYSIWYG 表格兼容处理：使“语法”列中的转义反引号整体以 code 呈现
    let inlineCodeObserver = null

    const normalizeWysiwygTables = () => {
      const root = editorRoot.value
      if (!root) return
      const cells = root.querySelectorAll('.wysiwyg-rendered table td, .wysiwyg-rendered table th')
      cells.forEach((cell) => {
        // 若单元格已是“仅一个 <code>...</code> 且没有其他文本”的情况，直接跳过
        if (cell.children.length === 1 && cell.children[0].tagName?.toLowerCase() === 'code') {
          const onlyCode = (cell.textContent || '').trim() === (cell.children[0].textContent || '').trim()
          if (onlyCode) return
        }

        const plain = (cell.textContent || '').trim()
        const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

        // 模式1：标准形式 \`text\`
        const m1 = plain.match(/^\\`([^`]+)\\`$/)
        if (m1) {
          cell.innerHTML = `<code>\`${esc(m1[1])}\`</code>`
          return
        }

        // 模式2：Milkdown 断裂形式 "\\" + text + "``"（光标在末尾时尤为常见）
        // e.g. "\\code``" 或 "\\ code``" -> <code>`code`</code>
        const m2 = plain.match(/^\\\s*([^`]+)``$/)
        if (m2) {
          cell.innerHTML = `<code>\`${esc(m2[1].trim())}\`</code>`
          return
        }

        // 模式3：包含 \` 且至少两个反引号 —— 将整格包裹为 code 胶囊（用于更宽泛的兼容）
        const backticks = (plain.match(/`/g) || []).length
        if (/\\`/.test(plain) && backticks >= 2) {
          cell.innerHTML = `<code>${esc(plain)}</code>`
          return
        }
      })
    }

    const setupInlineCodeObserver = () => {
      const root = editorRoot.value
      if (!root || inlineCodeObserver) return
      inlineCodeObserver = new MutationObserver(() => {
        requestAnimationFrame(normalizeWysiwygTables)
      })
      inlineCodeObserver.observe(root, { childList: true, characterData: true, subtree: true })
      // 初始执行一次
      normalizeWysiwygTables()
    }


    return {
      editorRoot,
      currentLayoutId,
      getPreviewClasses,
      toolbarConfig
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

/* Mermaid NodeView styles */
.wysiwyg-rendered :deep(.md-mermaid) {
  position: relative;
  margin: 0.75rem 0;
  border-radius: 12px;
  border: 1px solid var(--theme-border-light, #e5e7eb);
  background: var(--theme-bg-primary, #fff);
  overflow: visible; /* 允许 SVG 内容超出边界，防止文字被截断 */
}
.wysiwyg-rendered :deep(.md-mermaid.is-selected) { outline: 2px solid #60a5fa; outline-offset: -2px; }
.wysiwyg-rendered :deep(.md-mermaid__toolbar) {
  display: flex;
  justify-content: flex-end;
  gap: .5rem;
  padding: .25rem .5rem;
  border-bottom: 1px solid var(--theme-border-light, #e5e7eb);
  background: var(--theme-bg-secondary, #f9fafb);
}
.wysiwyg-rendered :deep(.md-mermaid__btn) {
  font: inherit;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: #fff;
  cursor: pointer;
}
.wysiwyg-rendered :deep(.md-mermaid__btn:hover) { background: #f3f4f6; }
.wysiwyg-rendered :deep(.md-mermaid__svg) { padding: 12px; overflow: visible; }
.wysiwyg-rendered :deep(.md-mermaid__svg svg) { display: block; max-width: 100%; height: auto; overflow: visible; }
.wysiwyg-rendered :deep(.md-mermaid__source) { margin: 0; padding: 8px 12px; overflow: auto; }
.wysiwyg-rendered :deep(.md-mermaid__error) { color: #b91c1c; white-space: pre-wrap; }
.wysiwyg-rendered :deep(.md-mermaid__empty) { color: #6b7280; padding: 12px; }
.wysiwyg-rendered :deep(.md-mermaid__source) { display: none; }
.wysiwyg-rendered :deep(.md-mermaid[data-editing="true"] .md-mermaid__svg) { display: none; }
.wysiwyg-rendered :deep(.md-mermaid[data-editing="true"] .md-mermaid__source) { display: block; }


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

/* 表头与单元格样式（WYSIWYG 与预览页对齐） */
.wysiwyg-rendered :deep(th),
.wysiwyg-rendered :deep(td) {
  border: 1px solid var(--theme-border-light) !important;
  padding: 8px 12px !important;
  font-size: var(--markdown-font-size, 16px) !important;
  font-family: var(--markdown-font-family, var(--theme-font-family)) !important;
  line-height: var(--markdown-line-height, 1.6) !important;
  color: var(--theme-text-primary) !important;
}

.wysiwyg-rendered :deep(th) {
  background-color: var(--theme-bg-secondary) !important;
  font-weight: 600 !important;
}
/* 保障表头加粗的多重兜底（适配 Milkdown 结构差异） */
.wysiwyg-rendered :deep(thead th),
.wysiwyg-rendered :deep(tr:first-child > th),
.wysiwyg-rendered :deep(tr:first-child > td) {
  font-weight: 600 !important;
  background-color: var(--theme-bg-secondary) !important;
}
/* ProseMirror 在单元格内包裹 p，导致 th 的字重被覆盖，这里强制加粗 */
.wysiwyg-rendered :deep(th > p) { font-weight: 600 !important; margin: 0 !important; }

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

/* 行内代码样式 - 对齐预览页的颜色主题（使用 inline-code 变量） */
.wysiwyg-rendered :deep(code:not(pre code)) {
  background-color: var(--theme-inline-code-bg) !important;
  color: var(--theme-inline-code-text) !important;
  padding: 0.2rem 0.4rem !important;
  border-radius: var(--radius-sm) !important;
  font-family: var(--theme-code-font-family) !important;
  font-size: 14px !important;
  border: 1px solid var(--theme-inline-code-border) !important;
}

/* 代码块样式 */
.wysiwyg-rendered :deep(pre) {
  background: var(--code-bg, var(--theme-code-bg)) !important;
  color: var(--code-color, var(--theme-code-text)) !important;
  padding: var(--code-padding, 16px) !important;
  border-radius: var(--code-border-radius, var(--radius-md)) !important;
  overflow-x: auto !important;
  margin: 1.5rem 0 !important;
  border: var(--code-border, 1px solid var(--theme-code-border)) !important;
  position: relative !important;
}

/* Mac-style header bar & traffic lights (pure CSS, no DOM changes) */
.wysiwyg-rendered.code-style-mac :deep(pre)::before {
  content: '';
  display: block;
  height: 28px;
  margin: calc(var(--code-padding, 16px) * -1) calc(var(--code-padding, 16px) * -1) 12px calc(var(--code-padding, 16px) * -1); /* cancel pre padding dynamically */
  border-radius: var(--code-border-radius, var(--radius-md)) var(--code-border-radius, var(--radius-md)) 0 0;
  background: var(--code-bg, var(--theme-code-bg));
  border-bottom: none;
}

.wysiwyg-rendered.code-style-mac :deep(pre)::after {
  content: '';
  position: absolute;
  top: 12px;
  left: 20px;
  width: 8px;   /* smaller: half size */
  height: 8px;  /* smaller: half size */
  border-radius: 50%;
  background: #ff5f56; /* red */
  /* increase spacing: double the offsets */
  box-shadow: 14px 0 0 #ffbd2e, 28px 0 0 #27c93f; /* yellow, green */
  opacity: 0.95;
}

/* GitHub style header */
.wysiwyg-rendered.code-style-github :deep(pre)::before {
  content: '';
  display: block;
  height: 32px;
  margin: calc(var(--code-padding, 16px) * -1) calc(var(--code-padding, 16px) * -1) 12px calc(var(--code-padding, 16px) * -1);
  border-radius: var(--code-border-radius, var(--radius-md)) var(--code-border-radius, var(--radius-md)) 0 0;
  background: #f1f3f4;
  border-bottom: 1px solid #d0d7de;
}
.wysiwyg-rendered.code-style-github :deep(pre)::after {
  content: '📄 代码';
  position: absolute;
  top: 8px;
  left: 16px;
  font-size: 12px;
  color: #656d76;
}

/* VS Code style header */
.wysiwyg-rendered.code-style-vscode :deep(pre)::before {
  content: '';
  display: block;
  height: 32px;
  margin: calc(var(--code-padding, 16px) * -1) calc(var(--code-padding, 16px) * -1) 12px calc(var(--code-padding, 16px) * -1);
  border-radius: var(--code-border-radius, var(--radius-md)) var(--code-border-radius, var(--radius-md)) 0 0;
  background: linear-gradient(135deg, #2d2d30 0%, #3c3c3c 100%);
  border-bottom: 1px solid #3c3c3c;
}
.wysiwyg-rendered.code-style-vscode :deep(pre)::after {
  content: '⚡ 代码片段';
  position: absolute;
  top: 8px;
  left: 16px;
  font-size: 13px;
  color: #cccccc;
}

/* Terminal style header */
.wysiwyg-rendered.code-style-terminal :deep(pre)::before {
  content: '';
  display: block;
  height: 28px;
  margin: calc(var(--code-padding, 16px) * -1) calc(var(--code-padding, 16px) * -1) 12px calc(var(--code-padding, 16px) * -1);
  border-radius: var(--code-border-radius, var(--radius-md)) var(--code-border-radius, var(--radius-md)) 0 0;
  background: #1a1a1a;
  border-bottom: 1px solid #333333;
}
.wysiwyg-rendered.code-style-terminal :deep(pre)::after {
  content: '$ terminal';
  position: absolute;
  top: 8px;
  left: 16px;
  font-size: 12px;
  color: #00ff00;
  font-family: 'Courier New', monospace;
}

.wysiwyg-rendered :deep(pre code) {
  background: none !important;
  padding: 0 !important;
  border-radius: 0 !important;
  border: none !important;
  font-size: 14px !important;
  /* Do not set explicit color here; allow Prism token colors to take effect */
  font-family: var(--code-font-family, var(--theme-code-font-family)) !important;
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

/* 引用块样式 - 对齐预览页面（带斜向柔和渐变背景 + 左侧竖线圆弧效果） */
.wysiwyg-rendered :deep(blockquote) {
  margin: 1.5rem 0 !important;
  padding: 1rem 1.5rem !important;
  border-left: 4px solid var(--theme-primary) !important;
  /* 与预览页 ThemeProcessor 输出保持一致的条纹渐变 */
  background: linear-gradient(
    135deg,
    rgba(var(--theme-primary-rgb), 0.08) 0%,
    rgba(var(--theme-primary-rgb), 0.04) 50%,
    rgba(var(--theme-primary-rgb), 0.08) 100%
  ) !important;
  color: var(--theme-text-secondary) !important;
  font-style: italic !important;
  /* 关键：为整个容器添加圆角，令左侧竖线呈“括号”圆弧端点 */
  border-radius: var(--radius-md) !important;
  /* 轻微投影，接近预览页 legacy 配置的 0 4px 16px */
  box-shadow: 0 4px 16px rgba(var(--theme-primary-rgb), 0.10) !important;
  position: relative;
}

.wysiwyg-rendered :deep(blockquote blockquote) {
  margin-top: 1rem !important;
  margin-bottom: 1rem !important;
  padding-left: 1.5rem !important;
  border-left-color: var(--theme-primary) !important;
  background: linear-gradient(
    135deg,
    rgba(var(--theme-primary-rgb), 0.08) 0%,
    rgba(var(--theme-primary-rgb), 0.04) 50%,
    rgba(var(--theme-primary-rgb), 0.08) 100%
  ) !important;
  border-radius: var(--radius-md) !important;
  box-shadow: 0 2px 8px rgba(var(--theme-primary-rgb), 0.08) !important;
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

/* Math formula styles for Milkdown */
.wysiwyg-rendered :deep([data-type="math_inline"]) {
  display: inline-block;
  vertical-align: middle;
  margin: 0 0.1em;
  color: var(--theme-text-primary, inherit);
}

.wysiwyg-rendered :deep([data-type="math_block"]) {
  display: block;
  margin: 1em 0;
  text-align: center;
  overflow-x: auto;
  padding: 0.5em 0;
  color: var(--theme-text-primary, inherit);
}

.wysiwyg-rendered :deep([data-type="math_inline"]:hover),
.wysiwyg-rendered :deep([data-type="math_block"]:hover) {
  background-color: var(--theme-hover-bg, rgba(0, 0, 0, 0.03));
  border-radius: var(--radius-sm, 4px);
}

/* KaTeX error styling */
.wysiwyg-rendered :deep(.katex-error) {
  color: var(--theme-error, #dc3545);
  background: var(--theme-error-bg, rgba(220, 53, 69, 0.1));
  padding: 2px 6px;
  border-radius: var(--radius-sm, 4px);
  font-family: Consolas, Monaco, 'Courier New', monospace;
  font-size: 0.9em;
}

/* ========== Math NodeView Styles ========== */

/* Base math container */
.wysiwyg-rendered :deep(.md-math) {
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Inline math */
.wysiwyg-rendered :deep(.md-math--inline) {
  display: inline-block;
  vertical-align: middle;
  padding: 2px 4px;
  border-radius: 4px;
  margin: 0 2px;
}

.wysiwyg-rendered :deep(.md-math--inline:hover) {
  background-color: rgba(var(--theme-primary-rgb), 0.08);
}

.wysiwyg-rendered :deep(.md-math--inline.is-selected),
.wysiwyg-rendered :deep(.md-math--inline.is-editing) {
  background-color: rgba(var(--theme-primary-rgb), 0.12);
  outline: 2px solid var(--theme-primary);
  outline-offset: 1px;
}

/* Block math */
.wysiwyg-rendered :deep(.md-math--block) {
  display: block;
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--theme-border-light, #e5e7eb);
  background: var(--theme-bg-secondary, #f9fafb);
}

.wysiwyg-rendered :deep(.md-math--block:hover) {
  border-color: var(--theme-primary);
  box-shadow: 0 2px 8px rgba(var(--theme-primary-rgb), 0.1);
}

.wysiwyg-rendered :deep(.md-math--block.is-selected),
.wysiwyg-rendered :deep(.md-math--block.is-editing) {
  border-color: var(--theme-primary);
  outline: 2px solid var(--theme-primary);
  outline-offset: -2px;
}

/* Math toolbar (block only) */
.wysiwyg-rendered :deep(.md-math__toolbar) {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--theme-border-light, #e5e7eb);
}

.wysiwyg-rendered :deep(.md-math__btn) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font: inherit;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--theme-border-medium, #d1d5db);
  background: var(--theme-bg-primary, #fff);
  color: var(--theme-text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.wysiwyg-rendered :deep(.md-math__btn:hover) {
  background: var(--theme-bg-tertiary, #f3f4f6);
  border-color: var(--theme-primary);
  color: var(--theme-primary);
}

.wysiwyg-rendered :deep(.md-math__btn-icon) {
  font-size: 14px;
}

/* Preview container */
.wysiwyg-rendered :deep(.md-math__preview) {
  text-align: center;
}

.wysiwyg-rendered :deep(.md-math--inline .md-math__preview) {
  text-align: left;
  display: inline;
}

/* Source editor container - hidden by default */
.wysiwyg-rendered :deep(.md-math__source) {
  display: none;
}

.wysiwyg-rendered :deep(.md-math[data-editing="true"] .md-math__source) {
  display: block;
  margin-top: 0.5rem;
}

.wysiwyg-rendered :deep(.md-math--inline[data-editing="true"] .md-math__source) {
  display: inline-block;
  margin-top: 0;
}

.wysiwyg-rendered :deep(.md-math[data-editing="true"] .md-math__preview) {
  display: none;
}

/* Source code editor - input/textarea */
.wysiwyg-rendered :deep(.md-math__editor) {
  display: block;
  width: 100%;
  padding: 8px 12px;
  font-family: var(--theme-code-font-family, 'JetBrains Mono', Consolas, monospace);
  font-size: 14px;
  line-height: 1.5;
  color: var(--theme-text-primary);
  background: var(--theme-bg-primary, #fff);
  border: 1px solid var(--theme-border-medium, #d1d5db);
  border-radius: 6px;
  outline: none;
  resize: vertical;
  box-sizing: border-box;
}

.wysiwyg-rendered :deep(.md-math__editor:focus) {
  border-color: var(--theme-primary);
  box-shadow: 0 0 0 3px rgba(var(--theme-primary-rgb), 0.15);
}

.wysiwyg-rendered :deep(.md-math--inline .md-math__editor) {
  display: inline-block;
  width: auto;
  min-width: 120px;
  max-width: 300px;
  padding: 4px 8px;
  resize: none;
}

/* Textarea specific */
.wysiwyg-rendered :deep(textarea.md-math__editor) {
  min-height: 60px;
}

/* Empty state */
.wysiwyg-rendered :deep(.md-math__empty) {
  color: var(--theme-text-tertiary, #9ca3af);
  font-style: italic;
  font-size: 14px;
}

/* Error state */
.wysiwyg-rendered :deep(.md-math__error) {
  color: var(--theme-error, #dc3545);
  background: var(--theme-error-bg, rgba(220, 53, 69, 0.1));
  padding: 4px 8px;
  border-radius: 4px;
  font-family: var(--theme-code-font-family, monospace);
  font-size: 12px;
  display: block;
  white-space: pre-wrap;
}

/* Edit hint tooltip */
.wysiwyg-rendered :deep(.md-math--inline::after) {
  content: '点击编辑';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  font-size: 11px;
  color: white;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
  z-index: 10;
}

.wysiwyg-rendered :deep(.md-math--inline:hover::after) {
  opacity: 1;
}

.wysiwyg-rendered :deep(.md-math--inline.is-editing::after) {
  content: 'ESC 退出';
}

/* ========== Table Selection Styles ========== */
.wysiwyg-rendered :deep(.selectedCell) {
  position: relative;
}

.wysiwyg-rendered :deep(.selectedCell::after) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(var(--theme-primary-rgb), 0.15);
  pointer-events: none;
}

/* Column resize handle */
.wysiwyg-rendered :deep(.column-resize-handle) {
  position: absolute;
  right: -2px;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: var(--theme-primary);
  cursor: col-resize;
  z-index: 20;
}

/* Table hover effect */
.wysiwyg-rendered :deep(table) {
  position: relative;
}

.wysiwyg-rendered :deep(table:hover) {
  box-shadow: 0 0 0 2px rgba(var(--theme-primary-rgb), 0.2);
}

/* Improve table cell editing */
.wysiwyg-rendered :deep(td),
.wysiwyg-rendered :deep(th) {
  position: relative;
  min-width: 50px;
}

.wysiwyg-rendered :deep(td:focus-within),
.wysiwyg-rendered :deep(th:focus-within) {
  outline: 2px solid var(--theme-primary);
  outline-offset: -2px;
}
</style>

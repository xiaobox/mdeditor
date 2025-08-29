// Mermaid NodeView for Milkdown WYSIWYG
// - Intercepts code_block with language="mermaid"
// - Lazy-loads mermaid and renders SVG in preview mode
// - Supports toggle between preview (SVG) and source (editable)

import { Plugin, TextSelection } from '@milkdown/prose/state'
import { $prose } from '@milkdown/utils'

let mermaidMod = null
const loadMermaid = async () => {
  if (!mermaidMod) {
    const mod = await import('mermaid')
    mermaidMod = mod.default || mod
    mermaidMod.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'default',
    })
  }
  return mermaidMod
}

const getCode = (node) => node.textContent || ''
const isMermaidBlock = (node) => {
  const lang = (node?.attrs?.language ?? node?.attrs?.lang ?? '').toString().toLowerCase()
  return node?.type?.name === 'code_block' && lang === 'mermaid'
}

class MermaidNodeView {
  constructor(node, view, getPos) {
    this.node = node
    this.view = view
    this.getPos = getPos

    this.dom = document.createElement('div')
    this.dom.className = 'md-mermaid'

    this.toolbar = document.createElement('div')
    this.toolbar.className = 'md-mermaid__toolbar'
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'md-mermaid__btn'
    btn.textContent = '编辑源码/预览'
    btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); this.toggle() })
    this.toolbar.appendChild(btn)

    this.svgContainer = document.createElement('div')
    this.svgContainer.className = 'md-mermaid__svg'

    const pre = document.createElement('pre')
    pre.className = 'md-mermaid__source'
    this.contentDOM = document.createElement('code')
    pre.appendChild(this.contentDOM)

    this.dom.appendChild(this.toolbar)
    this.dom.appendChild(this.svgContainer)
    this.dom.appendChild(pre)
    // Capture all mouse interactions at root to prevent PM selection when toggling
    this.dom.addEventListener('mousedown', (e) => {
      if (this.toolbar.contains(e.target) || this.svgContainer.contains(e.target)) {
        e.preventDefault(); e.stopPropagation()
      }
    })


    this.editing = false
    this.lastCode = ''
    this.rafId = null

    // Initial: preview
    this.setEditing(false)
    this.renderIfNeeded()

    // UX: double click to edit, ESC to exit edit
    // Also capture click on toolbar button again at bubble phase just in case
    this.toolbar.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation() })

    this.dom.addEventListener('dblclick', (e) => {
      e.preventDefault(); e.stopPropagation();
      this.setEditing(true)
    })
    this.dom.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.editing) {
        e.preventDefault(); e.stopPropagation();
        this.setEditing(false)
      }
    })
  }

  selectNode() {
    this.dom.classList.add('is-selected')
  }

  deselectNode() { this.dom.classList.remove('is-selected') }

  setEditing(v) {
    this.editing = v
    if (v) this.dom.setAttribute('data-editing', 'true')
    else this.dom.removeAttribute('data-editing')
    // Do NOT toggle contenteditable; let ProseMirror manage it. Use CSS + stopEvent to control modes.
    if (v) this._focusInto()
    if (!v) this.renderIfNeeded()
  }


  _focusInto() {
    const { state, dispatch } = this.view
    const basePos = typeof this.getPos === 'function' ? this.getPos() : null
    if (basePos != null) {
      try {
        const inside = Math.min(state.doc.content.size - 1, basePos + 1)
        const $pos = state.doc.resolve(inside)
        dispatch(state.tr.setSelection(TextSelection.create(state.doc, inside)).scrollIntoView())
      } catch {}
    }
    this.view.focus()
  }



  toggle() {
    this.setEditing(!this.editing)
    if (!this.editing) this.renderIfNeeded()
  }

  update(node) {
    if (!isMermaidBlock(node)) return false
    this.node = node
    if (!this.editing) this.renderIfNeeded()
    return true
  }

  ignoreMutation(m) {
    // Ignore our own attribute toggles (data-editing) on the root
    if (m.type === 'attributes' && m.target === this.dom) return true
    // Ignore selection changes triggered around the node view
    if (m.type === 'selection') return true
    // Always ignore toolbar and preview SVG internal mutations
    if (this.toolbar && this.toolbar.contains(m.target)) return true
    if (this.svgContainer && this.svgContainer.contains(m.target)) return true
    // Allow ProseMirror to handle mutations inside contentDOM (editing source)
    if (this.contentDOM && this.contentDOM.contains(m.target)) return false
    // Default: ignore
    return true
  }

  stopEvent(e) {
    const t = e.target
    // Block toolbar interactions from reaching ProseMirror
    if (this.toolbar && this.toolbar.contains(t)) return true
    // In preview mode, block interactions within SVG area to avoid selection resets
    if (!this.editing && this.svgContainer && this.svgContainer.contains(t)) return true
    return false
  }

  destroy() {
    if (this.rafId != null) cancelAnimationFrame(this.rafId)
  }

  renderIfNeeded() {
    const code = getCode(this.node)
    if (code === this.lastCode) return
    this.lastCode = code
    if (!code.trim()) {
      this.svgContainer.innerHTML = '<div class="md-mermaid__empty">空的 mermaid 代码块</div>'
      return
    }
    if (this.rafId != null) cancelAnimationFrame(this.rafId)
    this.rafId = requestAnimationFrame(async () => {
      const mermaid = await loadMermaid()
      const id = `mmd-${Math.random().toString(36).slice(2)}`
      try {
        const { svg } = await mermaid.render(id, code)
        this.svgContainer.innerHTML = svg
      } catch (err) {
        // 使用 DOM API 防止注入：不将错误内容作为 HTML 注入
        const pre = document.createElement('pre')
        pre.className = 'md-mermaid__error'
        pre.textContent = String(err)
        this.svgContainer.innerHTML = ''
        this.svgContainer.appendChild(pre)
      }
    })
  }
}

export const mermaidNodeViewPlugin = $prose(() => {
  return new Plugin({
    props: {
      nodeViews: {
        code_block: (node, view, getPos) => {
          if (!isMermaidBlock(node)) return null // Fallback to other views/default
          return new MermaidNodeView(node, view, getPos)
        },
      },
    },
  })
})


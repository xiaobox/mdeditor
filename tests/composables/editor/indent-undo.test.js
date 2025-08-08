/**
 * @file tests/composables/editor/indent-undo.test.js
 * @description 集成最小化 CodeMirror，测试 Tab/Shift-Tab 缩进与撤销/重做
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import { indentUnit, indentOnInput } from '@codemirror/language'
import { keymap } from '@codemirror/view'
import { indentMore, indentLess, undo, redo } from '@codemirror/commands'

function createEditorWithDoc(doc = '', unit = '  ') {
  const parent = document.createElement('div')
  parent.id = 'root-' + Math.random().toString(36).slice(2)
  document.body.appendChild(parent)

  const state = EditorState.create({
    doc,
    extensions: [
      basicSetup,
      markdown(),
      indentUnit.of(unit),
      indentOnInput(),
      keymap.of([
        { key: 'Tab', run: indentMore },
        { key: 'Shift-Tab', run: indentLess }
      ])
    ]
  })

  const view = new EditorView({ state, parent })
  return { view, parent }
}

describe('CodeMirror 缩进与撤销/重做', () => {
  let ctx
  beforeEach(() => {
    ctx = createEditorWithDoc('line1\nline2')
  })
  afterEach(() => {
    ctx.view.destroy()
    ctx.parent.remove()
  })

  it('Tab 应在行前插入两个空格缩进', () => {
    const { view } = ctx
    const posStartSecondLine = view.state.doc.line(2).from
    view.dispatch({ selection: { anchor: posStartSecondLine } })
    indentMore(view)
    const line2 = view.state.doc.line(2).text
    expect(line2.startsWith('  ')).toBe(true)
  })

  it('Shift-Tab 应减少缩进', () => {
    const { view } = ctx
    const posStartSecondLine = view.state.doc.line(2).from
    view.dispatch({ selection: { anchor: posStartSecondLine } })
    indentMore(view)
    indentLess(view)
    const line2 = view.state.doc.line(2).text
    expect(line2.startsWith('  ')).toBe(false)
  })

  it('撤销/重做应恢复缩进行为', () => {
    const { view } = ctx
    const pos = view.state.doc.line(1).from
    view.dispatch({ selection: { anchor: pos } })
    indentMore(view)
    const afterIndent = view.state.doc.line(1).text
    undo(view)
    const afterUndo = view.state.doc.line(1).text
    expect(afterUndo.length <= afterIndent.length).toBe(true)
    redo(view)
    const afterRedo = view.state.doc.line(1).text
    expect(afterRedo).toBe(afterIndent)
  })

  it('多行选区 Tab 应为每行添加两个空格', () => {
    const { view } = ctx
    const l1 = view.state.doc.line(1)
    const l2 = view.state.doc.line(2)
    view.dispatch({ selection: { anchor: l1.from, head: l2.to } })
    indentMore(view)
    expect(view.state.doc.line(1).text.startsWith('  ')).toBe(true)
    expect(view.state.doc.line(2).text.startsWith('  ')).toBe(true)
  })

  it('无缩进时 Shift-Tab 不应产生负缩进', () => {
    const { view } = ctx
    const pos = view.state.doc.line(1).from
    view.dispatch({ selection: { anchor: pos } })
    indentLess(view)
    expect(view.state.doc.line(1).text.startsWith(' ')).toBe(false)
  })

  it('当缩进宽度为四个空格时，Tab 应插入四个空格', () => {
    const next = createEditorWithDoc('x', '    ')
    const { view, parent } = next
    const pos = view.state.doc.line(1).from
    view.dispatch({ selection: { anchor: pos } })
    indentMore(view)
    expect(view.state.doc.line(1).text.startsWith('    ')).toBe(true)
    view.destroy(); parent.remove()
  })
})


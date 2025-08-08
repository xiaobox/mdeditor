/**
 * @file tests/composables/useClipboard.test.js
 * @description useClipboard 复制流程与选项控制测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useClipboard } from '../../src/composables/useClipboard.js'

vi.mock('../../src/composables/index.js', () => ({
  useGlobalThemeManager: () => ({
    currentColorTheme: { value: { background: '#fff', textPrimary: '#000' } },
    currentCodeStyle: { value: { name: 'github' } },
    currentThemeSystem: { value: { mode: 'light' } },
    currentFontSettings: { value: { fontSize: 16, lineHeight: '1.6' } },
  })
}))

vi.mock('../../src/core/editor/copy-formats.js', () => ({
  getCopyFormatOptions: () => ([
    { label: '社交格式', value: 'social' },
    { label: 'Markdown', value: 'markdown' },
  ]),
  copySocialFormat: vi.fn(async (content) => ({ success: !!content.trim(), message: !!content.trim() ? '复制成功' : '内容为空' })),
  copyMarkdownFormat: vi.fn(async (content) => ({ success: !!content.trim(), message: !!content.trim() ? '复制成功' : '内容为空' })),
}))

describe('useClipboard', () => {
  const origRAF = global.requestAnimationFrame

  beforeEach(() => {
    vi.useFakeTimers()
    // 强制使用基于 setTimeout 的 raf，便于用 fake timers 驱动
    global.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16)
    // 清理 localStorage
    localStorage.clear()
  })

  afterEach(() => {
    // 还原 raf 与计时器
    if (origRAF) global.requestAnimationFrame = origRAF
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('空内容时应提示，请先编辑内容', async () => {
    const notify = vi.fn()
    const { handleCopyFormatSelect } = useClipboard({ onNotify: notify, getContent: () => '   ' })
    await handleCopyFormatSelect({ value: 'social' })
    // flush 异步通知
    await vi.runAllTimersAsync()
    expect(notify).toHaveBeenCalledWith('请先编辑内容', 'warning')
  })

  it('reloadCopyFormatOptions 会在当前选中值不在新列表时重置', () => {
    const { copyFormatOptions, selectedCopyFormat, reloadCopyFormatOptions, setSelectedCopyFormat } = useClipboard()
    // 人为设置为一个不存在的值
    setSelectedCopyFormat({ label: 'X', value: 'x' })
    reloadCopyFormatOptions()
    expect(selectedCopyFormat.value.value).toBe(copyFormatOptions.value[0].value)
  })

  it('getCurrentEffectiveTheme 优先使用临时主题', async () => {
    const { getCurrentEffectiveTheme } = useClipboard()
    localStorage.setItem('temp-custom-theme', JSON.stringify({ background: '#000' }))
    expect(getCurrentEffectiveTheme()).toEqual({ background: '#000' })
  })
})


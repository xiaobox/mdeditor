/**
 * @file tests/composables/useExport.test.js
 * @description useExport 导出流程与选项控制测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../../src/composables/index.js', () => ({
  useGlobalThemeManager: () => ({
    currentColorTheme: { value: { primary: '#a0522d', background: '#fff' } },
    currentCodeStyle: { value: { name: 'github' } },
    currentThemeSystem: { value: { mode: 'light' } },
    currentFontSettings: { value: { fontSize: 16, lineHeight: '1.6' } }
  })
}))

vi.mock('../../src/core/editor/export-formats.js', () => ({
  getExportFormatOptions: () => ([
    { label: '导出 PDF', value: 'pdf' },
    { label: '导出图片', value: 'image' }
  ]),
  exportAsImage: vi.fn(async (content) => ({
    success: !!content.trim(),
    message: content.trim() ? '图片已开始下载' : '请先编辑内容'
  })),
  exportAsPdf: vi.fn(async (content) => ({
    success: !!content.trim(),
    message: content.trim() ? 'PDF 已开始下载' : '请先编辑内容'
  }))
}))

import { useExport } from '../../src/composables/useExport.js'
import { exportAsImage, exportAsPdf } from '../../src/core/editor/export-formats.js'

describe('useExport', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('空内容时应提示请先编辑内容', async () => {
    const notify = vi.fn()
    const { handleExportFormatSelect } = useExport({
      onNotify: notify,
      getContent: () => '   '
    })
    await handleExportFormatSelect({ value: 'image' })
    await vi.runAllTimersAsync()
    expect(notify).toHaveBeenCalledWith('请先编辑内容', 'warning')
  })

  it('getContent 返回空字符串时应提示', async () => {
    const notify = vi.fn()
    const { handleExportFormatSelect } = useExport({
      onNotify: notify,
      getContent: () => ''
    })
    await handleExportFormatSelect({ value: 'pdf' })
    await vi.runAllTimersAsync()
    expect(notify).toHaveBeenCalledWith('请先编辑内容', 'warning')
  })

  it('选择 image 格式应调用 exportAsImage', async () => {
    const notify = vi.fn()
    const { handleExportFormatSelect } = useExport({
      onNotify: notify,
      getContent: () => '# Hello'
    })
    await handleExportFormatSelect({ value: 'image' })
    await vi.runAllTimersAsync()
    expect(exportAsImage).toHaveBeenCalledWith('# Hello', expect.objectContaining({
      theme: expect.any(Object),
      codeTheme: expect.any(Object)
    }))
    expect(notify).toHaveBeenCalledWith('图片已开始下载', 'success')
  })

  it('选择 pdf 格式应调用 exportAsPdf', async () => {
    const notify = vi.fn()
    const { handleExportFormatSelect } = useExport({
      onNotify: notify,
      getContent: () => '# Hello'
    })
    await handleExportFormatSelect({ value: 'pdf' })
    await vi.runAllTimersAsync()
    expect(exportAsPdf).toHaveBeenCalledWith('# Hello', expect.objectContaining({
      theme: expect.any(Object),
      codeTheme: expect.any(Object)
    }))
    expect(notify).toHaveBeenCalledWith('PDF 已开始下载', 'success')
  })

  it('传入字符串格式值应正常工作', async () => {
    const notify = vi.fn()
    const { handleExportFormatSelect } = useExport({
      onNotify: notify,
      getContent: () => '# Hello'
    })
    await handleExportFormatSelect('image')
    await vi.runAllTimersAsync()
    expect(exportAsImage).toHaveBeenCalled()
  })

  it('未知格式应提示错误', async () => {
    const notify = vi.fn()
    const { handleExportFormatSelect } = useExport({
      onNotify: notify,
      getContent: () => '# Hello'
    })
    await handleExportFormatSelect({ value: 'unknown' })
    await vi.runAllTimersAsync()
    expect(notify).toHaveBeenCalledWith('未知的导出格式', 'error')
  })

  it('导出完成后 isExporting 应恢复为 false', async () => {
    const { handleExportFormatSelect, isExporting } = useExport({
      onNotify: vi.fn(),
      getContent: () => '# Hello'
    })
    expect(isExporting.value).toBe(false)
    await handleExportFormatSelect({ value: 'image' })
    expect(isExporting.value).toBe(false)
  })

  it('导出期间重复调用应被忽略', async () => {
    const { handleExportFormatSelect, isExporting } = useExport({
      onNotify: vi.fn(),
      getContent: () => '# Hello'
    })

    // 让 exportAsImage 挂起
    let resolveExport
    exportAsImage.mockImplementationOnce(() => new Promise(r => { resolveExport = r }))

    const p = handleExportFormatSelect({ value: 'image' })
    // isExporting 应为 true
    expect(isExporting.value).toBe(true)

    // 再次调用应被忽略
    await handleExportFormatSelect({ value: 'image' })
    expect(exportAsImage).toHaveBeenCalledTimes(1)

    // 完成导出
    resolveExport({ success: true, message: 'ok' })
    await p
    expect(isExporting.value).toBe(false)
  })

  it('exportFormatOptions 应包含 pdf 和 image 选项', () => {
    const { exportFormatOptions } = useExport({
      onNotify: vi.fn(),
      getContent: () => ''
    })
    expect(exportFormatOptions.value).toHaveLength(2)
    expect(exportFormatOptions.value.find(o => o.value === 'pdf')).toBeTruthy()
    expect(exportFormatOptions.value.find(o => o.value === 'image')).toBeTruthy()
  })

  it('导出失败时应通知 error', async () => {
    exportAsImage.mockRejectedValueOnce(new Error('网络异常'))
    const notify = vi.fn()
    const { handleExportFormatSelect } = useExport({
      onNotify: notify,
      getContent: () => '# Hello'
    })
    await handleExportFormatSelect({ value: 'image' })
    await vi.runAllTimersAsync()
    expect(notify).toHaveBeenCalledWith(expect.stringContaining('网络异常'), 'error')
  })

  it('getCurrentEffectiveTheme 优先使用临时主题', async () => {
    localStorage.setItem('temp-custom-theme', JSON.stringify({ primary: '#000' }))
    const notify = vi.fn()
    const { handleExportFormatSelect } = useExport({
      onNotify: notify,
      getContent: () => '# Hello'
    })
    await handleExportFormatSelect({ value: 'image' })
    expect(exportAsImage).toHaveBeenCalledWith('# Hello', expect.objectContaining({
      theme: { primary: '#000' }
    }))
  })

  it('null 格式值应被忽略', async () => {
    const notify = vi.fn()
    const { handleExportFormatSelect } = useExport({
      onNotify: notify,
      getContent: () => '# Hello'
    })
    await handleExportFormatSelect({ value: null })
    expect(exportAsImage).not.toHaveBeenCalled()
    expect(exportAsPdf).not.toHaveBeenCalled()
    expect(notify).not.toHaveBeenCalled()
  })
})

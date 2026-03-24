/**
 * @file tests/core/editor/export-formats.test.js
 * @description 导出格式逻辑（PDF / 图片）测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// 模拟 html2canvas
const mockCanvas = {
  width: 800,
  height: 1200,
  toBlob: vi.fn((cb) => cb(new Blob(['PNG'], { type: 'image/png' }))),
  toDataURL: vi.fn(() => 'data:image/jpeg;base64,mock'),
  getContext: vi.fn(() => ({
    fillStyle: '',
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    clearRect: vi.fn()
  }))
}

vi.mock('html2canvas', () => ({
  default: vi.fn(async () => mockCanvas)
}))

// 模拟 jsPDF
const mockPdf = {
  addPage: vi.fn(),
  addImage: vi.fn(),
  output: vi.fn(() => new Blob(['PDF'], { type: 'application/pdf' }))
}

vi.mock('jspdf', () => ({
  jsPDF: vi.fn(() => mockPdf)
}))

// 模拟 copy-formats 管道
vi.mock('../../../src/core/editor/copy-formats.js', () => ({
  generateSocialHtml: vi.fn((text) => `<p>${text}</p>`),
  renderMermaidInContainer: vi.fn(async () => {}),
  rasterizeMermaidSvgs: vi.fn(async () => {})
}))

// 模拟数学公式处理
vi.mock('../../../src/core/markdown/math/image-converter.js', () => ({
  solveMathForWeChat: vi.fn()
}))

import { exportAsImage, exportAsPdf, getExportFormatOptions } from '../../../src/core/editor/export-formats.js'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { generateSocialHtml, renderMermaidInContainer, rasterizeMermaidSvgs } from '../../../src/core/editor/copy-formats.js'
import { solveMathForWeChat } from '../../../src/core/markdown/math/image-converter.js'

describe('exportAsImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 确保 URL.createObjectURL / revokeObjectURL 可用
    if (!global.URL.createObjectURL) {
      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    }
    if (!global.URL.revokeObjectURL) {
      global.URL.revokeObjectURL = vi.fn()
    }
  })

  it('空内容应返回失败', async () => {
    const r = await exportAsImage('')
    expect(r.success).toBe(false)
    expect(r.message).toContain('编辑内容')
  })

  it('仅空白内容应返回失败', async () => {
    const r = await exportAsImage('   ')
    expect(r.success).toBe(false)
  })

  it('null 内容应返回失败', async () => {
    const r = await exportAsImage(null)
    expect(r.success).toBe(false)
  })

  it('正常内容应调用社交 HTML 管道生成容器', async () => {
    await exportAsImage('# Hello')
    expect(generateSocialHtml).toHaveBeenCalledWith('# Hello', expect.any(Object))
  })

  it('应依次调用 Mermaid 渲染与栅格化', async () => {
    await exportAsImage('# Hello')
    expect(renderMermaidInContainer).toHaveBeenCalled()
    expect(rasterizeMermaidSvgs).toHaveBeenCalled()
  })

  it('应调用数学公式处理', async () => {
    await exportAsImage('# Hello')
    expect(solveMathForWeChat).toHaveBeenCalled()
  })

  it('应调用 html2canvas 截取容器', async () => {
    await exportAsImage('# Hello')
    expect(html2canvas).toHaveBeenCalled()
  })

  it('正常导出应返回成功', async () => {
    const r = await exportAsImage('# Hello')
    expect(r.success).toBe(true)
    expect(r.message).toContain('下载')
  })

  it('导出完成后应清理离屏容器', async () => {
    const removeSpy = vi.spyOn(document.body, 'removeChild')
    await exportAsImage('# Hello')
    expect(removeSpy).toHaveBeenCalled()
    removeSpy.mockRestore()
  })

  it('canvas.toBlob 返回 null 时应返回失败', async () => {
    mockCanvas.toBlob.mockImplementationOnce((cb) => cb(null))
    const r = await exportAsImage('# Hello')
    expect(r.success).toBe(false)
    expect(r.message).toContain('生成失败')
  })

  it('html2canvas 抛异常时应返回失败并清理容器', async () => {
    html2canvas.mockRejectedValueOnce(new Error('render failed'))
    const removeSpy = vi.spyOn(document.body, 'removeChild')
    const r = await exportAsImage('# Hello')
    expect(r.success).toBe(false)
    expect(r.message).toContain('render failed')
    expect(removeSpy).toHaveBeenCalled()
    removeSpy.mockRestore()
  })

  it('应传递主题配置给 generateSocialHtml', async () => {
    const opts = { theme: { primary: '#ff0000' }, codeTheme: { name: 'github' } }
    await exportAsImage('# Hello', opts)
    expect(generateSocialHtml).toHaveBeenCalledWith('# Hello', opts)
  })
})

describe('exportAsPdf', () => {
  let origCreateElement

  beforeEach(() => {
    vi.clearAllMocks()
    if (!global.URL.createObjectURL) {
      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    }
    if (!global.URL.revokeObjectURL) {
      global.URL.revokeObjectURL = vi.fn()
    }
    // jsdom 不支持 canvas.getContext，需要 mock createElement('canvas')
    origCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: vi.fn(() => ({
            fillStyle: '',
            fillRect: vi.fn(),
            drawImage: vi.fn(),
            clearRect: vi.fn()
          })),
          toDataURL: vi.fn(() => 'data:image/jpeg;base64,mock')
        }
      }
      return origCreateElement(tag)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('空内容应返回失败', async () => {
    const r = await exportAsPdf('')
    expect(r.success).toBe(false)
    expect(r.message).toContain('编辑内容')
  })

  it('仅空白内容应返回失败', async () => {
    const r = await exportAsPdf('   ')
    expect(r.success).toBe(false)
  })

  it('正常内容应调用社交 HTML 管道', async () => {
    await exportAsPdf('# Hello')
    expect(generateSocialHtml).toHaveBeenCalled()
    expect(renderMermaidInContainer).toHaveBeenCalled()
  })

  it('应创建 A4 格式的 jsPDF 实例', async () => {
    await exportAsPdf('# Hello')
    expect(jsPDF).toHaveBeenCalledWith(expect.objectContaining({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    }))
  })

  it('应调用 addImage 添加页面内容', async () => {
    await exportAsPdf('# Hello')
    expect(mockPdf.addImage).toHaveBeenCalled()
  })

  it('正常导出应返回成功', async () => {
    const r = await exportAsPdf('# Hello')
    expect(r.success).toBe(true)
    expect(r.message).toContain('下载')
  })

  it('导出完成后应清理离屏容器', async () => {
    const removeSpy = vi.spyOn(document.body, 'removeChild')
    await exportAsPdf('# Hello')
    expect(removeSpy).toHaveBeenCalled()
    removeSpy.mockRestore()
  })

  it('html2canvas 抛异常时应返回失败并清理容器', async () => {
    html2canvas.mockRejectedValueOnce(new Error('render failed'))
    const removeSpy = vi.spyOn(document.body, 'removeChild')
    const r = await exportAsPdf('# Hello')
    expect(r.success).toBe(false)
    expect(r.message).toContain('render failed')
    expect(removeSpy).toHaveBeenCalled()
    removeSpy.mockRestore()
  })

  it('内容较长时应生成多页 PDF', async () => {
    // 模拟很高的 canvas（会生成多页）
    const origHeight = mockCanvas.height
    mockCanvas.height = 10000
    await exportAsPdf('# Long content')
    expect(mockPdf.addPage).toHaveBeenCalled()
    mockCanvas.height = origHeight
  })
})

describe('getExportFormatOptions', () => {
  it('应返回包含 pdf 和 image 两项', () => {
    const opts = getExportFormatOptions()
    expect(opts).toHaveLength(2)
    expect(opts.find(o => o.value === 'pdf')).toBeTruthy()
    expect(opts.find(o => o.value === 'image')).toBeTruthy()
  })

  it('每项应包含 label、icon、viewBox', () => {
    const opts = getExportFormatOptions()
    for (const opt of opts) {
      expect(opt.label).toBeTruthy()
      expect(opt.icon).toBeTruthy()
      expect(opt.viewBox).toBe('0 0 24 24')
    }
  })
})

describe('fixUnsupportedCssForCapture', () => {
  it('应将 background-clip:text 元素转为普通颜色', async () => {
    // 通过 exportAsImage 间接测试 fixUnsupportedCssForCapture
    // generateSocialHtml 返回包含 background-clip:text 的 H1
    const { generateSocialHtml: mockGen } = await import('../../../src/core/editor/copy-formats.js')
    mockGen.mockReturnValueOnce(
      '<h1 style="background: linear-gradient(135deg, #a0522d, #8b4513); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Title</h1>'
    )

    // 在 html2canvas 回调中检查容器
    html2canvas.mockImplementationOnce(async (container) => {
      const h1 = container.querySelector('h1')
      // fixUnsupportedCssForCapture 应已清理 background-clip
      expect(h1.style.backgroundClip).not.toBe('text')
      expect(h1.style.background).toBe('none')
      return mockCanvas
    })

    await exportAsImage('# Title', { theme: { primary: '#a0522d' } })
  })
})

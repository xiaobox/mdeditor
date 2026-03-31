/**
 * @file src/core/editor/export-formats.js
 * @description 导出功能 - 支持 PDF 和图片格式
 *
 * 复用社交格式 HTML 管道（内联样式 + Mermaid 渲染 + 公式处理），
 * 确保导出效果与预览一致。
 *
 * 纯前端方案：
 * - 图片导出：生成内联样式 HTML → html2canvas 截取 → PNG 下载
 * - PDF 导出：同上 → jsPDF 分页生成 PDF 下载
 */

/**
 * 延迟加载导出依赖 (html2canvas + jsPDF)
 * 仅在用户触发导出操作时加载，节省 ~580KB 首屏体积
 */
let _html2canvas = null
let _jsPDF = null

async function getHtml2Canvas() {
  if (!_html2canvas) {
    const mod = await import('html2canvas')
    _html2canvas = mod.default || mod
  }
  return _html2canvas
}

async function getJsPDF() {
  if (!_jsPDF) {
    const mod = await import('jspdf')
    _jsPDF = mod.jsPDF || mod.default
  }
  return _jsPDF
}

import { i18n } from '../../plugins/i18n.js'
import { generateSocialHtml, renderMermaidInContainer, rasterizeMermaidSvgs } from './copy-formats.js'
import { DOMUtils } from '../../shared/utils/dom.js'
import { solveMathForWeChat } from '../markdown/math/image-converter.js'

/** 导出容器宽度 (px)，模拟预览宽度 */
const EXPORT_WIDTH = 750

/**
 * 生成文件名（不含扩展名）
 * @returns {string}
 */
function generateFilename() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}`
  return `markdown-export-${date}-${time}`
}

/**
 * 触发浏览器下载
 * @param {Blob} blob - 文件内容
 * @param {string} filename - 文件名
 */
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * 修复 html2canvas 不支持的 CSS 特性
 * - background-clip: text（渐变文字效果）→ 转为普通 color
 * @param {HTMLElement} container - 导出容器
 * @param {Object} options - 包含 theme 的选项
 */
function fixUnsupportedCssForCapture(container, options = {}) {
  const primaryColor = options.theme?.primary || '#333333'

  container.querySelectorAll('*').forEach(el => {
    const style = el.style
    // html2canvas 不支持 background-clip: text，会把渐变当作背景色渲染
    // 检测 inline style 或 computed style
    if (
      style.backgroundClip === 'text' ||
      style.webkitBackgroundClip === 'text'
    ) {
      style.background = 'none'
      style.backgroundClip = ''
      style.webkitBackgroundClip = ''
      style.webkitTextFillColor = ''
      style.color = primaryColor
    }
  })
}

/**
 * 构建用于导出的离屏容器：
 * 1. 生成带内联样式的 HTML（与复制到公众号一致）
 * 2. 渲染 Mermaid 图表并转为 PNG
 * 3. 处理数学公式
 *
 * @param {string} markdownText - 原始 Markdown 文本
 * @param {Object} options - 主题/字体配置
 * @returns {Promise<HTMLElement>} 渲染好的离屏容器（调用方负责移除）
 */
async function buildExportContainer(markdownText, options = {}) {
  // 1. 生成带内联样式的 HTML
  const socialHtml = generateSocialHtml(markdownText, options)

  // 2. 创建可见的离屏容器（html2canvas 需要元素可见才能正确渲染）
  const container = document.createElement('div')
  container.innerHTML = socialHtml
  Object.assign(container.style, {
    position: 'fixed',
    left: '-99999px',
    top: '0',
    width: `${EXPORT_WIDTH}px`,
    padding: '40px 50px',
    background: '#ffffff',
    zIndex: '-1',
    // 不设置 visibility:hidden / opacity:0，html2canvas 需要元素"可见"
    overflow: 'visible',
    fontFamily: '"Microsoft YaHei", "微软雅黑", "PingFang SC", "Hiragino Sans GB", Arial, sans-serif',
    fontSize: '15px',
    lineHeight: '1.8',
    color: '#333333',
    boxSizing: 'border-box'
  })
  document.body.appendChild(container)

  // 3. 渲染 Mermaid 并栅格化为 PNG
  await renderMermaidInContainer(container)
  await rasterizeMermaidSvgs(container, 2)

  // 4. 处理数学公式
  solveMathForWeChat(container)

  // 5. 修复 html2canvas 不支持的 CSS 特性
  fixUnsupportedCssForCapture(container, options)

  return container
}

/**
 * 使用 html2canvas 截取离屏容器
 * @param {HTMLElement} container - 离屏容器
 * @param {number} scale - 缩放倍率
 * @returns {Promise<HTMLCanvasElement>}
 */
async function captureContainer(container, scale = 2) {
  const html2canvas = await getHtml2Canvas()
  return html2canvas(container, {
    scale,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    scrollX: 0,
    scrollY: 0,
    width: container.scrollWidth,
    windowWidth: container.scrollWidth
  })
}

/**
 * 导出为图片 (PNG)
 * @param {string} markdownText - Markdown 文本
 * @param {Object} options - 主题配置
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function exportAsImage(markdownText, options = {}) {
  if (!markdownText || !markdownText.trim()) {
    return { success: false, message: '请先编辑内容' }
  }

  let container = null
  try {
    container = await buildExportContainer(markdownText, options)
    const canvas = await captureContainer(container)
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png', 1.0)
    })

    if (!blob) {
      return { success: false, message: '图片生成失败' }
    }

    triggerDownload(blob, `${generateFilename()}.png`)
    return { success: true, message: '图片已开始下载' }
  } catch (error) {
    console.error('导出图片失败:', error)
    return { success: false, message: `导出失败: ${error.message}` }
  } finally {
    if (container) DOMUtils.safeRemove(container)
  }
}

/**
 * 导出为 PDF
 * @param {string} markdownText - Markdown 文本
 * @param {Object} options - 主题配置
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function exportAsPdf(markdownText, options = {}) {
  if (!markdownText || !markdownText.trim()) {
    return { success: false, message: '请先编辑内容' }
  }

  let container = null
  try {
    container = await buildExportContainer(markdownText, options)
    const canvas = await captureContainer(container)

    // A4 尺寸 (mm)
    const a4Width = 210
    const a4Height = 297
    const margin = 10

    const contentWidth = a4Width - margin * 2
    const contentHeight = a4Height - margin * 2

    const imgWidth = contentWidth
    const imgHeight = (canvas.height * contentWidth) / canvas.width

    const pageHeight = contentHeight
    const totalPages = Math.ceil(imgHeight / pageHeight)

    const jsPDF = await getJsPDF()
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) pdf.addPage()

      const sourceY = (page * pageHeight / imgHeight) * canvas.height
      const sourceHeight = Math.min(
        (pageHeight / imgHeight) * canvas.height,
        canvas.height - sourceY
      )

      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = canvas.width
      pageCanvas.height = sourceHeight

      const ctx = pageCanvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
      ctx.drawImage(
        canvas,
        0, sourceY, canvas.width, sourceHeight,
        0, 0, pageCanvas.width, sourceHeight
      )

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95)
      const currentPageImgHeight = (sourceHeight * contentWidth) / canvas.width

      pdf.addImage(pageImgData, 'JPEG', margin, margin, imgWidth, currentPageImgHeight)
    }

    const blob = pdf.output('blob')
    triggerDownload(blob, `${generateFilename()}.pdf`)
    return { success: true, message: 'PDF 已开始下载' }
  } catch (error) {
    console.error('导出 PDF 失败:', error)
    return { success: false, message: `导出失败: ${error.message}` }
  } finally {
    if (container) DOMUtils.safeRemove(container)
  }
}

/**
 * 获取所有可用的导出格式选项
 * @returns {Array} 格式选项数组
 */
export function getExportFormatOptions() {
  const t = (key) => (i18n && i18n.global && i18n.global.t ? i18n.global.t(key) : key)
  return [
    {
      value: 'pdf',
      label: t('exportFormat.pdf'),
      icon: 'M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10.92,12.31C10.68,11.54 10.15,9.08 11.55,9.04C12.95,9 12.03,12.16 12.03,12.16C12.42,13.65 14.05,14.72 14.05,14.72C14.55,14.57 17.4,14.24 17,15.72C16.57,17.2 13.5,15.81 13.5,15.81C11.55,15.95 10.09,16.47 10.09,16.47C8.96,18.58 7.64,19.5 7.1,18.61C6.43,17.5 9.23,16.07 9.23,16.07C10.68,13.72 10.92,12.31 10.92,12.31Z',
      viewBox: '0 0 24 24'
    },
    {
      value: 'image',
      label: t('exportFormat.image'),
      icon: 'M5,3A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3H5M5,5H19V19H5V5M6,17L10,13L12,15.5L15,11L19,17H6Z',
      viewBox: '0 0 24 24'
    }
  ]
}

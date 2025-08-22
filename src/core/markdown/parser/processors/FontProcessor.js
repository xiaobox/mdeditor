/**
 * @file src/core/markdown/parser/processors/FontProcessor.js
 * @description 字体处理器：集中处理标题/段落/列表的字号、行高与字距（解析后）
 * 与 SocialStyler 保持一致的行高策略，逻辑已抽取到 utils/typography
 */
import { calculateLineHeight } from '../../../../shared/utils/typography.js'


function ensureSemicolon(style) {
  const s = String(style || '').trim()
  if (!s) return ''
  return /;\s*$/.test(s) ? s : `${s};`
}

function setOrReplace(style, prop, value) {
  const re = new RegExp(`${prop}\s*:\s*[^;]*;?`, 'i')
  const decl = `${prop}: ${value};`
  if (re.test(style)) return style.replace(re, decl)
  const withSemi = ensureSemicolon(style)
  return `${withSemi} ${decl}`.trim()
}


function rewriteTagStyle(html, tag, mutator) {
  const re = new RegExp(`<${tag}([^>]*?)style="([^"]*)"([^>]*)>`, 'gi')
  return (html || '').replace(re, (_m, pre, style, post) => {
    const newStyle = mutator(style || '')
    return `<${tag}${pre}style="${newStyle}"${post}>`
  })
}

export class FontProcessor {
  /**
   * @param {string} html
   * @param {{ fontSettings?: { fontSize?: number, lineHeight?: number|string, letterSpacing?: number }, isPreview?: boolean }} options
   * @returns {string}
   */
  static process(html, options = {}) {
    if (!html) return ''
    // 预览模式完全交由 CSS 主题控制，避免行内样式覆盖主题规则
    if (options?.isPreview) return html
    const fs = options.fontSettings || {}
    const fontSize = Number(fs.fontSize) || 16
    const letterSpacing = typeof fs.letterSpacing === 'number' ? fs.letterSpacing : 0

    // 计算行高（保持与 SocialStyler 一致）
    let lineHeight
    if (typeof fs.lineHeight === 'number' && isFinite(fs.lineHeight) && fs.lineHeight > 0) {
      lineHeight = String(fs.lineHeight)
    } else {
      // 共享与 SocialStyler 的行高策略（静态导入）
      lineHeight = calculateLineHeight(fontSize)

    }

    const lineHeightCss = /[empx%]/i.test(String(lineHeight)) ? String(lineHeight) : String(lineHeight)

    const applyCommon = (style, base, extra = '') => {
      let out = style || ''
      // 统一用 setOrReplace 防止重复声明导致非幂等
      out = setOrReplace(out, 'letter-spacing', `${letterSpacing}px`)
      const toPairs = (s) => String(s || '').split(';').map(x => x.trim()).filter(Boolean).map(d => d.split(':')).filter(p => p.length === 2).map(([k,v]) => [k.trim(), v.trim()])
      for (const [k, v] of toPairs(base)) out = setOrReplace(out, k, v)
      for (const [k, v] of toPairs(extra)) out = setOrReplace(out, k, v)
      return out.replace(/\s+/g, ' ').trim()
    }

    let result = html

    // p
    result = result.replace(/<p(?![^>]*style=)/gi, `<p style="letter-spacing: ${letterSpacing}px; font-size: ${fontSize}px; line-height: ${lineHeightCss} !important; margin: 1.5em 8px; font-weight: 400;"`)
    result = rewriteTagStyle(result, 'p', (style) => applyCommon(style, `font-size: ${fontSize}px; line-height: ${lineHeightCss} !important;`, 'font-weight: 400;'))

    // li
    result = result.replace(/<li(?![^>]*style=)/gi, `<li style="letter-spacing: ${letterSpacing}px; font-size: ${fontSize}px; line-height: ${lineHeightCss} !important; font-weight: 400; margin: 0.5em 0;"`)
    result = rewriteTagStyle(result, 'li', (style) => applyCommon(style, `font-size: ${fontSize}px; line-height: ${lineHeightCss} !important;`, 'font-weight: 400;'))

    // h1-h4（社交平台尺寸与旧实现对齐：h1=2.2x，h2=1.5x，h3=1.3x，h4=1.1x）
    const h1Size = Math.round(fontSize * 2.2)
    const h2Size = Math.round(fontSize * 1.5)
    const h3Size = Math.round(fontSize * 1.3)
    const h4Size = Math.round(fontSize * 1.1)

    // h1：无 style 时补齐完整样式（按基础字号）；有 style 时仅补齐缺失项，不覆盖已有 font-size/line-height
    result = result.replace(/<h1(?![^>]*style=)/gi, `<h1 style="letter-spacing: ${letterSpacing}px; font-size: ${fontSize}px; line-height: 1.3em !important; font-weight: 700; margin: 1.8em 0 1.5em; text-align: center;"`)
    result = rewriteTagStyle(result, 'h1', (style) => {
      let out = style || ''
      out = setOrReplace(out, 'letter-spacing', `${letterSpacing}px`)
      if (!/font-size\s*:/i.test(out)) out = setOrReplace(out, 'font-size', `${h1Size}px`)
      if (!/line-height\s*:/i.test(out)) out = setOrReplace(out, 'line-height', '1.3em !important')
      if (!/font-weight\s*:/i.test(out)) out = setOrReplace(out, 'font-weight', '700')
      if (!/text-align\s*:/i.test(out)) out = setOrReplace(out, 'text-align', 'center')
      return out.replace(/\s+/g, ' ').trim()
    })

    result = result.replace(/<h2(?![^>]*style=)/gi, `<h2 style="letter-spacing: ${letterSpacing}px; font-size: ${h2Size}px; line-height: 1.4em !important; font-weight: 600; margin: 2em 0 1.5em;"`)
    result = rewriteTagStyle(result, 'h2', (style) => applyCommon(style, `font-size: ${h2Size}px; line-height: 1.4em !important;`, 'font-weight: 600;'))

    result = result.replace(/<h3(?![^>]*style=)/gi, `<h3 style="letter-spacing: ${letterSpacing}px; font-size: ${h3Size}px; line-height: ${lineHeightCss} !important; font-weight: 600; margin: 1.5em 0 1em;"`)
    result = rewriteTagStyle(result, 'h3', (style) => applyCommon(style, `font-size: ${h3Size}px; line-height: ${lineHeightCss} !important;`, 'font-weight: 600;'))

    result = result.replace(/<h4(?![^>]*style=)/gi, `<h4 style="letter-spacing: ${letterSpacing}px; font-size: ${h4Size}px; line-height: ${lineHeightCss} !important; font-weight: 600; margin: 1em 0 0.6em;"`)
    result = rewriteTagStyle(result, 'h4', (style) => applyCommon(style, `font-size: ${h4Size}px; line-height: ${lineHeightCss} !important;`, 'font-weight: 600;'))

    // ul/ol 容器
    result = result.replace(/<ul(?![^>]*style=)/gi, `<ul style="letter-spacing: ${letterSpacing}px; font-size: ${fontSize}px; line-height: ${lineHeightCss} !important; margin: 1.5em 8px; padding-left: 25px; font-weight: 400;"`)
    result = rewriteTagStyle(result, 'ul', (style) => applyCommon(style, `font-size: ${fontSize}px; line-height: ${lineHeightCss} !important;`, 'font-weight: 400;'))

    result = result.replace(/<ol(?![^>]*style=)/gi, `<ol style="letter-spacing: ${letterSpacing}px; font-size: ${fontSize}px; line-height: ${lineHeightCss} !important; margin: 1.5em 8px; padding-left: 25px; font-weight: 400;"`)
    result = rewriteTagStyle(result, 'ol', (style) => applyCommon(style, `font-size: ${fontSize}px; line-height: ${lineHeightCss} !important;`, 'font-weight: 400;'))

    // blockquote 只补齐行高与字号，不覆盖 ThemeProcessor 定义的主题色与背景
    result = result.replace(/<blockquote(?![^>]*style=)/gi, `<blockquote style="letter-spacing: ${letterSpacing}px; font-size: ${fontSize}px; line-height: ${lineHeightCss} !important; margin: 1.5em 8px; font-weight: 400;"`)
    result = rewriteTagStyle(result, 'blockquote', (style) => applyCommon(style, `font-size: ${fontSize}px; line-height: ${lineHeightCss} !important;`, 'font-weight: 400;'))

    return result
  }
}

export default FontProcessor


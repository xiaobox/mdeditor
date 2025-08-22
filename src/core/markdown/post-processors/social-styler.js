/**
 * @file src/core/markdown/post-processors/social-styler.js
 * @description 通用的社交平台复制后处理器：
 * 1) 注入基础字体/行高/字距等 inline 样式
 * 2) 调用主题复制适配器（adapters/*）做主题化修饰
 */

import { getThemeCopyAdapter } from './adapters/index.js'
import { calculateLineHeight as calcLH } from '../../../shared/utils/typography.js'

function addInlineStyles(html, fontFamily, fontSize, lineHeight, letterSpacing = 0) {
  const lh = parseFloat(lineHeight)
  const fallback = calcLH(fontSize, lh)
  const lineHeightCss = Number.isFinite(lh) ? String(lineHeight) : (/[empx%]/i.test(String(lineHeight)) ? String(lineHeight) : fallback)
  const baseStyle = `font-family: ${fontFamily}; color: #333; letter-spacing: ${letterSpacing}px;`
  const normalWeight = '400'
  const boldWeight = '700'


  let out = html
    .replace(/<section(?![^>]*style=)/gi, `<section style="${baseStyle} line-height: ${lineHeightCss} !important;"`)
    .replace(/<strong(?![^>]*style=)/gi, `<strong style="${baseStyle} font-weight: ${boldWeight};"`)
    .replace(/<b(?![^>]*style=)/gi, `<b style="${baseStyle} font-weight: ${boldWeight};"`)
    .replace(/<em(?![^>]*style=)/gi, `<em style="${baseStyle} font-weight: ${normalWeight}; font-style: italic;"`)
    .replace(/<i(?![^>]*style=)/gi, `<i style="${baseStyle} font-weight: ${normalWeight}; font-style: italic;"`)
    // 为带有 data-md-caption 的图片包裹 figure + figcaption
    .replace(/<img([^>]*?)data-md-caption=\"true\"([^>]*?)>/gi, (m, pre, post) => {
      const altMatch = m.match(/alt=\"([^\"]*)\"/i)
      const alt = altMatch ? altMatch[1] : ''
      const img = `<img${pre}data-md-caption=\"true\"${post}>`
      const figureStyle = `${baseStyle} text-align: center; margin: 1em 0;`
      const captionStyle = `${baseStyle} display: block; font-size: ${Math.max(12, Math.round(fontSize * 0.875))}px; color: #666; margin-top: 6px;`
      return `<figure style=\"${figureStyle}\">${img}<figcaption style=\"${captionStyle}\">${alt}</figcaption></figure>`
    })

  const enforce = (inputHtml, tag) => {
    const re = new RegExp(`<${tag}([^>]*?)style="([^"]*)"([^>]*)>`, 'gi')
    return inputHtml.replace(re, (_m, pre, style, post) => {
      let updated = style
      if (/line-height\s*:/i.test(updated)) {
        updated = updated.replace(/line-height\s*:\s*[^;]*;?/gi, `line-height: ${lineHeightCss} !important;`)
      } else {
        const needsSemicolon = updated.trim().length > 0 && !(/[;\s]$/.test(updated.trim()))
        updated = `${updated}${needsSemicolon ? '; ' : ' '}line-height: ${lineHeightCss} !important;`
      }
      return `<${tag}${pre}style="${updated}"${post}>`
    })
  }
  for (const t of ['section','p','h1','h2','h3','ul','ol','li','blockquote']) out = enforce(out, t)

  const wrapInner = (inputHtml, tag) => {
    const re = new RegExp(`<${tag}([^>]*)>([\s\S]*?)<\/${tag}>`, 'gi')
    return inputHtml.replace(re, (m, attrs, inner) => {
      if (/data-wx-lh-wrap/.test(inner)) return m
      if (/^\s*<(p|div|ul|ol|li|h1|h2|h3|blockquote|pre|table)\b/i.test(inner)) return m
      const span = `<span data-wx-lh-wrap style="line-height: ${lineHeightCss} !important; letter-spacing: ${letterSpacing}px; display: inline-block; width: 100%;">${inner}</span>`
      return `<${tag}${attrs}>${span}</${tag}>`
    })
  }
  for (const t of ['p','li','blockquote','h1','h2','h3']) out = wrapInner(out, t)
  return out
}

const FONT_FAMILY_MAP = {
  'microsoft-yahei': 'Microsoft YaHei, Arial, sans-serif',
  'pingfang-sc': 'PingFang SC, Microsoft YaHei, Arial, sans-serif',
  'hiragino-sans': 'Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif',
  'arial': 'Arial, sans-serif',
  'system-safe': 'Microsoft YaHei, Arial, sans-serif'
}

// moved to utils/typography.js

function hexToRgb(hex) {
  if (!hex) return null
  const m = String(hex).trim().replace('#', '')
  const v = m.length === 3 ? m.split('').map(c => c + c).join('') : m
  const int = parseInt(v, 16)
  if (!Number.isFinite(int) || v.length !== 6) return null
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 }
}

export function wrapWithFontStyles(html, fontSettings) {
  if (!fontSettings || !html) return html
  const fontFamily = FONT_FAMILY_MAP[fontSettings.fontFamily] || FONT_FAMILY_MAP['microsoft-yahei']
  const fontSize = fontSettings.fontSize || 16
  const lineHeight = calcLH(fontSize, fontSettings.lineHeight)
  const letterSpacing = typeof fontSettings.letterSpacing === 'number' ? fontSettings.letterSpacing : 0
  const styledHtml = addInlineStyles(html, fontFamily, fontSize, lineHeight, letterSpacing)
  const lh2 = parseFloat(lineHeight)
  const fallback = calcLH(fontSize, lh2)
  const lhCss = Number.isFinite(lh2) ? String(lineHeight) : (/[empx%]/i.test(String(lineHeight)) ? String(lineHeight) : fallback)
  return `<section data-role="outer" class="rich_media_content" style="font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lhCss} !important; letter-spacing: ${letterSpacing}px; font-weight: 400; color: #333; margin: 0; padding: 0;">
<section data-role="inner" style="font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lhCss} !important; letter-spacing: ${letterSpacing}px; font-weight: 400; color: #333;">
${styledHtml}
</section>
</section>`
}

export class SocialStyler {
  static process(html, options = {}) {
    if (!html) return ''
    const { fontSettings, themeSystem, colorTheme, isPreview = false } = options

    // 预览模式：仅为带说明的图片添加图注包裹，不进行整体字体/段落样式注入
    if (isPreview) {
      const fontFamily = FONT_FAMILY_MAP[fontSettings?.fontFamily] || FONT_FAMILY_MAP['microsoft-yahei']
      const fontSize = fontSettings?.fontSize || 16
      const baseStyle = `font-family: ${fontFamily}; color: #333; letter-spacing: ${typeof fontSettings?.letterSpacing === 'number' ? fontSettings.letterSpacing : 0}px;`
      const out = html.replace(/<img([^>]*?)data-md-caption="true"([^>]*?)>/gi, (m, pre, post) => {
        const altMatch = m.match(/alt="([^"]*)"/i)
        const alt = altMatch ? altMatch[1] : ''
        const img = `<img${pre}data-md-caption="true"${post}>`
        const figureStyle = `${baseStyle} text-align: center; margin: 1em 0;`
        const captionStyle = `${baseStyle} display: block; font-size: ${Math.max(12, Math.round(fontSize * 0.875))}px; color: #666; margin-top: 6px;`
        return `<figure style="${figureStyle}">${img}<figcaption style="${captionStyle}">${alt}</figcaption></figure>`
      })
      return out
    }

    // 复制到公众号等平台：注入字体/行高等样式，并进行主题适配，同时包裹图注
    if (!isPreview && fontSettings) {
      let out = wrapWithFontStyles(html, fontSettings)
      const primary = (colorTheme && colorTheme.primary) ? colorTheme.primary : '#5865F2'
      const baseFontSize = Number(fontSettings?.fontSize) || 16
      const primaryRgb = hexToRgb(primary) || { r: 88, g: 101, b: 242 }
      const primaryRgbStr = `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`
      const adapter = getThemeCopyAdapter(themeSystem)
      if (adapter && typeof adapter.transform === 'function') {
        out = adapter.transform(out, { primary, baseFontSize, primaryRgbStr, themeSystem })
      }
      return out
    }
    return html
  }

  static applyInlineStyles(html, fontSettings) {
    if (!fontSettings || !html) return html
    const fontFamily = FONT_FAMILY_MAP[fontSettings.fontFamily] || FONT_FAMILY_MAP['microsoft-yahei']
    const fontSize = fontSettings.fontSize || 16
    const lineHeight = calculateLineHeight(fontSize, fontSettings.lineHeight)
    const letterSpacing = typeof fontSettings.letterSpacing === 'number' ? fontSettings.letterSpacing : 0
    return addInlineStyles(html, fontFamily, fontSize, lineHeight, letterSpacing)
  }
}



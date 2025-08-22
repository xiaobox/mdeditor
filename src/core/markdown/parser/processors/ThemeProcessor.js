/**
 * @file src/core/markdown/parser/processors/ThemeProcessor.js
 * @description 主题处理器：在结构化解析后，对 HTML 进行与主题色/主题系统相关的处理
 * 当前实现：
 * - 规范化 blockquote 的主题主色边框和渐变背景（与 legacy 输出保持等价，幂等）
 * - 轻量规范化 h1 的主题渐变（幂等）
 */

function normalizeColor(color, fallback = '#5865F2') {
  if (!color || typeof color !== 'string') return fallback
  return color
}

function ensureSemiColon(style) {
  const trimmed = style.trim()
  if (!trimmed) return ''
  return /;\s*$/.test(trimmed) ? trimmed : `${trimmed};`
}

function setOrReplaceDecl(style, prop, value) {
  const re = new RegExp(`${prop}\s*:\s*[^;]*;?`, 'i')
  const decl = `${prop}: ${value};`
  if (re.test(style)) return style.replace(re, decl)
  const withSemi = ensureSemiColon(style)
  return `${withSemi} ${decl}`.trim()
}

function mutateStyle(style, mutator) {
  const before = style || ''
  const after = mutator(before)
  return after
}

function rewriteTagStyle(html, tag, mutator) {
  const re = new RegExp(`<${tag}([^>]*?)style="([^"]*)"([^>]*)>`, 'gi')
  return (html || '').replace(re, (_match, pre, style, post) => {
    const newStyle = mutateStyle(style, mutator)
    return `<${tag}${pre}style="${newStyle}"${post}>`
  })
}

export class ThemeProcessor {
  /**
   * @param {string} html
   * @param {{ colorTheme?: Object, themeSystem?: Object|string, isPreview?: boolean }} options
   * @returns {string}
   */
  static process(html, options = {}) {
    if (!html) return ''
    const primary = normalizeColor(options?.colorTheme?.primary)

    // 1) blockquote：规范化主题主色与渐变（与 legacy 等价，重复执行不改变结果）
    const applyBlockquoteTheme = (style) => {
      let out = style || ''
      // border-left: 4px solid {primary}
      out = setOrReplaceDecl(out, 'border-left', `4px solid ${primary}`)
      // background: linear-gradient(135deg, {primary}14 0%, {primary}0A 50%, {primary}14 100%)
      const gradient = `linear-gradient(135deg, ${primary}14 0%, ${primary}0A 50%, ${primary}14 100%)`
      out = setOrReplaceDecl(out, 'background', gradient)
      return out.replace(/\s+/g, ' ').trim()
    }

    let result = rewriteTagStyle(html, 'blockquote', applyBlockquoteTheme)

    // 2) 表格：规范化边框与配色（保持与现有输出一致，幂等）
    const applyTableTheme = (style) => {
      let out = style || ''
      out = setOrReplaceDecl(out, 'border-collapse', 'collapse')
      out = setOrReplaceDecl(out, 'width', '100%')
      // 保持 margin，不覆盖字体字号与行高
      if (!/margin\s*:/i.test(out)) out = ensureSemiColon(out) + ' margin: 16px 0;'
      return out.replace(/\s+/g, ' ').trim()
    }
    const applyCellTheme = (style) => {
      let out = style || ''
      out = setOrReplaceDecl(out, 'border', '1px solid #d0d7de')
      out = setOrReplaceDecl(out, 'padding', '8px 12px')
      out = setOrReplaceDecl(out, 'color', '#24292e')
      return out.replace(/\s+/g, ' ').trim()
    }

    result = rewriteTagStyle(result, 'table', applyTableTheme)
    result = rewriteTagStyle(result, 'th', applyCellTheme)
    result = rewriteTagStyle(result, 'td', applyCellTheme)

    // 3) h1：规范化主题渐变字色（与现有输出一致，预览模式不强制）
    if (!options?.isPreview) {
      const applyH1Theme = (style) => {
        let out = style || ''
        const gradient = `linear-gradient(135deg, ${primary} 0%, ${primary} 100%)`
        // 为了不覆盖 text 颜色，使用背景渐变 + -webkit-text-fill-color: transparent 的模式由渲染器决定
        out = setOrReplaceDecl(out, 'background', gradient)
        return out.replace(/\s+/g, ' ').trim()
      }
      result = rewriteTagStyle(result, 'h1', applyH1Theme)
    }

    return result
  }
}

export default ThemeProcessor


/**
 * @file tests/core/markdown/post-processors.test.js
 * @description 后处理器（adapters 和 social-styler）测试
 */

import { describe, it, expect } from 'vitest'
import { getThemeCopyAdapter, registerThemeCopyAdapter, resolveCopyFontSettings, wrapWithFontStyles, SocialStyler } from '../../../src/core/markdown/social-adapters.js'

describe('adapters.js', () => {
  describe('getThemeCopyAdapter', () => {
    it('应返回 breeze 适配器', () => {
      const adapter = getThemeCopyAdapter('breeze')
      expect(adapter).not.toBeNull()
      expect(typeof adapter.transform).toBe('function')
    })

    it('应支持对象形式的主题系统', () => {
      const adapter = getThemeCopyAdapter({ id: 'breeze' })
      expect(adapter).not.toBeNull()
    })

    it('未注册的适配器应返回 null', () => {
      const adapter = getThemeCopyAdapter('nonexistent')
      expect(adapter).toBeNull()
    })
  })

  describe('registerThemeCopyAdapter', () => {
    it('应能动态注册新适配器', () => {
      const customAdapter = {
        transform: (html) => html + '<!-- custom -->'
      }
      registerThemeCopyAdapter('custom-theme', customAdapter)

      const adapter = getThemeCopyAdapter('custom-theme')
      expect(adapter).toBe(customAdapter)
    })
  })

  describe('breeze adapter transform', () => {
    const adapter = getThemeCopyAdapter('breeze')
    const baseCtx = {
      primary: '#5865F2',
      baseFontSize: 16,
      primaryRgbStr: '88, 101, 242',
      themeSystem: { id: 'breeze' }
    }

    it('应转换 H1 为胶囊样式', () => {
      const html = '<h1 style="color: red;">标题一</h1>'
      const result = adapter.transform(html, baseCtx)
      expect(result).toContain('<h1')
      expect(result).toContain('标题一')
    })

    it('H1 胶囊应保留父级字体', () => {
      const html = '<h1 style="font-family: \'Kaiti SC\', \'STKaiti\', \'华文楷体\', KaiTi, \'楷体\', serif !important;">标题一</h1>'
      const result = adapter.transform(html, baseCtx)
      expect(result).toContain("data-wx-h1-pill")
      expect(result).toContain("font-family: 'Kaiti SC', 'STKaiti', '华文楷体', KaiTi, '楷体', serif !important;")
    })

    it('应为 H2/H3/H4 添加装饰', () => {
      const html = '<h2 style="margin: 10px;">二级标题</h2><h3 style="color:blue;">三级标题</h3><h4 style="padding:5px;">四级标题</h4>'
      const result = adapter.transform(html, baseCtx)
      expect(result).toContain('<h2')
      expect(result).toContain('<h3')
      expect(result).toContain('<h4')
    })

    it('H2/H3/H4 装饰布局应保留父级字体', () => {
      const html = '<h2 style="font-family: \'Kaiti SC\', \'STKaiti\', \'华文楷体\', KaiTi, \'楷体\', serif !important;">二级标题</h2>'
      const result = adapter.transform(html, baseCtx)
      expect(result).toContain('display: table-cell')
      expect(result).toContain("font-family: 'Kaiti SC', 'STKaiti', '华文楷体', KaiTi, '楷体', serif !important;")
    })

    it('应为链接添加内联样式', () => {
      const html = '<a href="https://example.com">链接</a>'
      const result = adapter.transform(html, baseCtx)
      expect(result).toContain('style=')
      expect(result).toContain('text-decoration: none')
    })

    it('应为带 style 的链接追加样式', () => {
      const html = '<a href="#" style="font-weight: bold;">链接</a>'
      const result = adapter.transform(html, baseCtx)
      expect(result).toContain('font-weight: bold')
      expect(result).toContain('text-decoration: none')
    })

    it('应处理表格样式', () => {
      const html = '<table style="width:100%;"><thead><tr><th style="padding:5px;">表头</th></tr></thead><tbody><tr><td style="border:1px;">数据</td></tr></tbody></table>'
      const result = adapter.transform(html, baseCtx)
      expect(result).toContain('<table')
      expect(result).toContain('border-collapse')
    })

    it('应处理无 style 的表格', () => {
      const html = '<table><tr><th>表头</th></tr><tr><td>数据</td></tr></table>'
      const result = adapter.transform(html, baseCtx)
      expect(result).toContain('style=')
    })

    it('应处理内层容器样式', () => {
      const html = '<section data-role="inner" style="background: white;">内容</section>'
      const result = adapter.transform(html, baseCtx)
      expect(result).toContain('border-radius')
    })

    it('应处理自定义的 headings 配置', () => {
      const ctx = {
        ...baseCtx,
        themeSystem: {
          id: 'breeze',
          copy: {
            headings: {
              h2: { fontScale: 1.6, lineHeight: '1.4em' },
              h3: { fontScale: 1.3 },
              h4: { fontScale: 1.1 }
            }
          }
        }
      }
      const html = '<h2 style="font-size: 20px;">标题</h2>'
      const result = adapter.transform(html, ctx)
      expect(result).toContain('font-size:')
    })
  })
})

describe('social-styler.js', () => {
  const fontSettings = {
    fontFamily: 'microsoft-yahei',
    fontSize: 16,
    lineHeight: 1.6,
    letterSpacing: 0.5
  }

  describe('wrapWithFontStyles', () => {
    it('应包装 HTML 并添加字体样式', () => {
      const html = '<p>测试内容</p>'
      const result = wrapWithFontStyles(html, fontSettings)

      expect(result).toContain('data-role="outer"')
      expect(result).toContain('data-role="inner"')
      expect(result).toContain('font-family:')
      expect(result).toContain('font-size: 16px')
    })

    it('空 html 应返回空字符串', () => {
      expect(wrapWithFontStyles('', fontSettings)).toBe('')
      expect(wrapWithFontStyles(null, fontSettings)).toBe(null)
    })

    it('无 fontSettings 应返回原 HTML', () => {
      const html = '<p>内容</p>'
      expect(wrapWithFontStyles(html, null)).toBe(html)
    })

    it('应支持不同的字体系列', () => {
      const families = ['microsoft-yahei', 'pingfang-sc', 'hiragino-sans', 'songti-sc', 'kaiti-mac', 'sf-mono']
      families.forEach(fontFamily => {
        const result = wrapWithFontStyles('<p>测试</p>', { ...fontSettings, fontFamily })
        expect(result).toContain('font-family:')
      })
    })

    it('复制输出应使用当前字体库中的新增字体', () => {
      const result = wrapWithFontStyles('<p>测试</p>', { ...fontSettings, fontFamily: 'kaiti-mac' })
      expect(result).toContain('Kaiti SC')
      expect(result).toContain('STKaiti')
      expect(result).toContain('华文楷体')
      expect(result).toContain('KaiTi')
    })

    it('复制输出应把字体强制内联到正文和内部包裹 span', () => {
      const result = wrapWithFontStyles('<p style="margin: 1em 0;">测试</p>', { ...fontSettings, fontFamily: 'kaiti-mac' })
      expect(result).toContain("<p style=\"margin: 1em 0; font-family: 'Kaiti SC', 'STKaiti', '华文楷体', KaiTi, '楷体', serif !important;")
      expect(result).toContain("data-wx-lh-wrap style=\"font-family: 'Kaiti SC', 'STKaiti', '华文楷体', KaiTi, '楷体', serif !important;")
    })

    it('应处理未知字体系列（使用默认）', () => {
      const result = wrapWithFontStyles('<p>测试</p>', { ...fontSettings, fontFamily: 'unknown' })
      expect(result).toContain('font-family:')
      expect(result).not.toContain('unknown')
    })
  })

  describe('resolveCopyFontSettings', () => {
    it('应与预览 CSS 变量使用同一套字体解析', () => {
      const resolved = resolveCopyFontSettings({
        fontFamily: 'songti-sc',
        fontSize: 18,
        lineHeight: 1.8,
        letterSpacing: 1
      })

      expect(resolved.fontFamily).toContain("'Songti SC'")
      expect(resolved.fontSize).toBe(18)
      expect(resolved.lineHeight).toBe('1.8')
      expect(resolved.letterSpacing).toBe(1)
    })
  })

  describe('SocialStyler.process', () => {
    it('空 html 应返回空字符串', () => {
      expect(SocialStyler.process('')).toBe('')
      expect(SocialStyler.process(null)).toBe('')
    })

    it('预览模式应只处理图片说明', () => {
      const html = '<p>内容</p><img data-md-caption="true" alt="图片说明" src="test.jpg">'
      const result = SocialStyler.process(html, {
        fontSettings,
        isPreview: true
      })

      expect(result).toContain('<figure')
      expect(result).toContain('<figcaption')
      expect(result).toContain('图片说明')
      expect(result).not.toContain('data-role="outer"')
    })

    it('预览模式图片说明应使用所选字体', () => {
      const html = '<img data-md-caption="true" alt="图片说明" src="test.jpg">'
      const result = SocialStyler.process(html, {
        fontSettings: { ...fontSettings, fontFamily: 'songti-sc' },
        isPreview: true
      })

      expect(result).toContain('Songti SC')
    })

    it('非预览模式应注入完整样式', () => {
      const html = '<p>内容</p>'
      const result = SocialStyler.process(html, {
        fontSettings,
        isPreview: false,
        themeSystem: 'breeze',
        colorTheme: { primary: '#5865F2' }
      })

      expect(result).toContain('data-role="outer"')
      expect(result).toContain('data-role="inner"')
    })

    it('应使用默认主色（无 colorTheme 时）', () => {
      const html = '<p>内容</p>'
      const result = SocialStyler.process(html, {
        fontSettings,
        isPreview: false,
        themeSystem: 'breeze'
      })

      // breeze 适配器处理后会包含 rgba 格式的主色
      expect(result).toContain('88, 101, 242')
    })

    it('无适配器时应返回基础样式化 HTML', () => {
      const html = '<p>内容</p>'
      const result = SocialStyler.process(html, {
        fontSettings,
        isPreview: false,
        themeSystem: 'nonexistent',
        colorTheme: { primary: '#ff0000' }
      })

      expect(result).toContain('data-role="outer"')
    })

    it('无 fontSettings 且非预览模式应返回原 HTML', () => {
      const html = '<p>内容</p>'
      const result = SocialStyler.process(html, {
        isPreview: false
      })

      expect(result).toBe(html)
    })
  })

  describe('SocialStyler.applyInlineStyles', () => {
    it('应为 HTML 元素添加内联样式', () => {
      const html = '<section><strong>粗体</strong><em>斜体</em></section>'
      const result = SocialStyler.applyInlineStyles(html, fontSettings)

      expect(result).toContain('font-weight: 700')
      expect(result).toContain('font-style: italic')
    })

    it('空参数应返回原值', () => {
      expect(SocialStyler.applyInlineStyles('', fontSettings)).toBe('')
      expect(SocialStyler.applyInlineStyles('<p>x</p>', null)).toBe('<p>x</p>')
    })

    it('applyInlineStyles 不应让 <i 正则干扰 <img', () => {
      const html = '<div><img data-md-caption="true" alt="描述" src="img.jpg"></div>'
      const result = SocialStyler.applyInlineStyles(html, fontSettings)

      expect(result).toContain('<figure')
      expect(result).toContain('<img data-md-caption="true" alt="描述" src="img.jpg">')
      expect(result).toContain('<figcaption')
      expect(result).not.toContain('<i style=')
    })

    it('应为各种标签强制行高', () => {
      const tags = ['section', 'p', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote']
      tags.forEach(tag => {
        const html = `<${tag} style="color: red;">内容</${tag}>`
        const result = SocialStyler.applyInlineStyles(html, fontSettings)
        expect(result).toContain('line-height:')
      })
    })

    it('应为纯文本块添加微信行高包裹', () => {
      const html = '<p style="margin: 10px;">纯文本内容</p>'
      const result = wrapWithFontStyles(html, fontSettings)
      expect(result).toContain('<p style="margin: 10px;')
      expect(result).toContain('data-wx-lh-wrap')
      expect(result).toContain('纯文本内容</span></p>')
    })

    it('不应重复包裹已有 data-wx-lh-wrap 的内容', () => {
      const html = '<p style="margin: 10px;"><span data-wx-lh-wrap>已包裹</span></p>'
      const result = SocialStyler.applyInlineStyles(html, fontSettings)
      // 计算 data-wx-lh-wrap 出现次数
      const count = (result.match(/data-wx-lh-wrap/g) || []).length
      expect(count).toBe(1)
    })

    it('不应对包含块级元素的标签添加 span 包裹', () => {
      const html = '<p style="margin: 10px;"><div>块级元素</div></p>'
      const result = SocialStyler.applyInlineStyles(html, fontSettings)
      expect(result).not.toMatch(/<p[^>]*><span data-wx-lh-wrap/)
    })
  })
})

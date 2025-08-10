/**
 * @file tests/core/markdown/breeze-styler.test.js
 */
import { wrapWithFontStyles, SocialStyler } from '../../../src/core/markdown/post-processors/social-styler.js'

const fontSettings = { fontFamily: 'microsoft-yahei', fontSize: 16, lineHeight: 1.6 }

describe('Breeze Styler', () => {
  it('清风排版主题下复制时应追加链接样式并应用容器卡片化', () => {
    const sample = '<h2>H2</h2><h3>H3</h3><h4>H4</h4><a href="#">link</a>'
    const out = SocialStyler.process(sample, {
      fontSettings,
      isPreview: false,
      themeSystem: 'breeze',
      colorTheme: { primary: '#5865F2' }
    })
    // 链接应无下划线并着主色
    expect(out).toMatch(/<a[^>]*style="[^"]*color:\s*#5865F2[^"]*text-decoration:\s*none/i)
    // 内层容器应被卡片化
    expect(out).toMatch(/<section[^>]*data-role="inner"[^>]*style="[^"]*border-radius:[^;]+;[^"]*padding:[^;]+;[^"]*border:[^"]*"/i)
  })
})



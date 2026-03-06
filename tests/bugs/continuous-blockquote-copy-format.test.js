import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../../src/core/markdown/index.js'

const fontSettings = {
  fontFamily: 'microsoft-yahei',
  fontSize: 16,
  lineHeight: 1.6,
  letterSpacing: 0
}

const continuousBlockquote = `> Q = 我现在想找什么
> K = 每个词身上贴的“索引标签”
> V = 每个词真正携带、可被取走的信息。
>
> 最通俗的比喻是“图书馆检索”：
> 你现在脑子里有一个问题，这就是 Q（Query）；书架上每本书卡片上的主题标签，是 K（Key）；书里真正的内容，是 V（Value）。系统先拿你的问题 Q 去和所有标签 K 比一比，看看“像不像、相关不相关”；相关度高的那些书，它们的内容 V 就会被更多地取出来，最后合成当前这一步该看的信息。Transformer 论文对 attention 的定义，本质上就是“一个 query 对一组 key-value 对做匹配，输出是 values 的加权和”。`

describe('continuous blockquotes in social copy output', () => {
  it('keeps <br> tags instead of turning them into malformed <b> tags', () => {
    const html = parseMarkdown(continuousBlockquote, { fontSettings })

    expect(html).toContain('<br>')
    expect(html).not.toMatch(/<b style="[^"]*"r>/i)

    const container = document.createElement('div')
    container.innerHTML = html

    const quoteParagraphs = container.querySelectorAll('blockquote p')
    expect(quoteParagraphs).toHaveLength(2)
    expect(quoteParagraphs[0].querySelectorAll('br')).toHaveLength(2)
    expect(container.querySelectorAll('blockquote b')).toHaveLength(0)
  })

  it('does not leak bold formatting into content after the quote', () => {
    const html = parseMarkdown(`${continuousBlockquote}\n\n后续正文`, { fontSettings })
    const container = document.createElement('div')
    container.innerHTML = html

    const followup = Array.from(container.querySelectorAll('p'))
      .find((node) => node.textContent === '后续正文')

    expect(followup).toBeTruthy()
    expect(followup.closest('b')).toBeNull()
    expect(followup.querySelector('b, strong')).toBeNull()
  })
})

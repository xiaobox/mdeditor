<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click="close">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2>Markdown 语法指南</h2>
            <button class="close-btn" @click="close">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
              </svg>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="guide-sections">
              <section class="guide-section">
                <h3>基础语法</h3>
                <table class="syntax-table">
                  <thead>
                    <tr>
                      <th>元素</th>
                      <th>Markdown 语法</th>
                      <th>效果预览</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>标题</td>
                      <td><code># 一级标题<br>## 二级标题<br>### 三级标题</code></td>
                      <td class="preview-cell">
                        <h1>一级标题</h1>
                        <h2>二级标题</h2>
                        <h3>三级标题</h3>
                      </td>
                    </tr>
                    <tr>
                      <td>粗体</td>
                      <td><code>**粗体文本**</code></td>
                      <td class="preview-cell"><strong>粗体文本</strong></td>
                    </tr>
                    <tr>
                      <td>斜体</td>
                      <td><code>*斜体文本*</code></td>
                      <td class="preview-cell"><em>斜体文本</em></td>
                    </tr>
                    <tr>
                      <td>删除线</td>
                      <td><code>~~删除线~~</code></td>
                      <td class="preview-cell"><del>删除线</del></td>
                    </tr>
                    <tr>
                      <td>引用</td>
                      <td><code>> 引用文本</code></td>
                      <td class="preview-cell"><blockquote>引用文本</blockquote></td>
                    </tr>
                    <tr>
                      <td>行内代码</td>
                      <td><code>`代码`</code></td>
                      <td class="preview-cell"><code>代码</code></td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section class="guide-section">
                <h3>列表</h3>
                <table class="syntax-table">
                  <thead>
                    <tr>
                      <th>类型</th>
                      <th>Markdown 语法</th>
                      <th>效果预览</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>无序列表</td>
                      <td><code>- 项目 1<br>- 项目 2<br>&nbsp;&nbsp;- 子项目</code></td>
                      <td class="preview-cell">
                        <ul>
                          <li>项目 1</li>
                          <li>项目 2
                            <ul>
                              <li>子项目</li>
                            </ul>
                          </li>
                        </ul>
                      </td>
                    </tr>
                    <tr>
                      <td>有序列表</td>
                      <td><code>1. 第一项<br>2. 第二项<br>3. 第三项</code></td>
                      <td class="preview-cell">
                        <ol>
                          <li>第一项</li>
                          <li>第二项</li>
                          <li>第三项</li>
                        </ol>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section class="guide-section">
                <h3>链接和图片</h3>
                <table class="syntax-table">
                  <thead>
                    <tr>
                      <th>元素</th>
                      <th>Markdown 语法</th>
                      <th>效果预览</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>链接</td>
                      <td><code>[链接文本](https://example.com)</code></td>
                      <td class="preview-cell"><a href="#">链接文本</a></td>
                    </tr>
                    <tr>
                      <td>图片</td>
                      <td><code>![alt文本](图片URL)</code></td>
                      <td class="preview-cell"><em>图片预览</em></td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section class="guide-section">
                <h3>代码块</h3>
                <table class="syntax-table">
                  <thead>
                    <tr>
                      <th>元素</th>
                      <th>Markdown 语法</th>
                      <th>效果预览</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>代码块</td>
                      <td><code>```javascript<br>function hello() {<br>&nbsp;&nbsp;console.log("Hello!");<br>}<br>```</code></td>
                      <td class="preview-cell">
                        <pre><code>function hello() {
    console.log("Hello!");
}</code></pre>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section class="guide-section">
                <h3>表格</h3>
                <table class="syntax-table">
                  <thead>
                    <tr>
                      <th>元素</th>
                      <th>Markdown 语法</th>
                      <th>效果预览</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>表格</td>
                      <td><code>| 列 1 | 列 2 | 列 3 |<br>| --- | --- | --- |<br>| 内容 1 | 内容 2 | 内容 3 |</code></td>
                      <td class="preview-cell">
                        <table class="demo-table">
                          <thead>
                            <tr>
                              <th>列 1</th>
                              <th>列 2</th>
                              <th>列 3</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>内容 1</td>
                              <td>内容 2</td>
                              <td>内容 3</td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section class="guide-section">
                <h3>其他</h3>
                <table class="syntax-table">
                  <thead>
                    <tr>
                      <th>元素</th>
                      <th>Markdown 语法</th>
                      <th>说明</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>分割线</td>
                      <td><code>---</code></td>
                      <td>创建水平分割线</td>
                    </tr>
                    <tr>
                      <td>转义字符</td>
                      <td><code>\*文本\*</code></td>
                      <td>使用反斜杠转义特殊字符</td>
                    </tr>
                  </tbody>
                </table>
              </section>
            </div>
          </div>

          <div class="modal-footer">
            <div class="tip">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
              </svg>
              <span>提示：点击编辑器工具栏按钮可快速插入对应语法</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
export default {
  name: 'MarkdownGuide',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  methods: {
    close() {
      this.$emit('close')
    }
  }
}
</script>

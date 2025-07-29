<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click="close">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <div class="header-content">
              <div class="header-icon">
                <svg viewBox="0 0 24 24" width="28" height="28">
                  <path fill="currentColor" d="M22.269,19.385H1.731A1.73,1.73 0 0,1 0,17.655V6.345A1.73,1.73 0 0,1 1.731,4.615H22.269A1.73,1.73 0 0,1 24,6.345V17.655A1.73,1.73 0 0,1 22.269,19.385ZM16.5,13L13.5,9.5L15.5,9.5L15.5,7L17.5,7L17.5,9.5L19.5,9.5L16.5,13ZM7,7L9,7L9,10.5L11,7L13,7L13,15L11,15L11,11.5L9,15L7,15L7,7Z"/>
                </svg>
              </div>
              <div class="header-text">
                <h2>Markdown 语法指南</h2>
                <p>快速掌握 Markdown 语法，提升写作效率</p>
              </div>
            </div>
            <button class="close-btn" @click="close">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="guide-sections">
              <!-- 基础语法 -->
              <section class="guide-section">
                <div class="section-header">
                  <div class="section-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path fill="currentColor" d="M5,4V7H10.5V19H13.5V7H19V4H5Z"/>
                    </svg>
                  </div>
                  <h3>基础语法</h3>
                </div>
                <div class="syntax-list">
                  <!-- 一级标题 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>一级标题</h4>
                      <code># 一级标题</code>
                    </div>
                    <div class="syntax-right">
                      <h1 class="demo-h1">一级标题</h1>
                    </div>
                  </div>

                  <!-- 二级标题 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>二级标题</h4>
                      <code>## 二级标题</code>
                    </div>
                    <div class="syntax-right">
                      <h2 class="demo-h2">二级标题</h2>
                    </div>
                  </div>

                  <!-- 三级标题 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>三级标题</h4>
                      <code>### 三级标题</code>
                    </div>
                    <div class="syntax-right">
                      <h3 class="demo-h3">三级标题</h3>
                    </div>
                  </div>

                  <!-- 粗体 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>粗体</h4>
                      <code>**粗体文本**</code>
                    </div>
                    <div class="syntax-right">
                      <p><strong>粗体文本</strong></p>
                    </div>
                  </div>

                  <!-- 斜体 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>斜体</h4>
                      <code>*斜体文本*</code>
                    </div>
                    <div class="syntax-right">
                      <p><em>斜体文本</em></p>
                    </div>
                  </div>

                  <!-- 删除线 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>删除线</h4>
                      <code>~~删除线~~</code>
                    </div>
                    <div class="syntax-right">
                      <p><del>删除线</del></p>
                    </div>
                  </div>

                  <!-- 引用 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>引用</h4>
                      <code>> 引用文本</code>
                    </div>
                    <div class="syntax-right">
                      <blockquote class="demo-quote">引用文本</blockquote>
                    </div>
                  </div>

                  <!-- 行内代码 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>行内代码</h4>
                      <code>`行内代码`</code>
                    </div>
                    <div class="syntax-right">
                      <p><code class="demo-code">行内代码</code></p>
                    </div>
                  </div>
                </div>
              </section>

              <!-- 列表 -->
              <section class="guide-section">
                <div class="section-header">
                  <div class="section-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path fill="currentColor" d="M7,5H21V7H7V5M7,13V11H21V13H7M4,4.5A1.5,1.5 0 0,1 5.5,6A1.5,1.5 0 0,1 4,7.5A1.5,1.5 0 0,1 2.5,6A1.5,1.5 0 0,1 4,4.5M4,10.5A1.5,1.5 0 0,1 5.5,12A1.5,1.5 0 0,1 4,13.5A1.5,1.5 0 0,1 2.5,12A1.5,1.5 0 0,1 4,10.5M7,19V17H21V19H7M4,16.5A1.5,1.5 0 0,1 5.5,18A1.5,1.5 0 0,1 4,19.5A1.5,1.5 0 0,1 2.5,18A1.5,1.5 0 0,1 4,16.5Z"/>
                    </svg>
                  </div>
                  <h3>列表</h3>
                </div>
                <div class="syntax-list">
                  <!-- 无序列表 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>无序列表</h4>
                      <code>- 项目 1<br>- 项目 2<br>  - 子项目</code>
                    </div>
                    <div class="syntax-right">
                      <ul class="demo-list">
                        <li>项目 1</li>
                        <li>项目 2
                          <ul>
                            <li>子项目</li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <!-- 有序列表 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>有序列表</h4>
                      <code>1. 第一项<br>2. 第二项<br>3. 第三项</code>
                    </div>
                    <div class="syntax-right">
                      <ol class="demo-list">
                        <li>第一项</li>
                        <li>第二项</li>
                        <li>第三项</li>
                      </ol>
                    </div>
                  </div>

                  <!-- 任务列表 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>任务列表</h4>
                      <code>- [x] 已完成<br>- [ ] 待完成</code>
                    </div>
                    <div class="syntax-right">
                      <ul class="demo-task-list">
                        <li class="task-done">✓ 已完成</li>
                        <li class="task-todo">○ 待完成</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <!-- 链接和图片 -->
              <section class="guide-section">
                <div class="section-header">
                  <div class="section-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path fill="currentColor" d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z"/>
                    </svg>
                  </div>
                  <h3>链接和图片</h3>
                </div>
                <div class="syntax-list">
                  <!-- 链接 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>链接</h4>
                      <code>[链接文本](URL)</code>
                    </div>
                    <div class="syntax-right">
                      <p><a href="#" class="demo-link">链接文本</a></p>
                    </div>
                  </div>

                  <!-- 图片 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>图片</h4>
                      <code>![描述文本](图片URL)</code>
                    </div>
                    <div class="syntax-right">
                      <div class="demo-image">
                        <svg viewBox="0 0 24 24" width="32" height="32">
                          <path fill="currentColor" d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/>
                        </svg>
                        <span>图片预览</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <!-- 代码块 -->
              <section class="guide-section">
                <div class="section-header">
                  <div class="section-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path fill="currentColor" d="M8,3A2,2 0 0,0 6,5V9A2,2 0 0,1 4,11H3V13H4A2,2 0 0,1 6,15V19A2,2 0 0,0 8,21H10V19H8V14A2,2 0 0,0 6,12A2,2 0 0,0 8,10V5H10V3M16,3A2,2 0 0,1 18,5V9A2,2 0 0,0 20,11H21V13H20A2,2 0 0,0 18,15V19A2,2 0 0,1 16,21H14V19H16V14A2,2 0 0,1 18,12A2,2 0 0,1 16,10V5H14V3"/>
                    </svg>
                  </div>
                  <h3>代码块</h3>
                </div>
                <div class="syntax-list">
                  <!-- 代码块 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>代码块</h4>
                      <code>```javascript<br>function hello() {<br>  console.log("Hello!");<br>}<br>```</code>
                    </div>
                    <div class="syntax-right">
                      <pre class="demo-code-block"><code>function hello() {
  console.log("Hello!");
}</code></pre>
                    </div>
                  </div>
                </div>
              </section>

              <!-- 表格 -->
              <section class="guide-section">
                <div class="section-header">
                  <div class="section-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path fill="currentColor" d="M5,4H19A2,2 0 0,1 21,6V18A2,2 0 0,1 19,20H5A2,2 0 0,1 3,18V6A2,2 0 0,1 5,4M5,8V12H11V8H5M13,8V12H19V8H13M5,14V18H11V14H5M13,14V18H19V14H13Z"/>
                    </svg>
                  </div>
                  <h3>表格</h3>
                </div>
                <div class="syntax-list">
                  <!-- 表格 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>表格</h4>
                      <code>| 列 1 | 列 2 | 列 3 |<br>| --- | --- | --- |<br>| 内容 1 | 内容 2 | 内容 3 |</code>
                    </div>
                    <div class="syntax-right">
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
                    </div>
                  </div>
                </div>
              </section>

              <!-- 其他语法 -->
              <section class="guide-section">
                <div class="section-header">
                  <div class="section-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"/>
                    </svg>
                  </div>
                  <h3>其他语法</h3>
                </div>
                <div class="syntax-list">
                  <!-- 分割线 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>分割线</h4>
                      <code>---</code>
                    </div>
                    <div class="syntax-right">
                      <hr class="demo-hr">
                    </div>
                  </div>

                  <!-- 转义字符 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>转义字符</h4>
                      <code>\*文本\*</code>
                    </div>
                    <div class="syntax-right">
                      <p>*文本*</p>
                    </div>
                  </div>
                </div>
              </section>
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

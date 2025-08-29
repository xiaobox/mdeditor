<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click="close">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <div class="header-content">
              <div class="header-icon">
                <svg viewBox="0 0 1024 1024" width="28" height="28">
                  <path fill="currentColor" d="M895.318 192 128.682 192C93.008 192 64 220.968 64 256.616l0 510.698C64 802.986 93.008 832 128.682 832l766.636 0C930.992 832 960 802.986 960 767.312L960 256.616C960 220.968 930.992 192 895.318 192zM568.046 704l-112.096 0 0-192-84.08 107.756L287.826 512l0 192L175.738 704 175.738 320l112.088 0 84.044 135.96 84.08-135.96 112.096 0L568.046 704 568.046 704zM735.36 704l-139.27-192 84 0 0-192 112.086 0 0 192 84.054 0-140.906 192L735.36 704z"/>
                </svg>
              </div>
              <div class="header-text">
                <h2>{{ $t('guide.title') }}</h2>
                <p>{{ $t('guide.subtitle') }}</p>
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
                  <h3>{{ $t('guide.sections.basic') }}</h3>
                </div>
                <div class="syntax-list">
                  <!-- 一级标题 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>{{ $t('guide.h1') }}</h4>
                      <code># {{ $t('guide.h1') }}</code>
                    </div>
                    <div class="syntax-right">
                      <h1 class="demo-h1">{{ $t('guide.h1') }}</h1>
                    </div>
                  </div>

                  <!-- 二级标题 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>{{ $t('guide.h2') }}</h4>
                      <code>## {{ $t('guide.h2') }}</code>
                    </div>
                    <div class="syntax-right">
                      <h2 class="demo-h2">{{ $t('guide.h2') }}</h2>
                    </div>
                  </div>

                  <!-- 三级标题 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>{{ $t('guide.h3') }}</h4>
                      <code>### {{ $t('guide.h3') }}</code>
                    </div>
                    <div class="syntax-right">
                      <h3 class="demo-h3">{{ $t('guide.h3') }}</h3>
                    </div>
                  </div>

                  <!-- 粗体 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>{{ $t('guide.bold') }}</h4>
                      <code>**{{ $t('guide.bold') }}**</code>
                    </div>
                    <div class="syntax-right">
                      <p><strong>{{ $t('guide.samples.text') }}</strong></p>
                    </div>
                  </div>

                  <!-- 斜体 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>{{ $t('guide.italic') }}</h4>
                      <code>*{{ $t('guide.italic') }}*</code>
                    </div>
                    <div class="syntax-right">
                      <p><em>{{ $t('guide.samples.text') }}</em></p>
                    </div>
                  </div>

                  <!-- 删除线 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>{{ $t('guide.strikethrough') }}</h4>
                      <code>~~{{ $t('guide.strikethrough') }}~~</code>
                    </div>
                    <div class="syntax-right">
                      <p><del>{{ $t('guide.samples.text') }}</del></p>
                    </div>
                  </div>

                  <!-- 引用 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>{{ $t('guide.quote') }}</h4>
                      <code>> {{ $t('guide.samples.quoteText') }}</code>
                    </div>
                    <div class="syntax-right">
                      <blockquote class="demo-quote">{{ $t('guide.samples.quoteText') }}</blockquote>
                    </div>
                  </div>

                  <!-- 行内代码 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>{{ $t('guide.inlineCode') }}</h4>
                      <code>`{{ $t('guide.inlineCode') }}`</code>
                    </div>
                    <div class="syntax-right">
                      <p><code class="demo-code">{{ $t('guide.inlineCode') }}</code></p>
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
                  <h3>{{ $t('guide.sections.lists') }}</h3>
                </div>
                <div class="syntax-list">
                  <!-- 无序列表 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>{{ $t('guide.unorderedList') }}</h4>
                      <code>- {{ $t('guide.samples.item1') }}<br>- {{ $t('guide.samples.item2') }}<br>  - {{ $t('guide.samples.subitem') }}</code>
                    </div>
                    <div class="syntax-right">
                      <ul class="demo-list">
                        <li>{{ $t('guide.samples.item1') }}</li>
                        <li>{{ $t('guide.samples.item2') }}
                          <ul>
                            <li>{{ $t('guide.samples.subitem') }}</li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <!-- 有序列表 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>{{ $t('guide.orderedList') }}</h4>
                      <code>1. {{ $t('guide.samples.first') }}<br>2. {{ $t('guide.samples.second') }}<br>3. {{ $t('guide.samples.third') }}</code>
                    </div>
                    <div class="syntax-right">
                      <ol class="demo-list">
                        <li>{{ $t('guide.samples.first') }}</li>
                        <li>{{ $t('guide.samples.second') }}</li>
                        <li>{{ $t('guide.samples.third') }}</li>
                      </ol>
                    </div>
                  </div>

                  <!-- 任务列表 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>{{ $t('guide.taskList') }}</h4>
                      <code>- [x] {{ $t('guide.done') }}<br>- [ ] {{ $t('guide.todo') }}</code>
                    </div>
                    <div class="syntax-right">
                      <ul class="demo-task-list">
                        <li class="task-done">✓ {{ $t('guide.done') }}</li>
                        <li class="task-todo">○ {{ $t('guide.todo') }}</li>
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
                  <h3>{{ $t('guide.sections.linksImages') }}</h3>
                </div>
                <div class="syntax-list">
                  <!-- 链接 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>{{ $t('guide.link') }}</h4>
                      <code>[{{ $t('guide.samples.linkText') }}](URL)</code>
                    </div>
                    <div class="syntax-right">
                      <p><a href="#" class="demo-link">{{ $t('guide.samples.linkText') }}</a></p>
                    </div>
                  </div>

                  <!-- 图片 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>{{ $t('guide.image') }}</h4>
                      <code>![{{ $t('guide.samples.altText') }}](URL)</code>
                    </div>
                    <div class="syntax-right">
                      <div class="demo-image">
                        <svg viewBox="0 0 24 24" width="32" height="32">
                          <path fill="currentColor" d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/>
                        </svg>
                        <span>{{ $t('guide.imagePreview') }}</span>
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
                  <h3>{{ $t('guide.sections.code') }}</h3>
                </div>
                <div class="syntax-list">
                  <!-- 代码块 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>{{ $t('guide.codeBlock') }}</h4>
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
                  <h3>{{ $t('guide.sections.table') }}</h3>
                </div>
                <div class="syntax-list">
                  <!-- 表格 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>{{ $t('guide.tableTitle') }}</h4>
                      <code>| {{ $t('guide.column1') }} | {{ $t('guide.column2') }} | {{ $t('guide.column3') }} |<br>| --- | --- | --- |<br>| {{ $t('guide.content1') }} | {{ $t('guide.content2') }} | {{ $t('guide.content3') }} |</code>
                    </div>
                    <div class="syntax-right">
                      <table class="demo-table">
                        <thead>
                          <tr>
                            <th>{{ $t('guide.column1') }}</th>
                            <th>{{ $t('guide.column2') }}</th>
                            <th>{{ $t('guide.column3') }}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{{ $t('guide.content1') }}</td>
                            <td>{{ $t('guide.content2') }}</td>
                            <td>{{ $t('guide.content3') }}</td>
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
                  <h3>{{ $t('guide.sections.misc') }}</h3>
                </div>
                <div class="syntax-list">
                  <!-- 分割线 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>{{ $t('guide.hr') }}</h4>
                      <code>---</code>
                    </div>
                    <div class="syntax-right">
                      <hr class="demo-hr">
                    </div>
                  </div>

                  <!-- 转义字符 -->
                  <div class="syntax-item">
                    <div class="syntax-left">
                      <h4>{{ $t('guide.escape') }}</h4>
                      <code>\*{{ $t('guide.samples.text') }}\*</code>
                    </div>
                    <div class="syntax-right">
                      <p>*{{ $t('guide.samples.text') }}*</p>
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

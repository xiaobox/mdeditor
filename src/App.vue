<template>
  <div id="app">
    <!-- 头部工具栏 -->
    <header class="app-header">
      <div class="header-left">
        <h1>Modern MD Editor</h1>
        <span class="header-subtitle">现代化 Markdown 编辑器</span>
      </div>
      <div class="header-right">
        <button class="btn btn-secondary" @click="showMarkdownGuide = true">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
          </svg>
          语法指南
        </button>
        <button class="btn btn-primary" @click="copyToClipboard" :disabled="!htmlContent">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
          </svg>
          复制HTML格式
        </button>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="app-main">
      <!-- 左侧：Markdown编辑器 -->
      <div class="editor-panel">
        <div class="panel-header">
          <h3>Markdown 编辑器</h3>
          <div class="panel-actions">
            <button @click="clearContent" class="btn-small" title="清空内容">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
              </svg>
            </button>
            <button @click="loadSample" class="btn-small" title="加载示例">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
            </button>
          </div>
        </div>
        <MarkdownEditor
          v-model="markdownContent"
          @update:modelValue="handleMarkdownChange"
          class="editor-content"
        />
      </div>


      <!-- 右侧：预览面板 -->
      <div class="preview-panel">
        <div class="panel-header">
          <h3>预览</h3>
          <div class="panel-actions">
            <button 
              @click="previewMode = previewMode === 'rendered' ? 'html' : 'rendered'"
              class="btn-small"
              :title="previewMode === 'rendered' ? '查看HTML源码' : '查看渲染效果'"
            >
              <svg v-if="previewMode === 'rendered'" viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M12.89,3L14.85,3.4L11.11,21L9.15,20.6L12.89,3M19.59,12L16,8.41V5.58L22.42,12L16,18.41V15.58L19.59,12M1.58,12L8,5.58V8.41L4.41,12L8,15.58V18.41L1.58,12Z"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
              </svg>
            </button>
          </div>
        </div>
        
        <PreviewPane
          :markdown="markdownContent"
          :preview-mode="previewMode"
          @html-generated="handleHtmlGenerated"
          class="preview-content"
        />
      </div>
    </main>

    <!-- 状态栏 -->
    <footer class="app-footer">
      <div class="footer-left">
        <span>字符数: {{ markdownContent.length }}</span>
        <span>预计阅读时间: {{ estimatedReadTime }}分钟</span>
      </div>
      <div class="footer-right">
        <span :class="['status-indicator', htmlContent ? 'ready' : 'pending']">
          {{ htmlContent ? '已生成' : '待生成' }}
        </span>
      </div>
    </footer>

    <!-- 通知组件 -->
    <div v-if="notification" :class="['notification', notification.type]">
      {{ notification.message }}
    </div>
    
    <!-- Markdown 语法指南 -->
    <MarkdownGuide 
      :show="showMarkdownGuide" 
      @close="showMarkdownGuide = false"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import MarkdownEditor from './components/MarkdownEditor.vue'
import PreviewPane from './components/PreviewPane.vue'
import MarkdownGuide from './components/MarkdownGuide.vue'
import { copyToWechatClean, rebuildHtmlForWechat } from './utils/clipboard-handler.js'

export default {
  name: 'App',
  components: {
    MarkdownEditor,
    PreviewPane,
    MarkdownGuide
  },
  setup() {
    // 响应式数据
    const markdownContent = ref(`# GitHub 风格绿色主题测试

## 🎯 设计目标

保持 **GitHub Markdown CSS** 的优秀设计，只将主题色调整为绿色，并优化微信公众号兼容性。

### ✨ 主要特性

- **GitHub 风格**：保持经典的 GitHub Markdown 样式结构
- **绿色主题**：统一使用 #52C41A 绿色系
- **微调优化**：竖线等元素更加圆润
- **微信兼容**：完美支持微信公众号粘贴

## 📝 样式测试

### 标题层级测试
# 一级标题 - GitHub 风格
## 二级标题 - 带圆润竖线
### 三级标题 - 绿色主题
#### 四级标题
##### 五级标题
###### 六级标题

### 文本格式测试
这是普通段落文本，包含各种格式：

- **粗体文本** 和 __另一种粗体__
- *斜体文本* 和 _另一种斜体_
- ***粗斜体文本***
- ~~删除线文本~~
- \`行内代码\` 示例

### 链接测试
- [GitHub 官网](https://github.com) - 绿色主题链接
- [Markdown 指南](https://www.markdownguide.org) - 外部链接
- [相对链接](./README.md) - 内部链接

### 引用块测试
> 这是一个 GitHub 风格的引用块。
>
> 保持了经典的设计，只是将边框颜色调整为绿色主题。
>
> > 嵌套引用块也支持绿色主题。

### 列表测试

#### 无序列表
- 第一项 (绿色标记)
- 第二项
  - 嵌套项 1
  - 嵌套项 2
    - 深层嵌套
- 第三项

#### 有序列表
1. 第一项 (绿色数字)
2. 第二项
   1. 嵌套有序项
   2. 另一个嵌套项
3. 第三项

#### 任务列表
- [x] 恢复 GitHub 原始样式
- [x] 应用绿色主题色
- [x] 优化竖线圆润度
- [x] 修复微信公众号兼容性
- [ ] 继续完善功能

### 代码测试

#### 行内代码
在 JavaScript 中使用 \`const\` 和 \`let\` 声明变量。

#### 代码块
\`\`\`javascript
// GitHub 风格代码块
const githubGreenTheme = {
  primary: '#52C41A',
  hover: '#389E0D',
  active: '#237804',
  style: 'github'
};

function applyTheme() {
  console.log('GitHub 绿色主题已应用');
  return githubGreenTheme;
}
\`\`\`

\`\`\`css
/* CSS 样式示例 */
.github-markdown {
  color: #52C41A;
  border-left: 4px solid #52C41A;
  background-color: #f6ffed;
}
\`\`\`

### 表格测试

| 特性 | GitHub 原版 | 绿色主题版 | 微信兼容 |
|------|-------------|------------|----------|
| 排版结构 | ✅ 优秀 | ✅ 保持 | ✅ 完美 |
| 视觉效果 | ✅ 专业 | ✅ 清新 | ✅ 美观 |
| 兼容性 | ✅ 标准 | ✅ 一致 | ✅ 优化 |
| 可读性 | ✅ 出色 | ✅ 舒适 | ✅ 友好 |

### 分割线测试
---

### 特殊元素测试

#### 键盘按键
使用 <kbd>Ctrl</kbd> + <kbd>C</kbd> 复制，<kbd>Ctrl</kbd> + <kbd>V</kbd> 粘贴。

#### 图片测试
![示例图片](https://xiaobox-public-images.oss-cn-beijing.aliyuncs.com/images20250626155159516.png)

## 🚀 微信公众号测试

### 复制粘贴测试
1. 点击右上角 **"复制 HTML 格式"** 按钮
2. 打开微信公众号编辑器
3. 直接粘贴 (Ctrl+V)
4. 检查样式是否完整保留

### 预期效果
- ✅ 标题层级清晰
- ✅ 绿色主题一致
- ✅ 代码块格式正确
- ✅ 表格布局完整
- ✅ 引用块样式保持
- ✅ 链接颜色正确

---

*GitHub 风格绿色主题 - 经典设计与现代色彩的完美结合！*`)

    const htmlContent = ref('')
    const notification = ref(null)
    const previewMode = ref('rendered')
    const showMarkdownGuide = ref(false)

    // 计算属性
    const estimatedReadTime = computed(() => {
      const wordsPerMinute = 200 // 中文阅读速度约200字/分钟
      const wordCount = markdownContent.value.length
      return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
    })


    // 方法
    const handleMarkdownChange = (content) => {
      markdownContent.value = content
    }

    const handleHtmlGenerated = (html) => {
      htmlContent.value = html
    }



    const clearContent = () => {
      if (confirm('确定要清空所有内容吗？')) {
        markdownContent.value = ''
      }
    }

    const loadSample = () => {
      if (confirm('确定要加载示例内容吗？这将覆盖当前内容。')) {
        markdownContent.value = `# GitHub 风格绿色主题测试

## 🎯 设计目标

保持 **GitHub Markdown CSS** 的优秀设计，只将主题色调整为绿色，并优化微信公众号兼容性。

### ✨ 主要特性

- **GitHub 风格**：保持经典的 GitHub Markdown 样式结构
- **绿色主题**：统一使用 #52C41A 绿色系
- **微调优化**：竖线等元素更加圆润
- **微信兼容**：完美支持微信公众号粘贴

## 📝 样式测试

### 标题层级测试
# 一级标题 - GitHub 风格
## 二级标题 - 带圆润竖线
### 三级标题 - 绿色主题
#### 四级标题
##### 五级标题
###### 六级标题

### 文本格式测试
这是普通段落文本，包含各种格式：

- **粗体文本** 和 __另一种粗体__
- *斜体文本* 和 _另一种斜体_
- ***粗斜体文本***
- ~~删除线文本~~
- \`行内代码\` 示例

### 链接测试
- [GitHub 官网](https://github.com) - 绿色主题链接
- [Markdown 指南](https://www.markdownguide.org) - 外部链接
- [相对链接](./README.md) - 内部链接

---

*GitHub 风格绿色主题 - 经典设计与现代色彩的完美结合！*`
      }
    }

    // 显示通知
    const showNotification = (message, type = 'info') => {
      notification.value = { message, type }
      setTimeout(() => {
        notification.value = null
      }, 5000)
    }



    const copyToClipboard = async () => {
      if (!htmlContent.value) {
        showNotification('请先编辑内容，等待HTML生成', 'warning')
        return
      }

      try {
        // 方法1：直接复制预览元素
        const previewElement = document.querySelector('.preview-rendered')
        if (previewElement) {
          // 创建一个选择范围
          const range = document.createRange()
          range.selectNodeContents(previewElement)
          
          const selection = window.getSelection()
          selection.removeAllRanges()
          selection.addRange(range)
          
          // 执行复制
          const success = document.execCommand('copy')
          
          // 清理选择
          selection.removeAllRanges()
          
          if (success) {
            showNotification('🎉 内容已复制！可以粘贴到任何支持HTML的编辑器', 'success')
            console.log('从预览窗口复制成功')
            return
          }
        }
        
        // 使用处理后的HTML
        const rebuiltHtml = rebuildHtmlForWechat(htmlContent.value)
        const success = await copyToWechatClean(rebuiltHtml)

        if (success) {
          showNotification('🎉 内容已复制！可以粘贴到任何支持HTML的编辑器', 'success')
        } else {
          showNotification('❌ 复制失败，请重试', 'error')
        }
      } catch (err) {
        console.error('复制错误:', err)
        showNotification('❌ 复制失败：' + err.message, 'error')
      }
    }

    return {
      markdownContent,
      htmlContent,
      notification,
      previewMode,
      estimatedReadTime,
      handleMarkdownChange,
      handleHtmlGenerated,
      clearContent,
      loadSample,
      copyToClipboard,
      showMarkdownGuide
    }
  }
}
</script>



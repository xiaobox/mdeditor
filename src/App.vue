<template>
  <div id="app">
    <!-- 头部工具栏 -->
    <header class="app-header">
      <div class="header-left">
        <h1>Modern MD Editor</h1>
        <span class="header-subtitle">现代化 Markdown 编辑器</span>
      </div>
      <div class="header-right">
        <button class="btn btn-settings" @click="showSettingsPanel = !showSettingsPanel" :class="{ 'active': showSettingsPanel }">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
          </svg>
          设置
        </button>

        <button class="btn btn-secondary" @click="showMarkdownGuide = true">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
          </svg>
          语法指南
        </button>

        <DropdownMenu
          :options="copyFormatOptions"
          v-model="selectedCopyFormat"
          trigger-text="复制"
          trigger-class="btn-copy-custom"
          :disabled="!markdownContent.trim()"
          @select="handleCopyFormatSelect"
        />
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
            <!-- HTML源码查看功能已移除 -->
          </div>
        </div>
        
        <PreviewPane
          :markdown="markdownContent"
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
    <div v-if="notifications.length > 0" class="notification-container">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['notification', notification.type]"
      >
        {{ notification.message }}
      </div>
    </div>
    
    <!-- 设置面板 -->
    <SettingsPanel
      :visible="showSettingsPanel"
      @close="showSettingsPanel = false"
      @theme-system-changed="handleThemeSystemChanged"
      @theme-changed="handleThemeChanged"
      @code-style-changed="handleCodeStyleChanged"
    />

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
import SettingsPanel from './components/SettingsPanel.vue'
import DropdownMenu from './components/DropdownMenu.vue'
import {
  copySocialFormat,
  copyMarkdownFormat,
  getCopyFormatOptions
} from './core/editor/copy-formats.js'
import { useGlobalThemeManager } from './composables/index.js'

export default {
  name: 'App',
  components: {
    MarkdownEditor,
    PreviewPane,
    MarkdownGuide,
    SettingsPanel,
    DropdownMenu
  },
  setup() {
    // 使用统一主题管理器
    const themeManager = useGlobalThemeManager()

    // 解构所需的功能
    const {
      currentColorThemeId,
      currentColorTheme,
      currentCodeStyleId,
      currentCodeStyle,
      currentThemeSystemId: currentLayoutId,
      setColorTheme,
      setCodeStyle,
      setThemeSystem: setLayout,
      initialize
    } = themeManager
    // 响应式数据
    const markdownContent = ref(`# Markdown 格式完整测试

## 📋 所有格式枚举测试

这是一个包含所有 Markdown 格式的完整测试文档，用于检查社交平台兼容性。

---

## 1️⃣ 标题层级测试

# 一级标题 H1
## 二级标题 H2
### 三级标题 H3
#### 四级标题 H4
##### 五级标题 H5
###### 六级标题 H6

---

## 2️⃣ 文本格式测试

### 基础文本格式
- **粗体文本** 和 __另一种粗体语法__
- *斜体文本* 和 _另一种斜体语法_
- ***粗斜体文本*** 和 ___另一种粗斜体___
- ~~删除线文本~~
- \`行内代码\` 示例
- 普通文本和 **混合** *格式* ~~测试~~

### 特殊字符和转义
- 反引号: \\\`code\\\`
- 星号: \\*text\\*
- 下划线: \\_text\\_
- 波浪号: \\~\\~text\\~\\~

---

## 3️⃣ 列表测试

### 无序列表
- 第一项
- 第二项
  - 嵌套项 1
  - 嵌套项 2
    - 深层嵌套项
    - 另一个深层项
  - 嵌套项 3
- 第三项
- 包含 **粗体** 和 *斜体* 的项
- 包含 \`代码\` 的项

### 有序列表
1. 第一项
2. 第二项
   1. 嵌套有序项 1
   2. 嵌套有序项 2
      1. 深层嵌套
      2. 另一个深层嵌套
   3. 嵌套有序项 3
3. 第三项
4. 包含 **格式** 的项
5. 包含 \`代码\` 的项

### 任务列表
- [x] 已完成任务
- [x] 另一个已完成任务
- [ ] 未完成任务
- [ ] 包含 **粗体** 的任务
- [x] 包含 \`代码\` 的已完成任务
- [ ] 包含 [链接](https://github.com) 的任务

---

## 4️⃣ 引用块测试

### 简单引用
> 这是一个简单的引用块。

### 多行引用
> 这是多行引用的第一行。
>
> 这是第二行，中间有空行。
>
> 这是第三行。

### 嵌套引用
> 这是外层引用。
>
> > 这是嵌套引用。
> >
> > > 这是更深层的嵌套引用。
>
> 回到外层引用。

### 引用中的格式
> 引用中可以包含 **粗体**、*斜体* 和 \`代码\`。
>
> 也可以包含 [链接](https://github.com)。

---

## 5️⃣ 代码测试

### 行内代码
这是 \`行内代码\` 示例，包含 \`console.log('Hello')\` 这样的代码片段。

### 代码块（无语言标识）
\`\`\`
这是没有语言标识的代码块
可以包含任意文本
保持原有格式和缩进
\`\`\`

### JavaScript 代码块
\`\`\`javascript
// JavaScript 代码示例
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return \`Welcome, \${name}\`;
}

const user = 'World';
greet(user);
\`\`\`

---

## 6️⃣ 表格测试

### 简单表格
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据1 | 数据2 | 数据3 |
| 数据4 | 数据5 | 数据6 |

### 对齐表格
| 左对齐 | 居中对齐 | 右对齐 |
|:-------|:-------:|-------:|
| 左 | 中 | 右 |
| 数据较长的内容 | 居中内容 | 右侧内容 |

### 包含格式的表格
| 功能 | 语法 | 示例 |
|------|------|------|
| **粗体** | \`**text**\` | **示例文本** |
| *斜体* | \`*text*\` | *示例文本* |
| \`代码\` | \`\\\`code\\\`\` | \`console.log()\` |
| [链接](https://github.com) | \`[text](url)\` | [GitHub](https://github.com) |

---

## 7️⃣ 分割线测试

使用三个或更多连字符：

---

使用三个或更多星号：

***

使用三个或更多下划线：

___

---

## 📝 测试总结

以上包含了所有常用的 Markdown 格式：

✅ **已测试格式**：
- 标题（H1-H6）
- 文本格式（粗体、斜体、删除线、行内代码）
- 列表（有序、无序、任务列表、嵌套）
- 引用块（简单、多行、嵌套）
- 代码块（多种语言）
- 表格（简单、对齐、包含格式）
- 分割线

🎯 **测试目标**：检查所有格式在社交平台中的显示效果和兼容性。`)

    const htmlContent = ref('')
    const notifications = ref([])
    const showMarkdownGuide = ref(false)
    const showSettingsPanel = ref(false)

    // 复制格式相关
    const copyFormatOptions = getCopyFormatOptions()
    const selectedCopyFormat = ref(null) // 不设置默认选中，避免用户困惑

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
        markdownContent.value = `# Markdown 格式完整测试

## 📋 所有格式枚举测试

这是一个包含所有 Markdown 格式的完整测试文档，用于检查社交平台兼容性。

### 基础格式测试
- **粗体文本** 和 __另一种粗体语法__
- *斜体文本* 和 _另一种斜体语法_
- ***粗斜体文本*** 和 ___另一种粗斜体___
- ~~删除线文本~~
- \`行内代码\` 示例



### 列表测试
1. 有序列表项
2. 包含 **格式** 的项
3. 包含 \`代码\` 的项

- 无序列表项
- 包含 **粗体** 和 *斜体* 的项
- 包含 \`代码\` 的项

### 任务列表
- [x] 已完成任务
- [ ] 未完成任务
- [x] 包含 \`代码\` 的已完成任务

### 引用块测试
> 这是引用块，可以包含 **粗体**、*斜体* 和 \`代码\`。

### 代码块测试
\`\`\`javascript
// JavaScript 代码示例
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`

### 表格测试
| 功能 | 语法 | 示例 |
|------|------|------|
| **粗体** | \`**text**\` | **示例文本** |
| *斜体* | \`*text*\` | *示例文本* |
| \`代码\` | \`\\\`code\\\`\` | \`console.log()\` |

🎯 **测试目标**：检查所有格式在社交平台中的显示效果和兼容性。`
      }
    }

    // 显示通知
    const showNotification = (message, type = 'info') => {
      const id = Date.now() + Math.random() // 生成唯一ID
      const newNotification = { id, message, type }

      // 添加到通知数组
      notifications.value.push(newNotification)

      // 3秒后自动移除该通知
      setTimeout(() => {
        const index = notifications.value.findIndex(n => n.id === id)
        if (index > -1) {
          notifications.value.splice(index, 1)
        }
      }, 3000)
    }





    // 获取当前有效的颜色主题（包括临时自定义主题）
    const getCurrentEffectiveTheme = () => {
      try {
        const tempTheme = localStorage.getItem('temp-custom-theme')
        if (tempTheme) {
          return JSON.parse(tempTheme)
        }
      } catch (error) {
        console.warn('Failed to load temp custom theme:', error)
      }
      return currentColorTheme.value
    }

    const handleCopyFormatSelect = async (option) => {
      if (!markdownContent.value.trim()) {
        showNotification('请先编辑内容', 'warning')
        return
      }

      try {
        let result
        const copyOptions = {
          theme: getCurrentEffectiveTheme(), // 使用有效主题
          codeTheme: currentCodeStyle.value,
          themeSystem: currentLayoutId.value
        }

        // 如果没有指定格式，默认使用社交格式
        const formatValue = option.value || 'social'

        switch (formatValue) {
          case 'social':
            result = await copySocialFormat(markdownContent.value, copyOptions)
            break
          case 'markdown':
            result = await copyMarkdownFormat(markdownContent.value)
            break
          default:
            result = { success: false, message: '未知的复制格式' }
        }

        showNotification(result.message, result.success ? 'success' : 'error')
      } catch (err) {
        console.error('复制错误:', err)
        showNotification('❌ 复制失败：' + err.message, 'error')
      }
    }

    // 布局主题系统处理方法
    const handleThemeSystemChanged = (systemId) => {
      setLayout(systemId)
      // 重新应用当前颜色主题，确保颜色变量也被更新
      setColorTheme(currentColorThemeId.value)
      const systemName = currentLayoutId.value === 'default' ? '默认主题' : '主题系统'
      showNotification(`主题风格已更新为${systemName}`, 'success')
    }

    // 颜色主题处理方法
    const handleThemeChanged = (themeId) => {
      setColorTheme(themeId)
      showNotification('主题色已更新', 'success')
    }

    // 代码样式处理方法
    const handleCodeStyleChanged = (styleId) => {
      setCodeStyle(styleId)
      const styleName = currentCodeStyleId.value === 'mac' ? 'Mac 风格' :
                       currentCodeStyleId.value === 'github' ? 'GitHub 风格' :
                       currentCodeStyleId.value === 'vscode' ? 'VS Code 风格' :
                       currentCodeStyleId.value === 'terminal' ? '终端风格' : '代码样式'
      showNotification(`代码样式已更新为${styleName}`, 'success')
    }

    // 初始化主题 - 立即初始化避免闪烁
    initialize()

    return {
      markdownContent,
      htmlContent,
      notifications,
      estimatedReadTime,
      currentThemeSystemId: currentLayoutId,
      currentThemeId: currentColorThemeId,
      currentCodeStyleId,
      showSettingsPanel,
      showMarkdownGuide,
      copyFormatOptions,
      selectedCopyFormat,
      handleMarkdownChange,
      handleHtmlGenerated,
      handleCopyFormatSelect,
      clearContent,
      loadSample,
      handleThemeSystemChanged,
      handleThemeChanged,
      handleCodeStyleChanged
    }
  }
}
</script>

<style scoped>


/* 设置按钮样式 */
.btn-settings {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  color: #495057;
  border: 1px solid #dee2e6;
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.btn-settings::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg,
    var(--theme-primary, #00A86B)08 0%,
    var(--theme-primary, #00A86B)04 50%,
    var(--theme-primary, #00A86B)08 100%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.btn-settings:hover::before {
  opacity: 1;
}

.btn-settings:hover {
  border-color: var(--theme-primary, #00A86B);
  color: var(--theme-primary, #00A86B);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-settings.active {
  background: var(--theme-primary, #00A86B);
  color: white;
  border-color: var(--theme-primary, #00A86B);
  box-shadow: 0 2px 8px var(--theme-primary, #00A86B)40;
}

.btn-settings.active::before {
  opacity: 0;
}




</style>

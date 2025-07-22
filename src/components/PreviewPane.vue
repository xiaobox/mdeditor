<template>
  <div class="preview-pane">
    <!-- 预览模式切换工具栏 -->
    <div class="preview-toolbar">
      <div class="preview-mode-selector">
        <label class="mode-label">预览模式:</label>
        <div class="mode-buttons">
          <button
            v-for="mode in viewportModes"
            :key="mode.key"
            @click="currentViewportMode = mode.key"
            :class="['mode-btn', { active: currentViewportMode === mode.key }]"
            :title="mode.description"
          >
            <component :is="mode.icon" class="mode-icon" />
            <span class="mode-text">{{ mode.label }}</span>
          </button>
        </div>
      </div>

      <div class="viewport-info">
        <span class="viewport-size">{{ getCurrentModeInfo().size }}</span>
      </div>
    </div>

    <!-- 预览容器 -->
    <div class="preview-container" :class="`viewport-${currentViewportMode}`">
      <!-- 渲染预览模式 -->
      <div v-if="previewMode === 'rendered'"
           ref="previewContent"
           class="preview-rendered markdown-body modern-markdown"
           :class="getPreviewClasses()"
           @scroll="handleScroll"
           v-html="renderedHtml">
      </div>

      <!-- HTML源码模式 -->
      <div v-else class="preview-html">
        <textarea
          readonly
          :value="wechatHtml"
          class="html-textarea"
          placeholder="生成的HTML代码将在这里显示..."
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { parseMarkdown } from '../utils/markdown-parser.js'
import { formatForWechat } from '../utils/wechat-formatter.js'

import '../styles/modern-markdown.css'

// 图标组件
const DesktopIcon = {
  template: `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M21,16H3V4H21M21,2H3C1.89,2 1,2.89 1,4V16A2,2 0 0,0 3,18H10V20H8V22H16V20H14V18H21A2,2 0 0,0 23,16V4C23,2.89 22.1,2 21,2Z"/></svg>`
}

const TabletIcon = {
  template: `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19,18H5V6H19M21,4H3C1.89,4 1,4.89 1,6V18A2,2 0 0,0 3,20H21A2,2 0 0,0 23,18V6C23,4.89 22.1,4 21,4Z"/></svg>`
}

const MobileIcon = {
  template: `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3C19,1.89 18.1,1 17,1Z"/></svg>`
}

export default {
  name: 'PreviewPane',
  components: {
    DesktopIcon,
    TabletIcon,
    MobileIcon
  },
  props: {
    markdown: {
      type: String,
      default: ''
    },
    previewMode: {
      type: String,
      default: 'rendered'
    },

  },
  emits: ['html-generated'],
  setup(props, { emit }) {
    const renderedHtml = ref('')
    const wechatHtml = ref('')
    const previewContent = ref(null)
    const currentViewportMode = ref('desktop')
    const scrollPosition = ref(0)
    // 移除多余的变量声明，现在在滚动时实时获取

    // 预览模式配置
    const viewportModes = [
      {
        key: 'desktop',
        label: '桌面端',
        icon: 'DesktopIcon',
        size: '100%',
        maxWidth: 'none',
        description: '桌面端预览 - 宽屏显示'
      },
      {
        key: 'tablet',
        label: '平板',
        icon: 'TabletIcon',
        size: '768px',
        maxWidth: '768px',
        description: '平板端预览 - 中等屏幕'
      },
      {
        key: 'mobile',
        label: '手机',
        icon: 'MobileIcon',
        size: '375px',
        maxWidth: '375px',
        description: '移动端预览 - 手机屏幕'
      }
    ]

    // 获取当前模式信息
    const getCurrentModeInfo = () => {
      return viewportModes.find(mode => mode.key === currentViewportMode.value) || viewportModes[0]
    }

    // 获取预览样式类
    const getPreviewClasses = () => {
      return {
        [`viewport-${currentViewportMode.value}`]: true,
        'viewport-mobile': currentViewportMode.value === 'mobile',
        'viewport-tablet': currentViewportMode.value === 'tablet',
        'viewport-desktop': currentViewportMode.value === 'desktop'
      }
    }

    // 保存和恢复滚动位置
    const saveScrollPosition = () => {
      if (previewContent.value) {
        const scrollTop = previewContent.value.scrollTop
        const scrollHeight = previewContent.value.scrollHeight
        const clientHeight = previewContent.value.clientHeight

        // 保存滚动百分比而不是绝对位置，这样在内容高度变化时更准确
        scrollPosition.value = {
          scrollTop,
          scrollPercentage: scrollHeight > clientHeight ? scrollTop / (scrollHeight - clientHeight) : 0,
          timestamp: Date.now()
        }
      }
    }

    const restoreScrollPosition = () => {
      // 滚动位置恢复已禁用，避免与同步冲突
    }

    // 滚动同步处理
    const handleScroll = (e) => {
      const element = e.target
      const scrollTop = element.scrollTop
      const scrollHeight = element.scrollHeight
      const clientHeight = element.clientHeight

      // 保存滚动位置
      saveScrollPosition()

      // 计算滚动百分比
      const maxScrollTop = Math.max(0, scrollHeight - clientHeight)
      const scrollPercentage = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0

      // 同步到编辑器
      const editorElement = document.querySelector('.cm-scroller')
      if (editorElement) {
        const editorMaxScrollTop = Math.max(0, editorElement.scrollHeight - editorElement.clientHeight)
        const targetScrollTop = Math.round(editorMaxScrollTop * scrollPercentage)
        editorElement.scrollTop = targetScrollTop
      }
    }

    // 监听视口模式变化，添加平滑过渡
    watch(currentViewportMode, (_, oldMode) => {
      if (oldMode) {
        saveScrollPosition()

        // 添加切换动画类
        if (previewContent.value) {
          previewContent.value.classList.add('viewport-transitioning')

          // 动画完成后移除类并恢复滚动位置
          setTimeout(() => {
            if (previewContent.value) {
              previewContent.value.classList.remove('viewport-transitioning')
              restoreScrollPosition()
            }
          }, 300)
        }
      }
    })

    // 处理Markdown解析和转换
    const processMarkdown = () => {
      if (!props.markdown) {
        renderedHtml.value = ''
        wechatHtml.value = ''
        emit('html-generated', '')
        return
      }

      try {
        // 1. 解析Markdown为HTML
        const parsed = parseMarkdown(props.markdown)

        // 2. 生成预览版本（用于渲染预览）
        renderedHtml.value = parsed

        // 3. 生成微信公众号格式
        const wechatFormatted = formatForWechat(parsed)
        wechatHtml.value = wechatFormatted

        // 4. 发送给父组件
        emit('html-generated', wechatFormatted)
      } catch (error) {
        console.error('处理Markdown时出错:', error)
        const errorMessage = `<div class="error">
          <h3>❌ 处理错误</h3>
          <p>错误信息: ${error.message}</p>
          <p>请检查Markdown语法或联系开发者。</p>
        </div>`

        renderedHtml.value = errorMessage
        wechatHtml.value = ''
        emit('html-generated', '')
      }
    }

    // 监听markdown内容变化
    watch(() => props.markdown, () => {
      processMarkdown()
    }, { immediate: true })

    // 组件生命周期
    onMounted(() => {
      // 组件挂载完成
    })

    onUnmounted(() => {
      // 组件卸载清理
    })

    return {
      renderedHtml,
      wechatHtml,
      previewContent,
      currentViewportMode,
      viewportModes,
      getCurrentModeInfo,
      getPreviewClasses,
      handleScroll
    }
  }
}
</script>


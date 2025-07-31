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
            <!-- 桌面端图标 -->
            <svg v-if="mode.key === 'desktop'" class="mode-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M21,16H3V4H21M21,2H3C1.89,2 1,2.89 1,4V16A2,2 0 0,0 3,18H10V20H8V22H16V20H14V18H21A2,2 0 0,0 23,16V4C23,2.89 22.1,2 21,2Z"/>
            </svg>
            <!-- 平板图标 -->
            <svg v-else-if="mode.key === 'tablet'" class="mode-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M19,18H5V6H19M21,4H3C1.89,4 1,4.89 1,6V18A2,2 0 0,0 3,20H21A2,2 0 0,0 23,18V6C23,4.89 22.1,4 21,4Z"/>
            </svg>
            <!-- 手机图标 -->
            <svg v-else-if="mode.key === 'mobile'" class="mode-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3C19,1.89 18.1,1 17,1Z"/>
            </svg>
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
      <div ref="previewContent"
           class="preview-rendered markdown-body modern-markdown"
           :class="getPreviewClasses()"
           @scroll="handleScroll"
           v-html="renderedHtml">
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { parseMarkdown } from '../core/markdown/parser/coordinator.js'
import { useGlobalThemeManager } from '../composables/index.js'

export default {
  name: 'PreviewPane',
  props: {
    markdown: {
      type: String,
      default: ''
    }
  },
  emits: ['html-generated'],
  setup(props, { emit }) {
    // 使用统一主题管理器
    const themeManager = useGlobalThemeManager()

    // 解构所需功能
    const {
      currentThemeSystemId: currentLayoutId,
      currentColorTheme,
      currentCodeStyle,
      currentFontSettings,
      initialize
    } = themeManager

    const renderedHtml = ref('')
    const socialHtml = ref('')
    const previewContent = ref(null)
    const currentViewportMode = ref('desktop')
    const scrollPosition = ref(0)
    // 移除多余的变量声明，现在在滚动时实时获取

    // 预览模式配置
    const viewportModes = [
      {
        key: 'desktop',
        label: '桌面端',
        size: '100%',
        maxWidth: 'none',
        description: '桌面端预览 - 宽屏显示'
      },
      {
        key: 'tablet',
        label: '平板',
        size: '768px',
        maxWidth: '768px',
        description: '平板端预览 - 中等屏幕'
      },
      {
        key: 'mobile',
        label: '手机',
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

    // 获取当前有效的颜色主题（包括临时自定义主题）
    const getCurrentTheme = () => {
      // 检查是否有临时自定义主题
      try {
        const tempTheme = localStorage.getItem('temp-custom-theme')
        if (tempTheme) {
          return JSON.parse(tempTheme)
        }
      } catch (error) {
        console.warn('Failed to load temp custom theme:', error)
      }

      // 返回当前主题
      return currentColorTheme.value
    }

    // 处理Markdown解析和转换
    const processMarkdown = () => {
      if (!props.markdown) {
        renderedHtml.value = ''
        socialHtml.value = ''
        emit('html-generated', '')
        return
      }

      try {
        // 获取当前有效主题（可能是临时自定义主题）
        const effectiveTheme = getCurrentTheme()

        // 1. 生成公众号格式 - 使用 parseMarkdown 函数直接处理
        const socialFormatted = parseMarkdown(props.markdown, {
          theme: effectiveTheme,
          codeTheme: currentCodeStyle.value,
          themeSystem: currentLayoutId.value,
          fontSettings: currentFontSettings.value
        })
        socialHtml.value = socialFormatted

        // 2. 预览版本使用相同的格式化器，但标记为预览环境以调整样式
        const previewFormatted = parseMarkdown(props.markdown, {
          theme: effectiveTheme,
          codeTheme: currentCodeStyle.value,
          themeSystem: currentLayoutId.value,
          fontSettings: currentFontSettings.value,
          isPreview: true
        })
        renderedHtml.value = previewFormatted

        // 3. 发送给父组件
        emit('html-generated', socialFormatted)
      } catch (error) {
        console.error('处理Markdown时出错:', error)
        const errorMessage = `<div class="error">
          <h3>❌ 处理错误</h3>
          <p>错误信息: ${error.message}</p>
          <p>请检查Markdown语法或联系开发者。</p>
        </div>`

        renderedHtml.value = errorMessage
        socialHtml.value = ''
        emit('html-generated', '')
      }
    }

    // HTML语法高亮功能已移除



    // 监听markdown内容变化
    watch(() => props.markdown, () => {
      processMarkdown()
    }, { immediate: true })

    // 监听颜色主题变化
    watch(currentColorTheme, () => {
      processMarkdown()
    }, { deep: true })

    // 监听代码样式变化
    watch(currentCodeStyle, () => {
      processMarkdown()
    }, { deep: true })

    // 监听布局主题系统变化
    watch(currentLayoutId, () => {
      processMarkdown()
    })

    // 监听字体设置变化
    watch(currentFontSettings, () => {
      processMarkdown()
    }, { deep: true })

    // 监听临时自定义主题变化
    const handleCustomThemeChange = () => {
      processMarkdown()
    }

    // 组件生命周期
    onMounted(() => {
      // 初始化主题系统
      initialize()

      // 监听自定义主题变化事件
      window.addEventListener('custom-theme-changed', handleCustomThemeChange)

      // 保存清理函数
      onUnmounted(() => {
        window.removeEventListener('custom-theme-changed', handleCustomThemeChange)
      })
    })

    onUnmounted(() => {
      // 组件卸载清理
    })

    return {
      renderedHtml,
      socialHtml,
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


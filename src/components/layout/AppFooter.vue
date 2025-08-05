<template>
  <footer class="app-footer">
    <div class="footer-left">
      <div class="stat-item">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>
        <span>{{ characterCount }} 字符</span>
      </div>
      <div class="stat-item">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M3,3H21V5H3V3M3,7H21V9H3V7M3,11H21V13H3V11M3,15H21V17H3V15M3,19H21V21H3V19Z"/>
        </svg>
        <span>{{ lineCount }} 行</span>
      </div>
      <div class="stat-item">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M17,7H22V17H17V19A1,1 0 0,0 18,20H20V22H17.5C16.95,22 16,21.55 16,21C16,21.55 15.05,22 14.5,22H12V20H14A1,1 0 0,0 15,19V5A1,1 0 0,0 14,4H12V2H14.5C15.05,2 16,2.45 16,3C16,2.45 16.95,2 17.5,2H20V4H18A1,1 0 0,0 17,5V7M2,7H13V9H4V15H13V17H2V7Z"/>
        </svg>
        <span>{{ wordCount }} 词</span>
      </div>
      <div class="stat-item">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
        </svg>
        <span>{{ estimatedReadTime }} 分钟</span>
      </div>
    </div>
    <div class="footer-right">
      <!-- 控制按钮组 -->
      <div class="control-group">
        <!-- 同步滚动开关 -->
        <div class="sync-scroll-toggle">
          <label class="toggle-label">
            <span class="toggle-text">同步滚动</span>
            <input
              type="checkbox"
              :checked="syncScrollEnabled"
              @change="$emit('toggle-sync-scroll')"
              class="toggle-checkbox"
            />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <!-- 分隔线 -->
        <div class="control-divider"></div>

        <!-- 回到顶部按钮 -->
        <div class="back-to-top-toggle">
          <button
            @click="scrollToTop"
            :class="['back-to-top-btn', { 'has-scroll': hasScrollableContent }]"
            title="回到顶部"
            aria-label="回到顶部"
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z"/>
            </svg>
            <span class="back-to-top-text">回到顶部</span>
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  characterCount: {
    type: Number,
    required: true
  },
  lineCount: {
    type: Number,
    required: true
  },
  wordCount: {
    type: Number,
    required: true
  },
  estimatedReadTime: {
    type: Number,
    required: true
  },
  syncScrollEnabled: {
    type: Boolean,
    default: true
  }
})

defineEmits(['toggle-sync-scroll'])

// 滚动状态检测
const hasScrollableContent = ref(false)

// 存储当前绑定的元素引用，用于清理事件监听器
let currentEditorScroller = null
let currentPreviewScroller = null

// 检查是否有可滚动内容
const checkScrollableContent = () => {
  try {
    const editorScroller = document.querySelector('.cm-scroller')
    const previewScroller = document.querySelector('.preview-rendered')

    let hasScroll = false

    // 检查编辑器是否有滚动
    if (editorScroller && editorScroller.scrollTop > 50) {
      hasScroll = true
    }

    // 检查预览面板是否有滚动
    if (previewScroller && previewScroller.scrollTop > 50) {
      hasScroll = true
    }

    hasScrollableContent.value = hasScroll
  } catch (error) {
    console.error('Check scroll error:', error)
  }
}

// 滚动事件监听器
const handleEditorScroll = () => checkScrollableContent()
const handlePreviewScroll = () => checkScrollableContent()

// 清理现有的事件监听器
const cleanupScrollListeners = () => {
  if (currentEditorScroller) {
    currentEditorScroller.removeEventListener('scroll', handleEditorScroll)
    currentEditorScroller = null
  }
  if (currentPreviewScroller) {
    currentPreviewScroller.removeEventListener('scroll', handlePreviewScroll)
    currentPreviewScroller = null
  }
}

// 设置滚动监听器
const setupScrollListeners = () => {
  // 先清理现有的监听器
  cleanupScrollListeners()

  // 查找新的滚动元素
  const editorScroller = document.querySelector('.cm-scroller')
  const previewScroller = document.querySelector('.preview-rendered')

  // 绑定编辑器滚动监听器
  if (editorScroller) {
    editorScroller.addEventListener('scroll', handleEditorScroll, { passive: true })
    currentEditorScroller = editorScroller
    console.debug('✅ Editor scroll listener attached')
  } else {
    console.debug('⚠️ Editor scroller not found')
  }

  // 绑定预览面板滚动监听器
  if (previewScroller) {
    previewScroller.addEventListener('scroll', handlePreviewScroll, { passive: true })
    currentPreviewScroller = previewScroller
    console.debug('✅ Preview scroll listener attached')
  } else {
    console.debug('⚠️ Preview scroller not found')
  }
}

// 使用 MutationObserver 监听 DOM 变化
let mutationObserver = null

const startDOMObserver = () => {
  // 创建 MutationObserver 来监听 DOM 变化
  mutationObserver = new MutationObserver((mutations) => {
    let shouldRebind = false

    mutations.forEach((mutation) => {
      // 检查是否有新增或删除的节点
      if (mutation.type === 'childList') {
        // 检查是否涉及编辑器或预览面板的变化
        const addedNodes = Array.from(mutation.addedNodes)
        const removedNodes = Array.from(mutation.removedNodes)

        const hasRelevantChanges = [...addedNodes, ...removedNodes].some(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            return node.classList?.contains('cm-scroller') ||
                   node.classList?.contains('preview-rendered') ||
                   node.querySelector?.('.cm-scroller') ||
                   node.querySelector?.('.preview-rendered')
          }
          return false
        })

        if (hasRelevantChanges) {
          shouldRebind = true
          console.debug('🔄 DOM change detected, will rebind scroll listeners')
        }
      }
    })

    if (shouldRebind) {
      // 延迟重新绑定，确保 DOM 完全更新
      nextTick(() => {
        setTimeout(() => {
          setupScrollListeners()
          checkScrollableContent()
        }, 100)
      })
    }
  })

  // 开始观察整个应用的 DOM 变化
  const appElement = document.getElementById('app')
  if (appElement) {
    mutationObserver.observe(appElement, {
      childList: true,
      subtree: true
    })
  }
}

// 手动重新初始化监听器（作为备用方案）
const reinitializeListeners = () => {
  console.debug('🔄 Manually reinitializing scroll listeners')
  setupScrollListeners()
  checkScrollableContent()
}

// 生命周期
onMounted(() => {
  // 初始设置
  nextTick(() => {
    setTimeout(() => {
      setupScrollListeners()
      checkScrollableContent()
      startDOMObserver()
    }, 100)
  })

  // 添加一个定期检查机制，确保监听器始终有效
  const intervalCheck = setInterval(() => {
    const editorExists = document.querySelector('.cm-scroller')
    const previewExists = document.querySelector('.preview-rendered')

    // 如果元素存在但监听器丢失，重新绑定
    if ((editorExists && !currentEditorScroller) ||
        (previewExists && !currentPreviewScroller)) {
      console.debug('🔧 Detected missing listeners, reinitializing...')
      reinitializeListeners()
    }
  }, 2000) // 每2秒检查一次

  // 清理定时器
  onUnmounted(() => {
    clearInterval(intervalCheck)
  })
})

onUnmounted(() => {
  // 清理所有监听器
  cleanupScrollListeners()

  // 停止 DOM 观察
  if (mutationObserver) {
    mutationObserver.disconnect()
    mutationObserver = null
  }
})

// 回到顶部功能 - 滚动编辑器和预览面板内容
const scrollToTop = () => {
  try {
    // 滚动编辑器内容到顶部
    const editorScroller = document.querySelector('.cm-scroller')
    if (editorScroller) {
      editorScroller.scrollTop = 0
      // 也尝试平滑滚动作为备选
      if (typeof editorScroller.scrollTo === 'function') {
        editorScroller.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }

    // 滚动预览面板内容到顶部
    const previewScroller = document.querySelector('.preview-rendered')
    if (previewScroller) {
      previewScroller.scrollTop = 0
      // 也尝试平滑滚动作为备选
      if (typeof previewScroller.scrollTo === 'function') {
        previewScroller.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }

    // 滚动完成后重新检查状态
    setTimeout(checkScrollableContent, 100)

  } catch (error) {
    console.error('Scroll error:', error)
  }
}

// 暴露方法给父组件
defineExpose({
  reinitializeListeners,
  checkScrollableContent
})

// 移除不需要的计算属性，现在从props直接获取
</script>

<style scoped>
.app-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  background: linear-gradient(135deg,
    #94a3b8 0%,
    #cbd5e1 25%,
    #e2e8f0 50%,
    #f1f5f9 75%,
    #f8fafc 100%);
  border-top: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow:
    0 -8px 32px rgba(0, 0, 0, 0.06),
    0 -4px 16px rgba(0, 0, 0, 0.04),
    inset 0 -1px 0 rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
  position: relative;
}

.app-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg,
    var(--primary-color) 0%,
    var(--primary-hover) 50%,
    var(--primary-color) 100%);
  opacity: 0.8;
  box-shadow: 0 1px 3px rgba(var(--primary-rgb), 0.3);
}

.footer-left,
.footer-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--theme-text-secondary);
  font-weight: 600;
  letter-spacing: 0.2px;
  transition: all 0.2s ease;
}

.stat-item:hover {
  color: var(--primary-color);
  transform: translateY(-1px);
}

.stat-item svg {
  opacity: 0.7;
  transition: all 0.2s ease;
}

.stat-item:hover svg {
  opacity: 1;
  color: var(--primary-color);
}

/* 控制按钮组样式 - 简洁现代设计 */
.control-group {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 6px;
  backdrop-filter: blur(10px);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.05);
  gap: 4px;
}

/* 控制分隔线 - 更简洁 */
.control-divider {
  width: 1px;
  height: 24px;
  background: rgba(0, 0, 0, 0.1);
  margin: 0 4px;
}

/* 同步滚动开关样式 */
.sync-scroll-toggle {
  display: flex;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  transition: all 0.2s ease;
  padding: 8px 14px;
  border-radius: 16px;
  background: transparent;
}

.toggle-label:hover {
  color: var(--primary-color);
  background: rgba(0, 0, 0, 0.05);
}

.toggle-checkbox {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 40px;
  height: 22px;
  background: #e2e8f0;
  border-radius: 11px;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-slider::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: #ffffff;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-checkbox:checked + .toggle-slider {
  background: var(--primary-color);
}

.toggle-checkbox:checked + .toggle-slider::before {
  transform: translateX(18px);
}

.toggle-text {
  font-weight: 600;
  letter-spacing: -0.01em;
}

/* 回到顶部按钮样式 - 与同步滚动开关保持一致 */
.back-to-top-toggle {
  display: flex;
  align-items: center;
}

.back-to-top-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: none;
  border-radius: 16px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  user-select: none;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.01em;
  transition: all 0.3s ease;
}

.back-to-top-btn:hover {
  color: var(--primary-color);
  background: rgba(0, 0, 0, 0.05);
}

.back-to-top-btn:active {
  color: var(--primary-hover);
  background: rgba(0, 0, 0, 0.1);
}

.back-to-top-btn svg {
  flex-shrink: 0;
  transition: all 0.2s ease;
  opacity: 0.7;
}

.back-to-top-btn:hover svg {
  opacity: 1;
  transform: translateY(-1px);
}

.back-to-top-text {
  font-weight: 500;
  letter-spacing: -0.01em;
  transition: all 0.2s ease;
}

/* 当有可滚动内容时的特殊样式 - 现代简洁风格 */
.back-to-top-btn.has-scroll {
  background: rgba(var(--primary-rgb, 0, 168, 107), 0.1);
  color: var(--primary-color);
  animation: subtle-glow 2.5s ease-in-out infinite;
}

.back-to-top-btn.has-scroll:hover {
  background: rgba(var(--primary-rgb, 0, 168, 107), 0.15);
  color: var(--primary-hover);
  animation: none;
  transform: translateY(-1px);
}

.back-to-top-btn.has-scroll:active {
  background: rgba(var(--primary-rgb, 0, 168, 107), 0.2);
  color: var(--primary-dark);
  transform: translateY(0);
}

.back-to-top-btn.has-scroll svg {
  color: var(--primary-color);
  opacity: 1;
}

.back-to-top-btn.has-scroll:hover svg {
  color: var(--primary-hover);
  transform: translateY(-2px);
}

/* 微妙的发光动画 - 只改变颜色，不改变尺寸 */
@keyframes subtle-glow {
  0%, 100% {
    background: rgba(var(--primary-rgb, 0, 168, 107), 0.1);
    color: var(--primary-color);
  }
  50% {
    background: rgba(var(--primary-rgb, 0, 168, 107), 0.15);
    color: var(--primary-hover);
  }
}



/* 响应式设计 */
@media (max-width: 768px) {
  .app-footer {
    padding: 10px 16px;
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
  
  .footer-left {
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .stat-item {
    font-size: 12px;
  }
  
  .status-indicator {
    font-size: 11px;
    padding: 4px 8px;
  }
}

@media (max-width: 480px) {
  .footer-left {
    gap: 12px;
  }
  
  .stat-item span {
    display: none;
  }
  
  .stat-item {
    flex-direction: column;
    gap: 2px;
    font-size: 11px;
  }
}
</style>

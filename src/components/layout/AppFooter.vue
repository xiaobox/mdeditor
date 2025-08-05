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
import { computed, ref, onMounted, onUnmounted } from 'vue'

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

// 生命周期
onMounted(() => {
  // 初始检查
  setTimeout(checkScrollableContent, 100)

  // 添加滚动监听器
  const editorScroller = document.querySelector('.cm-scroller')
  const previewScroller = document.querySelector('.preview-rendered')

  if (editorScroller) {
    editorScroller.addEventListener('scroll', handleEditorScroll, { passive: true })
  }

  if (previewScroller) {
    previewScroller.addEventListener('scroll', handlePreviewScroll, { passive: true })
  }
})

onUnmounted(() => {
  // 移除滚动监听器
  const editorScroller = document.querySelector('.cm-scroller')
  const previewScroller = document.querySelector('.preview-rendered')

  if (editorScroller) {
    editorScroller.removeEventListener('scroll', handleEditorScroll)
  }

  if (previewScroller) {
    previewScroller.removeEventListener('scroll', handlePreviewScroll)
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
